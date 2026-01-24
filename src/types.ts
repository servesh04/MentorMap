export interface QuizQuestion {
    id: string;
    text: string;
    options: string[];
    correctAnswer: number; // Index of the correct option
}

export interface Module {
    id: string;
    title: string;
    type: 'video' | 'quiz';
    duration: string; // e.g., "10 min"
    quiz?: {
        questions: QuizQuestion[];
        passingScore: number; // Percentage, e.g., 80
    };
}

export interface Course {
    id: string;
    title: string;
    description: string;
    level: 'Beginner' | 'Intermediate' | 'Advanced';
    thumbnail: string;
    modules: Module[];
}
