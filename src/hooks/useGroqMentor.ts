import { useState, useCallback, useRef } from 'react';

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
}

export const useGroqMentor = (nodeTitle: string, currentResource?: string): UseGroqMentorReturn => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isTyping, setIsTyping] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    const systemMessage = {
        role: 'system' as const,
        content: `You are a highly skilled, concise technical mentor for the MentorMap app. The user is currently studying the module: '${nodeTitle}'.${currentResource ? ` They are referencing this material: '${currentResource}'.` : ''} Answer their questions directly, assuming they are a beginner. Do not use excessive formatting. Keep it brief.`,
    };

    const sendMessage = useCallback(async (userQuery: string) => {
        if (!userQuery.trim() || isTyping) return;

        const API_KEY = import.meta.env.VITE_GROQ_API_KEY;
        if (!API_KEY) {
            setError('VITE_GROQ_API_KEY is missing from .env');
            return;
        }

        const userMessage: ChatMessage = { role: 'user', content: userQuery.trim() };
        setMessages(prev => [...prev, userMessage]);
        setIsTyping(true);
        setError(null);

        // Cancel any previous in-flight request
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        const controller = new AbortController();
        abortControllerRef.current = controller;

        try {
            // Build the full message array with system prompt
            const apiMessages = [
                systemMessage,
                ...messages.map(m => ({ role: m.role, content: m.content })),
                { role: 'user' as const, content: userQuery.trim() },
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

            const assistantContent = data.choices?.[0]?.message?.content;
            if (!assistantContent) {
                throw new Error('No response received from Groq.');
            }

            const assistantMessage: ChatMessage = { role: 'assistant', content: assistantContent };
            setMessages(prev => [...prev, assistantMessage]);
        } catch (err: any) {
            if (err.name === 'AbortError') return;
            console.error('Groq Mentor Error:', err);
            setError(err.message || 'Failed to get response.');
            // Add an error message to the chat
            setMessages(prev => [
                ...prev,
                { role: 'assistant', content: '⚠️ Sorry, I couldn\'t process that. Please try again.' },
            ]);
        } finally {
            setIsTyping(false);
        }
    }, [messages, isTyping, systemMessage]);

    const clearChat = useCallback(() => {
        setMessages([]);
        setError(null);
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
    }, []);

    return { messages, isTyping, error, sendMessage, clearChat };
};
