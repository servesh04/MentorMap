import { create } from 'zustand';
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
}

export const useStore = create<AppState>((set) => ({
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
}));
