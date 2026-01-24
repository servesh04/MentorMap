import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Search, Loader } from 'lucide-react';
import { useCourses } from '../hooks/useCourses';

const Explore: React.FC = () => {
    const navigate = useNavigate();
    const { courses, loading, error } = useCourses();
    const [searchTerm, setSearchTerm] = useState('');

    const filteredCourses = courses.filter(course =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
                <h1 className="text-2xl font-bold text-gray-900">Explore</h1>
                <p className="text-gray-500">Discover new learning paths.</p>
            </header>

            {/* Search Bar */}
            <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                    type="text"
                    placeholder="Search courses..."
                    className="w-full bg-gray-100 py-3 pl-10 pr-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="space-y-4">
                {filteredCourses.map((course) => (
                    <div
                        key={course.id}
                        onClick={() => navigate(`/course/${course.id}`)}
                        className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex gap-4 cursor-pointer hover:shadow-md transition-shadow"
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
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-1">{course.title}</h3>
                            <p className="text-sm text-gray-500 line-clamp-2 mb-2">{course.description}</p>
                            <div className="flex items-center text-gray-400 text-xs gap-3">
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
                <div className="text-center py-12 text-gray-400">
                    <p>No courses found matching "{searchTerm}"</p>
                </div>
            )}
        </div>
    );
};

export default Explore;
