import React from 'react';
import { CheckCircle, Lock, Play, Star } from 'lucide-react';
import type { Module } from '../../types';
import clsx from 'clsx';

interface RoadmapNodeProps {
    module: Module;
    status: 'locked' | 'active' | 'completed';
    onClick: () => void;
    isLast: boolean;
    index: number;
}

const RoadmapNode: React.FC<RoadmapNodeProps> = ({ module, status, onClick, isLast, index }) => {
    const isLeft = index % 2 === 0;

    return (
        <div className={clsx("relative flex items-center justify-center py-8 w-full", isLeft ? "flex-row" : "flex-row-reverse")}>

            {/* Center Line Connection */}
            {!isLast && (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 w-1 bg-gray-200 h-full -z-10 mt-8" />
            )}

            {/* Content Box */}
            <div
                className={clsx(
                    "w-5/12 p-4 rounded-xl border transition-all duration-300 relative group",
                    status === 'locked' && "bg-gray-50 border-gray-200 opacity-70",
                    status === 'active' && "bg-white border-indigo-500 shadow-lg scale-105 z-10 cursor-pointer hover:shadow-indigo-200",
                    status === 'completed' && "bg-indigo-50 border-indigo-200 cursor-pointer hover:bg-indigo-100"
                )}
                onClick={status !== 'locked' ? onClick : undefined}
            >
                {/* Connector Line to Center */}
                <div className={clsx(
                    "absolute top-1/2 w-full h-[2px] -z-20",
                    isLeft ? "-right-[20%] bg-gradient-to-r from-transparent to-gray-200" : "-left-[20%] bg-gradient-to-l from-transparent to-gray-200"
                )} />

                <div className="flex items-start gap-3">
                    <div className={clsx(
                        "p-2 rounded-lg flex-shrink-0 transition-colors",
                        status === 'active' ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-400",
                        status === 'completed' && "bg-green-500 text-white"
                    )}>
                        {status === 'completed' ? <CheckCircle size={20} /> :
                            status === 'locked' ? <Lock size={20} /> :
                                module.type === 'quiz' ? <Star size={20} /> : <Play size={20} />
                        }
                    </div>
                    <div>
                        <h4 className={clsx("font-bold text-sm", status === 'locked' ? "text-gray-500" : "text-gray-900")}>
                            {module.title}
                        </h4>
                        <div className="flex items-center text-xs text-gray-500 mt-1 gap-2">
                            <span>{module.type.toUpperCase()}</span>
                            <span>•</span>
                            <span>{module.duration}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Center Node Dot */}
            <div className={clsx(
                "absolute left-1/2 transform -translate-x-1/2 w-4 h-4 rounded-full border-2 z-0",
                status === 'completed' ? "bg-green-500 border-green-500" :
                    status === 'active' ? "bg-indigo-600 border-indigo-600 animate-pulse" :
                        "bg-white border-gray-300"
            )} />

        </div>
    );
};

export default RoadmapNode;
