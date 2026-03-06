/**
 * Dynamic Leveling Engine
 * Maps user XP to progression tiers using AI-generated or fallback titles.
 */

const XP_THRESHOLDS = [0, 500, 1500, 4000, 10000];

const FALLBACK_TITLES = ['Initiate', 'Apprentice', 'Practitioner', 'Specialist', 'Master'];

export interface UserRank {
    level: number;
    title: string;
    currentTierXp: number;
    nextTierXp: number;
    /** 0-100 progress toward next tier */
    progress: number;
}

/**
 * Calculate the user's dynamic rank based on XP and optional AI-generated titles.
 * @param totalXp - the user's current total XP
 * @param titlesArray - optional 5-element array from the active course's progressionTitles
 */
export const getUserDynamicRank = (
    totalXp: number,
    titlesArray?: string[]
): UserRank => {
    const titles = titlesArray && titlesArray.length === 5 ? titlesArray : FALLBACK_TITLES;

    // Find current tier (highest threshold ≤ totalXp)
    let tierIndex = 0;
    for (let i = XP_THRESHOLDS.length - 1; i >= 0; i--) {
        if (totalXp >= XP_THRESHOLDS[i]) {
            tierIndex = i;
            break;
        }
    }

    const currentTierXp = XP_THRESHOLDS[tierIndex];
    const isMaxTier = tierIndex >= XP_THRESHOLDS.length - 1;
    const nextTierXp = isMaxTier ? currentTierXp : XP_THRESHOLDS[tierIndex + 1];

    // Progress within current tier (0-100)
    let progress = 100;
    if (!isMaxTier) {
        const range = nextTierXp - currentTierXp;
        progress = range > 0 ? Math.min(100, Math.round(((totalXp - currentTierXp) / range) * 100)) : 100;
    }

    // Approximate level number: 1-based, scaling within tiers
    const tierLevels = [1, 5, 15, 30, 50];
    const level = tierLevels[tierIndex];

    return {
        level,
        title: titles[tierIndex],
        currentTierXp,
        nextTierXp,
        progress,
    };
};
