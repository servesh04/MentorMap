import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, Trash2, Loader2, X } from 'lucide-react';
import clsx from 'clsx';
import { useGroqMentor } from '../../hooks/useGroqMentor';
import { useStore } from '../../store/useStore';

interface SandboxMentorWidgetProps {
    nodeTitle: string;
    selectedLanguage: string;
    currentResource?: string;
    onAnalyzeTrigger?: (sendMessage: (query: string) => Promise<void>) => void;
    onClearChatTrigger?: (clearChatFn: () => void) => void;
    attachedContext: string | null;
    setAttachedContext: (context: string | null) => void;
}

// Stateful component to handle copy action and copied success transition feedback
const CodeBlockContainer: React.FC<{ code: string; lang: string }> = ({ code, lang }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy code block:", err);
        }
    };

    return (
        <div className="my-3 border border-slate-800/80 rounded-xl overflow-hidden font-mono text-xs w-full max-w-full relative group">
            <div className="bg-slate-950 px-3 py-1.5 text-slate-500 border-b border-slate-800/60 flex justify-between items-center text-[10px] select-none">
                <span>{lang || 'code'}</span>
            </div>
            <div className="relative">
                <button
                    type="button"
                    onClick={handleCopy}
                    className="absolute top-2.5 right-2.5 bg-slate-950/90 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 px-2 py-1 rounded-lg text-slate-400 hover:text-slate-200 transition-all cursor-pointer shadow-md select-none z-10 flex items-center gap-1 font-sans text-[10px]"
                    title="Copy code to clipboard"
                >
                    {copied ? (
                        <>
                            <span className="text-emerald-455 text-emerald-400 font-bold">✓</span>
                            <span className="text-emerald-455 text-emerald-400 font-bold">Copied</span>
                        </>
                    ) : (
                        <span>📋</span>
                    )}
                </button>
                <pre className="p-3.5 bg-slate-950/90 text-emerald-400 overflow-x-auto select-text scrollbar-thin pr-16">
                    <code className="block select-text whitespace-pre">{code}</code>
                </pre>
            </div>
        </div>
    );
};

// Custom lightweight markdown streaming parser to strip backticks and render code containers
const renderMessageContent = (content: string) => {
    if (!content) return null;
    
    // Split text by code blocks
    const parts = content.split(/(```[\s\S]*?```)/g);
    return parts.map((part, index) => {
        if (part.startsWith('```') && part.endsWith('```')) {
            const lines = part.split('\n');
            const firstLine = lines[0]; // e.g. ```typescript
            const lang = firstLine.replace('```', '').trim();
            const code = lines.slice(1, -1).join('\n');
            return <CodeBlockContainer key={index} code={code} lang={lang} />;
        } else {
            // Parse inline bold markers **text**
            const boldParts = part.split(/(\*\*.*?\*\*)/g);
            return (
                <span key={index} className="leading-relaxed block">
                    {boldParts.map((bp, i) => {
                        if (bp.startsWith('**') && bp.endsWith('**')) {
                            return <strong key={i} className="font-extrabold text-emerald-400">{bp.slice(2, -2)}</strong>;
                        }
                        return bp;
                    })}
                </span>
            );
        }
    });
};

