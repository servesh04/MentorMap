import React, { useState, useEffect } from 'react';
import { PlayCircle, ChevronDown, ChevronUp, Youtube } from 'lucide-react';
import type { Course, Module } from '../types';
import { useYouTubeSearch } from '../hooks/useYouTubeSearch';
import { useGeminiRoadmap } from '../hooks/useGeminiRoadmap';
import { courseService } from '../services/courseService';
import ResourceList from '../components/roadmap/ResourceList';
import clsx from 'clsx';

interface DynamicCourseViewProps {
    course: Course;
}

const StepContent: React.FC<{ query: string }> = ({ query }) => {
    const { video, loading: videoLoading, error: videoError } = useYouTubeSearch(query);

    return (
        <div className="p-4 border-t border-gray-100 bg-gray-50/50">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Video Player */}
                <div className="lg:col-span-2 space-y-3">
                    <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                        <Youtube className="w-4 h-4 text-red-600" />
                        Video Tutorial
                    </h4>

                    {videoLoading ? (
                        <div className="aspect-video w-full bg-gray-200 rounded-xl animate-pulse flex items-center justify-center">
                            <PlayCircle className="w-10 h-10 text-gray-400" />
                        </div>
                    ) : videoError ? (
                        <div className="aspect-video w-full bg-gray-100 rounded-xl flex items-center justify-center text-red-500 text-sm">
                            Video Unavailable
                        </div>
                    ) : video ? (
                        <div className="space-y-2">
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
                                <h5 className="font-medium text-gray-900 line-clamp-1">{video.title}</h5>
                                <p className="text-xs text-gray-500 line-clamp-2">{video.description}</p>
                            </div>
                        </div>
                    ) : null}
                </div>

                {/* Right: Articles */}
                <div className="lg:col-span-1">
                    <ResourceList query={query} />
                </div>
            </div>
        </div>
    );
};

const DynamicCourseView: React.FC<DynamicCourseViewProps> = ({ course }) => {
    // 1. Extract purely the topic from "Learn React Native" -> "React Native"
    // Assumption: Title format is always "Learn [Topic]" for generated courses.
    const topic = course.title.replace('Learn ', '');

    // 2. Call the Hook
    const { modules: generatedModules, loading, error } = useGeminiRoadmap(topic, course.isGenerated || false);

    // 3. State for modules (prefer generated over initial placeholders)
    const [modules, setModules] = useState<Module[]>(course.modules);

    // 4. Update local state when AI finishes
    useEffect(() => {
        if (generatedModules.length > 0) {
            setModules(generatedModules);

            // Save to DB for reusability (Phase 4)
            const saveToDb = async () => {
                const fullCourseData: Course = {
                    ...course,
                    modules: generatedModules,
                };
                await courseService.saveCourse(fullCourseData);
            };
            saveToDb();
        }
    }, [generatedModules]);

    // Default to first module expanded
    const [expandedModuleId, setExpandedModuleId] = useState<string | null>(null);

    // Auto-expand first module when data is ready
    useEffect(() => {
        if (modules.length > 0 && !loading) {
            setExpandedModuleId(modules[0].id);
        }
    }, [modules, loading]);

    const toggleModule = (id: string) => {
        setExpandedModuleId(prev => prev === id ? null : id);
    };

    return (
        <div className="space-y-4 max-w-4xl mx-auto">
            {/* Loading State */}
            {loading && (
                <div className="space-y-4">
                    <div className="bg-indigo-50 border border-indigo-100 text-indigo-800 px-4 py-3 rounded-xl text-sm flex items-center gap-2 mb-6 animate-pulse">
                        <span className="text-lg">✨</span>
                        <div>
                            <strong>Curating your personalized curriculum...</strong> This may take a few seconds.
                        </div>
                    </div>
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse"></div>
                    ))}
                </div>
            )}

            {/* Error State */}
            {error && (
                <div className="bg-red-50 border border-red-100 text-red-800 px-4 py-3 rounded-xl text-sm mb-6">
                    <strong>Error:</strong> {error} Using fallback curriculum.
                </div>
            )}

            {/* Content */}
            {!loading && (
                <>
                    <div className="bg-indigo-50 border border-indigo-100 text-indigo-800 px-4 py-3 rounded-xl text-sm flex items-center gap-2 mb-6">
                        <span className="text-lg">✨</span>
                        <div>
                            <strong>AI-Generated Learning Path.</strong> We've curated the best videos and articles for you.
                        </div>
                    </div>

                    <div className="space-y-4">
                        {modules.map((module, index) => {
                            const isExpanded = expandedModuleId === module.id;
                            // Construct search query: e.g. "React Basics tutorial"
                            const searchQuery = `${module.title} tutorial`;

                            return (
                                <div
                                    key={module.id}
                                    className={clsx(
                                        "bg-white border rounded-2xl overflow-hidden transition-all duration-300",
                                        isExpanded ? "shadow-md border-indigo-200 ring-1 ring-indigo-50" : "border-gray-200 hover:border-gray-300"
                                    )}
                                >
                                    <button
                                        onClick={() => toggleModule(module.id)}
                                        className="w-full flex items-center justify-between p-4 text-left"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={clsx(
                                                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border transition-colors",
                                                isExpanded ? "bg-indigo-600 border-indigo-600 text-white" : "bg-white border-gray-300 text-gray-500"
                                            )}>
                                                {index + 1}
                                            </div>
                                            <div>
                                                <h3 className={clsx(
                                                    "font-semibold text-lg transition-colors",
                                                    isExpanded ? "text-indigo-900" : "text-gray-900"
                                                )}>
                                                    {module.title}
                                                </h3>
                                                <div className="text-xs text-gray-500 flex items-center gap-2">
                                                    <span>Step {index + 1} of {modules.length}</span>
                                                    <span>•</span>
                                                    <span>{module.duration}</span>
                                                </div>
                                            </div>
                                        </div>
                                        {isExpanded ?
                                            <ChevronUp className="w-5 h-5 text-indigo-500" /> :
                                            <ChevronDown className="w-5 h-5 text-gray-400" />
                                        }
                                    </button>

                                    {/* Content Area (Only rendered when expanded) */}
                                    {isExpanded && (
                                        <StepContent query={searchQuery} />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </>
            )}
        </div>
    );
};

export default DynamicCourseView;
