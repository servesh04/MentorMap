import { useEffect } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, deleteUser, signInWithRedirect, getRedirectResult } from 'firebase/auth';
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '../lib/firebase';
import { useStore } from '../store/useStore';
import { calculateDailyStreak, assignToWeeklyLeague } from '../services/userService';
import { getCurrentWeekString } from '../utils/dateHelpers';

export const useAuthListener = () => {
    const { setCurrentUser, setUserRole, setAuthLoading, setActiveCourses, setNotificationPrefs, setLocalStreak, addLocalXP, setLeagueData, setPendingLeagueResult } = useStore();

    useEffect(() => {
        // Handle redirect result if returning from redirect sign-in
        getRedirectResult(auth).then(async (result) => {
            if (result) {
                const user = result.user;
                const userRef = doc(db, 'users', user.uid);
                const userDoc = await getDoc(userRef);
                if (!userDoc.exists()) {
                    await setDoc(userRef, {
                        displayName: user.displayName || 'Scholar',
                        email: user.email,
                        role: 'beginner',
                        xp: 0,
                        streak: 0,
                        league: 'bronze',
                        active_courses: [],
                        createdAt: new Date().toISOString()
                    });
                }
            }
        }).catch((error) => {
            console.error("Redirect sign-in failed:", error);
        });

        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setAuthLoading(true);
            if (user) {
                setCurrentUser(user);
                // Check for user role and active courses in Firestore, verifying custom claims first
                try {
                    const tokenResult = await user.getIdTokenResult(true);
                    const isAdmin = !!tokenResult.claims.admin;

                    const userDoc = await getDoc(doc(db, 'users', user.uid));
                    if (userDoc.exists()) {
                        const data = userDoc.data();
                        if (isAdmin) {
                            setUserRole('admin');
                        } else {
                            setUserRole(data.role);
                        }
                        setActiveCourses(data.active_courses || []);
                        if (data.notificationPrefs) {
                            setNotificationPrefs(data.notificationPrefs);
                        }
                        // Load gamification data
                        const xp = data.xp || 0;
                        const streak = data.streak || 0;
                        const lastActiveDate = data.lastActiveDate || '';
                        const lastBountyDate = data.lastBountyDate || '';
                        const unlockedBadges = data.unlockedBadges || [];
                        addLocalXP(xp);
                        setLocalStreak(streak, lastActiveDate);

                        const league = data.league || 'bronze';
                        let currentBucketId = data.currentBucketId || '2026_W11_bronze_1';
                        
                        // Extract pending league result if present
                        if (data.pendingLeagueResult) {
                            setPendingLeagueResult(data.pendingLeagueResult);
                        }

                        const currentWeek = getCurrentWeekString();
                        const expectedPrefix = `${currentWeek}_${league}`;

                        if (!currentBucketId.startsWith(expectedPrefix)) {
                            console.log(`Intercepted stale bucket: ${currentBucketId}. Reassigning to week ${currentWeek}...`);
                            const newBucketId = await assignToWeeklyLeague(user.uid, league);
                            if (newBucketId) {
                                currentBucketId = newBucketId;
                            }
                        }

                        setLeagueData(league, currentBucketId);

                        useStore.getState().setLastBountyDate(lastBountyDate);
                        // Load badges
                        unlockedBadges.forEach((id: string) => useStore.getState().unlockBadgeLocal(id));
                        // Calculate streak for today
                        calculateDailyStreak(user.uid, streak, lastActiveDate);
                    } else {
                        if (isAdmin) {
                            setUserRole('admin');
                        } else {
                            setUserRole('beginner'); // Default role for new users
                        }
                        setActiveCourses([]);
                    }
                } catch (error) {
                    console.error("Error fetching user data:", error);
                    setUserRole(null);
                    setActiveCourses([]);
                }
            } else {
                setCurrentUser(null);
                setUserRole(null);
                setActiveCourses([]);
            }
            setAuthLoading(false);
        });

        return () => unsubscribe();
    }, [setCurrentUser, setUserRole, setAuthLoading, setActiveCourses]);
};

export const useAuth = () => {
    const { setCurrentUser } = useStore();

    const login = async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;
            
            // Ensure Firestore document exists on first login
            const userRef = doc(db, 'users', user.uid);
            const userDoc = await getDoc(userRef);
            
            if (!userDoc.exists()) {
                await setDoc(userRef, {
                    displayName: user.displayName || 'Scholar',
                    email: user.email,
                    role: 'beginner',
                    xp: 0,
                    streak: 0,
                    league: 'bronze',
                    active_courses: [],
                    createdAt: new Date().toISOString()
                });
            }
        } catch (error: any) {
            if (error.code === 'auth/popup-blocked') {
                console.warn("Popup blocked, falling back to redirect sign-in...");
                try {
                    await signInWithRedirect(auth, googleProvider);
                } catch (redirectError) {
                    console.error("Redirect sign-in failed:", redirectError);
                    alert(`Redirect sign-in failed: ${(redirectError as Error).message}`);
                }
            } else {
                console.error("Login failed:", error);
                alert(`Login failed: ${error.message}`);
            }
        }
    };

    const signupWithEmail = async (email: string, password: string) => {
        try {
            const result = await createUserWithEmailAndPassword(auth, email, password);
            const user = result.user;
            
            // Create initial Firestore document
            await setDoc(doc(db, 'users', user.uid), {
                displayName: 'Scholar',
                email: user.email,
                role: 'beginner',
                xp: 0,
                streak: 0,
                league: 'bronze',
                active_courses: [],
                createdAt: new Date().toISOString()
            });
        } catch (error: any) {
            console.error("Signup failed:", error);
            throw error;
        }
    };

    const loginWithEmail = async (email: string, password: string) => {
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (error: any) {
            console.error("Login failed:", error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    const updateDisplayName = async (newName: string) => {
        const user = auth.currentUser;
        if (!user) throw new Error('Not authenticated');

        // Update Firebase Auth profile
        await updateProfile(user, { displayName: newName });

        // Update Firestore user document
        await setDoc(doc(db, 'users', user.uid), {
            displayName: newName,
        }, { merge: true });

        // Refresh the Zustand store with the updated user object
        // auth.currentUser is updated in place by updateProfile, so re-set it
        setCurrentUser({ ...user, displayName: newName } as any);
    };

    const deleteAccount = async () => {
        const user = auth.currentUser;
        if (!user) throw new Error('Not authenticated');

        // Delete Firestore user document first
        await deleteDoc(doc(db, 'users', user.uid));

        // Delete the Firebase Auth account
        await deleteUser(user);
    };

    return { login, logout, signupWithEmail, loginWithEmail, updateDisplayName, deleteAccount };
};
