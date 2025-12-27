import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { COURSES } from '../data/mockData';
import { ArrowLeft, PlayCircle, FileText, CheckCircle } from 'lucide-react';
import { useStore } from '../store/useStore';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../lib/firebase';
import ResourceRecommender from '../components/ResourceRecommender';
import clsx from 'clsx';

const CourseDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { currentUser, toggleModuleCompletion, completedModules, activeCourses, setActiveCourses } = useStore();
    const [enrolling, setEnrolling] = useState(false);

    // Check if enrolled based on store state, not just local state
    const isEnrolled = activeCourses.includes(id || '');

    const course = COURSES.find(c => c.id === id);

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

    return (
        <div className="pb-20 bg-white min-h-screen">
            {/* Header Image */}
            <div
                className="h-64 w-full bg-cover bg-center relative"
                style={{ backgroundImage: `url(${course.thumbnail})` }}
            >
                <button
                    onClick={() => navigate(-1)}
                    className="absolute top-4 left-4 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-md z-10"
                >
                    <ArrowLeft className="w-5 h-5 text-gray-900" />
                </button>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-6 left-6 right-6 text-white">
                    <span className="inline-block px-2 py-1 bg-white/20 backdrop-blur-md rounded-md text-xs font-medium mb-2">
                        {course.level}
                    </span>
                    <h1 className="text-2xl font-bold leading-tight">{course.title}</h1>

                    {/* Progress Bar */}
                    <div className="mt-4 flex items-center gap-3">
                        <div className="flex-1 h-2 bg-white/30 rounded-full overflow-hidden backdrop-blur-sm">
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
                <p className="text-gray-600 leading-relaxed mb-8">
                    {course.description}
                </p>

                <h3 className="font-bold text-gray-900 mb-4 text-lg">Course Modules</h3>
                <div className="space-y-3 mb-8">
                    {course.modules.map((module, index) => {
                        const isCompleted = courseCompletedModules.includes(module.id);
                        return (
                            <div
                                key={module.id}
                                className={clsx(
                                    "flex items-center p-4 rounded-xl border transition-colors cursor-pointer",
                                    isCompleted ? "bg-indigo-50 border-indigo-100" : "bg-gray-50 border-gray-100"
                                )}
                                onClick={() => toggleModuleCompletion(course.id, module.id)}
                            >
                                <div className={clsx(
                                    "w-6 h-6 rounded-md flex items-center justify-center border mr-4 transition-colors",
                                    isCompleted ? "bg-indigo-600 border-indigo-600" : "bg-white border-gray-300"
                                )}>
                                    {isCompleted && <CheckCircle className="w-4 h-4 text-white" />}
                                </div>
                                <div className="flex-1">
                                    <h4 className={clsx(
                                        "text-sm font-semibold transition-colors",
                                        isCompleted ? "text-indigo-900" : "text-gray-900"
                                    )}>
                                        {module.title}
                                    </h4>
                                    <div className="flex items-center text-xs text-gray-500 mt-1">
                                        {module.type === 'video' ? <PlayCircle className="w-3 h-3 mr-1" /> : <FileText className="w-3 h-3 mr-1" />}
                                        {module.duration}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <ResourceRecommender />
            </div>

            {/* Fixed Bottom Enrollment Bar */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 safe-area-bottom">
                <button
                    onClick={handleEnroll}
                    disabled={enrolling || isEnrolled}
                    className={`w-full py-4 rounded-xl font-bold text-white shadow-lg shadow-indigo-200 transition-all active:scale-95 ${isEnrolled ? 'bg-green-500 hover:bg-green-600' : 'bg-primary hover:bg-indigo-700'
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
        </div>
    );
};

export default CourseDetail;
