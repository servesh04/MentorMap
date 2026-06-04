import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, ChevronDown, Trash2, Loader2 } from 'lucide-react';
import clsx from 'clsx';
import { useGroqMentor } from '../../hooks/useGroqMentor';
import { useStore } from '../../store/useStore';
import OfflineAIModal from '../OfflineAIModal';

interface MentorChatWidgetProps {
    nodeTitle: string;
    currentResource?: string;
    isExpanded: boolean;
    setIsExpanded: (expanded: boolean) => void;
    initialQuery?: string;
    clearInitialQuery: () => void;
}

const MentorChatWidget: React.FC<MentorChatWidgetProps> = ({
    nodeTitle,
    currentResource,
    isExpanded,
    setIsExpanded,
    initialQuery,
    clearInitialQuery
}) => {
    const { offlineSettings, setOfflineSettings } = useStore();
    const [isOfflineModalOpen, setIsOfflineModalOpen] = useState(false);

    const handleToggleLocalMode = () => {
        if (!offlineSettings.hasAcceptedDownload) {
            setIsOfflineModalOpen(true);
        } else {
            setOfflineSettings({ offlineModeEnabled: !offlineSettings.offlineModeEnabled });
        }
    };
    const {
        messages,
        isTyping,
        sendMessage,
        clearChat,
        downloadProgress,
        isDownloading,
        downloadStatus,
        isLocalRunning
    } = useGroqMentor(nodeTitle, currentResource);

    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isTyping, isDownloading, isExpanded]);

    // Focus input when expanding
    useEffect(() => {
        if (isExpanded && inputRef.current) {
            // Slight timeout to ensure transition/mount is complete before focusing
            const timer = setTimeout(() => {
                inputRef.current?.focus();
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [isExpanded]);

    // Auto-send initial query on contextual spark click
    useEffect(() => {
        if (isExpanded && initialQuery && initialQuery.trim() && !isTyping && !isDownloading) {
            sendMessage(initialQuery);
            clearInitialQuery();
        }
    }, [isExpanded, initialQuery, isTyping, isDownloading, sendMessage, clearInitialQuery]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isTyping || isDownloading) return;
        sendMessage(input);
        setInput('');
    };

    if (!isExpanded) return null;

    return (
        <div className="absolute inset-x-0 bottom-0 z-40 bg-slate-950/90 backdrop-blur-xl border-t border-slate-800 flex flex-col justify-end transition-all duration-300 animate-in slide-in-from-bottom h-[420px] max-h-[85vh] rounded-t-2xl shadow-[0_-8px_30px_rgba(0,0,0,0.6)]">
            {/* Overlay Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-950/95 sticky top-0 z-20 shrink-0">
                <div className="flex items-center gap-2">
                    <div className="w-6.5 h-6.5 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                    <div>
                        <h4 className="text-xs font-bold text-slate-100">AI Mentor</h4>
                        <p className="text-[9px] text-slate-500">
                            {isDownloading
                                ? `Downloading... (${downloadProgress}%)`
                                : offlineSettings.offlineModeEnabled && isLocalRunning
                                ? 'On-Device AI • Qwen 1.5B'
                                : 'Cloud API • LLaMA 3'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {/* Interactive Toggle between Local and Cloud Mode */}
                    {!isDownloading && (
                        <button
                            onClick={handleToggleLocalMode}
                            className={clsx(
                                "text-[9px] tracking-wider border px-2.5 py-0.5 rounded-full font-bold transition-all cursor-pointer shrink-0",
                                offlineSettings.offlineModeEnabled
                                    ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25"
                                    : "bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700 hover:text-slate-300"
                            )}
                            title={offlineSettings.offlineModeEnabled ? "Switch to Cloud (LLaMA 3)" : "Switch to Local AI (Qwen 1.5B)"}
                        >
                            {offlineSettings.offlineModeEnabled ? "● LOCAL" : "○ CLOUD"}
                        </button>
                    )}
                    {isDownloading && (
                        <span className="text-[8px] tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1.5 py-0.5 rounded-full font-bold animate-pulse">
                            DOWNLOADING
                        </span>
                    )}
                    
                    <button
                        onClick={() => setIsExpanded(false)}
                        className="p-1 rounded-full hover:bg-slate-900 transition-colors text-slate-500 hover:text-slate-300 cursor-pointer"
                        title="Close Mentor Chat"
                    >
                        <ChevronDown className="w-4.5 h-4.5" />
                    </button>
                </div>
            </div>

            {/* Chat Content Scroll View */}
            <div className="flex-1 overflow-y-auto px-4 py-3.5 space-y-3.5 scrollbar-hide pb-20">
                {/* Local download progress card */}
                {isDownloading && (
                    <div className="flex flex-col items-center justify-center h-full text-center p-4 gap-3 bg-slate-900/20 rounded-xl border border-slate-800/40">
                        <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
                        <div>
                            <h4 className="text-xs font-bold text-slate-200">Downloading Offline Mentor</h4>
                            <p className="text-[10px] text-slate-500 mt-1 leading-normal max-w-[200px]">
                                {downloadStatus || 'Downloading model weights (~850MB)...'}
                            </p>
                        </div>
                        <div className="w-full max-w-[150px] h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-emerald-500 transition-all duration-300"
                                style={{ width: `${downloadProgress}%` }}
                            />
                        </div>
                        <span className="text-[10px] font-bold text-emerald-400">{downloadProgress}% completed</span>
                    </div>
                )}

                {messages.length === 0 && !isTyping && !isDownloading && (
                    <div className="flex flex-col items-center justify-center h-full text-center gap-2">
                        <Sparkles className="w-8 h-8 text-slate-700" />
                        <p className="text-slate-500 text-xs leading-relaxed max-w-[200px]">
                            Ask me anything about <span className="text-emerald-400 font-medium">{nodeTitle}</span>
                        </p>
                    </div>
                )}

                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        className={clsx(
                            'flex',
                            msg.role === 'user' ? 'justify-end' : 'justify-start'
                        )}
                    >
                        <div
                            className={clsx(
                                'max-w-[85%] px-3.5 py-2.5 text-sm leading-relaxed shadow-sm',
                                msg.role === 'user'
                                    ? 'bg-emerald-600 text-white rounded-2xl rounded-br-sm'
                                    : 'bg-slate-800 text-slate-200 rounded-2xl rounded-bl-sm border border-slate-700/30'
                            )}
                        >
                            {msg.content}
                        </div>
                    </div>
                ))}

                {/* Typing indicator */}
                {isTyping && (
                    <div className="flex justify-start">
                        <div className="bg-slate-800 border border-slate-700/30 text-slate-400 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1.5 shadow-sm">
                            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" />
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Absolute Glassmorphic Bottom Dock */}
            <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-slate-950 via-slate-950/95 to-transparent border-t border-slate-800/40 backdrop-blur-md z-10 shrink-0">
                <form
                    onSubmit={handleSubmit}
                    className="flex items-center gap-2"
                >
                    {messages.length > 0 && (
                        <button
                            type="button"
                            onClick={clearChat}
                            className="p-2.5 text-slate-500 hover:text-rose-400 transition-colors shrink-0 cursor-pointer"
                            title="Clear chat"
                        >
                            <Trash2 size={15} />
                        </button>
                    )}
                    <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        placeholder={isDownloading ? "Downloading model, please wait..." : "Ask a question..."}
                        disabled={isTyping || isDownloading}
                        className={clsx(
                            'flex-1 h-11 px-4 rounded-xl bg-slate-900/60 border border-slate-700/60 text-slate-200 text-sm placeholder:text-slate-600',
                            'focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20',
                            'transition-colors disabled:opacity-50'
                        )}
                    />
                    <button
                        type="submit"
                        disabled={isTyping || !input.trim() || isDownloading}
                        className={clsx(
                            'w-11 h-11 rounded-xl flex items-center justify-center transition-all shrink-0 cursor-pointer',
                            input.trim() && !isTyping && !isDownloading
                                ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold'
                                : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                        )}
                    >
                        <Send size={15} />
                    </button>
                </form>
            </div>

            <OfflineAIModal
                isOpen={isOfflineModalOpen}
                onClose={() => setIsOfflineModalOpen(false)}
            />
        </div>
    );
};

export default MentorChatWidget;
