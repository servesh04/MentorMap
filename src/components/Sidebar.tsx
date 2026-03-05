import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Compass, User, LogOut } from 'lucide-react';
import clsx from 'clsx';
import Logo from './Logo';
import { ThemeToggle } from './ThemeToggle';
import { useStore } from '../store/useStore';
import { useAuth } from '../hooks/useAuth';

const Sidebar: React.FC = () => {
    const { currentUser, userRole } = useStore();
    const { logout } = useAuth();

    const handleLogout = async () => {
        if (confirm("Are you sure you want to log out?")) {
            await logout();
        }
    };

    const navItems = [
        { to: '/dashboard', icon: LayoutDashboard, label: 'Home' },
        { to: '/explore', icon: Compass, label: 'Explore' },
        { to: '/profile', icon: User, label: 'Profile' },
    ];

    return (
        <aside className="hidden md:flex flex-col w-64 h-full border-r border-border bg-background p-4">
            {/* Logo */}
            <div className="flex items-center gap-3 px-2 mb-2">
                <Logo className="w-10" />
                <span className="text-lg font-bold text-foreground tracking-tight">MentorMap</span>
            </div>

            {/* Navigation Links */}
            <nav className="flex flex-col gap-1 mt-8">
                {navItems.map(({ to, icon: Icon, label }) => (
                    <NavLink
                        key={to}
                        to={to}
                        className={({ isActive }) =>
                            clsx(
                                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                                isActive
                                    ? "bg-primary/10 text-primary border border-primary/20"
                                    : "text-muted-foreground hover:text-foreground hover:bg-muted border border-transparent"
                            )
                        }
                    >
                        <Icon size={20} />
                        <span>{label}</span>
                    </NavLink>
                ))}
            </nav>

            {/* Spacer */}
            <div className="mt-auto" />

            {/* User Info + Sign Out */}
            <div className="border-t border-border pt-4 space-y-3">
                <div className="flex items-center gap-3 px-2">
                    <div className="w-9 h-9 rounded-full bg-muted border border-border flex items-center justify-center overflow-hidden shrink-0">
                        {currentUser?.photoURL ? (
                            <img src={currentUser.photoURL} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-sm font-bold text-muted-foreground">
                                {currentUser?.displayName?.charAt(0) || 'U'}
                            </span>
                        )}
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{currentUser?.displayName || 'User'}</p>
                        <p className="text-xs text-muted-foreground truncate capitalize">{userRole || 'Learner'}</p>
                    </div>
                </div>

                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-muted-foreground hover:text-red-400 hover:bg-red-500/5 transition-all duration-200 w-full border border-transparent"
                >
                    <LogOut size={18} />
                    <span>Sign Out</span>
                </button>
            </div>

            {/* Theme Toggle */}
            <div className="flex items-center justify-between px-2 pt-3 border-t border-border mt-3">
                <span className="text-xs text-muted-foreground">Theme</span>
                <ThemeToggle />
            </div>
        </aside>
    );
};

export default Sidebar;
