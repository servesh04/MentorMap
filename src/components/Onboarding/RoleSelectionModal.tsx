import React from 'react';
import { useStore } from '../../store/useStore';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { BookOpen, TrendingUp, Users } from 'lucide-react';

const RoleSelectionModal: React.FC = () => {
    const { currentUser, setUserRole } = useStore();

    const handleSelectRole = async (role: 'beginner' | 'advanced' | 'lecturer') => {
        if (!currentUser) return;

        try {
            await setDoc(doc(db, 'users', currentUser.uid), {
                email: currentUser.email,
                displayName: currentUser.displayName,
                photoURL: currentUser.photoURL,
                role: role,
                createdAt: new Date(),
            }, { merge: true });

            setUserRole(role);
        } catch (error) {
            console.error("Error saving role:", error);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
                <h2 className="text-xl font-bold text-gray-900 mb-2 text-center">Choose Your Path</h2>
                <p className="text-gray-500 text-center mb-6">How do you want to use CogniFlow?</p>

                <div className="space-y-3">
                    <button
                        onClick={() => handleSelectRole('beginner')}
                        className="w-full flex items-center p-4 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors text-left group"
                    >
                        <div className="w-10 h-10 bg-blue-100 group-hover:bg-white rounded-full flex items-center justify-center text-blue-600 mr-4">
                            <BookOpen className="w-5 h-5" />
                        </div>
                        <div>
                            <span className="block font-semibold text-gray-900">Beginner</span>
                            <span className="text-sm text-gray-500">I need guidance and structured paths.</span>
                        </div>
                    </button>

                    <button
                        onClick={() => handleSelectRole('advanced')}
                        className="w-full flex items-center p-4 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors text-left group"
                    >
                        <div className="w-10 h-10 bg-emerald-100 group-hover:bg-white rounded-full flex items-center justify-center text-emerald-600 mr-4">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                        <div>
                            <span className="block font-semibold text-gray-900">Advanced</span>
                            <span className="text-sm text-gray-500">I prefer self-paced, deep dives.</span>
                        </div>
                    </button>

                    <button
                        onClick={() => handleSelectRole('lecturer')}
                        className="w-full flex items-center p-4 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors text-left group"
                    >
                        <div className="w-10 h-10 bg-purple-100 group-hover:bg-white rounded-full flex items-center justify-center text-purple-600 mr-4">
                            <Users className="w-5 h-5" />
                        </div>
                        <div>
                            <span className="block font-semibold text-gray-900">Lecturer</span>
                            <span className="text-sm text-gray-500">I want to create and share content.</span>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RoleSelectionModal;
