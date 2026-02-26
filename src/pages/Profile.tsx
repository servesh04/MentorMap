import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { useStore } from '../store/useStore';
import { ThemeToggle } from '../components/ThemeToggle';
import { LogOut, Settings, Bell, HelpCircle, ChevronRight } from 'lucide-react';

const Profile: React.FC = () => {
    const { logout } = useAuth();
    const { currentUser, userRole } = useStore();

    const handleLogout = async () => {
        if (confirm("Are you sure you want to log out?")) {
            await logout();
        }
    };

    return (
        <div className="p-4 pb-24">
            {/* Centered Profile Header */}
            <header className="mb-6 flex flex-col items-center justify-center pt-4">
                <div className="w-20 h-20 bg-muted rounded-full mb-3 border-4 border-slate-800 shadow-lg flex items-center justify-center overflow-hidden">
                    {currentUser?.photoURL ? (
                        <img src={currentUser.photoURL} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                        <span className="text-2xl font-bold text-muted-foreground">
                            {currentUser?.displayName?.charAt(0) || 'U'}
                        </span>
                    )}
                </div>
                <h1 className="text-xl font-bold text-foreground">{currentUser?.displayName || 'User'}</h1>
                <p className="text-sm text-muted-foreground capitalize">{userRole || 'Learner'}</p>
                <div className="text-xs text-muted-foreground mt-0.5">{currentUser?.email}</div>
            </header>

            {/* iOS-Style Menu Grouping */}
            <div className="bg-slate-900 rounded-2xl flex flex-col overflow-hidden">
                {/* Appearance */}
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 active:bg-slate-800/50 transition-colors">
                    <span className="font-medium text-foreground text-sm">Appearance</span>
                    <ThemeToggle />
                </div>

                {/* Account Settings */}
                <button className="w-full text-left px-5 py-3.5 border-b border-slate-800 flex items-center justify-between active:bg-slate-800/50 active:scale-[0.99] transition-all duration-200 text-foreground">
                    <div className="flex items-center gap-3">
                        <Settings size={18} className="text-muted-foreground" />
                        <span className="text-sm">Account Settings</span>
                    </div>
                    <ChevronRight size={16} className="text-slate-600" />
                </button>

                {/* Notifications */}
                <button className="w-full text-left px-5 py-3.5 border-b border-slate-800 flex items-center justify-between active:bg-slate-800/50 active:scale-[0.99] transition-all duration-200 text-foreground">
                    <div className="flex items-center gap-3">
                        <Bell size={18} className="text-muted-foreground" />
                        <span className="text-sm">Notifications</span>
                    </div>
                    <ChevronRight size={16} className="text-slate-600" />
                </button>

                {/* Help & Support */}
                <button className="w-full text-left px-5 py-3.5 border-b border-slate-800 flex items-center justify-between active:bg-slate-800/50 active:scale-[0.99] transition-all duration-200 text-foreground">
                    <div className="flex items-center gap-3">
                        <HelpCircle size={18} className="text-muted-foreground" />
                        <span className="text-sm">Help & Support</span>
                    </div>
                    <ChevronRight size={16} className="text-slate-600" />
                </button>

                {/* Sign Out — last item, no border-b */}
                <button
                    onClick={handleLogout}
                    className="w-full text-left px-5 py-3.5 flex items-center justify-between active:bg-red-500/10 active:scale-[0.99] transition-all duration-200 text-red-500"
                >
                    <div className="flex items-center gap-3">
                        <LogOut size={18} />
                        <span className="text-sm">Sign Out</span>
                    </div>
                    <ChevronRight size={16} className="text-red-500/40" />
                </button>
            </div>
        </div>
    );
};

export default Profile;
