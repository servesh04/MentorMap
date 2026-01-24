import React, { useEffect, useRef, useState } from 'react';

const CustomCursor: React.FC = () => {
    const cursorRef = useRef<HTMLDivElement>(null);
    const trailerRef = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [isHovering, setIsHovering] = useState(false);

    useEffect(() => {
        // Hide cursor on touch devices or if user reduced motion
        const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        const items = document.querySelectorAll('a, button, input, textarea, select, [role="button"]');

        if (isTouchDevice) return;

        setIsVisible(true);
        // Add class for global cursor hiding via CSS
        document.body.classList.add('custom-cursor-active');

        // State for smooth animation
        let mouseX = 0;
        let mouseY = 0;
        let trailerX = 0;
        let trailerY = 0;

        const handleMouseMove = (e: MouseEvent) => {
            mouseX = e.clientX;
            mouseY = e.clientY;

            // Instant update for the main dot cursor
            if (cursorRef.current) {
                cursorRef.current.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
            }
        };

        const handleMouseLeave = () => setIsVisible(false);
        const handleMouseEnter = () => setIsVisible(true);

        const handleLinkHoverStart = () => setIsHovering(true);
        const handleLinkHoverEnd = () => setIsHovering(false);

        // Animation loop for smooth trailing
        const animateTrailer = () => {
            if (!trailerRef.current) return;

            const ease = 0.15; // Smoothness factor

            trailerX += (mouseX - trailerX) * ease;
            trailerY += (mouseY - trailerY) * ease;

            // Adding a small offset to center the circle
            const offset = isHovering ? 24 : 12; // Half of width/height

            trailerRef.current.style.transform = `translate3d(${trailerX - offset}px, ${trailerY - offset}px, 0) scale(${isHovering ? 1.5 : 1})`;

            requestAnimationFrame(animateTrailer);
        };

        const animationFrameId = requestAnimationFrame(animateTrailer);

        window.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseleave', handleMouseLeave);
        document.addEventListener('mouseenter', handleMouseEnter);

        // Add hover listeners to clickable elements
        items.forEach(item => {
            item.addEventListener('mouseenter', handleLinkHoverStart);
            item.addEventListener('mouseleave', handleLinkHoverEnd);
        });

        // Observer for dynamic content (optional, but good for single page apps)
        const observer = new MutationObserver((mutations) => {
            const newItems = document.querySelectorAll('a, button, input, textarea, select, [role="button"]');
            newItems.forEach(item => {
                // Remove old listeners to avoid duplicates (safeguard)
                item.removeEventListener('mouseenter', handleLinkHoverStart);
                item.removeEventListener('mouseleave', handleLinkHoverEnd);
                // Add new listeners
                item.addEventListener('mouseenter', handleLinkHoverStart);
                item.addEventListener('mouseleave', handleLinkHoverEnd);
            });
        });

        observer.observe(document.body, { childList: true, subtree: true });

        return () => {
            document.body.classList.remove('custom-cursor-active');
            window.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseleave', handleMouseLeave);
            document.removeEventListener('mouseenter', handleMouseEnter);
            cancelAnimationFrame(animationFrameId);
            observer.disconnect();

            items.forEach(item => {
                item.removeEventListener('mouseenter', handleLinkHoverStart);
                item.removeEventListener('mouseleave', handleLinkHoverEnd);
            });
        };
    }, [isHovering]); // Re-run if hovering state logic needs update, though mostly handled inside refs

    if (!isVisible) return null;

    return (
        <>
            {/* Main Dot Cursor */}
            <div
                ref={cursorRef}
                className="fixed top-0 left-0 w-2 h-2 bg-emerald-500 rounded-full pointer-events-none z-[9999] mix-blend-difference"
                style={{ transform: 'translate3d(-100px, -100px, 0)' }} // Initial off-screen
            />

            {/* Trailing Circle Cursor */}
            <div
                ref={trailerRef}
                className={`fixed top-0 left-0 w-6 h-6 border-2 border-emerald-400 rounded-full pointer-events-none z-[9998] transition-opacity duration-300 ${isHovering ? 'bg-emerald-500/20 border-emerald-500' : ''}`}
                style={{ transform: 'translate3d(-100px, -100px, 0)' }}
            />
        </>
    );
};

export default CustomCursor;
