import React, { useState, useEffect } from 'react';
import type { Course, Module } from '../types';
import { useGeminiRoadmap } from '../hooks/useGeminiRoadmap';
import { courseService } from '../services/courseService';
import { useStore } from '../store/useStore';
import RoadmapNode from '../components/roadmap/RoadmapNode';
import StepDetailDrawer from '../components/roadmap/StepDetailDrawer';
import { Sparkles, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';

interface DynamicCourseViewProps {
    course: Course;
}

const DynamicCourseView: React.FC<DynamicCourseViewProps> = ({ course }) => {
    const navigate = useNavigate();
    const store = useStore();

    // Retrieve completed module IDs for this course from the store
    const completedModuleIds = store.completedModules[course.id] || [];

    // 1. Logic & Data Fetching
    const topic = course.title.replace('Learn ', '');
    const { modules: generatedModules, loading, error } = useGeminiRoadmap(topic, course.isGenerated || false);

    // Prefer generated modules if available, else usage course.modules
    const [modules, setModules] = useState<Module[]>(course.modules);

    // 2. Drawer State
    const [selectedModule, setSelectedModule] = useState<Module | null>(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    // 3. Update modules when AI finishes
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

    // 4. Handlers
    const handleModuleClick = (module: Module) => {
        setSelectedModule(module);
        setIsDrawerOpen(true);
    };

    const handleCloseDrawer = () => {
        setIsDrawerOpen(false);
        setSelectedModule(null);
    };

    const getNodePositionClasses = (index: number) => {
        if (index === 0) return 'translate-x-0';
        return index % 2 === 0 ? 'translate-x-0 md:-translate-x-32 xl:-translate-x-48' : 'translate-x-0 md:translate-x-32 xl:translate-x-48';
    };

    return (
        <div className="h-screen w-full bg-background text-foreground relative overflow-hidden flex flex-col">

            {/* Header / Loading Overlay - STICKY */}
            <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border p-4 flex justify-between items-center transition-all">
                <button
                    onClick={() => navigate('/explore')}
                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors px-4 py-2 rounded-full hover:bg-muted border border-transparent hover:border-border"
                >
                    <ArrowLeft size={16} /> <span className="text-sm font-medium">Back</span>
                </button>

                <h1 className="text-lg font-bold text-foreground truncate max-w-md mx-4 hidden md:block">
                    {course.title}
                </h1>

                {loading ? (
                    <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 px-3 py-1.5 rounded-full flex items-center gap-2 animate-pulse">
                        <Sparkles size={14} />
                        <span className="text-xs font-semibold">Curating...</span>
                    </div>
                ) : <div className="w-20" /> /* Spacer */}
            </div>

            {/* ERROR State */}
            {error && (
                <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-20 bg-red-500/10 border border-red-500/20 text-red-500 px-6 py-4 rounded-xl backdrop-blur-md">
                    <strong>Error:</strong> {error}
                </div>
            )}

            {/* Roadmap DOM Canvas */}
            <div className="flex-1 w-full h-full overflow-y-auto px-4 py-12 md:py-20 scrollbar-hide relative">
                {/* Dotted Background */}
                <div
                    className="absolute inset-0 pointer-events-none opacity-40 dark:opacity-20 text-slate-300 dark:text-slate-600"
                    style={{
                        backgroundImage: 'radial-gradient(currentColor 1px, transparent 1px)',
                        backgroundSize: '24px 24px'
                    }}
                />

                <div className="flex flex-col items-center w-full max-w-4xl mx-auto">
                    {modules.map((module, index) => {
                        const isCompleted = completedModuleIds.includes(module.id);
                        const isCurrent = !isCompleted && (index === 0 || completedModuleIds.includes(modules[index - 1].id));
                        const isLocked = !isCompleted && !isCurrent;

                        const isEven = index % 2 === 0;
                        const isNextEven = (index + 1) % 2 === 0;

                        return (
                            <div key={module.id} className="w-full flex justify-center flex-col items-center z-10">

                                {/* Node Wrapper */}
                                <div className={clsx("transition-transform duration-500 z-10 w-full flex justify-center", getNodePositionClasses(index))}>
                                    <RoadmapNode
                                        module={module}
                                        isCompleted={isCompleted}
                                        isCurrent={isCurrent}
                                        isLocked={isLocked}
                                        courseId={course.id}
                                        onClick={() => handleModuleClick(module)}
                                        isSelected={selectedModule?.id === module.id}
                                    />
                                </div>

                                {/* In-Flow SVG Connection to Next Node */}
                                {index < modules.length - 1 && !loading && (
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

                    {modules.length === 0 && !loading && (
                        <div className="text-center text-muted-foreground p-12 bg-card rounded-2xl border border-border shadow-sm w-full max-w-md relative z-10">
                            No modules available for this course yet.
                        </div>
                    )}
                </div>
            </div>

            {/* Detail Drawer */}
            <StepDetailDrawer
                isOpen={isDrawerOpen}
                onClose={handleCloseDrawer}
                module={selectedModule}
                courseId={course.id}
            />

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

export default DynamicCourseView;
