import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useStore } from '../store/useStore';
import { ThemeToggle } from '../components/ThemeToggle';
import AccountSettingsModal from '../components/AccountSettingsModal';
import HelpSupportModal from '../components/HelpSupportModal';
import NotificationsModal from '../components/NotificationsModal';
import { LogOut, Settings, Bell, HelpCircle, ChevronRight, Lock } from 'lucide-react';
import { BADGE_REGISTRY } from '../constants/badges';
import clsx from 'clsx';
import { useCourses } from '../hooks/useCourses';
import { getUserDynamicRank } from '../utils/leveling';

const Profile: React.FC = () => {
    const { logout } = useAuth();
    const { currentUser, unlockedBadges, xp, activeCourses } = useStore();
    const { courses } = useCourses();

    // Get progression titles from the first active course (if any)
    const activeCourse = courses.find(c => activeCourses.includes(c.id));
    const rank = getUserDynamicRank(xp, activeCourse?.progressionTitles);

    const handleLogout = async () => {
        if (confirm("Are you sure you want to log out?")) {
            await logout();
        }
    };

    const [showAccountSettings, setShowAccountSettings] = useState(false);
    const [showHelpSupport, setShowHelpSupport] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);

    return (
        <div className="p-4 pb-24">
            {/* Centered Profile Header */}
            <header className="mb-6 flex flex-col items-center justify-center pt-4">
                <div className="w-20 h-20 bg-muted rounded-full mb-3 border-4 border-border shadow-lg flex items-center justify-center overflow-hidden">
                    {currentUser?.photoURL ? (
                        <img src={currentUser.photoURL} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                        <span className="text-2xl font-bold text-muted-foreground">
                            {currentUser?.displayName?.charAt(0) || 'U'}
                        </span>
                    )}
                </div>
                <h1 className="text-xl font-bold text-foreground">{currentUser?.displayName || 'User'}</h1>
                <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mt-1">
                    Lv. {rank.level} — {rank.title}
                </p>
                <div className="text-xs text-muted-foreground mt-0.5">{currentUser?.email}</div>
            </header>

            {/* Trophy Case */}
            <div className="mb-6">
                <h3 className="font-bold text-foreground text-base mb-3">Achievements</h3>
                <div className="flex flex-wrap gap-4 sm:gap-6 justify-center sm:justify-start">
                    {BADGE_REGISTRY.map(badge => {
                        const isUnlocked = unlockedBadges.includes(badge.id);
                        return (
                            <div
                                key={badge.id}
                                className={clsx(
                                    'w-28 h-28 sm:w-32 sm:h-32 flex flex-col items-center justify-center gap-2 p-2 rounded-xl text-center relative group cursor-pointer transition-all duration-300',
                                    'bg-card shadow-sm border border-border',
                                    isUnlocked && 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 dark:border-emerald-500/50'
                                )}
                            >
                                {/* Icon */}
                                <span className={clsx(
                                    'w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-3xl sm:text-4xl transition-all duration-300',
                                    !isUnlocked && 'grayscale opacity-50'
                                )}>
                                    {badge.icon}
                                </span>

                                {/* Title */}
                                <span className={clsx(
                                    'text-[10px] sm:text-xs leading-tight line-clamp-2 px-1',
                                    isUnlocked
                                        ? 'font-bold text-foreground'
                                        : 'font-medium text-muted-foreground'
                                )}>
                                    {badge.title}
                                </span>

                                {/* Lock icon */}
                                {!isUnlocked && (
                                    <Lock size={12} className="absolute top-2 right-2 text-muted-foreground" />
                                )}

                                {/* Tooltip */}
                                <div className="absolute z-50 bottom-full mb-2 w-48 p-2 text-xs bg-popover text-popover-foreground border border-border rounded-lg shadow-xl opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 left-1/2 -translate-x-1/2">
                                    <p className="font-semibold">{badge.title}</p>
                                    <p className="mt-0.5 text-muted-foreground">{badge.description}</p>
                                    {!isUnlocked && <p className="mt-1 text-amber-500 font-medium">🔒 Locked</p>}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* iOS-Style Menu Grouping */}
            <div className="bg-card rounded-2xl flex flex-col overflow-hidden border border-border">
                {/* Appearance */}
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-border active:bg-muted transition-colors">
                    <span className="font-medium text-foreground text-sm">Appearance</span>
                    <ThemeToggle />
                </div>

                {/* Account Settings */}
                <button
                    onClick={() => setShowAccountSettings(true)}
                    className="w-full text-left px-5 py-3.5 border-b border-border flex items-center justify-between active:bg-muted active:scale-[0.99] transition-all duration-200 text-foreground"
                >
                    <div className="flex items-center gap-3">
                        <Settings size={18} className="text-muted-foreground" />
                        <span className="text-sm">Account Settings</span>
                    </div>
                    <ChevronRight size={16} className="text-muted-foreground" />
                </button>

                {/* Notifications */}
                <button
                    onClick={() => setShowNotifications(true)}
                    className="w-full text-left px-5 py-3.5 border-b border-border flex items-center justify-between active:bg-muted active:scale-[0.99] transition-all duration-200 text-foreground"
                >
                    <div className="flex items-center gap-3">
                        <Bell size={18} className="text-muted-foreground" />
                        <span className="text-sm">Notifications</span>
                    </div>
                    <ChevronRight size={16} className="text-muted-foreground" />
                </button>

                {/* Help & Support */}
                <button
                    onClick={() => setShowHelpSupport(true)}
                    className="w-full text-left px-5 py-3.5 border-b border-border flex items-center justify-between active:bg-muted active:scale-[0.99] transition-all duration-200 text-foreground"
                >
                    <div className="flex items-center gap-3">
                        <HelpCircle size={18} className="text-muted-foreground" />
                        <span className="text-sm">Help & Support</span>
                    </div>
                    <ChevronRight size={16} className="text-muted-foreground" />
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

            {/* Account Settings Modal */}
            <AccountSettingsModal
                isOpen={showAccountSettings}
                onClose={() => setShowAccountSettings(false)}
            />
            <HelpSupportModal
                isOpen={showHelpSupport}
                onClose={() => setShowHelpSupport(false)}
            />
            <NotificationsModal
                isOpen={showNotifications}
                onClose={() => setShowNotifications(false)}
            />
        </div>
    );
};

export default Profile;
