export interface ShopItem {
    id: 'streakFreezes' | 'xpBoosts' | 'rerolls';
    name: string;
    icon: string;
    cost: number;
    limit: number;
    desc: string;
}

export const shopItems: Record<string, ShopItem> = {
    streakFreezes: {
        id: 'streakFreezes',
        name: 'Streak Freeze',
        icon: '🧊',
        cost: 200,
        limit: 2,
        desc: 'Protects your streak if you miss a day.'
    },
    xpBoosts: {
        id: 'xpBoosts',
        name: '2x XP Boost',
        icon: '⚡',
        cost: 100,
        limit: 5,
        desc: 'Doubles XP earned from the next module.'
    },
    rerolls: {
        id: 'rerolls',
        name: 'Bounty Reroll',
        icon: '🎲',
        cost: 50,
        limit: 3,
        desc: 'Skip a difficult Daily Bounty and get a new one.'
    }
};
