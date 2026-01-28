import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { CheckCircle, Circle, PlayCircle, Lock } from 'lucide-react';
import clsx from 'clsx';

const RoadmapNode = ({ data, selected }: any) => {
    const { title, isCompleted, isCurrent, isLocked } = data;

    return (
        <div className={clsx(
            "relative px-6 py-3 rounded-full shadow-lg transition-all duration-300 min-w-[200px] flex items-center gap-3 backdrop-blur-md",
            selected ? "ring-2 ring-primary bg-card scale-105" : "bg-card border border-border hover:border-primary/50 hover:scale-105",
            isCompleted && "border-primary/50",
            (isCurrent && !isCompleted) && "border-primary ring-1 ring-primary/50 animate-pulse-slow",
            isLocked && "opacity-70 border-border bg-muted"
        )}>
            {/* Input Handle (Top) */}
            <Handle type="target" position={Position.Top} className="!bg-transparent !border-0" />

            {/* Icon Status */}
            <div className={clsx(
                "w-8 h-8 rounded-full flex items-center justify-center border shrink-0 transition-colors",
                isCompleted ? "bg-primary/10 border-primary text-primary" :
                    isCurrent ? "bg-primary/10 border-primary text-primary" :
                        "bg-muted border-border text-muted-foreground"
            )}>
                {isCompleted ? <CheckCircle size={16} /> :
                    (isCurrent && !isLocked) ? <PlayCircle size={16} /> :
                        isLocked ? <Lock size={16} /> :
                            <Circle size={16} />}
            </div>

            {/* Title */}
            <div className="flex-1">
                <h3 className={clsx(
                    "text-sm font-medium leading-tight",
                    isCompleted ? "text-primary" :
                        isCurrent ? "text-foreground" :
                            "text-muted-foreground"
                )}>
                    {title}
                </h3>
            </div>

            {/* Output Handle (Bottom) */}
            <Handle type="source" position={Position.Bottom} className="!bg-transparent !border-0" />
        </div>
    );
};

export default memo(RoadmapNode);
