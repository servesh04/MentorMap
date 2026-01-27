import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { LayoutDashboard, Compass, User } from 'lucide-react';
import clsx from 'clsx';
import { ThemeToggle } from './ThemeToggle';

const Layout: React.FC = () => {
    return (
        <div className="flex flex-col h-screen bg-background text-foreground transition-colors duration-300">
            {/* Top Navigation */}
            <header className="px-6 py-4 flex items-center justify-between border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-40">
                <span className="font-bold text-xl tracking-tight text-primary">MentorMap</span>
                <ThemeToggle />
            </header>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto pb-20">
                <Outlet />
            </main>

            {/* Bottom Navigation */}
            <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border safe-area-bottom z-50">
                <div className="flex justify-around items-center h-16">
                    <NavLink
                        to="/"
                        className={({ isActive }) =>
                            clsx(
                                "flex flex-col items-center justify-center w-full h-full transition-colors",
                                isActive ? "text-primary" : "text-gray-400 hover:text-gray-600"
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
                                "flex flex-col items-center justify-center w-full h-full transition-colors",
                                isActive ? "text-primary" : "text-gray-400 hover:text-gray-600"
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
                                "flex flex-col items-center justify-center w-full h-full transition-colors",
                                isActive ? "text-primary" : "text-gray-400 hover:text-gray-600"
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
