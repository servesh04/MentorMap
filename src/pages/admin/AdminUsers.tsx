import React, { useEffect, useState } from 'react';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db, functions } from '../../lib/firebase';
import { httpsCallable } from 'firebase/functions';
import { 
    Users, 
    Search, 
    Check, 
    AlertCircle,
    Award
} from 'lucide-react';
import clsx from 'clsx';

const AdminUsers: React.FC = () => {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [submittingId, setSubmittingId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const querySnapshot = await getDocs(collection(db, 'users'));
            const list = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setUsers(list);
        } catch (e) {
            console.error("Failed to load user directory:", e);
            setError("Failed to fetch user directory from Firestore.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleGrantAdmin = async (userId: string) => {
        if (!confirm("Are you sure you want to grant this user administrative access? This will write Auth Custom Claims.")) {
            return;
        }
        setSubmittingId(userId);
        setError(null);
        setSuccess(null);

        try {
            // Option A: Set claims via Cloud Function
            const setAdminRoleFn = httpsCallable(functions, 'setAdminRole');
            await setAdminRoleFn({ uid: userId });

            // Option B: Set role field in Firestore
            const userRef = doc(db, 'users', userId);
            await updateDoc(userRef, { role: 'admin' });

            setSuccess(`Successfully granted Admin access claims to user.`);
            
            // Refresh list
            await fetchUsers();
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Failed to set custom claim.");
        } finally {
            setSubmittingId(null);
        }
    };

    const handleRevokeAdmin = async (userId: string) => {
        if (!confirm("Are you sure you want to revoke administrative access?")) {
            return;
        }
        setSubmittingId(userId);
        setError(null);
        setSuccess(null);

        try {
            // Write claims revoke to false (standard auth API)
            // Note: We'd typically have a revokeAdminRole Cloud Function
            // For this UI, let's write to Firestore role to demote back to beginner
            const userRef = doc(db, 'users', userId);
            await updateDoc(userRef, { role: 'beginner' });

            setSuccess(`Revoked Admin role status in Firestore. User demoted.`);
            
            // Refresh list
            await fetchUsers();
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Failed to demote user.");
        } finally {
            setSubmittingId(null);
        }
    };

    const filteredUsers = users.filter(u => 
        (u.displayName?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (u.email?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        u.id.includes(searchQuery)
    );

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            {/* Header section */}
            <div>
                <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
                    <Users className="text-red-500" />
                    User Management
                </h1>
                <p className="text-slate-400 text-sm mt-1">Review register, change system access roles, and assign Custom claims parameters.</p>
            </div>

            {/* Error/Success banners */}
            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl flex items-center gap-2 text-sm">
                    <AlertCircle size={18} />
                    <span>{error}</span>
                </div>
            )}
            {success && (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl flex items-center gap-2 text-sm">
                    <Check size={18} />
                    <span>{success}</span>
                </div>
            )}

            {/* Search filter panel */}
            <div className="relative">
                <Search size={18} className="absolute left-4 top-3.5 text-slate-500" />
                <input 
                    type="text" 
                    placeholder="Search by username, email, or UID..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-12 pr-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-red-500/40 transition-colors"
                />
            </div>

            {/* User Directory Table */}
            {loading ? (
                <div className="flex justify-center items-center py-20 text-slate-400">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
                </div>
            ) : (
                <div className="bg-slate-900/30 border border-slate-800/80 rounded-2xl overflow-hidden backdrop-blur-md">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-800/80 text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-900/20">
                                    <th className="p-4 pl-6">Scholar Profile</th>
                                    <th className="p-4">Firestore UID</th>
                                    <th className="p-4">Current Role</th>
                                    <th className="p-4 text-center">XP Points</th>
                                    <th className="p-4 text-center">Streak</th>
                                    <th className="p-4 text-right pr-6">Access Control Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-850">
                                {filteredUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="p-8 text-center text-slate-500 text-sm">
                                            No user records found matching search query parameters.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredUsers.map((user) => (
                                        <tr key={user.id} className="hover:bg-slate-900/10 transition-colors text-sm">
                                            <td className="p-4 pl-6 flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-bold shrink-0">
                                                    {user.displayName?.charAt(0) || 'U'}
                                                </div>
                                                <div>
                                                    <span className="font-semibold text-white block">{user.displayName || 'Scholar'}</span>
                                                    <span className="text-xs text-slate-400">{user.email || 'No email registered'}</span>
                                                </div>
                                            </td>
                                            <td className="p-4 font-mono text-xs text-slate-500">{user.id}</td>
                                            <td className="p-4">
                                                <span className={clsx(
                                                    "inline-flex px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider",
                                                    user.role === 'admin' 
                                                        ? "bg-red-500/10 text-red-400 border border-red-500/20" 
                                                        : "bg-slate-800 text-slate-400"
                                                )}>
                                                    {user.role || 'beginner'}
                                                </span>
                                            </td>
                                            <td className="p-4 text-center text-slate-300 font-mono">{user.xp || 0}</td>
                                            <td className="p-4 text-center text-slate-300 font-mono">{user.streak || 0} days</td>
                                            <td className="p-4 text-right pr-6">
                                                {submittingId === user.id ? (
                                                    <div className="animate-spin inline-block rounded-full h-4 w-4 border-b-2 border-red-500"></div>
                                                ) : user.role === 'admin' ? (
                                                    <button 
                                                        onClick={() => handleRevokeAdmin(user.id)}
                                                        className="px-3 py-1.5 rounded-xl border border-red-500/20 text-xs font-bold text-red-400 hover:bg-red-500/5 active:scale-95 transition-all duration-200"
                                                    >
                                                        Revoke Admin Access
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handleGrantAdmin(user.id)}
                                                        className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 active:scale-95 text-xs font-bold text-white transition-all duration-200 shadow-md shadow-red-600/10 inline-flex items-center gap-1"
                                                    >
                                                        <Award size={12} />
                                                        Make Admin Claims
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminUsers;
