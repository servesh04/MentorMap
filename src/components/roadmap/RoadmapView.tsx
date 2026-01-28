import React, { useMemo, useCallback } from 'react';
import { ReactFlow, Background, ReactFlowProvider, useNodesState, useEdgesState, Controls } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import type { Module } from '../../types';
import RoadmapNode from './RoadmapNode';
import { generateRoadmapLayout } from '../../utils/roadmapLayout';

interface RoadmapViewProps {
    modules: Module[];
    completedModuleIds: string[];
    onModuleClick: (moduleId: string) => void;
}

const nodeTypes = {
    roadmapNode: RoadmapNode,
};

const RoadmapView: React.FC<RoadmapViewProps> = ({ modules, completedModuleIds, onModuleClick }) => {

    // 1. Generate Layout
    const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
        return generateRoadmapLayout(modules, completedModuleIds);
    }, [modules, completedModuleIds]);

    // 2. Flow State
    const [nodes, , onNodesChange] = useNodesState(initialNodes);
    const [edges, , onEdgesChange] = useEdgesState(initialEdges);

    // 3. Handle Click
    const onNodeClick = useCallback((event: any, node: any) => {
        onModuleClick(node.id);
    }, [onModuleClick]);

    return (
        <div className="h-[600px] w-full bg-background border border-border rounded-2xl overflow-hidden shadow-inner">
            <ReactFlow
                nodes={initialNodes} // Use memoized directly to ensure updates from props reflect immediately
                edges={initialEdges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onNodeClick={onNodeClick}
                nodeTypes={nodeTypes}
                fitView
                minZoom={0.5}
                maxZoom={1.5}
                proOptions={{ hideAttribution: true }}
                className="bg-background"
            >
                <Background color="var(--muted-foreground)" gap={20} size={1} className="opacity-20" />
                <Controls className="!bg-card !border-border !fill-muted-foreground [&>button]:!fill-muted-foreground [&>button:hover]:!bg-muted" />
            </ReactFlow>
        </div>
    );
};

export default (props: RoadmapViewProps) => (
    <ReactFlowProvider>
        <RoadmapView {...props} />
    </ReactFlowProvider>
);
