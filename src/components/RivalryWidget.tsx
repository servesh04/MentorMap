import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, ChevronRight, TrendingUp, Loader } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useStore } from '../store/useStore';
import clsx from 'clsx';

interface LadderUser {
    id: string;
    rank: number;
    name: string;
    xp: number;
    isCurrentUser: boolean;
    photoURL?: string | null;
}

export const RivalryWidget: React.FC = () => {
    const navigate = useNavigate();
    const { currentUser, currentBucketId } = useStore();
    const [mockRivals, setMockRivals] = useState<LadderUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchRivals = async () => {
            if (!currentUser || !currentBucketId) return;

            try {
                const docRef = doc(db, 'leaderboards', currentBucketId);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    const participantsObj = data.participants || {};

                    // 1. Convert to array and sort
                    const ladderArray = Object.keys(participantsObj).map(uid => ({
                        id: uid,
                        name: participantsObj[uid].displayName || 'Scholar',
                        xp: participantsObj[uid].weeklyXp || 0,
                        photoURL: participantsObj[uid].photoURL,
                        isCurrentUser: uid === currentUser.uid,
                        rank: 0
                    })).sort((a, b) => b.xp - a.xp);

                    // 2. Assign ranks
                    ladderArray.forEach((u, i) => u.rank = i + 1);

                    // 3. Find current user index
                    const myIndex = ladderArray.findIndex(u => u.isCurrentUser);

                    // 4. Slice out the micro-ladder (Above, Current, Below)
                    if (myIndex !== -1) {
                        let startIndex = myIndex - 1;
                        let endIndex = myIndex + 2;

                        // Clamp bounding to valid array indexes to ensure length of 3 if possible
                        if (startIndex < 0) {
                            startIndex = 0;
                            endIndex = Math.min(3, ladderArray.length);
                        }
                        if (endIndex > ladderArray.length) {
                             endIndex = ladderArray.length;
                             startIndex = Math.max(0, ladderArray.length - 3);
                        }
                        
                        setMockRivals(ladderArray.slice(startIndex, endIndex));
                    } else if (ladderArray.length > 0) {
                         // Fallback if not found inside array 
                         setMockRivals(ladderArray.slice(0, 3));
                    }
                }
            } catch (error) {
                console.error("Failed to fetch snippet ladder", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchRivals();
    }, [currentUser, currentBucketId]);

    if (isLoading) {
        return (
            <div className="w-full bg-card border border-border rounded-2xl p-8 mb-8 flex items-center justify-center">
                 <Loader className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
        );
    }
    
    if (mockRivals.length === 0) return null;
    // Calculate distance to next rank if not #1
    const myIndex = mockRivals.findIndex(r => r.isCurrentUser);
    const target = myIndex > 0 ? mockRivals[myIndex - 1] : null;
    const me = mockRivals.find(r => r.isCurrentUser);
    const xpDiff = target && me ? target.xp - me.xp : 0;

    return (
        <div 
            onClick={() => navigate('/league')}
            className="w-full bg-card border border-border rounded-2xl p-5 mb-8 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                        <Trophy className="w-5 h-5 text-amber-500" />
                    </div>
                    <div>
                        <h3 className="font-bold text-foreground">Bronze League</h3>
                        {target && me ? (
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <TrendingUp className="w-3 h-3 text-emerald-500" />
                                {xpDiff} XP behind {target.name.split(' ')[0]}
                            </p>
                        ) : (
                             <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <Trophy className="w-3 h-3 text-emerald-500" />
                                Rank #1 in League
                            </p>
                        )}
                    </div>
                </div>
                <div className="p-2 bg-muted/50 rounded-full group-hover:bg-primary/10 transition-colors">
                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
            </div>

            <div className="space-y-1.5">
                {mockRivals.map((rival) => (
                    <div 
                        key={rival.rank} 
                        className={clsx(
                            "flex items-center px-3 py-2 rounded-xl text-sm transition-colors border overflow-hidden",
                            rival.isCurrentUser ? "bg-primary/10 border-primary/20 border-l-[3px] border-l-emerald-500" : "bg-muted/30 border-transparent"
                        )}
                    >
                        <span className={clsx(
                            "w-6 text-center font-bold mr-3",
                            rival.isCurrentUser ? "text-primary" : "text-muted-foreground"
                        )}>
                            {rival.rank}
                        </span>
                        
                        <div className="flex-1 flex items-center gap-2 min-w-0">
                            <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 border border-border overflow-hidden bg-muted">
                                {rival.photoURL ? (
                                    <img src={rival.photoURL} alt="User" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-[10px] font-bold text-muted-foreground">
                                        {rival.name.charAt(0)}
                                    </span>
                                )}
                            </div>
                            <span className={clsx(
                                "font-semibold truncate",
                                rival.isCurrentUser ? "text-primary" : "text-foreground"
                            )}>
                                {rival.name}
                            </span>
                        </div>
                        
                        <span className="font-mono text-muted-foreground font-medium shrink-0">
                            {rival.xp}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};
