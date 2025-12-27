export interface Course {
    id: string;
    title: string;
    description: string;
    thumbnail: string;
    progress: number;
}

export interface User {
    id: string;
    name: string;
    email: string;
    avatar: string;
}

export const mockCourses: Course[] = [
    {
        id: '1',
        title: 'Modern React Patterns',
        description: 'Advanced design patterns for building scalable React applications.',
        thumbnail: 'https://placehold.co/600x400',
        progress: 45,
    },
    {
        id: '2',
        title: 'TypeScript for Professionals',
        description: 'Master generic types, utilities, and advanced configuration.',
        thumbnail: 'https://placehold.co/600x400',
        progress: 10,
    }
];

export const mockUser: User = {
    id: 'u1',
    name: 'Alex Doe',
    email: 'alex@example.com',
    avatar: 'https://placehold.co/150x150',
};

export const fetchCourses = async (): Promise<Course[]> => {
    return new Promise((resolve) => {
        setTimeout(() => resolve(mockCourses), 500);
    });
};

export const fetchUser = async (): Promise<User> => {
    return new Promise((resolve) => {
        setTimeout(() => resolve(mockUser), 300);
    });
};
