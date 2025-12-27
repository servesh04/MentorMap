import React from 'react';
import { useNavigate } from 'react-router-dom';
import { COURSES } from '../data/mockData';
import { BarChart } from 'lucide-react';

const Explore: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="p-6">
            <header className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Explore</h1>
                <p className="text-gray-500">Discover new learning paths.</p>
            </header>

            <div className="space-y-4">
                {COURSES.map((course) => (
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
        </div>
    );
};

export default Explore;
