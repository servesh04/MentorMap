import React, { useState, useEffect } from 'react';
import { X, Cpu, CheckCircle2, AlertTriangle, Trash2, Download, Loader2 } from 'lucide-react';
import { useStore } from '../store/useStore';
import { checkWebGPUSupport, loadLocalModel, clearModelCache, isModelCached } from '../services/webllmService';
import clsx from 'clsx';

interface OfflineAIModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const OfflineAIModal: React.FC<OfflineAIModalProps> = ({ isOpen, onClose }) => {
    const { offlineSettings, setOfflineSettings } = useStore();
    const [webGpuSupported, setWebGpuSupported] = useState<boolean | null>(null);
    const [progress, setProgress] = useState(0);
    const [statusText, setStatusText] = useState('');
    const [isDownloading, setIsDownloading] = useState(false);
    const [isClearing, setIsClearing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            checkWebGPUSupport().then(supported => {
                setWebGpuSupported(supported);
            });
            isModelCached().then(cached => {
                setOfflineSettings({ hasAcceptedDownload: cached });
            });
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleToggle = () => {
        if (!webGpuSupported) return;

        if (!offlineSettings.offlineModeEnabled) {
            // Enable offline mode
            if (offlineSettings.hasAcceptedDownload) {
                setOfflineSettings({ offlineModeEnabled: true });
            } else {
                // Must download first
                handleDownload();
            }
        } else {
            // Disable offline mode (uses cloud API)
            setOfflineSettings({ offlineModeEnabled: false });
        }
    };

    const handleDownload = async () => {
        setIsDownloading(true);
        setError(null);
        setProgress(0);
        setStatusText('Initializing WebGPU...');

        try {
            await loadLocalModel((prog, text) => {
                setProgress(prog);
                setStatusText(text);
            });
            setOfflineSettings({ hasAcceptedDownload: true, offlineModeEnabled: true });
            setStatusText('Model ready');
        } catch (err: any) {
            console.error('Local download failed:', err);
            setError(err.message || 'Failed to download model weights. Ensure you are online and have sufficient memory.');
        } finally {
            setIsDownloading(false);
        }
    };

    const handleClearCache = async () => {
        if (
            confirm(
                'Are you sure you want to delete the offline model weights? This will free up ~850MB of local storage, and you will need to re-download them to use offline chat.'
            )
        ) {
            setIsClearing(true);
            try {
                await clearModelCache();
                setOfflineSettings({ hasAcceptedDownload: false, offlineModeEnabled: false });
                alert('Offline model weights deleted successfully!');
            } catch (err) {
                console.error('Failed to clear cache:', err);
                alert('Failed to clear cache.');
            } finally {
                setIsClearing(false);
            }
        }
    };

    return (
        <div
            className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm"
            onClick={e => {
                if (e.target === e.currentTarget && !isDownloading) onClose();
            }}
        >
            <div
                className={clsx(
                    'w-full sm:max-w-md bg-background rounded-t-2xl sm:rounded-2xl border border-slate-200 dark:border-slate-700/50 shadow-2xl transition-all duration-300',
                    'max-h-[85vh] overflow-y-auto'
                )}
            >
                {/* Header */}
                <div className="sticky top-0 bg-background/90 backdrop-blur-md flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-700/50 z-10">
                    <h2 className="text-lg font-bold text-foreground">Offline AI</h2>
                    <button
                        onClick={onClose}
                        disabled={isDownloading}
                        className="p-1.5 rounded-full hover:bg-muted transition-colors text-muted-foreground disabled:opacity-30"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-5 space-y-5">
                    {/* Device Capability Check */}
                    <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50">
                        <Cpu className="w-5 h-5 text-slate-500 dark:text-slate-400 mt-0.5 shrink-0" />
                        <div>
                            <h4 className="text-sm font-semibold text-foreground">Device Compatibility</h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                WebGPU is required for running local AI weights directly in your browser.
                            </p>
                            <div className="mt-2.5 flex items-center gap-1.5 text-xs font-bold">
                                {webGpuSupported === null ? (
                                    <span className="text-slate-400 animate-pulse">Checking hardware...</span>
                                ) : webGpuSupported ? (
                                    <span className="text-emerald-500 flex items-center gap-1">
                                        <CheckCircle2 size={14} /> WebGPU Supported
                                    </span>
                                ) : (
                                    <span className="text-amber-500 flex items-center gap-1">
                                        <AlertTriangle size={14} /> WebGPU Unsupported on this browser
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Offline Toggle Row */}
                    <div
                        className={clsx(
                            'flex items-center justify-between px-4 py-4 rounded-xl border transition-colors',
                            webGpuSupported
                                ? 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700/50'
                                : 'bg-slate-100/50 dark:bg-slate-900/30 border-slate-200 dark:border-slate-800/80 opacity-50 cursor-not-allowed'
                        )}
                    >
                        <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-bold text-foreground">Offline Mentor Chat</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-500 mt-0.5">
                                Route mentor queries entirely to a local Qwen 2.5 1.5B model.
                            </p>
                        </div>

                        <button
                            onClick={handleToggle}
                            disabled={!webGpuSupported || isDownloading}
                            className={clsx(
                                'relative shrink-0 ml-4 w-11 h-6 rounded-full transition-colors duration-200',
                                offlineSettings.offlineModeEnabled && webGpuSupported
                                    ? 'bg-emerald-500'
                                    : 'bg-slate-300 dark:bg-slate-600'
                            )}
                            role="switch"
                            aria-checked={offlineSettings.offlineModeEnabled}
                        >
                            <span
                                className={clsx(
                                    'absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200',
                                    offlineSettings.offlineModeEnabled && 'translate-x-5'
                                )}
                            />
                        </button>
                    </div>

                    {/* Download & Storage Status */}
                    {webGpuSupported && (
                        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50">
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
                                Model Storage (~850 MB)
                            </h4>

                            {isDownloading ? (
                                <div className="space-y-2.5">
                                    <div className="flex items-center justify-between text-xs font-medium">
                                        <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                                            <Loader2 size={13} className="animate-spin text-emerald-500" />
                                            {statusText || 'Downloading weights...'}
                                        </span>
                                        <span className="text-emerald-500 font-bold">{progress}%</span>
                                    </div>
                                    <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-emerald-500 transition-all duration-300 rounded-full"
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-3">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-slate-500">Local Weight Cache Status:</span>
                                        <span className="font-semibold text-foreground">
                                            {offlineSettings.hasAcceptedDownload ? (
                                                <span className="text-emerald-500">Downloaded</span>
                                            ) : (
                                                <span className="text-slate-400">Not Downloaded</span>
                                            )}
                                        </span>
                                    </div>

                                    {error && (
                                        <div className="text-xs text-rose-500 bg-rose-500/10 p-2.5 rounded-lg border border-rose-500/20">
                                            {error}
                                        </div>
                                    )}

                                    <div className="flex items-center gap-2.5 mt-1">
                                        {!offlineSettings.hasAcceptedDownload ? (
                                            <button
                                                onClick={handleDownload}
                                                className="flex-1 h-10 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                                            >
                                                <Download size={13} /> Download Weights (850MB)
                                            </button>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={handleDownload}
                                                    className="flex-1 h-10 px-4 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-foreground font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                                                >
                                                    Redownload / Repair
                                                </button>
                                                <button
                                                    onClick={handleClearCache}
                                                    disabled={isClearing}
                                                    className="h-10 px-3 rounded-lg border border-rose-500/30 text-rose-500 hover:bg-rose-500/10 font-medium text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                                                    title="Delete local weights cache"
                                                >
                                                    <Trash2 size={13} /> Delete Cache
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <p className="text-[10px] text-slate-500 text-center leading-relaxed">
                        Local weights are stored safely inside browser Cache / IndexedDB databases. 
                        Toggling offline mode off reverts queries to the default Cloud API (Groq LLaMA 3).
                    </p>
                </div>
            </div>
        </div>
    );
};

export default OfflineAIModal;
