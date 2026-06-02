import type { WebWorkerMLCEngine, InitProgressReport } from "@mlc-ai/web-llm";

const MODEL_ID = "Qwen2.5-1.5B-Instruct-q4f16_1-MLC";

let engine: WebWorkerMLCEngine | null = null;
let activeWorker: Worker | null = null;
let isInitializing = false;

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
    if (engine) return engine;
    if (isInitializing) {
        throw new Error("Local model is already initializing.");
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

        // Initialize the engine inside the Web Worker
        engine = await CreateWebWorkerMLCEngine(activeWorker, MODEL_ID, {
            initProgressCallback: (report: InitProgressReport) => {
                const progressPercentage = Math.round(report.progress * 100);
                onProgress(progressPercentage, report.text);
            }
        });

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
    if (engine) {
        try {
            await engine.unload();
        } catch (e) {
            console.error("Failed to unload model:", e);
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
