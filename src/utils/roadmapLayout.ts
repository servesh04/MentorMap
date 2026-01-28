import { MarkerType } from '@xyflow/react';
import type { Module } from '../types';

export const generateRoadmapLayout = (modules: Module[], completedModuleIds: string[] = []) => {
    const nodes: any[] = [];
    const edges: any[] = [];

    const X_CENTER = 250;
    const Y_START = 50;
    const Y_GAP = 150;
    const X_OFFSET = 200; // How far left/right variables go

    modules.forEach((module, index) => {
        // 1. Determine Position (Zig-Zag)
        // 0 -> Center
        // 1 -> Left
        // 2 -> Right
        // 3 -> Center
        // ... pattern repeats or varies.
        // Let's do a simple snake: Center -> Left -> Center -> Right -> Center ...

        let x = X_CENTER;
        const y = Y_START + (index * Y_GAP);

        const pattern = index % 4; // 0, 1, 2, 3

        if (pattern === 1) x = X_CENTER - X_OFFSET; // Left
        else if (pattern === 3) x = X_CENTER + X_OFFSET; // Right
        // 0 and 2 are Center (creating a weaving effect)

        // 2. Determine Data Status
        const isCompleted = completedModuleIds.includes(module.id);
        // Current is the first incomplete one
        const isCurrent = !isCompleted && (index === 0 || completedModuleIds.includes(modules[index - 1].id));

        nodes.push({
            id: module.id,
            type: 'roadmapNode', // Matches our custom node type
            position: { x, y },
            data: {
                title: module.title,
                isCompleted,
                isCurrent,
                description: module.description,
                duration: module.duration,
                type: module.type
            },
        });

        // 3. Create Edge to previous node
        if (index > 0) {
            const prevModule = modules[index - 1];
            const isPathActive = completedModuleIds.includes(prevModule.id);

            edges.push({
                id: `e-${prevModule.id}-${module.id}`,
                source: prevModule.id,
                target: module.id,
                type: 'smoothstep', // or 'bezier'
                animated: isPathActive,
                style: {
                    stroke: isPathActive ? 'var(--primary)' : 'var(--border)',
                    strokeWidth: 2,
                },
                markerEnd: {
                    type: MarkerType.ArrowClosed,
                    color: isPathActive ? 'var(--primary)' : 'var(--border)',
                },
            });
        }
    });

    return { nodes, edges };
};
