import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useStore } from '../store/useStore';
import { shopItems } from '../constants/shopItems';

export const ShopModal: React.FC = () => {
    const { isShopOpen, closeShop, coins, inventory, purchaseItem } = useStore();
    const [purchasing, setPurchasing] = useState<string | null>(null);

    if (!isShopOpen) return null;

    const handlePurchase = async (itemId: 'streakFreezes' | 'xpBoosts' | 'rerolls', cost: number, limit: number) => {
        setPurchasing(itemId);
        // Add artificial delay for UX (feeling of transaction)
        await new Promise(resolve => setTimeout(resolve, 600)); 
        await purchaseItem(itemId, cost, limit);
        setPurchasing(null);
    };

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop */}
            <div 
                className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                onClick={closeShop}
            />

            {/* Drawer */}
            <div className="relative w-full sm:w-96 h-full bg-white dark:bg-slate-900 shadow-2xl p-6 transform transition-transform animate-in slide-in-from-right duration-300 flex flex-col">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-2xl font-bold">Storefront</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            Balance: <span className="font-bold text-amber-500 inline-flex items-center gap-1">🪙 {coins}</span>
                        </p>
                    </div>
                    <button 
                        onClick={closeShop}
                        className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 -mr-2">
                    <div className="grid grid-cols-1 gap-4">
                        {Object.values(shopItems).map((item) => {
                            const currentCount = inventory[item.id];
                            const isMaxed = currentCount >= item.limit;
                            const canAfford = coins >= item.cost;
                            const isPurchasingThis = purchasing === item.id;

                            return (
                                <div key={item.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col gap-4 bg-slate-50/50 dark:bg-slate-800/20">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex items-center gap-3">
                                            <div className="text-3xl bg-white dark:bg-slate-800 w-12 h-12 rounded-xl flex items-center justify-center shadow-sm border border-slate-100 dark:border-slate-700">
                                                {item.icon}
                                            </div>
                                            <div>
                                                <div className="font-semibold text-foreground">{item.name}</div>
                                                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Owned: {currentCount} / {item.limit}</div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                                        {item.desc}
                                    </p>

                                    <button 
                                        onClick={() => handlePurchase(item.id, item.cost, item.limit)}
                                        disabled={isMaxed || !canAfford || (purchasing !== null)}
                                        className={`w-full py-2.5 rounded-lg font-bold text-sm transition-all focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-900 focus:outline-none flex items-center justify-center gap-2 ${
                                            isMaxed 
                                                ? 'bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-500 cursor-not-allowed'
                                                : !canAfford
                                                    ? 'bg-slate-100 text-slate-400 dark:bg-slate-800/50 dark:text-slate-500 cursor-not-allowed border border-slate-200 dark:border-slate-700'
                                                    : 'bg-amber-400 hover:bg-amber-500 text-amber-950 focus:ring-amber-500 shadow-sm active:scale-[0.98]'
                                        }`}
                                    >
                                        {isPurchasingThis ? (
                                            <span className="flex items-center gap-2">
                                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Processing...
                                            </span>
                                        ) : isMaxed ? (
                                            'Maxed Out'
                                        ) : !canAfford ? (
                                            <>🪙 {item.cost}</>
                                        ) : (
                                            <>Buy for 🪙 {item.cost}</>
                                        )}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};
