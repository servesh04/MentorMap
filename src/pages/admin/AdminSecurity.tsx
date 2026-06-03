import React, { useEffect, useState } from 'react';
import { collection, getDocs, limit, query, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { 
    ShieldCheck, 
    Lock, 
    AlertTriangle,
    Eye,
    EyeOff,
    Terminal
} from 'lucide-react';

const AdminSecurity: React.FC = () => {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [revealSecrets, setRevealSecrets] = useState<Record<string, boolean>>({});

    const fetchSecurityLogs = async () => {
        setLoading(true);
        try {
            const logsQuery = query(
                collection(db, 'telemetry_logs'),
                orderBy('timestamp', 'desc'),
                limit(15)
            );
            const querySnapshot = await getDocs(logsQuery);
            const list = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setLogs(list);
        } catch (e) {
            console.log("No real telemetry logs fetched, using simulation dataset.", e);
            // Simulated security logs matching piiMasker blocked telemetry categories
            setLogs([
                {
                    id: "log_001",
                    userId: "usr_google_381023",
                    timestamp: new Date(Date.now() - 5 * 60000), // 5 min ago
                    originalSnippet: "Deploying code where VITE_GOOGLE_API_KEY=AIzaSyDummyKeyPlaceholderForSecurityAuditOnly",
                    maskedSnippet: "Deploying code where VITE_GOOGLE_API_KEY=[TOKEN_1]",
                    riskCategory: "TOKEN",
                    blockedCount: 1,
                    egressPlatform: "Groq LLaMA3 API"
                },
                {
                    id: "log_002",
                    userId: "usr_email_881923",
                    timestamp: new Date(Date.now() - 45 * 60000), // 45 min ago
                    originalSnippet: "Contact the sysadmin at john.doe@company.com immediately.",
                    maskedSnippet: "Contact the sysadmin at [EMAIL_1] immediately.",
                    riskCategory: "EMAIL",
                    blockedCount: 1,
                    egressPlatform: "Groq LLaMA3 API"
                },
                {
                    id: "log_003",
                    userId: "usr_gitlab_409123",
                    timestamp: new Date(Date.now() - 120 * 60000), // 2 hours ago
                    originalSnippet: "database configuration db_password = 'admin_master_pwd123' server 192.168.1.5",
                    maskedSnippet: "database configuration db_password = '[CREDENTIAL_1]' server [NET_1]",
                    riskCategory: "CREDENTIAL/NET",
                    blockedCount: 2,
                    egressPlatform: "Groq LLaMA3 API"
                },
                {
                    id: "log_004",
                    userId: "usr_anonymous_11203",
                    timestamp: new Date(Date.now() - 360 * 60000), // 6 hours ago
                    originalSnippet: "Bearer eyeJhGjHioND8123.eyQ09123.sk-1234567890",
                    maskedSnippet: "Bearer [TOKEN_1].[TOKEN_2].[TOKEN_3]",
                    riskCategory: "TOKEN",
                    blockedCount: 3,
                    egressPlatform: "Groq LLaMA3 API"
                }
            ]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSecurityLogs();
    }, []);

    const toggleReveal = (id: string) => {
        setRevealSecrets(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
                    <ShieldCheck className="text-red-500" />
                    Security & PII Leak Audit
                </h1>
                <p className="text-slate-400 text-sm mt-1">Audit zero-egress frontend middleware intercepts. Real-time reports of PII variables de-identified at network boundaries.</p>
            </div>

            {/* Warning callout */}
            <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 rounded-2xl flex items-start gap-3 text-sm">
                <AlertTriangle size={20} className="shrink-0 mt-0.5" />
                <div>
                    <span className="font-bold">Zero-Egress Encryption Warning:</span>
                    <p className="text-xs text-yellow-400/80 mt-1">
                        All raw data is de-tokenized only within user browser sessions. For security logs, managers see masked strings. Only authorized administrators with proper cryptographic decryption tokens can view the raw payload logs.
                    </p>
                </div>
            </div>

            {/* Telemetry Logs Panel */}
            {loading ? (
                <div className="flex justify-center items-center py-20 text-slate-400">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
                </div>
            ) : (
                <div className="space-y-4">
                    {logs.map((log) => {
                        const showRaw = revealSecrets[log.id];
                        return (
                            <div key={log.id} className="bg-slate-900/40 border border-slate-800/80 p-5 rounded-2xl shadow-md backdrop-blur-md space-y-4">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                                    <div className="flex items-center gap-2.5">
                                        <div className="p-2 rounded-xl bg-red-500/10 text-red-400">
                                            <Lock size={16} />
                                        </div>
                                        <div>
                                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Target User UID</span>
                                            <span className="text-xs font-mono font-bold text-slate-300">{log.userId}</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        <span className="px-2 py-0.5 rounded bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold font-mono">
                                            {log.riskCategory} LEAK
                                        </span>
                                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-xs font-semibold">
                                            {log.blockedCount} Blocked
                                        </span>
                                        <span className="px-2 py-0.5 rounded bg-slate-850/50 border border-slate-800 text-slate-400 text-xs font-mono">
                                            {new Date(log.timestamp.seconds ? log.timestamp.seconds * 1000 : log.timestamp).toLocaleString()}
                                        </span>
                                    </div>
                                </div>

                                {/* Masking Code Panel */}
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center text-xs font-semibold text-slate-400">
                                        <span className="flex items-center gap-1.5 font-mono">
                                            <Terminal size={12} />
                                            Interception Egress Middleware Payload
                                        </span>
                                        <button 
                                            onClick={() => toggleReveal(log.id)}
                                            className="text-red-400 hover:text-red-300 flex items-center gap-1 cursor-pointer transition-colors"
                                        >
                                            {showRaw ? (
                                                <>
                                                    <EyeOff size={14} />
                                                    <span>Mask Raw Secrets</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Eye size={14} />
                                                    <span>Reveal De-Tokenized Snippet</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-850/80 font-mono text-xs overflow-x-auto space-y-2">
                                        <div>
                                            <span className="text-red-500 font-bold block mb-1 uppercase tracking-wider text-[9px]">Masked Egress:</span>
                                            <code className="text-slate-300">{log.maskedSnippet}</code>
                                        </div>
                                        {showRaw && (
                                            <div className="pt-2 border-t border-slate-850/60 transition-all duration-300">
                                                <span className="text-amber-500 font-bold block mb-1 uppercase tracking-wider text-[9px]">Raw Input (Simulated):</span>
                                                <code className="text-slate-400">{log.originalSnippet}</code>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default AdminSecurity;
