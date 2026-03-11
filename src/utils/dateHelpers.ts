/**
 * Calculates the current week identifier based on a Sunday-to-Saturday cycle.
 * For example: '2026_W11' for the 11th week of 2026.
 */
export const getCurrentWeekString = (): string => {
    const now = new Date();
    // Copy the date to avoid mutating the original
    const target = new Date(now.valueOf());

    // Day of week: 0 (Sunday) to 6 (Saturday)
    const dayNr = (now.getDay() + 6) % 7; // ISO day (1-7, Mon-Sun) -> shift so Sun is start

    // Set target to nearest Thursday mapping to ISO 8601 week number calculation
    target.setDate(target.getDate() - dayNr + 3);

    // Week 1 is the week with the first Thursday
    const firstThursday = new Date(target.getFullYear(), 0, 4);
    
    // Calculate week number
    const weekNumber = 1 + Math.round(((target.getTime() - firstThursday.getTime()) / 86400000 - 3 + (firstThursday.getDay() + 6) % 7) / 7);

    // Format week to always be 2 digits (e.g., W03)
    const weekString = weekNumber.toString().padStart(2, '0');

    return `${target.getFullYear()}_W${weekString}`;
};
