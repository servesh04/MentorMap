/**
 * XP Calculation Engine
 * Maps course difficulty to XP reward per module completion.
 */

const XP_MAP: Record<string, number> = {
    'Beginner': 50,
    'Easy': 50,
    'Intermediate': 100,
    'Medium': 100,
    'Advanced': 250,
    'Hard': 250,
};

/**
 * Calculate XP earned for completing a module based on course difficulty.
 * @param difficulty - The course level (e.g., 'Beginner', 'Intermediate', 'Advanced')
 * @returns XP amount
 */
export const calculateModuleXP = (difficulty: string): number => {
    return XP_MAP[difficulty] || 50; // Fallback to 50 to prevent NaN
};
