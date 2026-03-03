import React from 'react';
import clsx from 'clsx';

interface LogoProps {
    className?: string;
    width?: number | string;
}

const Logo: React.FC<LogoProps> = ({ className, width }) => {
    return (
        <div className={clsx("relative", className)} style={width ? { width } : undefined}>
            {/* Show when dark mode is active */}
            <img
                src="/pwa-512x512.jpg"
                alt="MentorMap Logo"
                className="hidden dark:block w-full h-auto object-contain"
            />
            {/* Show when light mode is active */}
            <img
                src="/pwa-512x512.jpg"
                alt="MentorMap Logo"
                className="block dark:hidden w-full h-auto object-contain"
            />
        </div>
    );
};

export default Logo;

