import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { LayoutDashboard, Compass, User } from 'lucide-react';
import clsx from 'clsx';

const Layout: React.FC = () => {
    return (
        <div className="flex flex-col h-screen bg-gray-50">
            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto pb-20">
                <Outlet />
            </main>

            {/* Bottom Navigation */}
            <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-bottom">
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
