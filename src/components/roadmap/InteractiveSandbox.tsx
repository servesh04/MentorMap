import React, { useState, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { X, Play, Code2, Terminal, ArrowRightLeft, ChevronDown, Zap, Trash2, Sun, Moon } from 'lucide-react';
import { SANDBOX_TEMPLATES } from './sandboxTemplates';
import { SandboxMentorWidget } from './SandboxMentorWidget';
import { useIsDesktop } from '../../hooks/useIsDesktop';
import { executeClientCode, type LogMessage } from '../../utils/codeRunner';
import clsx from 'clsx';
import { useTheme } from '../../context/ThemeContext';

interface InteractiveSandboxProps {
    isOpen: boolean;
    onClose: () => void;
    nodeTitle: string;
}

export const InteractiveSandbox: React.FC<InteractiveSandboxProps> = ({
    isOpen,
    onClose,
    nodeTitle
}) => {
    const isDesktop = useIsDesktop();
    const { theme: globalTheme } = useTheme();

    // Resolve the active Monaco Editor theme (defaulting to the global theme)
    const [editorTheme, setEditorTheme] = useState<'vs-dark' | 'vs'>(() => {
        if (globalTheme === 'dark') return 'vs-dark';
        if (globalTheme === 'light') return 'vs';
        if (typeof window !== 'undefined') {
            return window.matchMedia("(prefers-color-scheme: dark)").matches ? 'vs-dark' : 'vs';
        }
        return 'vs-dark';
    });

    // Sync with global theme changes
    React.useEffect(() => {
        if (globalTheme === 'dark') {
            setEditorTheme('vs-dark');
        } else if (globalTheme === 'light') {
            setEditorTheme('vs');
        } else if (globalTheme === 'system') {
            const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
            setEditorTheme(systemDark ? 'vs-dark' : 'vs');
        }
    }, [globalTheme]);

    // State configurations
    const [selectedLanguage, setSelectedLanguage] = useState<string>('javascript');
    const [leftWidth, setLeftWidth] = useState<number>(50); // percentage (split ratio)
    const [isRunning, setIsRunning] = useState<boolean>(false);
    const [logs, setLogs] = useState<LogMessage[]>([]);
    const [attachedContext, setAttachedContext] = useState<string | null>(null);
    const [cursorPos, setCursorPos] = useState({ ln: 1, col: 1 });
    const [activePane, setActivePane] = useState<'editor' | 'chat'>('editor');
    
    const containerRef = useRef<HTMLDivElement>(null);
    const editorRef = useRef<any>(null);
    const monacoRef = useRef<any>(null);
    const terminalEndRef = useRef<HTMLDivElement>(null);
    const sendMessageRef = useRef<((query: string) => Promise<void>) | null>(null);
    const clearChatRef = useRef<(() => void) | null>(null);

    const handleRegisterClearChatTrigger = (clearChatFn: () => void) => {
        clearChatRef.current = clearChatFn;
    };

    // Dynamic environmental boilerplate updates
    const currentTemplate = SANDBOX_TEMPLATES[selectedLanguage] || SANDBOX_TEMPLATES.javascript;

    // Safety guard: Unmount immediately if screen size drops below desktop threshold
    if (!isOpen || !isDesktop) {
        return null;
    }

    // Capture the Editor mount instance reference
    const handleEditorDidMount = (editor: any, monaco: any) => {
        editorRef.current = editor;
        monacoRef.current = monaco;
        
        // Track focus changes to highlight active pane
        editor.onDidFocusEditorWidget(() => {
            setActivePane('editor');
        });

        // Track cursor coordinates for status bar
        editor.onDidChangeCursorPosition((e: any) => {
            setCursorPos({
                ln: e.position.lineNumber,
                col: e.position.column
            });
        });
    };

    // Grab callback trigger for sendMessage from SandboxMentorWidget
    const handleRegisterAnalyzeTrigger = (sendMessageFn: (query: string) => Promise<void>) => {
        sendMessageRef.current = sendMessageFn;
    };

    // Split-pane dragging mechanism
    const handleMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        
        const handleMouseMove = (moveEvent: MouseEvent) => {
            if (!containerRef.current) return;
            const containerRect = containerRef.current.getBoundingClientRect();
            
            // Calculate cursor offset percentage
            const newPercentage = ((moveEvent.clientX - containerRect.left) / containerRect.width) * 100;
            
            // Constraint threshold range [25% - 75%]
            setLeftWidth(Math.max(25, Math.min(75, newPercentage)));
        };

        const handleMouseUp = () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    // Asynchronous local code execution handler
    const handleRunCode = async () => {
        if (!editorRef.current) return;

        const scrollTerminal = () => {
            setTimeout(() => {
                terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            }, 50);
        };

        if (selectedLanguage !== 'javascript' && selectedLanguage !== 'typescript') {
            setLogs(prev => [
                ...prev,
                {
                    type: 'error',
                    text: `Execution is not supported for ${selectedLanguage.toUpperCase()} in the client-side sandbox. Only JavaScript and TypeScript code can be run locally.`
                }
            ]);
            scrollTerminal();
            return;
        }

        setIsRunning(true);
        try {
            const result = await executeClientCode(editorRef.current, monacoRef.current, selectedLanguage);
            setLogs(prev => [...prev, ...result.logs]);
        } catch (e: any) {
            setLogs(prev => [
                ...prev,
                { type: 'error', text: `Uncaught Sandbox Runner Exception: ${e.message || e}` }
            ]);
        } finally {
            setIsRunning(false);
            scrollTerminal();
        }
    };

    // Code snapshot contextual attachment handler
    const handleAttachContext = () => {
        if (!editorRef.current) return;
        const codeContent = editorRef.current.getValue();
        if (!codeContent.trim()) return;
        setAttachedContext(codeContent);
        setActivePane('chat');
    };

    // Calculate file extension dynamically based on environment selection
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
    const fileExtension = getFileExtension(selectedLanguage);

    return (
        <div className="fixed inset-0 z-50 flex flex-col bg-slate-950/98 text-slate-100 font-sans backdrop-blur-md animate-in fade-in duration-300">
            {/* Custom Webkit scrollbar styler to keep terminal theme seamless */}
            <style>{`
                .scrollbar-thin::-webkit-scrollbar {
                    height: 5px;
                    width: 5px;
                }
                .scrollbar-thin::-webkit-scrollbar-track {
                    background: #000000;
                }
                .scrollbar-thin::-webkit-scrollbar-thumb {
                    background: #1e293b;
                    border-radius: 4px;
                }
                .scrollbar-thin::-webkit-scrollbar-thumb:hover {
                    background: #334155;
                }
            `}</style>

            {/* Glassmorphic Top Action Panel */}
            <header className="flex justify-between items-center px-6 py-4 border-b border-slate-900 bg-slate-950/80 backdrop-blur-md shrink-0">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-455 text-emerald-400 rounded-xl">
                        <Code2 size={20} className="animate-pulse" />
                    </div>
                    <div>
                        <h1 className="text-base font-extrabold tracking-tight text-white animate-in slide-in-from-left duration-300">Interactive Coding Sandbox</h1>
                        <p className="text-xs text-slate-400 mt-0.5">Single-file workspace • Anchored to: <span className="text-emerald-400 font-semibold">{nodeTitle}</span></p>
                    </div>
                </div>

                {/* Dropdown Environment Select and Close buttons */}
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400 font-mono">Environment:</span>
                        <div className="relative flex items-center">
                            <select
                                value={selectedLanguage}
                                onChange={(e) => {
                                    const newLang = e.target.value;
                                    setSelectedLanguage(newLang);
                                    setAttachedContext(null); // Clear context on language switch
                                    setLogs([]); // Reload/wipe terminal logs
                                    
                                    // Overwrite the editor buffer to match the new language boilerplate
                                    const newTemplate = SANDBOX_TEMPLATES[newLang];
                                    if (newTemplate && editorRef.current) {
                                        editorRef.current.setValue(newTemplate.boilerplate);
                                    }

                                    if (clearChatRef.current) {
                                        clearChatRef.current();
                                    }
                                }}
                                className="bg-slate-900 border border-slate-800 rounded-xl pl-3 pr-8 py-1.5 text-xs text-slate-200 font-semibold cursor-pointer outline-none appearance-none hover:border-slate-700 transition-colors focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
                            >
                                {Object.values(SANDBOX_TEMPLATES).map((template) => (
                                    <option key={template.id} value={template.id}>
                                        {template.name}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-2.5 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                        </div>
                    </div>

                    <div className="h-4 w-[1px] bg-slate-800" />

                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-900 text-slate-400 hover:text-slate-100 rounded-full transition-colors cursor-pointer"
                        title="Close coding workspace"
                    >
                        <X size={20} />
                    </button>
                </div>
            </header>

            {/* Split Screen Workspace Area */}
            <main ref={containerRef} className="flex-1 flex overflow-hidden relative">
                {/* Monaco Editor Panel (Left Pane) */}
                <section 
                    className={clsx(
                        "flex flex-col h-full bg-slate-950 relative overflow-hidden transition-all duration-300 border-t-2",
                        activePane === 'editor' 
                            ? "border-t-emerald-500 shadow-[inset_0_4px_20px_rgba(16,185,129,0.04)]" 
                            : "border-t-transparent"
                    )}
                    style={{ width: `${leftWidth}%` }}
                >
                    {/* Workspace Header */}
                    <div className="px-5 py-2.5 bg-slate-950/80 border-b border-slate-900 flex justify-between items-center text-xs text-slate-500 font-mono shrink-0">
                        <div className="flex items-center gap-1.5">
                            <Terminal size={13} className="text-emerald-400" />
                            <span>main.{fileExtension}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            {/* Editor Theme Toggle */}
                            <button
                                onClick={() => setEditorTheme(prev => prev === 'vs-dark' ? 'vs' : 'vs-dark')}
                                className="p-1 hover:bg-slate-900 text-slate-400 hover:text-slate-100 rounded-lg transition-colors cursor-pointer flex items-center justify-center"
                                title={`Switch to ${editorTheme === 'vs-dark' ? 'Light' : 'Dark'} Editor Theme`}
                            >
                                {editorTheme === 'vs-dark' ? <Sun size={13} /> : <Moon size={13} />}
                            </button>
                            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-emerald-400 font-bold font-sans">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                <span>Active Template</span>
                            </div>
                        </div>
                    </div>

                    {/* Monaco Editor Canvas */}
                    <div className="flex-1 w-full overflow-hidden bg-slate-950 relative pt-2">
                        <Editor
                            height="100%"
                            language={currentTemplate.monacoLanguage}
                            value={currentTemplate.boilerplate}
                            theme={editorTheme}
                            onMount={handleEditorDidMount}
                            options={{
                                automaticLayout: true,
                                minimap: { enabled: false },
                                fontSize: 13,
                                lineNumbers: 'on',
                                tabSize: 4,
                                wordWrap: 'on',
                                fontFamily: 'Fira Code, Menlo, Monaco, Consolas, Courier New, monospace',
                                fontLigatures: true,
                                cursorBlinking: 'smooth',
                                smoothScrolling: true,
                                roundedSelection: true,
                                scrollBeyondLastLine: false,
                            }}
                            loading={
                                <div className="absolute inset-0 flex items-center justify-center bg-slate-950/80 text-slate-400 gap-2">
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-emerald-500"></div>
                                    <span className="text-xs font-mono">Initializing Monaco Workspace...</span>
                                </div>
                            }
                        />
                    </div>

                    {/* Integrated Terminal Panel */}
                    <div className="h-[200px] border-t border-slate-900 bg-black flex flex-col font-mono text-xs shrink-0 select-text">
                        <div className="px-4 py-2 bg-slate-950/60 border-b border-slate-900 flex justify-between items-center text-[10px] text-slate-500 select-none">
                            <div className="flex items-center gap-1.5 font-bold">
                                <Terminal size={11} className="text-emerald-400" />
                                <span>TERMINAL OUTPUT</span>
                            </div>
                            {logs.length > 0 && (
                                <button
                                    onClick={() => setLogs([])}
                                    className="p-1 hover:bg-slate-900 hover:text-rose-400 text-slate-500 rounded transition-colors cursor-pointer"
                                    title="Clear terminal logs"
                                >
                                    <Trash2 size={12} />
                                </button>
                            )}
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-1.5 text-slate-350 scrollbar-thin">
                            {logs.length === 0 ? (
                                <span className="text-slate-600 italic select-none">No output. Press "Run Code" to execute.</span>
                            ) : (
                                logs.map((log, idx) => (
                                    <div
                                        key={idx}
                                        className={clsx(
                                            "whitespace-pre-wrap leading-relaxed",
                                            log.type === 'error' && "text-rose-400 font-bold",
                                            log.type === 'warn' && "text-amber-400",
                                            log.type === 'log' && "text-slate-300"
                                        )}
                                    >
                                        {log.type === 'error' && "❌ Error: "}
                                        {log.type === 'warn' && "⚠️ Warning: "}
                                        {log.type === 'log' && "› "}
                                        {log.text}
                                    </div>
                                ))
                            )}
                            <div ref={terminalEndRef} />
                        </div>
                    </div>

                    {/* Prompt Bridge Action Dock / Status Bar */}
                    <div className="px-5 py-3 border-t border-slate-900 bg-slate-950 flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-4 text-[11px] text-slate-500 font-mono select-none">
                            <span>Ln {cursorPos.ln}, Col {cursorPos.col}</span>
                            <span>Tab Size: 4</span>
                            <span>UTF-8</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleRunCode}
                                disabled={isRunning}
                                className={clsx(
                                    "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer",
                                    isRunning
                                        ? "bg-slate-900 text-slate-500 border border-slate-800 cursor-not-allowed"
                                        : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 hover:scale-[1.01] focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                                )}
                            >
                                <Play size={12} className={clsx(isRunning && "animate-spin")} />
                                <span>Run Code</span>
                            </button>
                            <button
                                onClick={handleAttachContext}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700/80 hover:text-slate-100 hover:scale-[1.01] focus:outline-none focus:ring-2 focus:ring-slate-700/50"
                            >
                                <Zap size={12} className="text-amber-400" />
                                <span>Attach to Chat</span>
                            </button>
                        </div>
                    </div>
                </section>

                {/* Adjuster Resizing Separator */}
                <div
                    onMouseDown={handleMouseDown}
                    className="w-1.5 hover:w-2 bg-slate-900 hover:bg-emerald-500 border-x border-slate-950 cursor-col-resize transition-all shrink-0 flex items-center justify-center group relative z-30"
                    title="Drag to adjust layouts"
                >
                    <div className="absolute inset-y-0 w-2.5 cursor-col-resize opacity-0" />
                    <ArrowRightLeft size={10} className="text-slate-655 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none text-emerald-200" />
                </div>

                {/* Local WebGPU Chat Assistant (Right Pane) */}
                <section 
                    className={clsx(
                        "h-full relative overflow-hidden transition-all duration-300 border-t-2",
                        activePane === 'chat' 
                            ? "border-t-emerald-500 shadow-[inset_0_4px_20px_rgba(16,185,129,0.04)]" 
                            : "border-t-transparent"
                    )}
                    style={{ width: `${100 - leftWidth}%` }}
                    onMouseDownCapture={() => setActivePane('chat')}
                >
                    <SandboxMentorWidget
                        nodeTitle={nodeTitle}
                        selectedLanguage={selectedLanguage}
                        onAnalyzeTrigger={handleRegisterAnalyzeTrigger}
                        onClearChatTrigger={handleRegisterClearChatTrigger}
                        attachedContext={attachedContext}
                        setAttachedContext={setAttachedContext}
                    />
                </section>
            </main>
        </div>
    );
};

export default InteractiveSandbox;
