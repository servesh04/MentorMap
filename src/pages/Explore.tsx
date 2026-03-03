import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Search, Loader, Sparkles } from 'lucide-react';
import { useCourseSearch } from '../hooks/useCourseSearch';

const Explore: React.FC = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const { courses: filteredCourses, loading, error } = useCourseSearch(searchTerm);

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

    return (
        <div className="p-4 pb-24">
            {/* Sticky App Bar */}
            <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md pt-4 pb-2 px-4 -mx-4 transition-colors duration-300">
                <header className="mb-3">
                    <h1 className="text-xl font-bold text-foreground">Explore</h1>
                    <p className="text-sm text-muted-foreground">Discover new learning paths.</p>
                </header>

                {/* Chunky Search Input */}
                <div className="relative mb-1">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search courses..."
                        className="w-full h-12 bg-card rounded-full border-none text-foreground pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-primary transition-all placeholder:text-slate-400"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="space-y-3 mt-4">
                {filteredCourses.map((course) => (
                    <div
                        key={course.id}
                        onClick={() => navigate(`/course/${course.id}`)}
                        className="bg-card py-3 px-4 rounded-2xl shadow-sm border border-border flex gap-3 cursor-pointer active:scale-95 transition-transform duration-200"
                    >
                        <div
                            className="w-16 h-16 rounded-xl bg-cover bg-center flex-shrink-0"
                            style={{ backgroundImage: `url(${course.thumbnail})` }}
                        />
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                                    {course.level}
                                </span>
                                {course.isGenerated && (
                                    <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r from-purple-500/20 to-indigo-500/20 text-indigo-400 border border-indigo-500/20">
                                        <Sparkles className="w-3 h-3" />
                                        AI
                                    </span>
                                )}
                            </div>
                            <h3 className="font-semibold text-foreground text-sm truncate mb-0.5">{course.title}</h3>
                            <p className="hidden md:block text-xs text-muted-foreground line-clamp-1 mb-1">{course.description}</p>
                            <div className="flex items-center text-muted-foreground text-xs gap-3">
                                <div className="flex items-center gap-1">
                                    <BarChart className="w-3 h-3" />
                                    <span>{course.modules.length} Modules</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredCourses.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                    <p className="mb-4">No courses found matching "{searchTerm}"</p>
                    {searchTerm && (
                        <div className="max-w-md mx-auto bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-6 rounded-2xl shadow-lg">
                            <Sparkles className="w-8 h-8 mx-auto mb-3 text-yellow-300" />
                            <h3 className="font-bold text-lg mb-2">Want to learn {searchTerm}?</h3>
                            <p className="text-indigo-100 text-sm mb-4">
                                Our AI can build a custom curriculum for you in seconds.
                            </p>
                            <button
                                onClick={() => navigate(`/course/dynamic-${searchTerm.toLowerCase().replace(/\s+/g, '-')}`)}
                                className="bg-white text-indigo-600 px-6 py-2 rounded-full font-bold hover:bg-indigo-50 active:scale-95 transition-all duration-200 shadow-sm"
                            >
                                Generate Roadmap
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Explore;
