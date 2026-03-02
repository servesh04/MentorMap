import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import clsx from 'clsx';
import { useGroqMentor } from '../../hooks/useGroqMentor';

interface MentorChatWidgetProps {
    nodeTitle: string;
    currentResource?: string;
}

const MentorChatWidget: React.FC<MentorChatWidgetProps> = ({ nodeTitle, currentResource }) => {
    const { messages, isTyping, sendMessage, clearChat } = useGroqMentor(nodeTitle, currentResource);
    const [isExpanded, setIsExpanded] = useState(false);
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isTyping]);

    // Focus input when expanding
    useEffect(() => {
        if (isExpanded && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isExpanded]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isTyping) return;
        sendMessage(input);
        setInput('');
    };

    return (
        <section className="rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden shadow-lg">
            {/* Header — always visible, toggles expand */}
            <button
                onClick={() => setIsExpanded(prev => !prev)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-900 transition-colors"
            >
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div className="text-left">
                        <h3 className="text-sm font-bold text-slate-100">Ask AI Mentor</h3>
                        <p className="text-[10px] text-slate-500">Powered by Groq • LLaMA 3</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {messages.length > 0 && (
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-medium">
                            {messages.length}
                        </span>
                    )}
                    {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-slate-500" />
                    ) : (
                        <ChevronUp className="w-4 h-4 text-slate-500" />
                    )}
                </div>
            </button>

            {/* Collapsible Body */}
            <div className={clsx(
                'transition-all duration-300 ease-in-out overflow-hidden',
                isExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
            )}>
                <div className="border-t border-slate-800">
                    {/* Messages Area */}
                    <div className="h-64 overflow-y-auto px-4 py-3 space-y-3 scrollbar-hide">
                        {messages.length === 0 && !isTyping && (
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
                                        'max-w-[85%] px-3.5 py-2.5 text-sm leading-relaxed',
                                        msg.role === 'user'
                                            ? 'bg-emerald-600 text-white rounded-2xl rounded-br-sm'
                                            : 'bg-slate-800 text-slate-200 rounded-2xl rounded-bl-sm'
                                    )}
                                >
                                    {msg.content}
                                </div>
                            </div>
                        ))}

                        {/* Typing indicator */}
                        {isTyping && (
                            <div className="flex justify-start">
                                <div className="bg-slate-800 text-slate-400 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" />
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <form
                        onSubmit={handleSubmit}
                        className="flex items-center gap-2 px-3 py-3 border-t border-slate-800"
                    >
                        {messages.length > 0 && (
                            <button
                                type="button"
                                onClick={clearChat}
                                className="p-2 text-slate-500 hover:text-rose-400 transition-colors shrink-0"
                                title="Clear chat"
                            >
                                <Trash2 size={14} />
                            </button>
                        )}
                        <input
                            ref={inputRef}
                            type="text"
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            placeholder="Ask a question..."
                            disabled={isTyping}
                            className={clsx(
                                'flex-1 h-12 px-4 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-sm placeholder:text-slate-600',
                                'focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20',
                                'transition-colors disabled:opacity-50'
                            )}
                        />
                        <button
                            type="submit"
                            disabled={isTyping || !input.trim()}
                            className={clsx(
                                'w-12 h-12 rounded-xl flex items-center justify-center transition-all shrink-0',
                                input.trim() && !isTyping
                                    ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-900'
                                    : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                            )}
                        >
                            <Send size={16} />
                        </button>
                    </form>
                </div>
            </div>
        </section>
    );
};

export default MentorChatWidget;
