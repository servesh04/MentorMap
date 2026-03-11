import React from 'react';
import { useStore } from '../store/useStore';
import { doc, updateDoc, deleteField } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { Trophy, Shield, AlertTriangle } from 'lucide-react';
import clsx from 'clsx';
// Note: Since react-confetti is not confirmed installed, we'll use CSS based visual effects or skip it for now.

const WeeklyResultModal: React.FC = () => {
    const { pendingLeagueResult, setPendingLeagueResult } = useStore();

    if (!pendingLeagueResult) return null;

    const { status, rank, newLeague, xp } = pendingLeagueResult;

    const handleDismiss = async () => {
        const user = auth.currentUser;
        if (!user) {
            setPendingLeagueResult(null);
            return;
        }

        try {
            const userRef = doc(db, 'users', user.uid);
            await updateDoc(userRef, {
                pendingLeagueResult: deleteField()
            });
            setPendingLeagueResult(null);
        } catch (error) {
            console.error('Failed to clear pending league result:', error);
            // Clear locally even if write fails so user isn't stuck
            setPendingLeagueResult(null);
        }
    };

    let themeStyles = '';
    let title = '';
    let subtext = '';
    let Icon = Trophy;
    let buttonText = 'Claim & Continue';

    if (status === 'promoted') {
        themeStyles = "from-emerald-900/40 to-emerald-600/20 border-emerald-500/50 text-emerald-400";
        title = `You placed Rank ${rank}!`;
        subtext = `Promoted to ${newLeague.charAt(0).toUpperCase() + newLeague.slice(1)}`;
        Icon = Trophy;
        buttonText = 'Claim Promotion';
    } else if (status === 'safe') {
        themeStyles = "from-slate-800 to-slate-900 border-border text-slate-300";
        title = `You survived at Rank ${rank}.`;
        subtext = `Holding steady in ${newLeague.charAt(0).toUpperCase() + newLeague.slice(1)}`;
        Icon = Shield;
        buttonText = 'Continue';
    } else if (status === 'demoted') {
        themeStyles = "from-rose-900/40 to-rose-600/20 border-rose-500/50 text-rose-400";
        title = `You fell to Rank ${rank}.`;
        subtext = `Demoted to ${newLeague.charAt(0).toUpperCase() + newLeague.slice(1)}`;
        Icon = AlertTriangle;
        buttonText = 'Accept Fate';
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md px-4 fade-in">
            <div className={clsx(
                "w-full max-w-md bg-card/95 border rounded-3xl p-8 text-center shadow-2xl overflow-hidden relative",
                "bg-gradient-to-b", themeStyles.split(' ') // applying the background gradient styles
            )}>
                {/* Visual Glow */}
                <div className={clsx(
                    "absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 rounded-full blur-[80px] -z-10",
                    status === 'promoted' ? 'bg-emerald-500/50' : status === 'demoted' ? 'bg-rose-500/50' : 'bg-blue-500/20'
                )} />

                <div className={clsx(
                    "mx-auto w-24 h-24 rounded-full flex items-center justify-center mb-6 shadow-inner",
                    status === 'promoted' ? 'bg-emerald-500/20 shadow-emerald-500/50' : 
                    status === 'demoted' ? 'bg-rose-500/20 shadow-rose-500/50' : 
                    'bg-slate-800 shadow-slate-900'
                )}>
                    <Icon className={clsx(
                        "w-12 h-12",
                        status === 'promoted' ? 'text-emerald-400' : 
                        status === 'demoted' ? 'text-rose-400' : 
                        'text-slate-400'
                    )} />
                </div>

                <h1 className="text-3xl font-black text-foreground mb-2 drop-shadow-md">
                    {title}
                </h1>
                
                <p className={clsx(
                    "text-lg font-semibold mb-8 uppercase tracking-widest",
                    status === 'promoted' ? 'text-emerald-400' : 
                    status === 'demoted' ? 'text-rose-400' : 
                    'text-muted-foreground'
                )}>
                    {subtext}
                </p>

                <div className="bg-background/50 rounded-2xl p-4 mb-8 border border-border/50">
                    <p className="text-sm text-muted-foreground mb-1 uppercase tracking-wider font-bold">Final Weekly XP</p>
                    <p className="text-4xl font-mono font-black text-foreground">{xp}</p>
                </div>

                <button
                    onClick={handleDismiss}
                    className={clsx(
                        "w-full py-4 rounded-xl font-bold text-lg transition-transform active:scale-95 shadow-lg relative overflow-hidden",
                        status === 'promoted' ? 'bg-emerald-500 text-black hover:bg-emerald-400 shadow-emerald-500/20' : 
                        status === 'demoted' ? 'bg-rose-500 text-white hover:bg-rose-600 shadow-rose-500/20' : 
                        'bg-slate-700 text-white hover:bg-slate-600'
                    )}
                >
                    {buttonText}
                </button>
            </div>
            
            <style>{`
                .fade-in {
                    animation: fadeIn 0.4s ease-out forwards;
                }
                @keyframes fadeIn {
                    from { opacity: 0; backdrop-filter: blur(0px); }
                    to { opacity: 1; backdrop-filter: blur(12px); }
                }
            `}</style>
        </div>
    );
};

export default WeeklyResultModal;
