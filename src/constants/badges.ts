/**
 * Static Badge Registry — all possible achievement badges.
 * No DB reads needed; UI maps over this to render the grid.
 */

export interface Badge {
    id: string;
    title: string;
    description: string;
    icon: string;
}

export const BADGE_REGISTRY: Badge[] = [
    {
        id: 'first_blood',
        title: 'First Steps',
        description: 'Complete your first module',
        icon: '🎯',
    },
    {
        id: 'streak_7',
        title: 'Week Warrior',
        description: 'Maintain a 7-day streak',
        icon: '🔥',
    },
    {
        id: 'streak_30',
        title: 'Monthly Master',
        description: 'Maintain a 30-day streak',
        icon: '💪',
    },
    {
        id: 'bounty_hunter',
        title: 'Bounty Hunter',
        description: 'Pass your first Daily Bounty',
        icon: '🏴‍☠️',
    },
    {
        id: 'xp_1000',
        title: 'XP Enthusiast',
        description: 'Earn 1,000 XP',
        icon: '⚡',
    },
    {
        id: 'xp_5000',
        title: 'XP Legend',
        description: 'Earn 5,000 XP',
        icon: '🌟',
    },
];

/** Quick lookup map */
export const BADGE_MAP: Record<string, Badge> = Object.fromEntries(
    BADGE_REGISTRY.map(b => [b.id, b])
);
