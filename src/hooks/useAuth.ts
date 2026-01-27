import { useEffect } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '../lib/firebase';
import { useStore } from '../store/useStore';

export const useAuthListener = () => {
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
};

export const useAuth = () => {
    const login = async () => {
        try {
            await signInWithPopup(auth, googleProvider);
        } catch (error: any) {
            console.error("Login failed:", error);
            alert(`Login failed: ${error.message}`);
        }
    };

    const signupWithEmail = async (email: string, password: string) => {
        try {
            await createUserWithEmailAndPassword(auth, email, password);
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

    return { login, logout, signupWithEmail, loginWithEmail };
};
