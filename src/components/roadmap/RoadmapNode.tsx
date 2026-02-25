import React, { memo } from 'react';
import { Check, Lock, Play } from 'lucide-react';
import clsx from 'clsx';
import { useStore } from '../../store/useStore';
import type { Module } from '../../types';

interface RoadmapNodeProps {
    module: Module;
    isCompleted: boolean;
    isCurrent: boolean;
    isLocked: boolean;
    courseId?: string;
    onClick?: () => void;
    isSelected?: boolean;
}

const RoadmapNode: React.FC<RoadmapNodeProps> = ({
    module,
    isCompleted,
    isCurrent,
    isLocked,
    courseId,
    onClick,
    isSelected
}) => {
    const store = useStore();

    const handleToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (courseId && module.id && !isLocked) {
            store.toggleModuleCompletion(courseId, module.id);
        }
    };

    // Strict Styling Matrix with Global Theme Support
    const nodeStyles = clsx(
        "relative px-4 py-4 md:px-5 md:py-4 rounded-xl shadow-lg transition-all duration-300 w-[280px] sm:w-[320px] flex items-center gap-4 group z-10",
        isSelected && !isLocked ? "scale-105" : "hover:scale-[1.02]",
        isLocked
            ? "opacity-50 bg-muted border border-border text-muted-foreground cursor-not-allowed"
            : isCurrent && !isCompleted
                ? "bg-card border-2 border-primary shadow-[0_0_15px_rgba(16,185,129,0.3)] text-card-foreground cursor-pointer"
                : isCompleted
                    ? "bg-card border border-primary/50 text-card-foreground cursor-pointer"
                    : "bg-card border border-border text-card-foreground cursor-pointer"
    );

    const iconBgStyles = clsx(
        "w-10 h-10 rounded-full flex items-center justify-center border shrink-0 transition-colors shadow-inner",
        isLocked ? "bg-background border-border text-muted-foreground" :
            isCurrent && !isCompleted ? "bg-primary/20 border-primary text-primary" :
                isCompleted ? "bg-primary/10 border-primary/50 text-primary" :
                    "bg-muted border-border text-muted-foreground"
    );

    return (
        <div onClick={isLocked ? undefined : onClick} className={nodeStyles}>

            {/* Status Icon (Left) */}
            <div className={iconBgStyles}>
                {isLocked ? <Lock size={18} /> :
                    isCompleted ? <Check size={20} className="text-primary" /> :
                        <Play size={18} className="translate-x-0.5" />}
            </div>

            {/* Text Content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        {module.type || 'Lesson'}
                    </span>
                    <span className="text-[10px] font-medium text-muted-foreground">
                        • {module.duration}m
                    </span>
                </div>
                <h3 className="text-sm font-bold leading-tight truncate">
                    {module.title}
                </h3>
            </div>

            {/* Pulse Indicator / Action Button (Right) */}
            <div className="flex justify-end shrink-0 pl-2 border-l border-border">
                {!isLocked && (
                    <button
                        onClick={handleToggle}
                        className={clsx(
                            "w-8 h-8 rounded-full flex items-center justify-center transition-all",
                            isCompleted
                                ? "bg-primary/10 hover:bg-destructive/20 hover:text-destructive text-primary"
                                : "bg-muted hover:bg-primary/20 text-muted-foreground hover:text-primary"
                        )}
                        title={isCompleted ? "Mark Incomplete" : "Mark Complete"}
                    >
                        {isCompleted ? <Check size={16} /> : <div className="w-3 h-3 rounded-full border-2 border-current" />}
                    </button>
                )}
                {isCurrent && !isCompleted && !isLocked && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
                )}
            </div>
        </div>
    );
};

export default memo(RoadmapNode);
