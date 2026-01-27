import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useStore } from '../store/useStore';
import { LogIn } from 'lucide-react';
import { ThemeToggle } from '../components/ThemeToggle';

const Login: React.FC = () => {
    const { login, signupWithEmail, loginWithEmail } = useAuth();
    const { currentUser, authLoading } = useStore();
    const navigate = useNavigate();

    const [isSignUp, setIsSignUp] = React.useState(false);
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [error, setError] = React.useState('');
    const [loading, setLoading] = React.useState(false);

    useEffect(() => {
        if (!authLoading && currentUser) {
            navigate('/');
        }
    }, [currentUser, authLoading, navigate]);

    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            if (isSignUp) {
                await signupWithEmail(email, password);
            } else {
                await loginWithEmail(email, password);
            }
        } catch (err: any) {
            // Clean up Firebase error messages for better UX
            const msg = err.message
                .replace('Firebase: ', '')
                .replace('Error (auth/', '')
                .replace(').', '')
                .replace(/-/g, ' ');
            setError(msg.charAt(0).toUpperCase() + msg.slice(1));
        } finally {
            setLoading(false);
        }
    };

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6 transition-colors duration-300 relative">
            <div className="absolute top-6 right-6">
                <ThemeToggle />
            </div>

            <div className="w-full max-w-sm bg-card border border-border rounded-2xl shadow-xl p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-xl mx-auto mb-6 flex items-center justify-center text-white">
                    <LogIn className="w-8 h-8" />
                </div>

                <h1 className="text-2xl font-bold text-foreground mb-2">Welcome to MentorMap</h1>
                <p className="text-muted-foreground mb-8">
                    {isSignUp ? "Create an account to get started." : "Your smart learning companion."}
                </p>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm p-3 rounded-lg mb-4 capitalize">
                        {error}
                    </div>
                )}

                <form onSubmit={handleEmailAuth} className="space-y-4 mb-6 text-left">
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Email</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                            placeholder="you@example.com"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Password</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                            placeholder="••••••••"
                            minLength={6}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Log In')}
                    </button>
                </form>

                <div className="relative mb-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-border"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-card text-muted-foreground">Or continue with</span>
                    </div>
                </div>

                <button
                    onClick={login}
                    className="w-full flex items-center justify-center gap-3 bg-card text-foreground border border-border font-medium py-2 px-4 rounded-lg hover:bg-muted transition-colors focus:ring-4 focus:ring-primary/20"
                >
                    <img
                        src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                        alt="Google"
                        className="w-5 h-5"
                    />
                    Google
                </button>

                <p className="mt-8 text-sm text-muted-foreground">
                    {isSignUp ? "Already have an account?" : "Don't have an account?"}
                    <button
                        onClick={() => {
                            setIsSignUp(!isSignUp);
                            setError('');
                        }}
                        className="ml-1 text-primary hover:underline font-medium focus:outline-none"
                    >
                        {isSignUp ? "Log in" : "Sign up"}
                    </button>
                </p>
            </div>
        </div>
    );
};

export default Login;
