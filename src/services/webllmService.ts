import type { WebWorkerMLCEngine, InitProgressReport } from "@mlc-ai/web-llm";
import { useStore } from "../store/useStore";

const MODEL_ID = "Qwen2.5-1.5B-Instruct-q4f16_1-MLC";

let engine: WebWorkerMLCEngine | null = null;
let activeWorker: Worker | null = null;
let isInitializing = false;
let isUnloading = false;
let cancelReject: ((reason?: any) => void) | null = null;

/**
 * Cancels any active local model loading process.
 */
export const cancelModelLoad = () => {
    if (cancelReject) {
        cancelReject(new Error("Download cancelled by user."));
    }
};

/**
 * Check if WebGPU is supported by the browser and client hardware,
 * and enforce a minimum RAM threshold of 4GB to prevent OOM tab crashes on low-end devices.
 */
export const checkWebGPUSupport = async (): Promise<boolean> => {
    if (typeof window === 'undefined') {
        return false;
    }
    const nav = navigator as any;

    // Enforce hardware RAM tiering. If device has <4GB RAM, disable local AI options.
    if (nav.deviceMemory && nav.deviceMemory < 4) {
        console.warn(`Device RAM is too low (${nav.deviceMemory}GB). Local AI disabled to prevent system crash.`);
        return false;
    }

    if (!nav.gpu) {
        return false;
    }
    try {
        const adapter = await nav.gpu.requestAdapter();
        return !!adapter;
    } catch (e) {
        return false;
    }
};

/**
 * Checks if the model weights are already cached in browser storage.
 */
export const isModelCached = async (): Promise<boolean> => {
    if (typeof window === 'undefined') return false;
    try {
        const { hasModelInCache: hasModel } = await import("@mlc-ai/web-llm");
        return await hasModel(MODEL_ID);
    } catch (e) {
        console.error("Failed to check if local model is cached:", e);
        return false;
    }
};

/**
 * Loads the Qwen 2.5 1.5B local model in a background Web Worker thread.
 * Downloads weights if not already cached.
 */
export const loadLocalModel = async (
    onProgress: (progress: number, text: string) => void
): Promise<WebWorkerMLCEngine> => {
    // If a previous instance is currently unloading, wait for it to fully release VRAM
    while (isUnloading) {
        await new Promise((resolve) => setTimeout(resolve, 100));
    }
    if (engine) return engine;
    if (activeWorker || isInitializing) {
        console.log("Unloading previous instance to enforce single instance rule.");
        await unloadModel();
        while (isUnloading) {
            await new Promise((resolve) => setTimeout(resolve, 100));
        }
    }

    isInitializing = true;

    try {
        const hasWebGPU = await checkWebGPUSupport();
        if (!hasWebGPU) {
            throw new Error("WebGPU is not supported or device RAM is insufficient.");
        }

        // Spawn background Web Worker
        activeWorker = new Worker(
            new URL("../workers/webllm.worker.ts", import.meta.url),
            { type: "module" }
        );

        const { CreateWebWorkerMLCEngine } = await import("@mlc-ai/web-llm");

        // 1. Create a promise that rejects on worker compile or load errors
        const workerErrorPromise = new Promise<WebWorkerMLCEngine>((_, reject) => {
            if (activeWorker) {
                activeWorker.onerror = (event) => {
                    event.preventDefault();
                    reject(new Error("Web Worker failed to load. This can happen if the browser blocks module workers or dependencies could not be resolved. Please check your browser console for detailed compile errors."));
                };
            }
        });

        // 2. Create a promise that rejects if the process times out (2 minutes)
        const timeoutPromise = new Promise<WebWorkerMLCEngine>((_, reject) => {
            setTimeout(() => {
                reject(new Error("Model initialization timed out (2-minute limit). This usually indicates a blocked connection to Hugging Face (weights server) or a WebGPU driver hang. Try checking your internet connection or updating your graphics drivers."));
            }, 120000);
        });

        // 3. Create a promise that rejects if the user cancels the download
        const cancelPromise = new Promise<WebWorkerMLCEngine>((_, reject) => {
            cancelReject = reject;
        });

        // 4. Create the engine promise
        const enginePromise = CreateWebWorkerMLCEngine(activeWorker, MODEL_ID, {
            initProgressCallback: (report: InitProgressReport) => {
                const progressPercentage = Math.round(report.progress * 100);
                onProgress(progressPercentage, report.text);
            }
        });

        // Race them!
        engine = await Promise.race([enginePromise, workerErrorPromise, timeoutPromise, cancelPromise]);

        return engine!;
    } catch (error) {
        // Clean up worker on failure
        if (activeWorker) {
            activeWorker.terminate();
            activeWorker = null;
        }
        engine = null;
        console.error("Failed to load local WebLLM model in Web Worker:", error);
        throw error;
    } finally {
        cancelReject = null;
        isInitializing = false;
    }
};

