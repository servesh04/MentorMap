import React, { useState, useEffect } from 'react';
import { 
    Settings, 
    Save, 
    Sliders, 
    RefreshCw, 
    Check,
    Cpu
} from 'lucide-react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

const AdminConfig: React.FC = () => {
    const [xpMultiplier, setXpMultiplier] = useState(1);
    const [localModelName, setLocalModelName] = useState('Qwen 2.5 1.5B');
    const [maxOutputTokens, setMaxOutputTokens] = useState(1024);
    const [enableCloudFallback, setEnableCloudFallback] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        const loadConfig = async () => {
            try {
                const docRef = doc(db, 'system', 'config');
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    if (data.xpMultiplier !== undefined) setXpMultiplier(data.xpMultiplier);
                    if (data.localModelName !== undefined) setLocalModelName(data.localModelName);
                    if (data.maxOutputTokens !== undefined) setMaxOutputTokens(data.maxOutputTokens);
                    if (data.enableCloudFallback !== undefined) setEnableCloudFallback(data.enableCloudFallback);
                }
            } catch (error) {
                console.error("Failed to load system config:", error);
            }
        };
        loadConfig();
    }, []);

    const handleSave = async () => {
        setIsSaving(true);
        setSaved(false);
        try {
            const docRef = doc(db, 'system', 'config');
            await setDoc(docRef, {
                xpMultiplier,
                localModelName,
                maxOutputTokens,
                enableCloudFallback,
                updatedAt: new Date().toISOString()
            });
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (error) {
            console.error("Failed to save system config:", error);
            alert("Failed to save configuration: " + (error as Error).message);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-900 pb-5">
                <div>
                    <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
                        <Settings className="text-red-500" />
                        App Configuration
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">Configure global application variables, default local models, and platform settings.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="px-5 py-2.5 bg-red-600 hover:bg-red-500 disabled:bg-slate-800 text-white rounded-2xl text-sm font-semibold active:scale-95 transition-all duration-200 flex items-center gap-2 shadow-lg shadow-red-600/10 cursor-pointer"
                >
                    {isSaving ? (
                        <RefreshCw size={16} className="animate-spin" />
                    ) : saved ? (
                        <Check size={16} />
                    ) : (
                        <Save size={16} />
                    )}
                    <span>{isSaving ? "Saving Configuration..." : saved ? "Configuration Saved!" : "Save Changes"}</span>
                </button>
            </div>

            {/* Config Panels */}
            <div className="grid grid-cols-1 gap-6">
                {/* Gamification Settings */}
                <div className="bg-slate-900/40 border border-slate-800/80 p-6 rounded-3xl shadow-md backdrop-blur-md space-y-6">
                    <div className="flex items-center gap-2 border-b border-slate-850 pb-3">
                        <Sliders size={18} className="text-red-400" />
                        <h3 className="text-base font-bold text-white uppercase tracking-wider">Gamification Constants</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">XP Award Multiplier</label>
                            <select 
                                value={xpMultiplier} 
                                onChange={(e) => setXpMultiplier(Number(e.target.value))}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 text-sm focus:outline-none focus:border-red-500/40 transition-colors"
                            >
                                <option value={1}>1.0x (Standard)</option>
                                <option value={1.5}>1.5x (Double XP Weekend Promo)</option>
                                <option value={2}>2.0x (Event Boosting)</option>
                                <option value={5}>5.0x (Developer debug mode)</option>
                            </select>
                            <p className="text-[10px] text-slate-500 leading-normal">System-wide multiplier applied dynamically on every awarded XP transaction log.</p>
                        </div>
                    </div>
                </div>

                {/* Local AI Model Configurations */}
                <div className="bg-slate-900/40 border border-slate-800/80 p-6 rounded-3xl shadow-md backdrop-blur-md space-y-6">
                    <div className="flex items-center gap-2 border-b border-slate-850 pb-3">
                        <Cpu size={18} className="text-red-400" />
                        <h3 className="text-base font-bold text-white uppercase tracking-wider">Local WebGPU Engine Configuration</h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Default Offline LLM Model</label>
                            <select 
                                value={localModelName} 
                                onChange={(e) => setLocalModelName(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 text-sm focus:outline-none focus:border-red-500/40 transition-colors"
                            >
                                <option value="Qwen 2.5 1.5B">Qwen 2.5 - 1.5B (Sweet Spot: ~1GB weights)</option>
                                <option value="Llama 3 8B">Llama 3 - 8B (Higher GPU requirement)</option>
                                <option value="Phi 3 Mini">Phi 3 Mini - 3.8B (Moderate weight footprint)</option>
                            </select>
                            <p className="text-[10px] text-slate-500 leading-normal">Weights downloaded client-side by users choosing local execution.</p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Max Output Generation Tokens</label>
                            <input 
                                type="number" 
                                value={maxOutputTokens}
                                onChange={(e) => setMaxOutputTokens(Number(e.target.value))}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 text-sm focus:outline-none focus:border-red-500/40 transition-colors font-mono"
                            />
                            <p className="text-[10px] text-slate-500 leading-normal">Hard generation token cutoff boundary constraint to control context leaks.</p>
                        </div>
                    </div>

                    {/* Boolean Toggles */}
                    <div className="space-y-4 pt-3 border-t border-slate-850">
                        <div className="flex items-center justify-between">
                            <div>
                                <span className="text-sm font-semibold text-white block">Auto-enable Cloud Fallback</span>
                                <span className="text-[10px] text-slate-400">Silently query cloud APIs (Groq) if user GPU execution fails.</span>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    checked={enableCloudFallback} 
                                    onChange={(e) => setEnableCloudFallback(e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-300 after:border-slate-350 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600 peer-checked:after:bg-white peer-checked:after:border-transparent"></div>
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminConfig;
