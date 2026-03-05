import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { LayoutDashboard, Compass, User } from 'lucide-react';
import clsx from 'clsx';
import { ThemeToggle } from './ThemeToggle';
import Logo from './Logo';
import Sidebar from './Sidebar';

const Layout: React.FC = () => {
    return (
        <div className="flex h-screen w-full bg-background text-foreground overflow-hidden">
            {/* Desktop Sidebar — hidden on mobile */}
            <Sidebar />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-full overflow-hidden">
                {/* Mobile Header — hidden on desktop */}
                <header className="flex md:hidden items-center justify-between px-4 py-3 border-b border-border bg-background sticky top-0 z-40">
                    <Logo className="w-10" />
                    <ThemeToggle />
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
                    <Outlet />
                </main>
            </div>

            {/* Mobile Bottom Nav — hidden on desktop */}
            <nav className="flex md:hidden fixed bottom-0 w-full h-16 border-t border-border bg-background/90 backdrop-blur-md justify-around items-center z-50 pb-[env(safe-area-inset-bottom)]">
                <NavLink
                    to="/dashboard"
                    className={({ isActive }) =>
                        clsx(
                            "flex flex-col items-center justify-center w-full h-full transition-all duration-200 active:scale-95",
                            isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
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
                            isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
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
                            isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                        )
                    }
                >
                    <User className="w-6 h-6" />
                    <span className="text-xs mt-1 font-medium">Profile</span>
                </NavLink>
            </nav>
        </div>
    );
};

export default Layout;
