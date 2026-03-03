import React, { useState, useEffect } from 'react';

interface SplashScreenProps {
    isLoading: boolean;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ isLoading }) => {
    const [shouldRender, setShouldRender] = useState(true);

    useEffect(() => {
        if (!isLoading) {
            const timer = setTimeout(() => {
                setShouldRender(false);
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [isLoading]);

    if (!shouldRender) return null;

    return (
        <div
            className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black transition-opacity duration-500 ease-in-out ${isLoading ? 'opacity-100' : 'opacity-0'}`}
        >
            {/* Logo — Glowing Geometric Shape */}
            <div className="relative mb-8 animate-pulse">
                <div className="w-24 h-24 bg-gradient-to-tr from-emerald-600 to-emerald-400 rounded-2xl rotate-45 shadow-[0_0_40px_rgba(16,185,129,0.3)]" />
                {/* Inner glow ring */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 bg-black/40 rounded-xl rotate-45 backdrop-blur-sm" />
                </div>
            </div>

            {/* Brand Name */}
            <h1
                className="text-4xl font-bold tracking-[0.15em] text-slate-100"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
                Mentor<span className="text-emerald-500">Map</span>
            </h1>

            {/* Tagline */}
            <p
                className="mt-3 text-sm text-slate-500 tracking-wider"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
                AI-Powered Learning Paths
            </p>

            {/* Loading Indicator */}
            <div className="mt-8 flex flex-col items-center gap-3">
                {/* Bar Track */}
                <div className="w-48 h-1 bg-slate-800 rounded-full overflow-hidden">
                    {/* Bar Fill — shimmer animation */}
                    <div
                        className="h-full rounded-full bg-emerald-500"
                        style={{
                            animation: 'splashShimmer 1.5s ease-in-out infinite',
                        }}
                    />
                </div>

                {/* Status Text */}
                <span
                    className="text-xs font-semibold tracking-widest text-slate-500 uppercase animate-pulse"
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                    Orchestrating Curriculum...
                </span>
            </div>

            {/* Inline keyframes for the shimmer bar */}
            <style>{`
                @keyframes splashShimmer {
                    0% {
                        transform: translateX(-100%);
                        width: 40%;
                    }
                    50% {
                        transform: translateX(60%);
                        width: 60%;
                    }
                    100% {
                        transform: translateX(200%);
                        width: 40%;
                    }
                }
            `}</style>
        </div>
    );
};

export default SplashScreen;
