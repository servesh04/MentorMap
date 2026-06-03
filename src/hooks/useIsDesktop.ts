import { useState, useEffect } from 'react';

/**
 * Custom React hook that evaluates if the current screen width is desktop-class (>= 1024px).
 * Dynamically updates if the viewport is resized.
 */
export const useIsDesktop = (): boolean => {
    const [isDesktop, setIsDesktop] = useState<boolean>(
        typeof window !== 'undefined' ? window.matchMedia('(min-width: 1024px)').matches : false
    );

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const mediaQuery = window.matchMedia('(min-width: 1024px)');
        
        const handleChange = (e: MediaQueryListEvent) => {
            setIsDesktop(e.matches);
        };

        // Modern browsers
        if (mediaQuery.addEventListener) {
            mediaQuery.addEventListener('change', handleChange);
            return () => mediaQuery.removeEventListener('change', handleChange);
        } else {
            // Fallback for older browsers
            mediaQuery.addListener(handleChange);
            return () => mediaQuery.removeListener(handleChange);
        }
    }, []);

    return isDesktop;
};
