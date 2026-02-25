import React from 'react';
import type { Module } from '../../types';
import RoadmapNode from './RoadmapNode';
import clsx from 'clsx';

interface RoadmapViewProps {
    modules: Module[];
    completedModuleIds: string[];
    onModuleClick: (moduleId: string) => void;
    courseId: string;
}

const RoadmapView: React.FC<RoadmapViewProps> = ({ modules, completedModuleIds, onModuleClick, courseId }) => {

    const getNodePositionClasses = (index: number) => {
        // Center the first node. then alternate left and right on medium screens upwards
        if (index === 0) return 'translate-x-0';
        return index % 2 === 0 ? 'translate-x-0 md:-translate-x-32 xl:-translate-x-48' : 'translate-x-0 md:translate-x-32 xl:translate-x-48';
    };

    return (
        <div className="h-[600px] w-full bg-background text-foreground rounded-2xl overflow-y-auto p-4 md:p-8 scrollbar-hide relative shadow-inner">
            {/* Dotted Background */}
            <div
                className="absolute inset-0 pointer-events-none opacity-40 dark:opacity-20 text-slate-300 dark:text-slate-600"
                style={{
                    backgroundImage: 'radial-gradient(currentColor 1px, transparent 1px)',
                    backgroundSize: '24px 24px'
                }}
            />

            <div className="flex flex-col items-center w-full max-w-4xl mx-auto py-8">
                {modules.map((module, index) => {
                    const isCompleted = completedModuleIds.includes(module.id);
                    const isCurrent = !isCompleted && (index === 0 || completedModuleIds.includes(modules[index - 1].id));
                    const isLocked = !isCompleted && !isCurrent;

                    const isEven = index % 2 === 0;
                    const isNextEven = (index + 1) % 2 === 0;

                    return (
                        <div key={module.id} className="w-full flex justify-center flex-col items-center z-10">

                            {/* Node Wrapping Div for Position */}
                            <div className={clsx("transition-transform duration-500 z-10 w-full flex justify-center", getNodePositionClasses(index))}>
                                <RoadmapNode
                                    module={module}
                                    isCompleted={isCompleted}
                                    isCurrent={isCurrent}
                                    isLocked={isLocked}
                                    courseId={courseId}
                                    onClick={() => onModuleClick(module.id)}
                                />
                            </div>

                            {/* In-Flow SVG Connection to Next Node */}
                            {index < modules.length - 1 && (
                                <svg
                                    className={clsx(
                                        "w-full h-12 md:h-24 pointer-events-none z-0 overflow-visible my-1 md:my-0",
                                        !isCompleted && !isCurrent ? "text-slate-300 dark:text-slate-700" : ""
                                    )}
                                    preserveAspectRatio="none"
                                    viewBox="0 0 100 100"
                                >
                                    {/* Desktop Curve (Hidden on Mobile) */}
                                    <path
                                        d={
                                            index === 0
                                                // From Center to Right
                                                ? `M 50 0 C 50 50, 75 50, 75 100`
                                                // From Right to Left
                                                : !isEven && isNextEven
                                                    ? `M 75 0 C 75 50, 25 50, 25 100`
                                                    // From Left to Right
                                                    : `M 25 0 C 25 50, 75 50, 75 100`
                                        }
                                        fill="none"
                                        stroke={isCompleted || isCurrent ? '#10b981' : 'currentColor'}
                                        strokeWidth={isCompleted || isCurrent ? "4" : "2"}
                                        strokeLinecap="round"
                                        className={clsx(
                                            "transition-all duration-700 hidden md:block",
                                            isCurrent && "animate-[dash_3s_linear_infinite]"
                                        )}
                                        strokeDasharray={isCurrent ? "12 12" : "none"}
                                    />
                                    {/* Mobile Straight Line */}
                                    <line
                                        x1="50" y1="0" x2="50" y2="100"
                                        stroke={isCompleted || isCurrent ? '#10b981' : 'currentColor'}
                                        strokeWidth={isCompleted || isCurrent ? "4" : "2"}
                                        strokeLinecap="round"
                                        className={clsx(
                                            "md:hidden transition-all duration-700",
                                            isCurrent && "animate-[dash_3s_linear_infinite]"
                                        )}
                                        strokeDasharray={isCurrent ? "12 12" : "none"}
                                    />
                                </svg>
                            )}

                        </div>
                    );
                })}

                {modules.length === 0 && (
                    <div className="text-center text-muted-foreground p-8 relative z-10">
                        No modules available yet.
                    </div>
                )}
            </div>

            <style>{`
                @keyframes dash {
                    to {
                        stroke-dashoffset: -24;
                    }
                }
            `}</style>
        </div>
    );
};

export default RoadmapView;
