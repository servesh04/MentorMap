import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

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
