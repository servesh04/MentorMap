import React, { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { TrendingUp, TrendingDown, Info, Shield, Loader } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import clsx from 'clsx';

// Removed mock generator for real Firestore data

interface LadderUser {
    id: string;
    rank: number;
    name: string;
    xp: number;
    isCurrentUser: boolean;
    photoURL?: string | null;
}

const League: React.FC = () => {
    const { currentUser, currentBucketId } = useStore();
    const [ladder, setLadder] = useState<LadderUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            if (!currentUser || !currentBucketId) return;
            
            try {
                const docRef = doc(db, 'leaderboards', currentBucketId);
                const docSnap = await getDoc(docRef);
                
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    const participantsObj = data.participants || {};
                    
                    // Transform object map to array
                    const ladderArray = Object.keys(participantsObj).map(uid => {
                        const user = participantsObj[uid];
                        return {
                            id: uid,
                            name: user.displayName || 'Scholar',
                            xp: user.weeklyXp || 0,
                            photoURL: user.photoURL,
                            isCurrentUser: uid === currentUser.uid,
                            rank: 0 // Will assign after sort
                        };
                    });
                    
                    // Sort descending by XP
                    ladderArray.sort((a, b) => b.xp - a.xp);
                    
                    // Assign strict sequential ranks
                    ladderArray.forEach((user, index) => {
                        user.rank = index + 1;
                    });
                    
                    setLadder(ladderArray);
                } else {
                    console.log("No leaderboard bucket found.");
                }
            } catch (error) {
                console.error("Error fetching leaderboard:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchLeaderboard();
    }, [currentUser, currentBucketId]);

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <Loader className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground pb-24 md:pb-6">
            
            {/* HER0 BANNER */}
            <div className="relative overflow-hidden bg-card border-b border-border">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent z-0 pointer-events-none" />
                
                <div className="relative z-10 p-6 md:p-10 flex flex-col md:flex-row md:items-center justify-between gap-6 max-w-5xl mx-auto">
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/20 shrink-0">
                            <Shield className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-bold uppercase tracking-wider text-amber-500">Tier 3</span>
                                <span className="px-2 py-0.5 rounded-full bg-background/50 backdrop-blur-sm text-[10px] font-semibold border border-border">
                                    Ends in: 4d 12h
                                </span>
                            </div>
                            <h1 className="text-3xl font-extrabold tracking-tight">Bronze League</h1>
                            <p className="text-sm text-muted-foreground mt-1 max-w-md">
                                Compete against 30 scholars. Finish in the top 5 to earn a promotion to Silver.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* LADDER CONTAINER */}
            <div className="w-full max-w-3xl mx-auto px-4 py-8">
                
                {/* Headers */}
                <div className="flex items-center px-4 py-3 border-b border-border mb-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    <div className="w-12 text-center">Rank</div>
                    <div className="flex-1 px-4">Scholar</div>
                    <div className="w-20 text-right">XP</div>
                </div>

                {/* Ladder Items */}
                <div className="space-y-2 relative">
                    {ladder.map((user) => {
                        const isPromotion = user.rank <= 5;
                        const isDemotion = user.rank >= 23;
                        const isMe = user.isCurrentUser;

                        return (
                            <React.Fragment key={user.id}>
                                <div 
                                    className={clsx(
                                        "flex items-center px-4 py-3 rounded-2xl transition-all duration-300 relative overflow-hidden group border",
                                        isMe 
                                            ? "bg-primary/10 border-primary/30 shadow-md shadow-primary/5 scale-[1.02] z-10 border-l-4 border-l-emerald-500" 
                                            : isPromotion
                                                ? "bg-emerald-500/5 border-emerald-500/20 hover:bg-emerald-500/10"
                                                : isDemotion
                                                    ? "bg-rose-500/5 border-rose-500/20 hover:bg-rose-500/10"
                                                    : "bg-card border-border hover:border-primary/30"
                                    )}
                                >
                                {/* Active 'Me' Indicator */}
                                {isMe && (
                                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary" />
                                )}

                                {/* Rank Column */}
                                <div className="w-12 flex flex-col items-center justify-center shrink-0">
                                    <span className={clsx(
                                        "text-lg font-black",
                                        isMe ? "text-primary" : "text-muted-foreground"
                                    )}>
                                        {user.rank}
                                    </span>
                                    {isPromotion && !isMe && <TrendingUp className="w-3 h-3 text-emerald-500 mt-0.5" />}
                                    {isDemotion && !isMe && <TrendingDown className="w-3 h-3 text-rose-500 mt-0.5" />}
                                </div>

                                {/* User Plate */}
                                <div className="flex-1 flex items-center gap-3 px-4 min-w-0">
                                    <div className={clsx(
                                        "w-10 h-10 rounded-full flex items-center justify-center shrink-0 border overflow-hidden",
                                        isMe ? "bg-primary text-primary-foreground border-primary" : "bg-muted text-muted-foreground border-border"
                                    )}>
                                        {user.photoURL ? (
                                             <img src={user.photoURL} alt={user.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="font-bold text-sm">
                                                {user.name.charAt(0)}
                                            </span>
                                        )}
                                    </div>
                                    <div className="truncate">
                                        <h3 className={clsx(
                                            "font-bold truncate",
                                            isMe ? "text-foreground text-base" : "text-foreground text-sm"
                                        )}>
                                            {user.name}
                                        </h3>
                                        {isMe && (
                                            <span className="text-[10px] font-semibold text-primary uppercase tracking-wider">
                                                Current Rank
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* XP Column */}
                                <div className="w-20 text-right shrink-0">
                                    <span className={clsx(
                                        "font-mono font-bold",
                                        isMe ? "text-primary text-base" : "text-muted-foreground text-sm"
                                    )}>
                                        {user.xp}
                                    </span>
                                </div>
                            </div>
                            
                            {/* Dividers */}
                            {user.rank === 5 && (
                                <div className="flex items-center my-4 opacity-80 pl-2 pr-2">
                                    <div className="flex-grow border-t border-dashed border-emerald-500/50"></div>
                                    <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-emerald-500 bg-emerald-500/10 rounded-full mx-3">
                                        ⬆️ Promotion Zone Cutoff
                                    </span>
                                    <div className="flex-grow border-t border-dashed border-emerald-500/50"></div>
                                </div>
                            )}
                            {user.rank === 22 && (
                                <div className="flex items-center my-4 opacity-80 pl-2 pr-2">
                                    <div className="flex-grow border-t border-dashed border-rose-500/50"></div>
                                    <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-rose-500 bg-rose-500/10 rounded-full mx-3">
                                        ⬇️ Demotion Zone Cutoff
                                    </span>
                                    <div className="flex-grow border-t border-dashed border-rose-500/50"></div>
                                </div>
                            )}
                            </React.Fragment>
                        );
                    })}
                </div>

                {/* Info Footer */}
                <div className="mt-8 flex items-start gap-3 p-4 rounded-xl bg-muted/50 border border-border text-sm text-muted-foreground">
                    <Info className="w-5 h-5 shrink-0 text-amber-500" />
                    <p>
                        Leagues are grouped by 30 scholars of similar skill levels. Finish in the top 5 to advance to the next tier and unlock permanent XP multiplier bonuses.
                    </p>
                </div>
            </div>

        </div>
    );
};

export default League;
