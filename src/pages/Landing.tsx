import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Code, Trophy, Target, Zap, BookOpen, Users, Terminal } from 'lucide-react';
import { useStore } from '../store/useStore';
import SpotlightCard from '../components/ui/SpotlightCard';
import { ThemeToggle } from '../components/ThemeToggle';


const Landing: React.FC = () => {
    const navigate = useNavigate();
    const { currentUser: user } = useStore();


    React.useEffect(() => {
        if (user) {
            navigate('/dashboard');
        }
    }, [user, navigate]);

    const handleGetStarted = () => {
        if (user) {
            navigate('/dashboard');
        } else {
            navigate('/login');
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-white overflow-hidden transition-colors duration-300">
            {/* Navbar */}
            <nav className="fixed w-full z-50 top-0 left-0 border-b border-border bg-background/80 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
                            <Code className="text-primary" size={20} />
                        </div>
                        <span className="font-bold text-xl tracking-tight">MentorMap</span>
                    </div>
                    <div className="flex items-center gap-6">
                        <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden md:block">Features</a>
                        <a href="#roadmaps" className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden md:block">Roadmaps</a>
                        <ThemeToggle />
                        <button
                            onClick={handleGetStarted}
                            className="px-5 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-full hover:bg-primary-hover transition-colors"
                        >
                            {user ? 'Go to Dashboard' : 'Login'}
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <header className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6">
                <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
                    <div className="space-y-8 z-10">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium">
                            <Zap size={12} className="fill-primary" />
                            <span>New: Interactive Skill Trees</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight">
                            Stop Watching. <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                                Start Doing.
                            </span>
                        </h1>
                        <p className="text-muted-foreground text-lg md:text-xl max-w-lg leading-relaxed">
                            Master Python and Java with interactive roadmaps, not just endless videos. Build real projects and track your progress.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <button
                                onClick={handleGetStarted}
                                className="px-8 py-4 bg-primary hover:bg-primary-hover text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-all transform hover:scale-105 shadow-lg shadow-primary/20"
                            >
                                Start Learning For Free
                                <ArrowRight size={18} />
                            </button>
                            <button
                                onClick={() => navigate('/explore')}
                                className="px-8 py-4 bg-transparent border border-border hover:bg-muted text-foreground font-semibold rounded-xl flex items-center justify-center transition-all"
                            >
                                Explore Catalog
                            </button>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500 pt-4">
                            <div className="flex -space-x-2">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="w-8 h-8 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs text-foreground overflow-hidden">
                                        <img
                                            src={`https://api.dicebear.com/7.x/notionists/svg?seed=${i * 55}`}
                                            alt="avatar"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                ))}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-foreground font-bold text-sm">Join 500+ Students</span>
                                <span className="text-xs text-muted-foreground">learning daily</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground font-medium">
                            <span>Curriculum aligned with:</span>
                            <div className="flex gap-2 opacity-50 grayscale hover:grayscale-0 transition-all">
                                <span>Google</span>
                                <span>•</span>
                                <span>Microsoft</span>
                                <span>•</span>
                                <span>Amazon</span>
                            </div>
                        </div>
                    </div>

                    {/* Abstract Visual - Mesh Gradients */}
                    <div className="relative z-0 perspective-1000">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-[120px] animate-pulse mix-blend-screen" />
                        <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/20 rounded-full blur-[120px] animate-pulse mix-blend-screen delay-1000" />

                        <div className="relative bg-card border border-border rounded-2xl p-4 shadow-2xl skew-y-3 transform hover:skew-y-0 transition-transform duration-700 h-[400px] flex overflow-hidden">
                            {/* Dashboard Mockup - Sidebar */}
                            <div className="w-16 border-r border-border flex flex-col items-center py-4 gap-4 bg-muted/50">
                                <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
                                    <Code size={16} />
                                </div>
                                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
                                    <BookOpen size={16} />
                                </div>
                                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
                                    <Trophy size={16} />
                                </div>
                            </div>
                            {/* Dashboard Mockup - Main */}
                            <div className="flex-1 p-6 relative">
                                <div className="flex justify-between items-center mb-8">
                                    <div>
                                        <div className="h-4 w-32 bg-muted rounded-full mb-2"></div>
                                        <div className="h-8 w-48 bg-muted rounded-lg"></div>
                                    </div>
                                    <div className="flex items-center gap-2 px-3 py-1 bg-muted rounded-full border border-border">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                        <span className="text-xs text-emerald-500 font-mono">Live</span>
                                    </div>
                                </div>

                                {/* Mock Graph/Tree */}
                                <div className="relative mt-12 pl-4">
                                    <div className="absolute left-[19px] top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-primary/50 to-transparent"></div>

                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="relative z-10 w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
                                            <Code size={18} />
                                        </div>
                                        <div className="flex-1 bg-muted/50 p-3 rounded-xl border border-border flex justify-between items-center">
                                            <span className="text-sm font-medium text-foreground">Intro to Python</span>
                                            <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded">Completed</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="relative z-10 w-10 h-10 rounded-full bg-card border-2 border-primary flex items-center justify-center text-primary">
                                            <Terminal size={18} />
                                        </div>
                                        <div className="flex-1 bg-muted/50 p-3 rounded-xl border border-primary/30 flex justify-between items-center">
                                            <span className="text-sm font-medium text-foreground">Variables & Loops</span>
                                            <span className="text-xs text-muted-foreground">In Progress</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="relative z-10 w-10 h-10 rounded-full bg-card border-2 border-muted-foreground/30 flex items-center justify-center text-muted-foreground">
                                            <Trophy size={18} />
                                        </div>
                                        <div className="flex-1 p-3 rounded-xl border border-dashed border-border">
                                            <span className="text-sm text-muted-foreground">Final Project</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Floating Badge */}
                                <div className="absolute top-1/2 right-4 bg-card/90 backdrop-blur border border-border p-3 rounded-xl shadow-2xl skew-x-[-2deg] animate-[float_4s_ease-in-out_infinite]">
                                    <div className="text-xs text-muted-foreground mb-1">Current Streak</div>
                                    <div className="flex items-center gap-2 text-orange-500 font-bold text-xl">
                                        <Zap size={20} className="fill-orange-500" />
                                        <span>7 Days</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Features Grid */}
            <section id="features" className="py-24 bg-card relative">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold mb-6 text-foreground">Built for the modern learner</h2>
                        <p className="text-muted-foreground text-lg">Forget boring video lectures. Learn by doing with our interactive, gamified platform.</p>
                    </div>

                    <div className="grid md:grid-cols-4 md:grid-rows-2 gap-6 h-auto md:h-[600px]">
                        {/* Large Feature - Skill Trees */}
                        <SpotlightCard className="md:col-span-2 md:row-span-2 p-8 flex flex-col justify-between group bg-card border-border">
                            <div>
                                <div className="mb-6 w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform text-primary">
                                    <Target size={32} />
                                </div>
                                <h3 className="text-2xl font-bold mb-3 text-foreground">Interactive Skill Trees</h3>
                                <p className="text-muted-foreground leading-relaxed text-lg">
                                    Visualize your mastery. Unlock new modules as you progress, just like in your favorite RPG.
                                </p>
                            </div>
                            <div className="mt-8 rounded-xl bg-muted/50 border border-border p-6 relative overflow-hidden flex items-center justify-center">
                                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10" />

                                {/* Mock Node Structure */}
                                <div className="relative z-0 flex items-center gap-6">
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="w-12 h-12 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center text-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)]">
                                            <Code size={20} />
                                        </div>
                                        <span className="text-xs text-emerald-500 font-mono">Basics</span>
                                    </div>
                                    <div className="w-16 h-1 bg-muted relative overflow-hidden">
                                        <div className="absolute inset-0 bg-emerald-500/50 w-full animate-[shimmer_2s_infinite]" />
                                    </div>
                                    <div className="flex flex-col items-center gap-2 opacity-80">
                                        <div className="w-12 h-12 rounded-full bg-indigo-500/20 border-2 border-indigo-500 flex items-center justify-center text-indigo-400">
                                            <Terminal size={20} />
                                        </div>
                                        <span className="text-xs text-indigo-400 font-mono">Logic</span>
                                    </div>
                                    <div className="w-16 h-1 bg-muted"></div>
                                    <div className="w-12 h-12 rounded-full bg-card border-2 border-muted-foreground flex items-center justify-center text-muted-foreground">
                                        <BookOpen size={20} />
                                    </div>
                                </div>
                            </div>
                        </SpotlightCard>

                        {/* Wide Feature - Gamified Quizzes */}
                        <SpotlightCard className="md:col-span-2 p-8 flex items-center justify-between gap-8 group bg-card border-border" spotlightColor="rgba(14, 165, 233, 0.2)">
                            <div>
                                <h3 className="text-xl font-bold mb-2 flex items-center gap-2 text-foreground">
                                    <Trophy className="text-secondary" size={24} />
                                    Gamified Quizzes
                                </h3>
                                <p className="text-muted-foreground text-sm">Score 80%+ to unlock the next level.</p>
                            </div>

                            {/* Mock Quiz UI */}
                            <div className="relative w-48 bg-muted rounded-xl border border-border p-4 shadow-xl rotate-3 transition-transform group-hover:rotate-0">
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">PYTHON QUIZ</span>
                                    <span className="text-xs text-emerald-400 font-mono">Top 5%</span>
                                </div>
                                <div className="space-y-2">
                                    <div className="h-2 w-3/4 bg-background rounded-full"></div>
                                    <div className="h-2 w-1/2 bg-background rounded-full"></div>
                                </div>
                                <div className="mt-4 flex gap-2">
                                    <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-xs text-indigo-400 font-bold">A</div>
                                    <div className="w-8 h-8 rounded-lg bg-background border border-border flex items-center justify-center text-xs text-muted-foreground font-bold">B</div>
                                </div>

                                {/* XP Floating Badge */}
                                <div className="absolute -top-3 -right-3 bg-yellow-500/20 text-yellow-400 border border-yellow-500/50 px-2 py-1 rounded-full text-xs font-bold shadow-lg shadow-yellow-500/20">
                                    +500 XP
                                </div>
                            </div>
                        </SpotlightCard>

                        {/* Small Feature - Instant Feedback */}
                        <SpotlightCard className="p-8 group bg-card border-border" spotlightColor="rgba(244, 63, 94, 0.2)">
                            <div className="mb-4 w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
                                <Zap size={24} />
                            </div>
                            <h3 className="font-bold mb-2 text-foreground">Instant Feedback</h3>
                            <p className="text-muted-foreground text-sm mb-4">Real-time code validation.</p>

                            {/* Mock Code Success */}
                            <div className="bg-muted rounded-lg p-3 border border-emerald-500/30 font-mono text-xs">
                                <div className="flex items-center gap-2 text-emerald-400 mb-1">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                    <span>All tests passed!</span>
                                </div>
                                <div className="text-muted-foreground pl-4 border-l border-border">
                                    <span className="text-purple-400">def</span> <span className="text-blue-400">solve</span>():<br />
                                    &nbsp;&nbsp;<span className="text-purple-400">return</span> <span className="text-green-400">True</span>
                                </div>
                            </div>
                        </SpotlightCard>

                        {/* Small Feature - Community */}
                        <SpotlightCard className="p-8 group bg-card border-border">
                            <div className="mb-4 w-12 h-12 rounded-xl bg-muted border border-border flex items-center justify-center text-foreground">
                                <Users size={24} />
                            </div>
                            <h3 className="font-bold mb-2 text-foreground">Community</h3>
                            <p className="text-muted-foreground text-sm mb-4">Join 10k+ peers.</p>

                            {/* Avatar Stack */}
                            <div className="flex -space-x-3">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="w-10 h-10 rounded-full border-2 border-background bg-muted flex items-center justify-center text-xs text-foreground overflow-hidden">
                                        <img
                                            src={`https://api.dicebear.com/7.x/notionists/svg?seed=${i * 123}`}
                                            alt="avatar"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                ))}
                                <div className="w-10 h-10 rounded-full border-2 border-background bg-muted flex items-center justify-center text-[10px] text-foreground font-bold">
                                    +10k
                                </div>
                            </div>
                        </SpotlightCard>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 border-t border-border text-center text-muted-foreground text-sm">
                <p>&copy; {new Date().getFullYear()} MentorMap. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default Landing;
