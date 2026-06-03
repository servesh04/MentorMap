import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

const Unauthorized: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
            <div className="max-w-md w-full bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 p-8 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] text-center">
                {/* Shield Alert Icon */}
                <div className="mx-auto w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 mb-6 animate-pulse">
                    <ShieldAlert size={36} />
                </div>

                {/* Main Heading */}
                <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">
                    Access Denied
                </h1>
                
                {/* Code Badge */}
                <span className="inline-block px-3 py-1 bg-red-950/40 border border-red-900/40 text-red-400 text-xs font-semibold rounded-full uppercase tracking-wider mb-6">
                    Error 403: Forbidden
                </span>

                {/* Subtext */}
                <p className="text-slate-400 text-sm leading-relaxed mb-8">
                    Your account does not possess the administrative privileges required to view this interface. If you believe this is an error, please request custom auth claims elevation from your system administrator.
                </p>

                {/* Navigation Button */}
                <button
                    onClick={() => navigate('/dashboard')}
                    className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-sm font-medium text-white bg-red-600 hover:bg-red-500 active:scale-95 transition-all duration-200 shadow-lg shadow-red-600/20"
                >
                    <ArrowLeft size={16} />
                    <span>Return to Dashboard</span>
                </button>
            </div>
        </div>
    );
};

export default Unauthorized;
