import React, { useState } from 'react';
import { X, Save, BookOpen, TrendingUp, Users, Trash2, Loader, Check } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useStore } from '../store/useStore';
import { updateUserFirestoreProfile } from '../services/userService';
import clsx from 'clsx';

interface AccountSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ROLES = [
    { key: 'beginner' as const, label: 'Beginner', desc: 'Guided learning paths', icon: BookOpen, color: 'blue' },
    { key: 'advanced' as const, label: 'Advanced', desc: 'Self-paced deep dives', icon: TrendingUp, color: 'emerald' },
    { key: 'lecturer' as const, label: 'Lecturer', desc: 'Create & share content', icon: Users, color: 'purple' },
];

const AccountSettingsModal: React.FC<AccountSettingsModalProps> = ({ isOpen, onClose }) => {
    const { currentUser, userRole, setUserRole, setCurrentUser } = useStore();
    const { deleteAccount } = useAuth();

    const [displayName, setDisplayName] = useState(currentUser?.displayName || '');
    const [selectedRole, setSelectedRole] = useState(userRole);
    const [saving, setSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    // Track if anything has changed
    const nameChanged = displayName.trim() !== (currentUser?.displayName || '');
    const roleChanged = selectedRole !== userRole;
    const hasChanges = nameChanged || roleChanged;

    // ── Unified Save: Optimistic update + background sync ──
    const handleSaveAll = async () => {
        if (!currentUser || saving || !hasChanges) return;

        const previousName = currentUser.displayName || '';
        const previousRole = userRole;
        const newName = displayName.trim();
        const updates: Record<string, unknown> = {};

        // Step A: Optimistic UI updates — instant
        if (nameChanged && newName) {
            setCurrentUser({ ...currentUser, displayName: newName } as any);
            updates.displayName = newName;
        }
        if (roleChanged && selectedRole) {
            setUserRole(selectedRole);
            updates.role = selectedRole;
        }

        setSaving(true);
        setError(null);
        setSaveSuccess(false);

        // Step B: Background sync to Firestore
        try {
            await updateUserFirestoreProfile(currentUser.uid, updates);
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 2500);
        } catch (_err) {
            // Step C: Rollback on failure
            if (nameChanged) {
                setCurrentUser({ ...currentUser, displayName: previousName } as any);
                setDisplayName(previousName);
            }
            if (roleChanged) {
                setUserRole(previousRole);
                setSelectedRole(previousRole);
            }
            setError('Failed to save. Changes reverted.');
        } finally {
            setSaving(false);
        }
    };

    // ── Role: local selection only (saved via unified Save button) ──
    const handleRoleSelect = (role: 'beginner' | 'advanced' | 'lecturer') => {
        setSelectedRole(role);
    };

    // ── Delete Account (destructive — no optimistic pattern) ──
    const handleDeleteAccount = async () => {
        const confirmed = confirm(
            '⚠️ This action is permanent!\n\nYour account, progress, and all data will be permanently deleted. This cannot be undone.\n\nAre you sure?'
        );
        if (!confirmed) return;

        const doubleConfirmed = confirm('This is your last chance. Delete account permanently?');
        if (!doubleConfirmed) return;

        setDeleting(true);
        setError(null);
        try {
            await deleteAccount();
            // Auth state listener will handle redirect
        } catch (err: any) {
            if (err.code === 'auth/requires-recent-login') {
                setError('For security, please sign out and sign back in, then try again.');
            } else {
                setError(err.message || 'Failed to delete account');
            }
            setDeleting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div className={clsx(
                "w-full sm:max-w-md bg-background rounded-t-2xl sm:rounded-2xl border border-slate-700/50 shadow-2xl",
                "animate-in slide-in-from-bottom duration-300 max-h-[85vh] overflow-y-auto"
            )}>
                {/* Header */}
                <div className="sticky top-0 bg-background/90 backdrop-blur-md flex items-center justify-between px-5 py-4 border-b border-border z-10">
                    <h2 className="text-lg font-bold text-foreground">Account Settings</h2>
                    <button onClick={onClose} className="p-1.5 rounded-full hover:bg-muted transition-colors text-muted-foreground">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-5 space-y-6">
                    {/* Error Banner */}
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm rounded-xl px-4 py-3">
                            {error}
                        </div>
                    )}

                    {/* Section 1: Display Name */}
                    <section>
                        <h3 className="text-xs uppercase tracking-wider text-slate-400 font-medium mb-3">Display Name</h3>
                        <input
                            type="text"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            placeholder="Your name"
                            className="w-full h-12 px-4 rounded-xl bg-slate-800 border border-slate-700/50 text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-colors"
                            maxLength={50}
                        />
                    </section>

                    {/* Section 2: Role */}
                    <section>
                        <h3 className="text-xs uppercase tracking-wider text-slate-400 font-medium mb-3">Learning Role</h3>
                        <div className="grid grid-cols-3 gap-2">
                            {ROLES.map(({ key, label, icon: Icon, color }) => (
                                <button
                                    key={key}
                                    onClick={() => handleRoleSelect(key)}
                                    className={clsx(
                                        "flex flex-col items-center gap-2 p-3 rounded-xl border transition-all duration-200 active:scale-95 cursor-pointer",
                                        selectedRole === key
                                            ? `border-${color}-500/50 bg-${color}-500/10`
                                            : "bg-slate-800 border-slate-700/50 hover:bg-slate-700/80 hover:border-slate-600"
                                    )}
                                >
                                    <Icon size={20} className={clsx(
                                        selectedRole === key ? `text-${color}-500` : "text-slate-400"
                                    )} />
                                    <span className={clsx(
                                        "text-xs font-medium",
                                        selectedRole === key ? "text-foreground" : "text-slate-400"
                                    )}>
                                        {label}
                                    </span>
                                    {selectedRole === key && (
                                        <span className="text-[9px] font-bold uppercase tracking-wider text-primary">Active</span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* Unified Save Button */}
                    <button
                        onClick={handleSaveAll}
                        disabled={saving || !hasChanges}
                        className={clsx(
                            "w-full h-12 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold transition-all duration-200 active:scale-[0.98]",
                            saveSuccess
                                ? "bg-emerald-500 text-white"
                                : saving || !hasChanges
                                    ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                                    : "bg-emerald-600 text-white hover:bg-emerald-500 shadow-lg shadow-emerald-500/20"
                        )}
                    >
                        {saving ? (
                            <Loader size={18} className="animate-spin" />
                        ) : saveSuccess ? (
                            <Check size={18} />
                        ) : (
                            <Save size={18} />
                        )}
                        {saving ? 'Saving...' : saveSuccess ? 'Changes Saved!' : 'Save Changes'}
                    </button>

                    {/* Section 3: Danger Zone */}
                    <section className="mt-8 pt-6 border-t border-slate-700/50">
                        <h3 className="text-xs uppercase tracking-wider text-red-500 font-medium mb-3">Danger Zone</h3>
                        <button
                            onClick={handleDeleteAccount}
                            disabled={deleting}
                            className="w-full h-12 flex items-center justify-center gap-2 rounded-xl border border-red-500/30 text-red-500 text-sm font-medium hover:bg-red-500 hover:text-white hover:border-red-500 active:scale-[0.98] transition-all duration-200 disabled:opacity-50"
                        >
                            {deleting ? (
                                <Loader size={16} className="animate-spin" />
                            ) : (
                                <Trash2 size={16} />
                            )}
                            {deleting ? 'Deleting...' : 'Delete Account'}
                        </button>
                        <p className="text-xs text-muted-foreground mt-2 text-center">
                            This permanently removes your account and all data.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default AccountSettingsModal;
