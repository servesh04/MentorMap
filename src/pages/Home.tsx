import React from 'react';
import { useStore } from '../store/useStore';
import { useCourses } from '../hooks/useCourses';
import { courseService } from '../services/courseService';
import { Loader, Clock, Award, Code, Terminal, Coffee } from 'lucide-react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
    const { currentUser, completedModules, activeCourses } = useStore();
    const { courses, loading, error } = useCourses();

    const handleSeed = async () => {
        if (confirm("Are you sure you want to re-seed the database? This might overwrite existing data.")) {
            await courseService.seedCourses();
            alert("Seeding complete! Refresh the page.");
            window.location.reload();
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader className="animate-spin text-indigo-600" size={32} />
            </div>
        );
    }

    if (error) {
        return <div className="p-8 text-center text-red-500">{error}</div>;
    }

    // Calculate total progress
    const totalModules = courses.reduce((acc, course) => acc + course.modules.length, 0);
    const completedCount = Object.values(completedModules).flat().length;
    const overallProgress = totalModules > 0 ? Math.round((completedCount / totalModules) * 100) : 0;

    return (
        <div className="p-6 relative">
            {/* Seed Button (Dev only) */}
            <div className="fixed bottom-24 right-4 z-50">
                <button onClick={handleSeed} className="bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-50 hover:opacity-100 shadow-lg">
                    Dev: Seed DB
                </button>
            </div>

            <header className="mb-8">
                <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
                <p className="text-muted-foreground">Welcome back, {currentUser?.displayName?.split(' ')[0] || 'Learner'}!</p>
            </header>

            <div className="bg-card rounded-2xl p-6 shadow-sm border border-border mb-6">
                <div className="flex justify-between items-end mb-2">
                    <h3 className="text-lg font-semibold">Overall Progress</h3>
                    <span className="text-2xl font-bold text-primary">{overallProgress}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                    <div
                        className="bg-primary h-full rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${overallProgress}%` }}
                    ></div>
                </div>
                <p className="text-sm text-muted-foreground mt-3 flex justify-between">
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

            <h3 className="font-bold text-foreground mb-4 text-lg">Continue Learning</h3>
            {activeCourses.length > 0 ? (
                <div className="space-y-4">
                    {courses.filter(c => activeCourses.includes(c.id)).map(course => {
                        const courseCompleted = (completedModules[course.id] || []).length;
                        const courseTotal = course.modules.length;
                        const percent = Math.round((courseCompleted / courseTotal) * 100);

                        return (
                            <Link to={`/course/${course.id}`} key={course.id}>
                                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex gap-4 hover:shadow-md transition-all mb-4">
                                    <img src={course.thumbnail} alt={course.title} className="w-20 h-20 rounded-lg object-cover bg-gray-200" />
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-gray-900 truncate mb-1">{course.title}</h4>
                                        <p className="text-xs text-gray-500 mb-3">{courseCompleted}/{courseTotal} Modules</p>
                                        <div className="w-full bg-gray-100 rounded-full h-1.5">
                                            <div
                                                className="bg-primary h-1.5 rounded-full transition-all duration-500"
                                                style={{ width: `${percent}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-8 bg-muted/30 rounded-2xl border border-dashed border-border">
                    <p className="text-muted-foreground mb-4">You haven't enrolled in any courses yet.</p>
                    <a href="/explore" className="inline-block px-4 py-2 bg-primary text-white text-sm font-bold rounded-lg hover:bg-indigo-700 transition-colors">
                        Explore Courses
                    </a>
                </div>
            )}
        </div>
    );
};

export default Home;
