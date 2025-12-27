import React from 'react';
import { useStore } from '../store/useStore';
import { COURSES } from '../data/mockData';

const Home: React.FC = () => {
    const { currentUser, completedModules, activeCourses } = useStore();

    // Calculate total progress
    const totalModules = COURSES.reduce((acc, course) => acc + course.modules.length, 0);
    const completedCount = Object.values(completedModules).flat().length;
    const overallProgress = totalModules > 0 ? Math.round((completedCount / totalModules) * 100) : 0;

    return (
        <div className="p-6">
            <header className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-500">Welcome back, {currentUser?.displayName?.split(' ')[0] || 'Learner'}!</p>
            </header>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
                <div className="flex justify-between items-end mb-2">
                    <h3 className="text-lg font-semibold">Overall Progress</h3>
                    <span className="text-2xl font-bold text-primary">{overallProgress}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                    <div
                        className="bg-primary h-full rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${overallProgress}%` }}
                    ></div>
                </div>
                <p className="text-sm text-gray-500 mt-3 flex justify-between">
                    <span>{completedCount} of {totalModules} modules completed</span>
                    <span className="text-primary font-medium">Keep it up!</span>
                </p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-indigo-50 p-5 rounded-2xl">
                    <span className="block text-3xl font-bold text-indigo-600 mb-1">{activeCourses.length}</span>
                    <span className="text-sm font-medium text-indigo-600/80">Active Courses</span>
                </div>
                <div className="bg-emerald-50 p-5 rounded-2xl">
                    <span className="block text-3xl font-bold text-emerald-600 mb-1">{completedCount * 15}m</span>
                    <span className="text-sm font-medium text-emerald-600/80">Learning Time</span>
                </div>
            </div>

            <h3 className="font-bold text-gray-900 mb-4 text-lg">Continue Learning</h3>
            {activeCourses.length > 0 ? (
                <div className="space-y-4">
                    {COURSES.filter(c => activeCourses.includes(c.id)).map(course => {
                        const courseCompleted = (completedModules[course.id] || []).length;
                        const courseTotal = course.modules.length;
                        const percent = Math.round((courseCompleted / courseTotal) * 100);

                        return (
                            <div key={course.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex gap-4">
                                <img src={course.thumbnail} alt={course.title} className="w-20 h-20 rounded-lg object-cover bg-gray-200" />
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-gray-900 truncate mb-1">{course.title}</h4>
                                    <p className="text-xs text-gray-500 mb-3">{courseCompleted}/{courseTotal} Modules</p>
                                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                                        <div
                                            className="bg-primary h-1.5 rounded-full"
                                            style={{ width: `${percent}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-8 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                    <p className="text-gray-500 mb-4">You haven't enrolled in any courses yet.</p>
                    <a href="/explore" className="inline-block px-4 py-2 bg-primary text-white text-sm font-bold rounded-lg hover:bg-indigo-700 transition-colors">
                        Explore Courses
                    </a>
                </div>
            )}
        </div>
    );
};

export default Home;
