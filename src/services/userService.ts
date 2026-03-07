import { doc, updateDoc, deleteDoc, increment } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useStore } from '../store/useStore';
import { evaluateAndUnlockBadges } from '../utils/badgeEvaluator';

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
