import React from 'react';
import clsx from 'clsx';

interface LogoProps {
    className?: string;
    width?: number | string;
}

const Logo: React.FC<LogoProps> = ({ className, width }) => {
    return (
        <div className={clsx("relative", className)} style={width ? { width } : undefined}>
            <img
                src="/pwa-512x512.jpg"
                alt="MentorMap Logo"
                className="w-full h-auto object-cover rounded-xl shadow-md border border-slate-200 dark:border-none dark:shadow-none"
            />
        </div>
    );
};

export default Logo;

