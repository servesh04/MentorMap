import { doc, updateDoc, deleteDoc, increment } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useStore } from '../store/useStore';

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
export const awardXP = async (userId: string, amount: number): Promise<void> => {
    const { addLocalXP } = useStore.getState();

    // Optimistic update
    addLocalXP(amount);

    try {
        await updateDoc(doc(db, 'users', userId), { xp: increment(amount) });
    } catch (error) {
        // Rollback
        addLocalXP(-amount);
        console.error('XP sync failed:', error);
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
    const { setLocalStreak } = useStore.getState();

    // Get today in user's local timezone as 'YYYY-MM-DD'
    const today = new Date().toLocaleDateString('en-CA'); // 'en-CA' gives YYYY-MM-DD

    // Already checked in today
    if (lastActiveDate === today) return;

    // Check if last active was yesterday
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toLocaleDateString('en-CA');

    let newStreak: number;
    if (lastActiveDate === yesterdayStr) {
        newStreak = currentStreak + 1;
    } else {
        newStreak = 1; // Reset streak
    }

    // Optimistic update
    setLocalStreak(newStreak, today);

    try {
        await updateDoc(doc(db, 'users', userId), {
            streak: newStreak,
            lastActiveDate: today,
        });
    } catch (error) {
        // Rollback
        setLocalStreak(currentStreak, lastActiveDate);
        console.error('Streak sync failed:', error);
    }
};