/**
 * Applies sliding-window context truncation to prevent model context window overflow
 * and browser memory crash. System message is always preserved.
 */
export const truncateMessages = (
    messages: { role: 'system' | 'user' | 'assistant'; content: string }[]
): { role: 'system' | 'user' | 'assistant'; content: string }[] => {
    if (messages.length <= 2) return messages; // System + latest message, no truncation needed

    const MAX_CHAR_LIMIT = 8000; // Heuristic: ~2000 tokens (4 chars/token average)
    const systemMsg = messages[0];
    const chatHistory = messages.slice(1);

    const getLength = (history: typeof chatHistory) => {
        return history.reduce((acc, msg) => acc + msg.content.length, 0) + systemMsg.content.length;
    };

    let truncatedHistory = [...chatHistory];

    // Shift oldest history out if length exceeds character limit, keeping system prompt intact
    while (truncatedHistory.length > 1 && getLength(truncatedHistory) > MAX_CHAR_LIMIT) {
        truncatedHistory.shift();
    }

    return [systemMsg, ...truncatedHistory];
};

/**
 * Generates an AI response client-side using the loaded Qwen model inside the Web Worker.
 * Supports streaming via callback.
 */
export const generateLocalResponse = async (
    messages: { role: 'system' | 'user' | 'assistant'; content: string }[],
    onChunk?: (text: string) => void
): Promise<string> => {
    if (!engine) {
        throw new Error("Local model is not loaded. Please initialize the model first.");
    }

    // Apply context window limits (sliding-window truncation)
    const processedMessages = truncateMessages(messages);

    try {
        if (onChunk) {
            // Streaming mode
            const response = await engine.chat.completions.create({
                messages: processedMessages,
                stream: true,
            });

            let fullText = "";
            for await (const chunk of response) {
                const text = chunk.choices[0]?.delta?.content || "";
                fullText += text;
                onChunk(text);
            }
            return fullText;
        } else {
            // Non-streaming mode
            const response = await engine.chat.completions.create({
                messages: processedMessages,
                stream: false,
            });
            return response.choices[0]?.message?.content || "";
        }
    } catch (error) {
        console.error("Local model worker generation error:", error);
        throw error;
    }
};

/**
 * Check if the local model is fully loaded in memory.
 */
export const isModelLoaded = (): boolean => {
    return !!engine;
};

/**
 * Unloads the local model from GPU VRAM and terminates the Web Worker.
 */
export const unloadModel = async (): Promise<void> => {
    if (isUnloading) return;
    isUnloading = true;
    useStore.getState().setIsUnloading(true);

    try {
        if (engine) {
            try {
                // Attempt a clean engine unload but race it with a 2-second timeout to prevent hangs
                await Promise.race([
                    engine.unload(),
                    new Promise((resolve) => setTimeout(resolve, 2000))
                ]).catch((e) => {
                    console.warn("[INFO] WebLLM engine unload failed or timed out:", e);
                });
            } catch (e: any) {
                console.warn("[INFO] Ignored WebLLM engine unload exception during worker shutdown:", e.message || e);
            }
            engine = null;
        }
        if (activeWorker) {
            try {
                activeWorker.terminate();
            } catch (e) {
                console.error("Failed to terminate active worker:", e);
            }
            activeWorker = null;
        }
    } finally {
        isInitializing = false;
        isUnloading = false;
        useStore.getState().setIsUnloading(false);
    }
};

/**
 * Deletes all cached model weights and WASM files from IndexedDB and Cache Storage
 * to free up local disk space.
 */
export const clearModelCache = async (): Promise<void> => {
    if (typeof window === 'undefined') return;

    // 1. Unload the model and terminate worker
    await unloadModel();

    // 2. Delete model files using WebLLM's official API
    try {
        const { deleteModelAllInfoInCache: deleteModel } = await import("@mlc-ai/web-llm");
        await deleteModel(MODEL_ID);
    } catch (e) {
        console.error("Failed to clear model cache using WebLLM API, falling back to manual clean:", e);
        
        // Manual cleanup fallback
        if ('caches' in window) {
            try {
                const keys = await caches.keys();
                for (const key of keys) {
                    if (
                        key.toLowerCase().includes('mlc') ||
                        key.toLowerCase().includes('webllm') ||
                        key.toLowerCase().includes('wasm')
                    ) {
                        await caches.delete(key);
                    }
                }
            } catch (cacheErr) {
                console.error("Manual cache clear failed:", cacheErr);
            }
        }
    }
};
