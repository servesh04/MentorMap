import React, { memo } from 'react';
import { CheckCircle, Circle, PlayCircle, Lock } from 'lucide-react';
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
        e.stopPropagation(); // CRITICAL: Stop parent click (drawer open)
        if (courseId && module.id) {
            store.toggleModuleCompletion(courseId, module.id);
        }
    };

    return (
        <div
            onClick={onClick}
            className={clsx(
                "relative px-4 py-4 md:px-6 md:py-5 rounded-xl shadow-md transition-all duration-300 w-full max-w-2xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4 backdrop-blur-md group",
                isSelected ? "ring-2 ring-primary bg-card/90 scale-[1.02]" : "bg-card/80 border border-border hover:border-primary/50 hover:bg-card hover:scale-[1.01] cursor-pointer",
                isCompleted && "border-primary/40",
                (isCurrent && !isCompleted) && "border-primary ring-1 ring-primary/40 shadow-primary/10",
                isLocked && "opacity-60 border-border bg-muted/50 cursor-not-allowed hover:scale-100 hover:border-border"
            )}
        >
            <div className="flex items-start md:items-center gap-4 flex-1 min-w-0">
                {/* Icon Status (Left) */}
                <div className={clsx(
                    "w-10 h-10 rounded-full flex items-center justify-center border-2 shrink-0 transition-colors mt-1 md:mt-0",
                    isCompleted ? "bg-primary/10 border-primary text-primary" :
                        isCurrent ? "bg-primary/10 border-primary text-primary shadow-[0_0_15px_rgba(var(--primary),0.3)]" :
                            "bg-muted border-border text-muted-foreground"
                )}>
                    {isCompleted ? <CheckCircle size={20} /> :
                        (isCurrent && !isLocked) ? <PlayCircle size={20} /> :
                            isLocked ? <Lock size={18} /> :
                                <Circle size={20} />}
                </div>

                {/* Text Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <span className={clsx(
                            "text-xs font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider",
                            isCompleted ? "bg-primary/10 text-primary" :
                                isCurrent ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                        )}>
                            {module.type || 'Lesson'}
                        </span>
                        <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                            {module.duration} min
                        </span>
                    </div>
                    <h3 className={clsx(
                        "text-base md:text-lg font-bold leading-tight",
                        isCompleted ? "text-foreground" :
                            isCurrent ? "text-foreground" :
                                "text-muted-foreground"
                    )}>
                        {module.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {module.description}
                    </p>
                </div>
            </div>

            {/* Interaction Button (Right) - Only show if not locked */}
            <div className="flex justify-end md:shrink-0 mt-2 md:mt-0">
                {!isLocked && (
                    <button
                        onClick={handleToggle}
                        className={clsx(
                            "group/btn px-4 py-2 rounded-lg border transition-all z-10 flex items-center gap-2 font-medium text-sm",
                            isCompleted
                                ? "bg-primary text-primary-foreground border-primary hover:bg-red-500 hover:border-red-500 hover:text-white"
                                : "bg-transparent border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground"
                        )}
                    >
                        {isCompleted ? (
                            <>
                                <CheckCircle size={16} className="group-hover/btn:hidden" />
                                <Circle size={16} className="hidden group-hover/btn:block shrink-0" />
                                <span className="group-hover/btn:hidden">Completed</span>
                                <span className="hidden group-hover/btn:block">Mark Incomplete</span>
                            </>
                        ) : (
                            <>
                                <Circle size={16} />
                                <span>Mark Complete</span>
                            </>
                        )}
                    </button>
                )}
                {isLocked && (
                    <div className="px-4 py-2 rounded-lg border border-transparent flex items-center gap-2 font-medium text-sm text-muted-foreground">
                        <Lock size={16} />
                        <span>Locked</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default memo(RoadmapNode);
