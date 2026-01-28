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
        <div className="p-6 pb-24">
            <header className="mb-6">
                <h1 className="text-2xl font-bold text-foreground">Explore</h1>
                <p className="text-muted-foreground">Discover new learning paths.</p>
            </header>

            {/* Search Bar */}
            <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <input
                    type="text"
                    placeholder="Search courses..."
                    className="w-full bg-card border border-border text-foreground py-3 pl-10 pr-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition-all placeholder:text-muted-foreground"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="space-y-4">
                {filteredCourses.map((course) => (
                    <div
                        key={course.id}
                        onClick={() => navigate(`/course/${course.id}`)}
                        className="bg-card p-4 rounded-2xl shadow-sm border border-border flex gap-4 cursor-pointer hover:shadow-md transition-shadow"
                    >
                        <div
                            className="w-20 h-20 rounded-xl bg-cover bg-center flex-shrink-0"
                            style={{ backgroundImage: `url(${course.thumbnail})` }}
                        />
                        <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600">
                                    {course.level}
                                </span>
                                {course.isGenerated && (
                                    <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r from-purple-100 to-indigo-100 text-indigo-700 border border-indigo-100">
                                        <Sparkles className="w-3 h-3" />
                                        Smart Generated
                                    </span>
                                )}
                            </div>
                            <h3 className="font-semibold text-foreground mb-1">{course.title}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{course.description}</p>
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
                                className="bg-white text-indigo-600 px-6 py-2 rounded-full font-bold hover:bg-indigo-50 transition-colors shadow-sm"
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
