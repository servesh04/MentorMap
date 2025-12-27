import type { Course } from '../types';

export const COURSES: Course[] = [
    {
        id: 'python-beginners',
        title: 'Python for Beginners',
        description: 'Learn the fundamentals of Python programming, from variables to loops and functions.',
        level: 'Beginner',
        thumbnail: 'https://placehold.co/600x400/4F46E5/FFFFFF?text=Python',
        modules: [
            { id: 'm1', title: 'Introduction to Python', type: 'video', duration: '15 min' },
            { id: 'm2', title: 'Variables and Data Types', type: 'video', duration: '20 min' },
            { id: 'q1', title: 'Basics Quiz', type: 'quiz', duration: '10 min' },
        ]
    },
    {
        id: 'system-design',
        title: 'Advanced System Design',
        description: 'Master the architectural patterns used to build scalable, high-performance systems.',
        level: 'Advanced',
        thumbnail: 'https://placehold.co/600x400/10B981/FFFFFF?text=System+Design',
        modules: [
            { id: 'm1', title: 'Scalability Fundamentals', type: 'video', duration: '25 min' },
            { id: 'm2', title: 'Load Balancing', type: 'video', duration: '30 min' },
            { id: 'q1', title: 'Architecture Quiz', type: 'quiz', duration: '15 min' },
        ]
    }
];
