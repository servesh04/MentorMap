import React from 'react';
import type { Module } from '../../types';
import RoadmapNode from './RoadmapNode';

interface RoadmapViewProps {
    modules: Module[];
    completedModuleIds: string[];
    onModuleClick: (moduleId: string) => void;
}

const RoadmapView: React.FC<RoadmapViewProps> = ({ modules, completedModuleIds, onModuleClick }) => {

    const getModuleStatus = (index: number, module: Module) => {
        const isCompleted = completedModuleIds.includes(module.id);
        if (isCompleted) return 'completed';

        // If it's the first module, or the previous module is completed, it's active
        if (index === 0) return 'active';
        const prevModule = modules[index - 1];
        if (completedModuleIds.includes(prevModule.id)) return 'active';

        return 'locked';
    };

    return (
        <div className="py-10 max-w-3xl mx-auto relative px-4">
            {/* Main Vertical Scanline */}
            <div className="absolute left-1/2 transform -translate-x-1/2 top-0 bottom-0 w-[2px] bg-gray-100 -z-20" />

            <div className="space-y-0">
                {modules.map((module, index) => (
                    <RoadmapNode
                        key={module.id}
                        index={index}
                        module={module}
                        status={getModuleStatus(index, module)}
                        onClick={() => onModuleClick(module.id)}
                        isLast={index === modules.length - 1}
                    />
                ))}
            </div>

            {/* Finish Line */}
            <div className="mt-8 text-center">
                <div className="inline-block px-6 py-2 bg-gray-900 text-white rounded-full text-sm font-bold shadow-lg z-10 relative">
                    Goal Reached 🏁
                </div>
            </div>
        </div>
    );
};

export default RoadmapView;
