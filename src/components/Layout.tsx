import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { LayoutDashboard, Compass, User } from 'lucide-react';
import clsx from 'clsx';
import { ThemeToggle } from './ThemeToggle';
import Logo from './Logo';

const Layout: React.FC = () => {
    return (
        <div className="flex flex-col h-screen bg-background text-foreground transition-colors duration-300">
            {/* Top Navigation */}
            <header className="px-6 py-4 flex items-center justify-between border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-40">
                <Logo className="w-32" />
                <ThemeToggle />
            </header>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto pb-20">
                <Outlet />
            </main>

            {/* Bottom Navigation — Glassmorphism Tab Bar */}
            <nav className="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-md border-t border-slate-800 z-50 pb-[env(safe-area-inset-bottom)]">
                <div className="flex justify-around items-center h-16">
                    <NavLink
                        to="/dashboard"
                        className={({ isActive }) =>
                            clsx(
                                "flex flex-col items-center justify-center w-full h-full transition-all duration-200 active:scale-95",
                                isActive ? "text-primary" : "text-slate-400 hover:text-slate-300"
                            )
                        }
                    >
                        <LayoutDashboard className="w-6 h-6" />
                        <span className="text-xs mt-1 font-medium">Home</span>
                    </NavLink>

                    <NavLink
                        to="/explore"
                        className={({ isActive }) =>
                            clsx(
                                "flex flex-col items-center justify-center w-full h-full transition-all duration-200 active:scale-95",
                                isActive ? "text-primary" : "text-slate-400 hover:text-slate-300"
                            )
                        }
                    >
                        <Compass className="w-6 h-6" />
                        <span className="text-xs mt-1 font-medium">Explore</span>
                    </NavLink>

                    <NavLink
                        to="/profile"
                        className={({ isActive }) =>
                            clsx(
                                "flex flex-col items-center justify-center w-full h-full transition-all duration-200 active:scale-95",
                                isActive ? "text-primary" : "text-slate-400 hover:text-slate-300"
                            )
                        }
                    >
                        <User className="w-6 h-6" />
                        <span className="text-xs mt-1 font-medium">Profile</span>
                    </NavLink>
                </div>
            </nav>
        </div>
    );
};

export default Layout;
