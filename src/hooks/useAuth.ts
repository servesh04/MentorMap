import { useEffect } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '../lib/firebase';
import { useStore } from '../store/useStore';

export const useAuth = () => {
    const { setCurrentUser, setUserRole, setAuthLoading, setActiveCourses } = useStore();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setAuthLoading(true);
            if (user) {
                setCurrentUser(user);
                // Check for user role and active courses in Firestore
                try {
                    const userDoc = await getDoc(doc(db, 'users', user.uid));
                    if (userDoc.exists()) {
                        const data = userDoc.data();
                        setUserRole(data.role);
                        setActiveCourses(data.active_courses || []);
                    } else {
                        setUserRole(null); // Triggers onboarding
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

    const login = async () => {
        try {
            await signInWithPopup(auth, googleProvider);
        } catch (error: any) {
            console.error("Login failed:", error);
            console.error("Error code:", error.code);
            console.error("Error message:", error.message);
            alert(`Login failed: ${error.message}`);
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    return { login, logout };
};
