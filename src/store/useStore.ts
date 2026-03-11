import { create } from 'zustand';
import { doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { User as MockUser, Course } from '../services/mockService';
import type { User as FirebaseUser } from 'firebase/auth';

export interface NotificationPrefs {
    dailyReminder: boolean;
    streakAlerts: boolean;
    newContent: boolean;
    quizResults: boolean;
}

const DEFAULT_NOTIFICATION_PREFS: NotificationPrefs = {
    dailyReminder: false,
    streakAlerts: true,
    newContent: false,
    quizResults: true,
};

export interface LeagueResult {
    rank: number;
    oldLeague: string;
    newLeague: string;
    xp: number;
    status: 'promoted' | 'demoted' | 'safe';
}

interface AppState {
    // Legacy/Mock Data
    user: MockUser | null;
    courses: Course[];
    isLoading: boolean;

    // Actions
    setUser: (user: MockUser | null) => void;
    setCourses: (courses: Course[]) => void;
    setLoading: (loading: boolean) => void;

    // Auth State Properties
    currentUser: FirebaseUser | null;
    userRole: 'beginner' | 'advanced' | 'lecturer' | null;
    authLoading: boolean;

    setCurrentUser: (user: FirebaseUser | null) => void;
    setUserRole: (role: 'beginner' | 'advanced' | 'lecturer' | null) => void;
    setAuthLoading: (loading: boolean) => void;

    // Progress State
    completedModules: { [courseId: string]: string[] };
    toggleModuleCompletion: (courseId: string, moduleId: string) => void;

    // Enrolled Courses
    activeCourses: string[];
    setActiveCourses: (courses: string[]) => void;

    // Notification Preferences
    notificationPrefs: NotificationPrefs;
    setNotificationPrefs: (prefs: NotificationPrefs) => void;

    // Gamification
    xp: number;
    streak: number;
    lastActiveDate: string;
    lastBountyDate: string;
    unlockedBadges: string[];
    addLocalXP: (amount: number) => void;
    setLocalStreak: (streak: number, date: string) => void;
    
    // Leagues
    league: string;
    currentBucketId: string;
    pendingLeagueResult: LeagueResult | null;
    setLeagueData: (league: string, currentBucketId: string) => void;
    setPendingLeagueResult: (result: LeagueResult | null) => void;
    setLastBountyDate: (date: string) => void;
    unlockBadgeLocal: (badgeId: string) => void;

    // Shop & Economy
    coins: number;
    inventory: {
        streakFreezes: number;
        xpBoosts: number;
        rerolls: number;
    };
    isShopOpen: boolean;
    openShop: () => void;
    closeShop: () => void;
    purchaseItem: (itemId: 'streakFreezes' | 'xpBoosts' | 'rerolls', cost: number, limit: number) => Promise<boolean>;
}

export const useStore = create<AppState>((set, get) => ({
    user: null,
    courses: [],
    isLoading: false,

    currentUser: null,
    userRole: null,
    authLoading: true,
    completedModules: {},
    activeCourses: [], // Initial state

    setUser: (user) => set({ user }),
    setCourses: (courses) => set({ courses }),
    setLoading: (isLoading) => set({ isLoading }),

    setCurrentUser: (currentUser) => set({ currentUser }),
    setUserRole: (userRole) => set({ userRole }),
    setAuthLoading: (authLoading) => set({ authLoading }),

    setActiveCourses: (activeCourses) => set({ activeCourses }),

    notificationPrefs: DEFAULT_NOTIFICATION_PREFS,
    setNotificationPrefs: (notificationPrefs) => set({ notificationPrefs }),

    xp: 0,
    streak: 0,
    lastActiveDate: '',
    lastBountyDate: '',
    unlockedBadges: [],
    addLocalXP: (amount) => set((state) => ({ xp: state.xp + amount })),
    setLocalStreak: (streak, lastActiveDate) => set({ streak, lastActiveDate }),
    
    league: 'bronze',
    currentBucketId: '2026_W11_bronze_1',
    pendingLeagueResult: null,
    setLeagueData: (league, currentBucketId) => set({ league, currentBucketId }),
    setPendingLeagueResult: (pendingLeagueResult) => set({ pendingLeagueResult }),

    setLastBountyDate: (lastBountyDate) => set({ lastBountyDate }),
    unlockBadgeLocal: (badgeId) => set((state) => ({
        unlockedBadges: state.unlockedBadges.includes(badgeId)
            ? state.unlockedBadges
            : [...state.unlockedBadges, badgeId]
    })),

    toggleModuleCompletion: (courseId, moduleId) => set((state) => {
        const currentCourseModules = state.completedModules[courseId] || [];
        const isCompleted = currentCourseModules.includes(moduleId);

        let newModules;
        if (isCompleted) {
            newModules = currentCourseModules.filter(id => id !== moduleId);
        } else {
            newModules = [...currentCourseModules, moduleId];
        }

        return {
            completedModules: {
                ...state.completedModules,
                [courseId]: newModules
            }
        };
    }),

    // Shop & Economy
    coins: 200, // Default for testing
    inventory: {
        streakFreezes: 0,
        xpBoosts: 0,
        rerolls: 0,
    },
    isShopOpen: false,
    openShop: () => set({ isShopOpen: true }),
    closeShop: () => set({ isShopOpen: false }),
    purchaseItem: async (itemId, cost, limit) => {
        const state = get();
        const user = state.currentUser;

        if (!user) {
            console.error("Must be logged in to purchase");
            return false;
        }

        if (state.coins < cost) {
            console.error("Not enough coins");
            return false;
        }

        if (state.inventory[itemId] >= limit) {
            console.error("Inventory limit reached");
            return false;
        }

        // Optimistic UI updates
        set((state) => ({
            coins: state.coins - cost,
            inventory: {
                ...state.inventory,
                [itemId]: state.inventory[itemId] + 1
            }
        }));

        try {
            // Sync with Firestore
            const userRef = doc(db, 'users', user.uid);
            await updateDoc(userRef, {
                coins: increment(-cost),
                [`inventory.${itemId}`]: increment(1)
            });
            return true;
        } catch (error) {
            console.error("Failed to sync purchase with server", error);
            // Revert on failure
            set((state) => ({
                coins: state.coins + cost,
                inventory: {
                    ...state.inventory,
                    [itemId]: state.inventory[itemId] - 1
                }
            }));
            return false;
        }
    },
}));
