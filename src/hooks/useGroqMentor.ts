import { useState, useCallback, useRef, useEffect } from 'react';
import { useStore } from '../store/useStore';
import {
    loadLocalModel,
    generateLocalResponse,
    isModelLoaded,
    unloadModel
} from '../services/webllmService';
import {
    getChatHistory,
    saveChatHistory,
    deleteChatHistory,
    type LocalChatMessage
} from '../services/dbService';
import { PIIMasker } from '../utils/piiMasker';

export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

interface UseGroqMentorReturn {
    messages: ChatMessage[];
    isTyping: boolean;
    error: string | null;
    sendMessage: (userQuery: string) => Promise<void>;
    clearChat: () => void;
    // Local/offline capability states
    downloadProgress: number;
    isDownloading: boolean;
    downloadStatus: string;
    isLocalRunning: boolean;
}

export const useGroqMentor = (nodeTitle: string, currentResource?: string): UseGroqMentorReturn => {
    const {
        offlineSettings,
        setOfflineSettings,
        isLocalRunning,
        isDownloading,
        downloadProgress,
        downloadStatus,
        setIsLocalRunning,
        setIsDownloading,
        setDownloadProgress,
        setDownloadStatus
    } = useStore();

    const maskerRef = useRef<PIIMasker | null>(null);
    if (!maskerRef.current) {
        maskerRef.current = new PIIMasker();
    }
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isTyping, setIsTyping] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    const [tabVisible, setTabVisible] = useState(true);

    const systemMessage = {
        role: 'system' as const,
        content: `You are a highly skilled, concise technical mentor for the MentorMap app. The user is currently studying the module: '${nodeTitle}'.${currentResource ? ` They are referencing this material: '${currentResource}'.` : ''} Answer their questions directly, assuming they are a beginner. Do not use excessive formatting. Keep it brief.`,
    };

    // 1. Database Hook: Load chat history from IndexedDB on mount or module change
    useEffect(() => {
        const loadOfflineChatHistory = async () => {
            try {
                const history = await getChatHistory(nodeTitle);
                setMessages(history);
            } catch (e) {
                console.error("Failed to load offline messages:", e);
            }
        };
        loadOfflineChatHistory();
    }, [nodeTitle]);

    // 2. Database Hook: Auto-persist messages to IndexedDB whenever the chat history updates
    useEffect(() => {
        if (messages.length > 0) {
            saveChatHistory(nodeTitle, messages as LocalChatMessage[]);
        }
    }, [messages, nodeTitle]);

    // 3. VRAM Lifecycle Hook: Unload local model on tab minimization to prevent background VRAM leaks
    useEffect(() => {
        const handleVisibilityChange = () => {
            const isHidden = document.hidden;
            setTabVisible(!isHidden);

            if (isHidden) {
                // If user switched tabs and we are NOT active, release VRAM
                if (!isTyping && isModelLoaded()) {
                    setIsLocalRunning(false);
                    unloadModel();
                }
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);
        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, [isTyping, setIsLocalRunning]);

    // 4. Local Model Pre-loader Hook: Re-evaluates on visibility state change
    useEffect(() => {
        let isMounted = true;

        const initLocalModel = async () => {
            if (
                offlineSettings.offlineModeEnabled &&
                tabVisible && // Only load model weights if the browser window/tab is visible
                !isModelLoaded() &&
                !isDownloading
            ) {
                if (isMounted) {
                    setIsDownloading(true);
                    setDownloadStatus('Initializing WebGPU...');
                }
                try {
                    await loadLocalModel((progress, text) => {
                        if (isMounted) {
                            setDownloadProgress(progress);
                            setDownloadStatus(text);
                        }
                    });
                    if (isMounted) {
                        setIsDownloading(false);
                        setDownloadStatus('Ready');
                        setIsLocalRunning(true);
                        setOfflineSettings({ hasAcceptedDownload: true });
                    }
                } catch (err: any) {
                    if (isMounted) {
                        setIsDownloading(false);
                        setDownloadStatus('Failed to load');
                        setError(err.message || 'Failed to initialize local model.');
                    }
                }
            } else if (isModelLoaded() && tabVisible) {
                if (isMounted) {
                    setIsLocalRunning(true);
                    setDownloadStatus('Ready');
                }
            }
        };

        initLocalModel();

        return () => {
            isMounted = false;
        };
    }, [offlineSettings.offlineModeEnabled, tabVisible, isDownloading, setIsDownloading, setDownloadStatus, setDownloadProgress, setIsLocalRunning, setOfflineSettings]);

    // Unload local model if user disables offline mode to free VRAM
    useEffect(() => {
        if (!offlineSettings.offlineModeEnabled && isModelLoaded()) {
            setIsLocalRunning(false);
            setDownloadStatus('');
            setDownloadProgress(0);
            unloadModel();
        }
    }, [offlineSettings.offlineModeEnabled, setIsLocalRunning, setDownloadStatus, setDownloadProgress]);

    const runCloudQuery = async (queryText: string, controller: AbortController) => {
        const API_KEY = import.meta.env.VITE_GROQ_API_KEY;
        if (!API_KEY) {
            throw new Error('VITE_GROQ_API_KEY is missing from .env');
        }

        // Scrub user and chat history messages before sending to Groq Cloud API
        const apiMessages = [
            { role: 'system', content: systemMessage.content },
            ...messages.map(m => ({ role: m.role, content: maskerRef.current!.maskPrompt(m.content) })),
            { role: 'user', content: maskerRef.current!.maskPrompt(queryText) },
        ];

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`,
            },
            body: JSON.stringify({
                model: 'llama-3.1-8b-instant',
                messages: apiMessages,
                temperature: 0.7,
                max_tokens: 1024,
            }),
            signal: controller.signal,
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error?.message || `Groq API error: ${response.status}`);
        }

        const assistantContentRaw = data.choices?.[0]?.message?.content;
        if (!assistantContentRaw) {
            throw new Error('No response received from Groq.');
        }

        // Unmask the cloud's response (re-inject sensitive info locally)
        return maskerRef.current!.unmaskResponse(assistantContentRaw);
    };

    const sendMessage = useCallback(async (userQuery: string) => {
        if (!userQuery.trim() || isTyping) return;

        const userMessage: ChatMessage = { role: 'user', content: userQuery.trim() };
        setMessages(prev => [...prev, userMessage]);
        setIsTyping(true);
        setError(null);

        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        const controller = new AbortController();
        abortControllerRef.current = controller;
        const isLocalMode = offlineSettings.offlineModeEnabled && (isLocalRunning || isModelLoaded());

        if (isLocalMode) {
            try {
                const apiMessages = [
                    { role: 'system' as const, content: systemMessage.content },
                    ...messages.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
                    { role: 'user' as const, content: userQuery.trim() },
                ];

                // Pre-append an empty assistant message to stream tokens into
                setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

                try {
                    await generateLocalResponse(apiMessages, (chunk) => {
                        setMessages(prev => {
                            const updated = [...prev];
                            const lastIdx = updated.length - 1;
                            if (lastIdx >= 0 && updated[lastIdx].role === 'assistant') {
                                updated[lastIdx] = {
                                    ...updated[lastIdx],
                                    content: updated[lastIdx].content + chunk
                                };
                            }
                            return updated;
                        });
                    });
                } catch (localErr) {
                    // Remove the placeholder message on failure so the fallback is clean
                    setMessages(prev => prev.slice(0, -1));
                    throw localErr;
                }
            } catch (err: any) {
                console.warn("Local generation failed, falling back to Cloud API:", err);
                setError("Local execution failed. Switched to Cloud API.");
                
                // Cloud fallback
                try {
                    const assistantContent = await runCloudQuery(userQuery.trim(), controller);
                    const assistantMessage: ChatMessage = { role: 'assistant', content: assistantContent };
                    setMessages(prev => [...prev, assistantMessage]);
                } catch (cloudErr: any) {
                    if (cloudErr.name === 'AbortError') return;
                    console.error("Cloud fallback also failed:", cloudErr);
                    setMessages(prev => [
                        ...prev,
                        { role: 'assistant', content: '⚠️ Sorry, I could not process your query locally or via cloud.' }
                    ]);
                }
            } finally {
                setIsTyping(false);
            }
        } else {
            // Standard Cloud Query
            try {
                const assistantContent = await runCloudQuery(userQuery.trim(), controller);
                const assistantMessage: ChatMessage = { role: 'assistant', content: assistantContent };
                setMessages(prev => [...prev, assistantMessage]);
            } catch (err: any) {
                if (err.name === 'AbortError') return;
                console.error("Groq Mentor Error:", err);
                setError(err.message || 'Failed to get response.');
                setMessages(prev => [
                    ...prev,
                    { role: 'assistant', content: '⚠️ Sorry, I couldn\'t process that. Please check your connection.' }
                ]);
            } finally {
                setIsTyping(false);
            }
        }
    }, [messages, isTyping, systemMessage, offlineSettings.offlineModeEnabled, isLocalRunning]);

        const clearChat = useCallback(() => {
        setMessages([]);
        setError(null);
        deleteChatHistory(nodeTitle); // Clear conversation history logs asynchronously from IndexedDB
        maskerRef.current?.clear(); // Clear volatile PII key-value registry and compliance metrics
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
    }, [nodeTitle]);

    return {
        messages,
        isTyping,
        error,
        sendMessage,
        clearChat,
        downloadProgress,
        isDownloading,
        downloadStatus,
        isLocalRunning
    };
};
