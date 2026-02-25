import React from 'react';
import type { Module } from '../../types';
import RoadmapNode from './RoadmapNode';

interface RoadmapViewProps {
    modules: Module[];
    completedModuleIds: string[];
    onModuleClick: (moduleId: string) => void;
    courseId: string;
}

const RoadmapView: React.FC<RoadmapViewProps> = ({ modules, completedModuleIds, onModuleClick, courseId }) => {

    return (
        <div className="h-[600px] w-full bg-background border border-border rounded-2xl overflow-y-auto p-4 md:p-8 space-y-6 scrollbar-hide">
            <div className="flex flex-col items-center relative max-w-3xl mx-auto">
                {modules.map((module, index) => {
                    const isCompleted = completedModuleIds.includes(module.id);
                    // A module is "current" if it's not completed, and it's either the first module, 
                    // or the previous module is completed.
                    const isCurrent = !isCompleted && (index === 0 || completedModuleIds.includes(modules[index - 1].id));
                    // Locked if not completed and not current
                    const isLocked = !isCompleted && !isCurrent;

                    return (
                        <React.Fragment key={module.id}>
                            <RoadmapNode
                                module={module}
                                isCompleted={isCompleted}
                                isCurrent={isCurrent}
                                isLocked={isLocked}
                                courseId={courseId}
                                onClick={() => onModuleClick(module.id)}
                            />

                            {/* Connecting Line (except after the last item) */}
                            {index < modules.length - 1 && (
                                <div className="h-8 md:h-12 w-0.5 relative my-2">
                                    <div
                                        className={`absolute inset-0 border-l-2 border-dashed ${completedModuleIds.includes(module.id) ? 'border-primary/50' : 'border-border'}`}
                                    />
                                </div>
                            )}
                        </React.Fragment>
                    );
                })}
                {modules.length === 0 && (
                    <div className="text-center text-muted-foreground p-8">
                        No modules available yet.
                    </div>
                )}
            </div>
        </div>
    );
};

export default RoadmapView;
