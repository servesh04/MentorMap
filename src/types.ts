export interface Module {
    id: string;
    title: string;
    type: 'video' | 'quiz';
    duration: string; // e.g., "10 min"
}

export interface Course {
    id: string;
    title: string;
    description: string;
    level: 'Beginner' | 'Intermediate' | 'Advanced';
    thumbnail: string;
    modules: Module[];
}
