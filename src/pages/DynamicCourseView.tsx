import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ReactFlow, Background, Position, ReactFlowProvider, useNodesState, useEdgesState, Controls } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import type { Course, Module } from '../types';
import { useGeminiRoadmap } from '../hooks/useGeminiRoadmap';
import { courseService } from '../services/courseService';
import RoadmapNode from '../components/roadmap/RoadmapNode';
import StepDetailDrawer from '../components/roadmap/StepDetailDrawer';
import { generateRoadmapLayout } from '../utils/roadmapLayout';
import clsx from 'clsx';
import { Sparkles, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface DynamicCourseViewProps {
    course: Course;
}

const nodeTypes = {
    roadmapNode: RoadmapNode,
};

const DynamicCourseView: React.FC<DynamicCourseViewProps> = ({ course }) => {
    const navigate = useNavigate();

    // 1. Logic & Data Fetching
    const topic = course.title.replace('Learn ', '');
    const { modules: generatedModules, loading, error } = useGeminiRoadmap(topic, course.isGenerated || false);

    // Prefer generated modules if available, else usage course.modules
    const [modules, setModules] = useState<Module[]>(course.modules);

    // 2. React Flow State
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);

    // 3. Drawer State
    const [selectedModule, setSelectedModule] = useState<Module | null>(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    // 4. Update modules when AI finishes
    useEffect(() => {
        if (generatedModules.length > 0) {
            setModules(generatedModules);
            // Persistence
            const saveToDb = async () => {
                const fullCourseData: Course = { ...course, modules: generatedModules };
                await courseService.saveCourse(fullCourseData);
            };
            saveToDb();
        }
    }, [generatedModules, course]);

    // 5. Layout Calculation using useMemo to avoid re-renders
    const layout = useMemo(() => {
        if (modules.length === 0) return { nodes: [], edges: [] };
        // We'll treat the first module as "current" effectively for the visual
        return generateRoadmapLayout(modules, []);
    }, [modules]);

    // 6. Sync Layout to Flow State
    useEffect(() => {
        setNodes(layout.nodes);
        setEdges(layout.edges);
    }, [layout, setNodes, setEdges]);


    // 7. Handlers
    const onNodeClick = useCallback((event: any, node: any) => {
        const module = modules.find(m => m.id === node.id);
        if (module) {
            setSelectedModule(module);
            setIsDrawerOpen(true);
        }
    }, [modules]);

    const handleCloseDrawer = () => {
        setIsDrawerOpen(false);
        setSelectedModule(null);
    };

    return (
        <div className="h-screen w-full bg-background text-foreground relative overflow-hidden flex flex-col">

            {/* Header / Loading Overlay */}
            <div className="absolute top-0 left-0 right-0 z-10 p-6 flex justify-between items-start pointer-events-none">
                <button
                    onClick={() => navigate('/explore')}
                    className="pointer-events-auto flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors bg-card/50 px-4 py-2 rounded-full backdrop-blur-md border border-border"
                >
                    <ArrowLeft size={16} /> Back
                </button>

                {loading && (
                    <div className="pointer-events-auto bg-primary/10 border border-primary/20 text-primary px-4 py-2 rounded-full backdrop-blur-md flex items-center gap-2 animate-pulse">
                        <Sparkles size={16} />
                        <span className="text-xs font-semibold">AI is curating your path...</span>
                    </div>
                )}
            </div>

            {/* ERROR State */}
            {error && (
                <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-20 bg-red-500/10 border border-red-500/20 text-red-500 px-6 py-4 rounded-xl backdrop-blur-md">
                    <strong>Error:</strong> {error}
                </div>
            )}

            {/* React Flow Canvas */}
            <div className="flex-1 w-full h-full">
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
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

            {/* Detail Drawer */}
            <StepDetailDrawer
                isOpen={isDrawerOpen}
                onClose={handleCloseDrawer}
                module={selectedModule}
            />
        </div>
    );
};

// Wrap in Provider to ensure internal context works if needed
export default (props: DynamicCourseViewProps) => (
    <ReactFlowProvider>
        <DynamicCourseView {...props} />
    </ReactFlowProvider>
);
