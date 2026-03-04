import React from 'react';
import { X, Clock, Flame, Sparkles, Trophy } from 'lucide-react';
import { useStore, type NotificationPrefs } from '../store/useStore';
import { updateUserFirestoreProfile } from '../services/userService';
import clsx from 'clsx';

interface NotificationsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const TOGGLES: {
    key: keyof NotificationPrefs;
    label: string;
    desc: string;
    icon: React.FC<{ size?: number; className?: string }>;
}[] = [
        { key: 'dailyReminder', label: 'Daily Learning Reminder', desc: 'Remind me to study every day', icon: Clock },
        { key: 'streakAlerts', label: 'Streak Alerts', desc: 'Warn me before I lose my streak', icon: Flame },
        { key: 'newContent', label: 'New Content', desc: 'Notify me about new courses & features', icon: Sparkles },
        { key: 'quizResults', label: 'Quiz Results', desc: 'Notifications for quiz completions', icon: Trophy },
    ];

const NotificationsModal: React.FC<NotificationsModalProps> = ({ isOpen, onClose }) => {
    const { currentUser, notificationPrefs, setNotificationPrefs } = useStore();

    if (!isOpen) return null;

    const handleToggle = async (key: keyof NotificationPrefs) => {
        if (!currentUser) return;

        const previousPrefs = { ...notificationPrefs };
        const newPrefs = { ...notificationPrefs, [key]: !notificationPrefs[key] };

        // Step A: Optimistic UI update
        setNotificationPrefs(newPrefs);

        // Step B: Background sync
        try {
            await updateUserFirestoreProfile(currentUser.uid, { notificationPrefs: newPrefs });
        } catch (_err) {
            // Step C: Rollback
            setNotificationPrefs(previousPrefs);
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
                <div className="sticky top-0 bg-background/90 backdrop-blur-md flex items-center justify-between px-5 py-4 border-b border-slate-700/50 z-10">
                    <h2 className="text-lg font-bold text-foreground">Notifications</h2>
                    <button onClick={onClose} className="p-1.5 rounded-full hover:bg-muted transition-colors text-muted-foreground">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-5">
                    <h3 className="text-xs uppercase tracking-wider text-slate-400 font-medium mb-4">Preferences</h3>

                    <div className="space-y-1">
                        {TOGGLES.map(({ key, label, desc, icon: Icon }) => (
                            <div
                                key={key}
                                className="flex items-center justify-between px-4 py-3.5 rounded-xl bg-slate-800 border border-slate-700/50 mb-2"
                            >
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <Icon size={18} className="text-slate-400 shrink-0" />
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-foreground">{label}</p>
                                        <p className="text-xs text-slate-500 truncate">{desc}</p>
                                    </div>
                                </div>

                                {/* iOS-Style Toggle */}
                                <button
                                    onClick={() => handleToggle(key)}
                                    className={clsx(
                                        "relative shrink-0 ml-3 w-11 h-6 rounded-full transition-colors duration-200",
                                        notificationPrefs[key]
                                            ? "bg-emerald-500"
                                            : "bg-slate-600"
                                    )}
                                    role="switch"
                                    aria-checked={notificationPrefs[key]}
                                >
                                    <span
                                        className={clsx(
                                            "absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200",
                                            notificationPrefs[key] && "translate-x-5"
                                        )}
                                    />
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Info Note */}
                    <p className="text-[10px] text-slate-500 text-center mt-6">
                        Push notifications coming soon. Your preferences are saved and will apply when available.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default NotificationsModal;
