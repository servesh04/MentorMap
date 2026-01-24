import type { Course } from '../types';

export const SEED_COURSES: Course[] = [
    {
        id: 'python-masterclass',
        title: 'Python Masterclass',
        description: 'A comprehensive guide to Python programming, covering everything from basics to advanced data structures.',
        level: 'Beginner',
        thumbnail: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        modules: [
            { id: 'py_m1', title: 'Python Setup & specifics', type: 'video', duration: '10 min' },
            { id: 'py_m2', title: 'Variables & Data Types', type: 'video', duration: '25 min' },
            {
                id: 'py_q1',
                title: 'Python Basics Quiz',
                type: 'quiz',
                duration: '15 min',
                quiz: {
                    passingScore: 80,
                    questions: [
                        { id: 'q1', text: 'Which keyword is used to define a function in Python?', options: ['func', 'def', 'function', 'define'], correctAnswer: 1 },
                        { id: 'q2', text: 'What is the output of 3 * "abc"?', options: ['abcabcabc', 'abc3', 'Error', '3abc'], correctAnswer: 0 },
                        { id: 'q3', text: 'Which data type is immutable?', options: ['List', 'Dictionary', 'Set', 'Tuple'], correctAnswer: 3 }
                    ]
                }
            },
            { id: 'py_m3', title: 'Control Flow (If/Else)', type: 'video', duration: '20 min' },
            { id: 'py_m4', title: 'Loops & Iterations', type: 'video', duration: '30 min' }
        ]
    },
    {
        id: 'c-programming',
        title: 'C Programming Essentials',
        description: 'Master the mother of all languages. Understand memory management, pointers, and low-level computing.',
        level: 'Intermediate',
        thumbnail: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        modules: [
            { id: 'c_m1', title: 'Introduction to C', type: 'video', duration: '15 min' },
            { id: 'c_m2', title: 'Pointers Demystified', type: 'video', duration: '40 min' },
            {
                id: 'c_q1',
                title: 'Memory Quiz',
                type: 'quiz',
                duration: '20 min',
                quiz: {
                    passingScore: 80,
                    questions: [
                        { id: 'q1', text: 'What does malloc() return?', options: ['Integer', 'Void Pointer', 'Null', 'String'], correctAnswer: 1 },
                        { id: 'q2', text: 'Which operator is used to get the address of a variable?', options: ['*', '&', '->', '.'], correctAnswer: 1 },
                        { id: 'q3', text: 'Size of int in standard 32-bit compiler?', options: ['2 bytes', '4 bytes', '8 bytes', '1 byte'], correctAnswer: 1 }
                    ]
                }
            },
            { id: 'c_m3', title: 'Structs & Unions', type: 'video', duration: '25 min' }
        ]
    },
    {
        id: 'java-enterprise',
        title: 'Java for Enterprise',
        description: 'Learn object-oriented programming with Java. Build robust, scalable applications.',
        level: 'Advanced',
        thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        modules: [
            { id: 'java_m1', title: 'JVM Architecture', type: 'video', duration: '20 min' },
            { id: 'java_m2', title: 'OOP Principles', type: 'video', duration: '35 min' },
            {
                id: 'java_q1',
                title: 'OOP Quiz',
                type: 'quiz',
                duration: '15 min',
                quiz: {
                    passingScore: 80,
                    questions: [
                        { id: 'q1', text: 'Which principle allows hiding internal details?', options: ['Inheritance', 'Polymorphism', 'Encapsulation', 'Abstraction'], correctAnswer: 2 },
                        { id: 'q2', text: 'Does Java support multiple inheritance for classes?', options: ['Yes', 'No', 'Sometimes', 'Only for Abstract classes'], correctAnswer: 1 },
                        { id: 'q3', text: 'Entry point of a Java application?', options: ['start()', 'main()', 'init()', 'run()'], correctAnswer: 1 }
                    ]
                }
            },
            { id: 'java_m3', title: 'Collections Framework', type: 'video', duration: '45 min' }
        ]
    },
    {
        id: 'modern-javascript',
        title: 'Modern JavaScript',
        description: 'Deep dive into ES6+, async programming, and the DOM.',
        level: 'Intermediate',
        thumbnail: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        modules: [
            { id: 'js_m1', title: 'ES6+ Features', type: 'video', duration: '25 min' },
            { id: 'js_m2', title: 'Async/Await & Promises', type: 'video', duration: '30 min' },
            {
                id: 'js_q1',
                title: 'Async Quiz',
                type: 'quiz',
                duration: '15 min',
                quiz: {
                    passingScore: 80,
                    questions: [
                        { id: 'q1', text: 'What does a Promise return initially?', options: ['Value', 'Error', 'Pending State', 'Undefined'], correctAnswer: 2 },
                        { id: 'q2', text: 'Keyword to wait for a Promise?', options: ['wait', 'await', 'pause', 'stop'], correctAnswer: 1 },
                        { id: 'q3', text: 'Which is NOT a valid variable declaration?', options: ['var', 'let', 'const', 'int'], correctAnswer: 3 }
                    ]
                }
            }
        ]
    },
    {
        id: 'html-css',
        title: 'HTML & CSS for Beginners',
        description: 'Build your first website with semantic HTML and modern CSS layouts.',
        level: 'Beginner',
        thumbnail: 'https://images.unsplash.com/photo-1507721999472-8ed4421c4af2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        modules: [
            { id: 'web_m1', title: 'Semantic HTML', type: 'video', duration: '20 min' },
            { id: 'web_m2', title: 'Box Model', type: 'video', duration: '25 min' },
            {
                id: 'web_q1',
                title: 'Web Basics Quiz',
                type: 'quiz',
                duration: '15 min',
                quiz: {
                    passingScore: 80,
                    questions: [
                        { id: 'q1', text: 'Which tag is used for the largest heading?', options: ['<head>', '<h6>', '<h1>', '<header>'], correctAnswer: 2 },
                        { id: 'q2', text: 'What does CSS stand for?', options: ['Computer Style Sheets', 'Creative Style Sheets', 'Cascading Style Sheets', 'Colorful Style Sheets'], correctAnswer: 2 },
                        { id: 'q3', text: 'Which property changes text color?', options: ['text-color', 'color', 'font-color', 'bg-color'], correctAnswer: 1 }
                    ]
                }
            },
            { id: 'web_m3', title: 'Flexbox & Grid', type: 'video', duration: '35 min' }
        ]
    }
];
