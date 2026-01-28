import { useMemo } from 'react';
import { useCourses } from './useCourses';
import type { Course } from '../types';

export const useCourseSearch = (searchTerm: string) => {
    const { courses, loading, error } = useCourses();

    const filteredCourses = useMemo(() => {
        if (!searchTerm) return courses;

        const lowerTerm = searchTerm.toLowerCase();
        const matches = courses.filter(course =>
            course.title.toLowerCase().includes(lowerTerm) ||
            course.description.toLowerCase().includes(lowerTerm)
        );

        if (matches.length === 0 && searchTerm.trim().length > 0) {
            // Generate Placeholder Course
            const formattedTerm = searchTerm.trim().toLowerCase().replace(/\s+/g, '-');
            const displayTerm = searchTerm.trim().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

            const placeholderCourse: Course = {
                id: `dynamic-${formattedTerm}`, // e.g. "dynamic-react-native"
                title: `Learn ${displayTerm}`,
                description: `AI-generated learning path for ${displayTerm}.`,
                level: 'Beginner',
                thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
                modules: [
                    { id: 'm-basics', title: `${displayTerm} Basics`, type: 'video', duration: '10 min' },
                    { id: 'm-intermediate', title: `Intermediate ${displayTerm}`, type: 'video', duration: '20 min' },
                    { id: 'm-advanced', title: `Advanced ${displayTerm}`, type: 'video', duration: '30 min' }
                ],
                isGenerated: true
            };
            return [placeholderCourse];
        }

        return matches;
    }, [courses, searchTerm]);

    return {
        courses: filteredCourses,
        loading,
        error
    };
};
