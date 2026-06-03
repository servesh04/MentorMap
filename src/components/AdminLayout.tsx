import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { 
    LayoutDashboard, 
    Users, 
    ShieldCheck, 
    Settings, 
    LogOut,
    Menu,
    X,
    UserCheck
} from 'lucide-react';
import clsx from 'clsx';
import Logo from './Logo';
import { useStore } from '../store/useStore';
import { useAuth } from '../hooks/useAuth';

const AdminLayout: React.FC = () => {
    const { currentUser } = useStore();
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [isMobileOpen, setIsMobileOpen] = React.useState(false);

    const handleLogout = async () => {
        if (confirm("Are you sure you want to log out?")) {
            await logout();
            navigate('/login');
        }
    };

    const menuItems = [
        { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Overview Dashboard' },
        { to: '/admin/users', icon: Users, label: 'User Management' },
        { to: '/admin/security', icon: ShieldCheck, label: 'Security Audit' },
        { to: '/admin/config', icon: Settings, label: 'App Configuration' },
    ];

    return (
        <div className="flex h-screen w-full bg-slate-950 text-slate-100 overflow-hidden font-sans">
            {/* Desktop Sidebar (hidden on mobile) */}
            <aside className="hidden md:flex flex-col w-64 h-full border-r border-slate-800/80 bg-slate-900/60 backdrop-blur-xl p-4 shrink-0">
                {/* Logo Section */}
                <div className="flex items-center gap-3 px-2 mb-2">
                    <Logo className="w-10" />
                    <div>
                        <span className="text-lg font-bold text-white tracking-tight block leading-none">MentorMap</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-red-500">Admin Control</span>
                    </div>
                </div>

                {/* Sidebar Navigation */}
                <nav className="flex flex-col gap-1.5 mt-8">
                    {menuItems.map(({ to, icon: Icon, label }) => (
                        <NavLink
                            key={to}
                            to={to}
                            className={({ isActive }) =>
                                clsx(
                                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 border",
                                    isActive
                                        ? "bg-red-500/10 text-red-400 border-red-500/20"
                                        : "text-slate-400 hover:text-white hover:bg-slate-800/40 border-transparent"
                                )
                            }
                        >
                            <Icon size={18} />
                            <span>{label}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="mt-auto" />

                {/* Footer Profiles & Sign Out */}
                <div className="border-t border-slate-800/80 pt-4 space-y-3">
                    <div className="flex items-center gap-3 px-2">
                        <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden shrink-0">
                            {currentUser?.photoURL ? (
                                <img src={currentUser.photoURL} alt="Admin Profile" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-sm font-bold text-slate-400">
                                    {currentUser?.displayName?.charAt(0) || 'A'}
                                </span>
                            )}
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-semibold text-white truncate">{currentUser?.displayName || 'Admin Console'}</p>
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-500 uppercase tracking-wider">
                                <UserCheck size={10} />
                                Administrator
                            </span>
                        </div>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-slate-400 hover:text-red-400 hover:bg-red-500/5 transition-all duration-200 w-full border border-transparent"
                    >
                        <LogOut size={16} />
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Mobile Header (hidden on desktop) */}
            <div className="flex-1 flex flex-col h-full overflow-hidden">
                <header className="flex md:hidden items-center justify-between px-4 py-3 border-b border-slate-800/80 bg-slate-900 sticky top-0 z-40">
                    <div className="flex items-center gap-2">
                        <Logo className="w-9" />
                        <div>
                            <span className="text-sm font-bold text-white block leading-none">MentorMap</span>
                            <span className="text-[9px] font-bold uppercase tracking-wider text-red-500">Admin</span>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsMobileOpen(!isMobileOpen)}
                        className="p-1.5 rounded-lg border border-slate-800 bg-slate-900/80 text-slate-300 hover:text-white"
                    >
                        {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </header>

                {/* Mobile Drawer Navigation (hidden on desktop) */}
                {isMobileOpen && (
                    <div className="md:hidden fixed inset-0 z-30 bg-slate-950/80 backdrop-blur-sm pt-16">
                        <nav className="flex flex-col gap-1.5 p-4 bg-slate-900 border-b border-slate-850">
                            {menuItems.map(({ to, icon: Icon, label }) => (
                                <NavLink
                                    key={to}
                                    to={to}
                                    onClick={() => setIsMobileOpen(false)}
                                    className={({ isActive }) =>
                                        clsx(
                                            "flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                                            isActive
                                                ? "bg-red-500/10 text-red-400 border border-red-500/20"
                                                : "text-slate-400 border border-transparent hover:text-white"
                                        )
                                    }
                                >
                                    <Icon size={18} />
                                    <span>{label}</span>
                                </NavLink>
                            ))}
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm text-slate-400 hover:text-red-400 hover:bg-red-500/5 mt-4"
                            >
                                <LogOut size={16} />
                                <span>Sign Out</span>
                            </button>
                        </nav>
                    </div>
                )}

                {/* Dynamic Content Viewport */}
                <main className="flex-1 overflow-y-auto bg-slate-950 p-4 md:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
