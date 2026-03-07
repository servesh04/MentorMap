import React from 'react';
import { useStore } from '../store/useStore';

export const WalletPill: React.FC<{ className?: string }> = ({ className = '' }) => {
    const { coins, openShop } = useStore();

    return (
        <button
            onClick={openShop}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-500 border border-amber-200 dark:border-amber-500/20 shadow-sm font-bold text-sm cursor-pointer hover:scale-105 active:scale-95 transition-all z-40 ${className}`}
        >
            <span>🪙</span>
            <span>{coins}</span>
        </button>
    );
};
