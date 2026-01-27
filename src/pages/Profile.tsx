import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { useStore } from '../store/useStore';
import { ThemeToggle } from '../components/ThemeToggle';
import { LogOut, Settings, Bell, HelpCircle } from 'lucide-react';

const Profile: React.FC = () => {
    const { logout } = useAuth();
    const { currentUser, userRole } = useStore();

    const handleLogout = async () => {
        if (confirm("Are you sure you want to log out?")) {
            await logout();
        }
    };

    return (
        <div className="p-6">
            <header className="mb-8 text-center">
                <div className="w-24 h-24 bg-muted rounded-full mx-auto mb-4 border-4 border-card shadow-lg flex items-center justify-center overflow-hidden">
                    {currentUser?.photoURL ? (
                        <img src={currentUser.photoURL} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                        <span className="text-3xl font-bold text-muted-foreground">
                            {currentUser?.displayName?.charAt(0) || 'U'}
                        </span>
                    )}
                </div>
                <h1 className="text-2xl font-bold text-foreground">{currentUser?.displayName || 'User'}</h1>
                <p className="text-muted-foreground capitalize">{userRole || 'Learner'}</p>
                <div className="text-xs text-muted-foreground mt-1">{currentUser?.email}</div>
            </header>

            <div className="bg-card rounded-2xl overflow-hidden shadow-sm border border-border divide-y divide-border">
                {/* Theme Toggle Row */}
                <div className="flex items-center justify-between px-6 py-4 hover:bg-muted/50 transition-colors">
                    <span className="font-medium text-foreground">Appearance</span>
                    <ThemeToggle />
                </div>

                <button className="w-full text-left px-6 py-4 hover:bg-muted/50 transition-colors flex items-center gap-3 text-foreground">
                    <Settings size={18} className="text-muted-foreground" />
                    Account Settings
                </button>
                <button className="w-full text-left px-6 py-4 hover:bg-muted/50 transition-colors flex items-center gap-3 text-foreground">
                    <Bell size={18} className="text-muted-foreground" />
                    Notifications
                </button>
                <button className="w-full text-left px-6 py-4 hover:bg-muted/50 transition-colors flex items-center gap-3 text-foreground">
                    <HelpCircle size={18} className="text-muted-foreground" />
                    Help & Support
                </button>
                <button
                    onClick={handleLogout}
                    className="w-full text-left px-6 py-4 hover:bg-red-500/10 transition-colors text-red-500 flex items-center gap-3"
                >
                    <LogOut size={18} />
                    Sign Out
                </button>
            </div>
        </div>
    );
};

export default Profile;