export const SandboxMentorWidget: React.FC<SandboxMentorWidgetProps> = ({
    nodeTitle,
    selectedLanguage,
    currentResource,
    onAnalyzeTrigger,
    onClearChatTrigger,
    attachedContext,
    setAttachedContext
}) => {
    const { offlineSettings, setOfflineSettings } = useStore();
    
    // Isolate conversation history strictly by language to resolve "Language Identity Crisis"
    const {
        messages,
        isTyping,
        sendMessage,
        clearChat,
        downloadProgress,
        isDownloading,
        downloadStatus,
        isLocalRunning
    } = useGroqMentor(`${nodeTitle}_${selectedLanguage}`, currentResource);

    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isTyping, isDownloading]);

    // Provide the parent with a trigger to send analysis message
    useEffect(() => {
        if (onAnalyzeTrigger) {
            onAnalyzeTrigger(sendMessage);
        }
    }, [onAnalyzeTrigger, sendMessage]);

    // Provide the parent with a trigger to clear history
    useEffect(() => {
        if (onClearChatTrigger) {
            onClearChatTrigger(clearChat);
        }
    }, [onClearChatTrigger, clearChat]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isTyping || isDownloading) return;

        let finalQuery = input.trim();
        if (attachedContext) {
            const getFileExtension = (lang: string) => {
                switch (lang) {
                    case 'javascript': return 'js';
                    case 'typescript': return 'ts';
                    case 'java': return 'java';
                    case 'python': return 'py';
                    case 'cpp': return 'cpp';
                    default: return 'js';
                }
            };
            const ext = getFileExtension(selectedLanguage);
            finalQuery = `${input.trim()}\n\n---\n**Attached Context Code (main.${ext}):**\n\`\`\`${selectedLanguage}\n${attachedContext}\n\`\`\``;
            
            // Cleanly flush context state after dispatching
            setAttachedContext(null);
        }

        sendMessage(finalQuery);
        setInput('');
    };

    return (
        <div className="flex flex-col h-full bg-slate-950/40 border-l border-slate-800/80">
            {/* Custom Webkit scrollbar styler to keep dark premium theme seamless */}
            <style>{`
                .scrollbar-thin::-webkit-scrollbar {
                    height: 5px;
                    width: 5px;
                }
                .scrollbar-thin::-webkit-scrollbar-track {
                    background: #020617;
                }
                .scrollbar-thin::-webkit-scrollbar-thumb {
                    background: #1e293b;
                    border-radius: 4px;
                }
                .scrollbar-thin::-webkit-scrollbar-thumb:hover {
                    background: #334155;
                }
            `}</style>

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-slate-950/60 sticky top-0 z-20 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-emerald-405 text-emerald-400 animate-pulse" />
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-slate-100">AI Coding Assistant</h4>
                        <p className="text-[10px] text-slate-500 mt-0.5">
                            {isDownloading
                                ? `Downloading Weights... (${downloadProgress}%)`
                                : offlineSettings.offlineModeEnabled && isLocalRunning
                                ? 'Qwen 1.5B Local Engine (WebGPU)'
                                : 'LLaMA 3.1 Cloud API'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {/* Interactive Toggle between Local and Cloud Mode */}
                    {offlineSettings.hasAcceptedDownload && !isDownloading && (
                        <button
                            onClick={() => setOfflineSettings({ offlineModeEnabled: !offlineSettings.offlineModeEnabled })}
                            className={clsx(
                                "text-[10px] tracking-wider border px-3 py-1 rounded-full font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5",
                                offlineSettings.offlineModeEnabled
                                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/25"
                                    : "bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/25"
                            )}
                            title={offlineSettings.offlineModeEnabled ? "Switch to Cloud (LLaMA 3)" : "Switch to Local AI (Qwen 1.5B)"}
                        >
                            {offlineSettings.offlineModeEnabled ? (
                                <>
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                    <span>LOCAL</span>
                                </>
                            ) : (
                                <>
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                                    <span>CLOUD</span>
                                </>
                            )}
                        </button>
                    )}
                    {isDownloading && (
                        <span className="text-[9px] tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-1 rounded-full font-bold animate-pulse">
                            DOWNLOADING
                        </span>
                    )}
                </div>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4 scrollbar-hide pb-32">
                {/* Local download progress card */}
                {isDownloading && (
                    <div className="flex flex-col items-center justify-center py-8 text-center p-6 gap-3.5 bg-slate-900/10 rounded-2xl border border-slate-800/40">
                        <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
                        <div>
                            <h4 className="text-xs font-bold text-slate-200">Downloading Offline Assistant</h4>
                            <p className="text-[10px] text-slate-500 mt-1.5 leading-relaxed max-w-[220px]">
                                {downloadStatus || 'Fetching required model parameters (~850MB)...'}
                            </p>
                        </div>
                        <div className="w-full max-w-[180px] h-2 bg-slate-800 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-emerald-500 transition-all duration-300"
                                style={{ width: `${downloadProgress}%` }}
                            />
                        </div>
                        <span className="text-[11px] font-bold text-emerald-400">{downloadProgress}% completed</span>
                    </div>
                )}

                {messages.length === 0 && !isTyping && !isDownloading && (
                    <div className="flex flex-col items-center justify-center h-64 text-center gap-3 select-none">
                        <Sparkles className="w-10 h-10 text-slate-700 animate-pulse" />
                        <div>
                            <h4 className="text-xs font-bold text-slate-400">Sandbox AI Assistant Ready</h4>
                            <p className="text-slate-500 text-[11px] leading-relaxed max-w-[220px] mt-1">
                                Write code on the left and click <span className="text-emerald-400 font-semibold">"Analyze Code"</span> to evaluate safety and check compilation.
                            </p>
                        </div>
                    </div>
                )}

                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        className={clsx(
                            'flex flex-col w-full mt-4 first:mt-0',
                            msg.role === 'user' ? 'items-end' : 'items-start'
                        )}
                    >
                        {/* Header Label for clean visuals with breathing margin space */}
                        <span className="text-[10px] text-slate-500 font-medium mb-1.5 px-1 select-none">
                            {msg.role === 'user' ? 'You' : 'Mentor AI'}
                        </span>
                        <div
                            className={clsx(
                                'max-w-[95%] text-slate-200 border shadow-md font-sans w-fit',
                                msg.role === 'user'
                                    ? 'bg-slate-900/40 border-slate-850 px-4 py-3 rounded-2xl rounded-tr-none'
                                    : 'bg-slate-900/60 border-slate-800/85 border-l-2 border-l-emerald-500 px-4 pt-3 pb-5 rounded-2xl rounded-tl-none backdrop-blur-sm'
                            )}
                        >
                            {renderMessageContent(msg.content)}
                        </div>
                    </div>
                ))}

                {/* Typing indicator */}
                {isTyping && (
                    <div className="flex flex-col items-start mt-4">
                        <span className="text-[10px] text-slate-500 font-medium mb-1.5 px-1 select-none">
                            Mentor AI
                        </span>
                        <div className="bg-slate-900/60 border border-slate-800/80 border-l-2 border-l-emerald-500 text-slate-400 rounded-2xl rounded-tl-none px-4 py-3.5 flex items-center gap-1.5 shadow-md">
                            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" />
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="p-4 bg-slate-950/60 border-t border-slate-850/60 backdrop-blur-md sticky bottom-0 z-10 shrink-0 flex flex-col gap-2">
                {attachedContext && (
                    <div className="flex items-center justify-between bg-slate-900/60 border border-slate-800/80 rounded-xl px-3.5 py-2 text-xs text-slate-300 animate-in slide-in-from-bottom duration-250 select-none">
                        <div className="flex items-center gap-2">
                            <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-extrabold text-[10px] tracking-wider px-2 py-0.5 rounded-md">ATTACHED CONTEXT</span>
                            <span className="font-mono text-slate-400">
                                main.{selectedLanguage === 'typescript' ? 'ts' : selectedLanguage === 'javascript' ? 'js' : selectedLanguage === 'python' ? 'py' : selectedLanguage === 'java' ? 'java' : selectedLanguage === 'cpp' ? 'cpp' : 'js'}
                            </span>
                        </div>
                        <button
                            type="button"
                            onClick={() => setAttachedContext(null)}
                            className="p-1 hover:bg-slate-800 text-slate-500 hover:text-rose-455 hover:text-rose-400 rounded-lg transition-colors cursor-pointer"
                            title="Remove attached context"
                        >
                            <X size={14} />
                        </button>
                    </div>
                )}
                <form
                    onSubmit={handleSubmit}
                    className="flex items-center gap-2 w-full"
                >
                    {messages.length > 0 && (
                        <button
                            type="button"
                            onClick={clearChat}
                            className="w-12 h-12 rounded-xl flex items-center justify-center text-slate-500 hover:text-rose-400 hover:bg-slate-900/40 transition-colors shrink-0 cursor-pointer"
                            title="Clear conversation history"
                        >
                            <Trash2 size={16} />
                        </button>
                    )}
                    <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        placeholder={isDownloading ? "Downloading LLM, please wait..." : "Ask a query or type code info..."}
                        disabled={isTyping || isDownloading}
                        className={clsx(
                            'flex-1 h-12 px-4 rounded-xl bg-slate-900/60 border border-slate-800/80 text-slate-200 text-sm placeholder:text-slate-655',
                            'focus:outline-none focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/10',
                            'transition-all disabled:opacity-50'
                        )}
                    />
                    <button
                        type="submit"
                        disabled={isTyping || !input.trim() || isDownloading}
                        className={clsx(
                            'w-12 h-12 rounded-xl flex items-center justify-center transition-all shrink-0 cursor-pointer',
                            input.trim() && !isTyping && !isDownloading
                                ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 hover:scale-[1.01]'
                                : 'bg-slate-900 text-slate-700 cursor-not-allowed border border-slate-800/60'
                        )}
                    >
                        <Send size={16} />
                    </button>
                </form>
            </div>
        </div>
    );
};
