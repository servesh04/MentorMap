import { doc, updateDoc, deleteDoc, increment, setDoc, runTransaction } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from '../lib/firebase';
import { useStore } from '../store/useStore';
import { evaluateAndUnlockBadges } from '../utils/badgeEvaluator';
import { getCurrentWeekString } from '../utils/dateHelpers';

/**
 * Syncs partial user profile data to Firestore.
 * Used for background sync after optimistic UI updates.
 * Throws on failure so the caller can rollback.
 */
export const updateUserFirestoreProfile = async (
    uid: string,
    data: Record<string, unknown>
): Promise<void> => {
    try {
        await updateDoc(doc(db, 'users', uid), data);
    } catch (error) {
        console.error('Firestore sync failed:', error);
        throw error;
    }
};

/**
 * Permanently deletes a user's Firestore document.
 */
export const deleteUserFirestoreProfile = async (uid: string): Promise<void> => {
    await deleteDoc(doc(db, 'users', uid));
};

/**
 * Awards XP with optimistic UI + Firestore increment.
 */
export const awardXP = async (userId: string, amount: number): Promise<{ earned: number, boostUsed: boolean }> => {
    const state = useStore.getState();
    const { addLocalXP, inventory } = state;
    
    const hasBoost = inventory.xpBoosts > 0;
    const finalXP = hasBoost ? amount * 2 : amount;

    // Optimistic update
    addLocalXP(finalXP);
    if (hasBoost) {
        useStore.setState((s) => ({
            ...s,
            inventory: {
                ...s.inventory,
                xpBoosts: s.inventory.xpBoosts - 1
            }
        }));
    }

    try {
        const updatePayload: Record<string, any> = {
            xp: increment(finalXP)
        };
        
        if (hasBoost) {
            updatePayload['inventory.xpBoosts'] = increment(-1);
        }

        await updateDoc(doc(db, 'users', userId), updatePayload);

        // Sync to League Bucket
        const { currentBucketId, currentUser } = state;
        if (currentBucketId && currentUser) {
            const bucketRef = doc(db, 'leaderboards', currentBucketId);
            await setDoc(bucketRef, {
                participants: {
                    [userId]: {
                        weeklyXp: increment(finalXP),
                        displayName: currentUser.displayName || 'Scholar',
                        photoURL: currentUser.photoURL || null
                    }
                }
            }, { merge: true });
        }

        // Evaluate badges after successful XP update
        evaluateAndUnlockBadges(userId);
        return { earned: finalXP, boostUsed: hasBoost };
    } catch (error) {
        // Rollback
        addLocalXP(-finalXP);
        if (hasBoost) {
            useStore.setState((s) => ({
                ...s,
                inventory: {
                    ...s.inventory,
                    xpBoosts: s.inventory.xpBoosts + 1
                }
            }));
        }
        console.error('XP sync failed:', error);
        return { earned: 0, boostUsed: false };
    }
};

/**
 * Calculates and updates the daily streak based on the user's local timezone.
 * - Same day → no-op
 * - Yesterday → streak + 1
 * - 2+ days gap → reset to 1
 */
