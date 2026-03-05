import React, { useState } from 'react';
import { X, Youtube, BookOpen, CheckCircle, Circle } from 'lucide-react';
import { useYouTubeSearch } from '../../hooks/useYouTubeSearch';
import ResourceList from './ResourceList';
import QuizModal from './QuizModal';
import MentorChatWidget from './MentorChatWidget';
import clsx from 'clsx';
import { useStore } from '../../store/useStore';
import type { Module } from '../../types';
import { calculateModuleXP } from '../../utils/gamification';
import { awardXP } from '../../services/userService';

interface StepDetailDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    module: Module | null;
    courseId?: string;
    courseLevel?: string;
}

const StepDetailDrawer: React.FC<StepDetailDrawerProps> = ({ isOpen, onClose, module, courseId, courseLevel }) => {
    // Only search if we have an open module
    const searchQuery = module ? `${module.title} tutorial` : '';
    const { video, loading: videoLoading } = useYouTubeSearch(isOpen ? searchQuery : '');

    // For completion tracking right from the drawer
    const store = useStore();
    const isCompleted = module && courseId ? (store.completedModules[courseId] || []).includes(module.id) : false;

    // Quiz modal state
    const [showQuiz, setShowQuiz] = useState(false);

    const handleToggleComplete = () => {
        if (courseId && module) {
            if (isCompleted) {
                // Un-completing bypasses quiz
                store.toggleModuleCompletion(courseId, module.id);
            } else {
                // Completing requires passing the quiz
                setShowQuiz(true);
            }
        }
    };

    const handleQuizPass = () => {
        if (courseId && module) {
            store.toggleModuleCompletion(courseId, module.id);
            // Award XP
            const user = store.currentUser;
            if (user && courseLevel) {
                const xpEarned = calculateModuleXP(courseLevel);
                awardXP(user.uid, xpEarned);
            }
        }
    };

    return (
        <>
            <div className={clsx(
                "fixed inset-y-0 right-0 z-50 w-full md:w-[45%] lg:w-[40%] bg-card shadow-2xl transform transition-transform duration-300 ease-in-out border-l border-border",
                isOpen ? "translate-x-0" : "translate-x-full"
            )}>
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-border bg-card">
                    <div className="flex-1 pr-4">
                        <h2 className="text-xl font-bold text-card-foreground line-clamp-1">
                            {module?.title || "Step Details"}
                        </h2>
                        <p className="text-sm text-muted-foreground mt-1">
                            {module?.duration} • {module?.type === 'video' ? 'Video Lesson' : 'Quiz'}
                        </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        {courseId && module && module.type !== 'quiz' && (
                            <button
                                onClick={handleToggleComplete}
                                className={clsx(
                                    "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border",
                                    isCompleted
                                        ? "bg-primary/10 text-primary border-primary/20 hover:bg-red-500 hover:text-white hover:border-red-500"
                                        : "bg-card text-muted-foreground border-border hover:border-primary hover:text-primary"
                                )}
                                title={isCompleted ? "Mark as Incomplete" : "Mark as Complete"}
                            >
                                {isCompleted ? <CheckCircle size={16} /> : <Circle size={16} />}
                                <span className="hidden sm:inline">{isCompleted ? "Completed" : "Mark Complete"}</span>
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground ml-2"
                        >
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* Content Scroll Area */}
                <div className="p-6 overflow-y-auto h-[calc(100vh-88px)] space-y-8 bg-background/50">

                    {module?.description && (
                        <div className="bg-primary/5 p-4 rounded-xl text-foreground text-sm leading-relaxed border border-primary/10">
                            {module.description}
                        </div>
                    )}

                    {/* Video Section */}
                    <section>
                        <h3 className="flex items-center gap-2 font-bold text-foreground mb-4">
                            <Youtube className="w-5 h-5 text-red-600" />
                            Video Tutorial
                        </h3>

                        {videoLoading ? (
                            <div className="aspect-video w-full bg-muted rounded-xl animate-pulse flex items-center justify-center">
                                <span className="text-muted-foreground text-xs">Loading video...</span>
                            </div>
                        ) : video ? (
                            <div className="space-y-3">
                                <div className="aspect-video w-full rounded-xl overflow-hidden shadow-sm bg-black">
                                    <iframe
                                        width="100%"
                                        height="100%"
                                        src={`https://www.youtube.com/embed/${video.embedId}`}
                                        title={video.title}
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    ></iframe>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-foreground line-clamp-1">{video.title}</h4>
                                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{video.description}</p>
                                </div>
                            </div>
                        ) : (
                            <div className="p-4 bg-muted rounded-xl text-sm text-muted-foreground text-center">
                                No video found for this topic.
                            </div>
                        )}
                    </section>

                    {/* Resources Section */}
                    <section>
                        <h3 className="flex items-center gap-2 font-bold text-foreground mb-4">
                            <BookOpen className="w-5 h-5 text-indigo-500" />
                            Recommended Reading
                        </h3>
                        <ResourceList query={searchQuery} />
                    </section>

                    {/* AI Mentor Chat */}
                    {module && (
                        <section>
                            <MentorChatWidget
                                nodeTitle={module.title}
                                currentResource={video?.title}
                            />
                        </section>
                    )}
                </div>
            </div>

            {/* Quiz Modal */}
            {module && courseId && (
                <QuizModal
                    isOpen={showQuiz}
                    onClose={() => setShowQuiz(false)}
                    nodeId={`${courseId}_${module.id}`}
                    topicName={module.title}
                    onMarkComplete={handleQuizPass}
                />
            )}
        </>
    );
};

export default StepDetailDrawer;
