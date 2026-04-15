export interface QuizQuestion {
    id: string;
    text: string;
    options: string[];
    correctAnswer: number; // Index of the correct option
}

export interface SearchHints {
    ytQuery: string;         // e.g. "Web Dev Simplified React Hooks tutorial"
    articleQuery: string;    // e.g. "React Hooks guide MDN"
}

export interface Module {
    id: string;
    title: string;
    description?: string; // Brief summary of the module
    type: 'video' | 'quiz';
    duration: string; // e.g., "10 min"
    searchHints?: SearchHints; // AI-curated search queries for best resources
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
    isGenerated?: boolean;
    progressionTitles?: string[]; // AI-generated 5-element array of rank titles
}
