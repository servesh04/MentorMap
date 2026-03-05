import React from 'react';
import { useStore } from '../store/useStore';
import { useCourses } from '../hooks/useCourses';
import { Loader } from 'lucide-react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
    const { currentUser, completedModules, activeCourses, streak, xp } = useStore();

    const { courses, loading, error } = useCourses();

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader className="animate-spin text-primary" size={32} />
            </div>
        );
    }

    if (error) {
        return <div className="p-8 text-center text-destructive">{error}</div>;
    }

    // Calculate total progress
    const totalModules = courses.reduce((acc, course) => acc + course.modules.length, 0);
    const completedCount = Object.values(completedModules).flat().length;
    const overallProgress = totalModules > 0 ? Math.round((completedCount / totalModules) * 100) : 0;

    return (
        <div className="p-4 relative">
            {/* Condensed Header */}
            <header className="mb-4">
                <h1 className="text-xl font-bold text-foreground">Welcome back, {currentUser?.displayName?.split(' ')[0] || 'Learner'}!</h1>
                <div className="flex gap-3 mt-2">
                    <div className="flex-1 flex flex-col items-center justify-center py-5 sm:py-6 rounded-2xl bg-card shadow-sm border border-border">
                        <span className="text-3xl sm:text-4xl font-bold flex items-center gap-2 text-foreground">🔥 {streak}</span>
                        <span className="text-xs uppercase tracking-wider text-muted-foreground mt-1 font-medium">Day Streak</span>
                    </div>
                    <div className="flex-1 flex flex-col items-center justify-center py-5 sm:py-6 rounded-2xl bg-card shadow-sm border border-border">
                        <span className="text-3xl sm:text-4xl font-bold flex items-center gap-2 text-foreground">⚡ {xp}</span>
                        <span className="text-xs uppercase tracking-wider text-muted-foreground mt-1 font-medium">Total XP</span>
                    </div>
                </div>
            </header>

            {/* Overall Progress */}
            <div className="bg-card rounded-2xl p-4 shadow-sm border border-border mb-5 active:scale-[0.98] transition-transform duration-200">
                <div className="flex justify-between items-end mb-2">
                    <h3 className="text-sm font-semibold text-card-foreground">Overall Progress</h3>
                    <span className="text-xl font-bold text-primary">{overallProgress}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                    <div
                        className="bg-primary h-full rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${overallProgress}%` }}
                    ></div>
                </div>
                <p className="text-xs text-muted-foreground mt-2 flex justify-between">
                    <span>{completedCount} of {totalModules} modules</span>
                    <span className="text-primary font-medium">Keep it up!</span>
                </p>
            </div>

            {/* Continue Learning — Horizontal Carousel */}
            <h3 className="font-bold text-foreground mb-3 text-base">Continue Learning</h3>
            {activeCourses.length > 0 ? (
                <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 scrollbar-hide -mx-4 px-4">
                    {courses.filter(c => activeCourses.includes(c.id)).map(course => {
                        const courseCompleted = (completedModules[course.id] || []).length;
                        const courseTotal = course.modules.length;
                        const percent = Math.round((courseCompleted / courseTotal) * 100);

                        return (
                            <Link to={`/course/${course.id}`} key={course.id} className="min-w-[85%] md:min-w-[300px] snap-center shrink-0">
                                <div className="bg-card p-4 rounded-xl border border-border shadow-sm flex gap-4 active:scale-95 transition-transform duration-200">
                                    <img src={course.thumbnail} alt={course.title} className="w-16 h-16 rounded-lg object-cover bg-muted" />
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-card-foreground truncate mb-1 text-sm">{course.title}</h4>
                                        <p className="text-xs text-muted-foreground mb-2">{courseCompleted}/{courseTotal} Modules</p>
                                        <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                                            <div
                                                className="bg-primary h-full rounded-full transition-all duration-500"
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
                    <a href="/explore" className="inline-block px-4 py-2 bg-primary text-primary-foreground text-sm font-bold rounded-lg hover:bg-primary/90 active:scale-95 transition-all duration-200">
                        Explore Courses
                    </a>
                </div>
            )}
        </div>
    );
};

export default Home;