export const calculateDailyStreak = async (
    userId: string,
    currentStreak: number,
    lastActiveDate: string
): Promise<void> => {
    const state = useStore.getState();
    const { setLocalStreak, inventory } = state;

    // Get today in user's local timezone as 'YYYY-MM-DD'
    const today = new Date().toLocaleDateString('en-CA'); // 'en-CA' gives YYYY-MM-DD

    // Already checked in today
    if (lastActiveDate === today) return;

    const todayDate = new Date(today);
    const lastActive = new Date(lastActiveDate);
    const diffTime = Math.abs(todayDate.getTime() - lastActive.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let newStreak = currentStreak;
    let freezeConsumed = false;

    if (diffDays === 1) {
        // Logged in yesterday
        newStreak = currentStreak + 1;
    } else if (diffDays >= 2) {
        // Danger Zone: Missed 2+ days
        if (inventory.streakFreezes > 0) {
            // Consume freeze, save streak
            freezeConsumed = true;
            console.log('🧊 Streak Freeze Consumed!');
            // In a real app we'd trigger a robust toast: toast.success('🧊 Streak Freeze Consumed! Your streak is safe.');
            alert('🧊 Streak Freeze Consumed! Your streak is safe.');
        } else {
            // Unprotected streak break
            newStreak = 1;
            console.log('⚠️ Streak lost!');
            // toast.error('⚠️ Streak lost! Time to rebuild.');
        }
    }

    // Optimistic update
    setLocalStreak(newStreak, today);
    if (freezeConsumed) {
        useStore.setState((s) => ({
            ...s,
            inventory: {
                ...s.inventory,
                streakFreezes: s.inventory.streakFreezes - 1
            }
        }));
    }

    try {
        const updatePayload: Record<string, any> = {
            streak: newStreak,
            lastActiveDate: today,
        };
        
        if (freezeConsumed) {
            updatePayload['inventory.streakFreezes'] = increment(-1);
        }

        await updateDoc(doc(db, 'users', userId), updatePayload);
        // Evaluate badges after successful streak update
        evaluateAndUnlockBadges(userId);
    } catch (error) {
        // Rollback
        setLocalStreak(currentStreak, lastActiveDate);
        if (freezeConsumed) {
            useStore.setState((s) => ({
                ...s,
                inventory: {
                    ...s.inventory,
                    streakFreezes: s.inventory.streakFreezes + 1
                }
            }));
        }
        console.error('Streak sync failed:', error);
    }
};

/**
 * Transactional Matchmaking Engine
 * Assigns a user to the current week's correct bucket, scaling horizontally when buckets reach 30 players.
 */
export const assignToWeeklyLeague = async (userId: string, leagueType: string): Promise<string | null> => {
    const weekString = getCurrentWeekString();
    const metadataRef = doc(db, 'leaderboards', `metadata_${weekString}_${leagueType}`);
    const userRef = doc(db, 'users', userId);

    try {
        const newBucketId = await runTransaction(db, async (transaction) => {
            const metadataSnap = await transaction.get(metadataRef);
            
            let currentBucketIndex = 1;
            let playerCount = 0;

            if (metadataSnap.exists()) {
                const metaData = metadataSnap.data();
                currentBucketIndex = metaData.currentBucketIndex || 1;
                playerCount = metaData.playerCount || 0;
            }

            // Logic: Is the current bucket full? (30 players)
            if (playerCount >= 30) {
                currentBucketIndex += 1;
                playerCount = 0; // Starts at 0, incremented below
            }

            const targetBucketId = `${weekString}_${leagueType}_${currentBucketIndex}`;
            const targetBucketRef = doc(db, 'leaderboards', targetBucketId);

            // Create an explicit expiry timestamp for Firestore TTL (14 days into the future)
            const expiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

            // Write 1: Update Metadata (increment count, set index)
            transaction.set(metadataRef, {
                currentBucketIndex,
                playerCount: playerCount + 1,
                expiresAt
            }, { merge: true });

            // Write 2: Add to Bucket Document Map
            const state = useStore.getState();
            const currentUser = state.currentUser;
            
            transaction.set(targetBucketRef, {
                expiresAt,
                participants: {
                    [userId]: {
                        weeklyXp: 0, // Reset XP for the new week
                        displayName: currentUser?.displayName || 'Scholar',
                        photoURL: currentUser?.photoURL || null
                    }
                }
            }, { merge: true });

            // Write 3: Update User Profile
            transaction.update(userRef, {
                currentBucketId: targetBucketId
            });

            return targetBucketId;
        });

        // Sync local state
        useStore.getState().setLeagueData(leagueType, newBucketId);
        console.log(`🚀 Successfully matched into bucket: ${newBucketId}`);

        // Fire-and-forget: seed bots into the fresh bucket
        try {
            const seedBots = httpsCallable(functions, 'seedBotsIntoBucket');
            seedBots({ bucketId: newBucketId }).then((result) => {
                console.log('🤖 Bot seeding result:', result.data);
            }).catch((err) => {
                console.warn('Bot seeding failed (non-critical):', err);
            });
        } catch (e) {
            console.warn('Could not invoke bot seeder:', e);
        }

        return newBucketId;

    } catch (error) {
        console.error("Matchmaking Transaction Failed:", error);
        return null;
    }
};
