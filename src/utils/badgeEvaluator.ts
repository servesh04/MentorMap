/**
 * Badge Evaluator Engine
 * Checks user stats against badge conditions and unlocks earned badges.
 */
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useStore } from '../store/useStore';
import { BADGE_MAP } from '../constants/badges';

/**
 * Evaluate all badge conditions and unlock any newly earned badges.
 * Call this after: module completion, XP award, streak update, bounty pass.
 */
export const evaluateAndUnlockBadges = async (userId: string): Promise<void> => {
    const state = useStore.getState();
    const { xp, streak, completedModules, unlockedBadges, lastBountyDate } = state;

    // Total completed modules across all courses
    const totalCompleted = Object.values(completedModules).flat().length;

    // Has completed at least one bounty (lastBountyDate is set)
    const hasCompletedBounty = lastBountyDate !== '';

    // Define conditions for each badge
    const conditions: Record<string, boolean> = {
        first_blood: totalCompleted >= 1,
        streak_7: streak >= 7,
        streak_30: streak >= 30,
        bounty_hunter: hasCompletedBounty,
        xp_1000: xp >= 1000,
        xp_5000: xp >= 5000,
    };

    for (const [badgeId, conditionMet] of Object.entries(conditions)) {
        if (conditionMet && !unlockedBadges.includes(badgeId)) {
            // Optimistic UI
            state.unlockBadgeLocal(badgeId);

            // Firestore sync
            try {
                await updateDoc(doc(db, 'users', userId), {
                    unlockedBadges: arrayUnion(badgeId),
                });
            } catch (error) {
                console.error(`Failed to sync badge "${badgeId}":`, error);
            }

            // Log unlock
            const badge = BADGE_MAP[badgeId];
            if (badge) {
                console.log(`🏆 Badge Unlocked: ${badge.icon} ${badge.title}`);
            }
        }
    }
};
