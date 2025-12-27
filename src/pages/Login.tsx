import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useStore } from '../store/useStore';
import { LogIn } from 'lucide-react';

const Login: React.FC = () => {
    const { login } = useAuth();
    const { currentUser, authLoading } = useStore();
    const navigate = useNavigate();

    useEffect(() => {
        if (!authLoading && currentUser) {
            navigate('/');
        }
    }, [currentUser, authLoading, navigate]);

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
            <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-xl mx-auto mb-6 flex items-center justify-center text-white">
                    <LogIn className="w-8 h-8" />
                </div>

                <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome to CogniFlow</h1>
                <p className="text-gray-500 mb-8">Your smart learning companion.</p>

                <button
                    onClick={login}
                    className="w-full flex items-center justify-center gap-3 bg-white text-gray-700 border border-gray-300 font-medium py-3 px-4 rounded-xl hover:bg-gray-50 transition-colors focus:ring-4 focus:ring-indigo-100"
                >
                    <img
                        src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                        alt="Google"
                        className="w-5 h-5"
                    />
                    Sign in with Google
                </button>
            </div>
        </div>
    );
};

export default Login;
