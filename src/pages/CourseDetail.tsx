import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, PlayCircle, FileText, CheckCircle, LayoutList, Map as MapIcon, Loader } from 'lucide-react';
import { useStore } from '../store/useStore';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../lib/firebase';
import ResourceRecommender from '../components/ResourceRecommender';
import clsx from 'clsx';
import RoadmapView from '../components/roadmap/RoadmapView';
import QuizModal from '../modals/QuizModal';
import StepDetailDrawer from '../components/roadmap/StepDetailDrawer';
import type { Module, Course } from '../types';
import { courseService } from '../services/courseService';
import DynamicCourseView from './DynamicCourseView';

const CourseDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { currentUser, toggleModuleCompletion, completedModules, activeCourses, setActiveCourses } = useStore();
    const [enrolling, setEnrolling] = useState(false);
    const [viewMode, setViewMode] = useState<'list' | 'roadmap'>('list');
    const [selectedQuizModule, setSelectedQuizModule] = useState<Module | null>(null);
    const [selectedDrawerModule, setSelectedDrawerModule] = useState<Module | null>(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    const [course, setCourse] = useState<Course | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCourse = async () => {
            if (!id) return;
            try {
                const data = await courseService.getCourseById(id);
                setCourse(data);
            } catch (error) {
                console.error("Failed to load course", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCourse();
    }, [id]);

    // Check if enrolled based on store state, not just local state
    const isEnrolled = activeCourses.includes(id || '');

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader className="animate-spin text-indigo-600" size={32} />
            </div>
        );
    }

    if (!course) {
        return <div className="p-6 text-center">Course not found</div>;
    }

    const courseCompletedModules = (id ? completedModules[id] : []) || [];
    const progress = Math.round((courseCompletedModules.length / course.modules.length) * 100);

    const handleEnroll = async () => {
        if (!currentUser) return;
        setEnrolling(true);
        try {
            await updateDoc(doc(db, 'users', currentUser.uid), {
                active_courses: arrayUnion(course.id)
            });
            // Update local store immediately
            setActiveCourses([...activeCourses, course.id]);
            alert("Successfully enrolled!");
        } catch (error) {
            console.error("Enrollment failed:", error);
            alert("Failed to enroll. Please try again.");
        } finally {
            setEnrolling(false);
        }
    };

    const handleRoadmapNodeClick = (moduleId: string) => {
        const module = course.modules.find(m => m.id === moduleId);
        if (!module) return;

        if (module.type === 'quiz') {
            setSelectedQuizModule(module);
        } else {
            setSelectedDrawerModule(module);
            setIsDrawerOpen(true);
        }
    };

    const handleQuizPass = () => {
        if (selectedQuizModule && currentUser) {
            // Only toggle if not already completed (avoid un-toggling)
            if (!courseCompletedModules.includes(selectedQuizModule.id)) {
                toggleModuleCompletion(course.id, selectedQuizModule.id);
            }
            setSelectedQuizModule(null);
        }
    };

    const handleCloseDrawer = () => {
        setIsDrawerOpen(false);
        setSelectedDrawerModule(null);
    };

    return (

        <div className="pb-20 bg-background min-h-screen text-foreground">
            {/* Header Image */}
            <div
                className="h-64 w-full bg-cover bg-center relative"
                style={{ backgroundImage: `url(${course.thumbnail})` }}
            >
                <button
                    onClick={() => navigate(-1)}
                    className="absolute top-4 left-4 w-10 h-10 bg-card/90 rounded-full flex items-center justify-center shadow-md z-10"
                >
                    <ArrowLeft className="w-5 h-5 text-foreground" />
                </button>
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent"></div>
                <div className="absolute bottom-6 left-6 right-6 text-foreground">
                    <span className="inline-block px-2 py-1 bg-card/20 backdrop-blur-md rounded-md text-xs font-medium mb-2 border border-white/10">
                        {course.level}
                    </span>
                    <h1 className="text-2xl font-bold leading-tight drop-shadow-md">{course.title}</h1>

                    {/* Progress Bar */}
                    <div className="mt-4 flex items-center gap-3">
                        <div className="flex-1 h-2 bg-card/30 rounded-full overflow-hidden backdrop-blur-sm border border-white/10">
                            <div
                                className="h-full bg-secondary transition-all duration-500 ease-out"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <span className="text-sm font-medium">{progress}%</span>
                    </div>
                </div>
            </div>

            <div className="p-6">
                <p className="text-muted-foreground leading-relaxed mb-8">
                    {course.description}
                </p>

                {course.isGenerated ? (
                    <DynamicCourseView course={course} />
                ) : (
                    <>
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-bold text-foreground text-lg">Course Modules</h3>

                            <div className="bg-muted p-1 rounded-lg flex items-center">
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={clsx(
                                        "p-2 rounded-md transition-all",
                                        viewMode === 'list' ? "bg-card shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    <LayoutList size={20} />
                                </button>
                                <button
                                    onClick={() => setViewMode('roadmap')}
                                    className={clsx(
                                        "p-2 rounded-md transition-all",
                                        viewMode === 'roadmap' ? "bg-card shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    <MapIcon size={20} />
                                </button>
                            </div>
                        </div>

                        {viewMode === 'list' ? (
                            <div className="space-y-3 mb-8">
                                {course.modules.map((module, _) => {
                                    const isCompleted = courseCompletedModules.includes(module.id);
                                    return (
                                        <div
                                            key={module.id}
                                            className={clsx(
                                                "flex items-center p-4 rounded-xl border transition-colors cursor-pointer",
                                                isCompleted ? "bg-primary/5 border-primary/20" : "bg-card border-border hover:border-primary/50"
                                            )}
                                            onClick={() => handleRoadmapNodeClick(module.id)}
                                        >
                                            <div className={clsx(
                                                "w-6 h-6 rounded-md flex items-center justify-center border mr-4 transition-colors",
                                                isCompleted ? "bg-primary border-primary text-primary-foreground" : "bg-muted border-border text-muted-foreground"
                                            )}>
                                                {isCompleted && <CheckCircle className="w-4 h-4" />}
                                            </div>
                                            <div className="flex-1">
                                                <h4 className={clsx(
                                                    "text-sm font-semibold transition-colors",
                                                    isCompleted ? "text-primary" : "text-foreground"
                                                )}>
                                                    {module.title}
                                                </h4>
                                                <div className="flex items-center text-xs text-muted-foreground mt-1">
                                                    {module.type === 'video' ? <PlayCircle className="w-3 h-3 mr-1" /> : <FileText className="w-3 h-3 mr-1" />}
                                                    {module.duration}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <RoadmapView
                                modules={course.modules}
                                completedModuleIds={courseCompletedModules}
                                onModuleClick={handleRoadmapNodeClick}
                                courseId={course.id}
                            />
                        )}

                        <ResourceRecommender />
                    </>
                )}
            </div>

            {/* Fixed Bottom Enrollment Bar */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-card border-t border-border safe-area-bottom z-40">
                <button
                    onClick={handleEnroll}
                    disabled={enrolling || isEnrolled}
                    className={`w-full py-4 rounded-xl font-bold text-white shadow-lg shadow-primary/20 transition-all active:scale-95 ${isEnrolled ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-primary hover:bg-primary/90'
                        }`}
                >
                    {isEnrolled ? (
                        <span className="flex items-center justify-center gap-2">
                            <CheckCircle className="w-5 h-5" /> Enrolled
                        </span>
                    ) : (
                        enrolling ? 'Enrolling...' : 'Enroll Now'
                    )}
                </button>
            </div>

            {/* Quiz Modal */}
            {selectedQuizModule && (
                <QuizModal
                    module={selectedQuizModule}
                    onClose={() => setSelectedQuizModule(null)}
                    onPass={handleQuizPass}
                />
            )}

            {/* Detail Drawer */}
            <StepDetailDrawer
                isOpen={isDrawerOpen}
                onClose={handleCloseDrawer}
                module={selectedDrawerModule}
                courseId={course.id}
            />
        </div>
    );
};

export default CourseDetail;
