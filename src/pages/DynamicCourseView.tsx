import React, { useState, useEffect } from 'react';
import type { Course, Module } from '../types';
import { useGeminiRoadmap } from '../hooks/useGeminiRoadmap';
import { courseService } from '../services/courseService';
import { useStore } from '../store/useStore';
import RoadmapNode from '../components/roadmap/RoadmapNode';
import StepDetailDrawer from '../components/roadmap/StepDetailDrawer';
import { Sparkles, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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

    return (
        <div className="h-screen w-full bg-background text-foreground relative overflow-hidden flex flex-col">

            {/* Header / Loading Overlay - STICKY */}
            <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border p-4 flex justify-between items-center transition-all">
                <button
                    onClick={() => navigate('/explore')}
                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors px-4 py-2 rounded-full hover:bg-card border border-transparent hover:border-border"
                >
                    <ArrowLeft size={16} /> <span className="text-sm font-medium">Back</span>
                </button>

                <h1 className="text-lg font-bold text-foreground truncate max-w-md mx-4 hidden md:block">
                    {course.title}
                </h1>

                {loading ? (
                    <div className="bg-primary/10 border border-primary/20 text-primary px-3 py-1.5 rounded-full flex items-center gap-2 animate-pulse">
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
            <div className="flex-1 w-full h-full overflow-y-auto px-4 py-12 md:py-20 scrollbar-hide">
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
                                <div className="w-full">
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

                                {/* Connecting Line (except after the last item) */}
                                {index < modules.length - 1 && (
                                    <div className="h-12 md:h-16 w-0.5 relative my-2">
                                        <div
                                            className={`absolute inset-0 border-l-2 border-dashed ${completedModuleIds.includes(module.id) ? 'border-primary/50' : 'border-border'}`}
                                        />
                                    </div>
                                )}
                            </React.Fragment>
                        );
                    })}

                    {modules.length === 0 && !loading && (
                        <div className="text-center text-muted-foreground p-12 bg-card rounded-2xl border border-border shadow-sm w-full max-w-md">
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
        </div>
    );
};

export default DynamicCourseView;
