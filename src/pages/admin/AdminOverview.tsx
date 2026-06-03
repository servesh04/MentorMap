import React, { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { 
    Cpu, 
    DollarSign, 
    ShieldAlert, 
    Flame, 
    Zap, 
    AlertTriangle, 
    HelpCircle, 
    Trophy,
    LineChart,
    Link2
} from 'lucide-react';

interface MetricCardProps {
    title: string;
    value: string | number;
    subtext: string;
    icon: React.ReactNode;
    colorClass: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, subtext, icon, colorClass }) => (
    <div className="bg-slate-900/40 border border-slate-800/80 p-6 rounded-2xl flex items-start gap-4 shadow-md backdrop-blur-md">
        <div className={`p-3 rounded-xl ${colorClass} shrink-0`}>
            {icon}
        </div>
        <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</span>
            <h2 className="text-2xl font-bold text-white mt-1">{value}</h2>
            <p className="text-xs text-slate-400 mt-1.5">{subtext}</p>
        </div>
    </div>
);

const DEMO_REPORT = {
    savingsTracker: { webGpuPercent: 62.5, groqPercent: 37.5, webGpuCount: 125, groqCount: 75 },
    costPerLearner: { totalActiveUsers: 240, estimatedCostPerLearner: 0.28, totalOperations: 1250 },
    securityIntercepts: { totalBlocked: 142, emails: 48, tokens: 62, networking: 22, credentials: 10 },
    curriculumHeatmap: { 'React': 45, 'System Design': 38, 'TypeScript': 30, 'Next.js': 25, 'Docker': 12 },
    skillVelocity: { averageDeltaSeconds: 345600 }, // 4 days average
    frictionNode: { mostAbandonedNode: 'Dynamic Routing in Next.js', abandonedCount: 14 },
    mentorAiReliance: { 'Cohort-2026A': 1.8, 'Cohort-2026B': 3.2 },
    leagueDistribution: { bronze: 142, silver: 78, gold: 20 },
    weeklyXpBurnRate: [
        { day: 'Mon', xp: 4500 },
        { day: 'Tue', xp: 5200 },
        { day: 'Wed', xp: 6100 },
        { day: 'Thu', xp: 5800 },
        { day: 'Fri', xp: 7200 },
        { day: 'Sat', xp: 8500 },
        { day: 'Sun', xp: 9100 },
    ],
    brokenLinkSla: { totalResources: 480, reportedDeadLinks: 3, slaPercentage: 99.37 },
    updatedAt: new Date().toISOString()
};

const AdminOverview: React.FC = () => {
    const [report, setReport] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isDemo, setIsDemo] = useState(false);

    useEffect(() => {
        const fetchLatestReport = async () => {
            try {
                const reportRef = doc(db, 'analytics_reports', 'latest');
                const docSnap = await getDoc(reportRef);
                if (docSnap.exists()) {
                    setReport(docSnap.data());
                    setIsDemo(false);
                } else {
                    console.log("No compiled report found, using fallback demo data.");
                    setReport(DEMO_REPORT);
                    setIsDemo(true);
                }
            } catch (e) {
                console.error("Failed to load report document:", e);
                setReport(DEMO_REPORT);
                setIsDemo(true);
            } finally {
                setLoading(false);
            }
        };
        fetchLatestReport();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh] text-slate-400 gap-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-500"></div>
                <span>Loading compiled analytics pipeline payload...</span>
            </div>
        );
    }

    // Process variables with defensive fallbacks
    const savings = report?.savingsTracker || DEMO_REPORT.savingsTracker;
    const cpl = report?.costPerLearner || DEMO_REPORT.costPerLearner;
    const pii = report?.securityIntercepts || DEMO_REPORT.securityIntercepts;
    const heatmap = report?.curriculumHeatmap || DEMO_REPORT.curriculumHeatmap;
    const velocityDelta = report?.skillVelocity?.averageDeltaSeconds ?? DEMO_REPORT.skillVelocity.averageDeltaSeconds;
    const velocityDays = (velocityDelta / (24 * 3600)).toFixed(1);
    const friction = report?.frictionNode || DEMO_REPORT.frictionNode;
    const reliance = report?.mentorAiReliance || DEMO_REPORT.mentorAiReliance;
    const leagues = report?.leagueDistribution || DEMO_REPORT.leagueDistribution;
    const xpBurn = report?.weeklyXpBurnRate || DEMO_REPORT.weeklyXpBurnRate;
    const linkSla = report?.brokenLinkSla || DEMO_REPORT.brokenLinkSla;

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            {/* Header Banner */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-900 pb-5">
                <div>
                    <h1 className="text-3xl font-extrabold text-white tracking-tight">Enterprise Analytics</h1>
                    <p className="text-slate-400 text-sm mt-1">Aggregated overnight dashboard metrics from Firestore pipeline.</p>
                </div>
                <div className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-400 font-mono">
                    Last updated: {report?.updatedAt ? new Date(report.updatedAt.seconds ? report.updatedAt.seconds * 1000 : report.updatedAt).toLocaleString() : 'Live Static Cache'}
                </div>
            </div>

            {isDemo && (
                <div className="flex items-center gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-400 text-sm">
                    <AlertTriangle size={18} className="shrink-0" />
                    <div>
                        <span className="font-semibold">Simulated Data Mode:</span> Failed to retrieve live overnight analytics reports. Showing high-fidelity fallback metrics.
                    </div>
                </div>
            )}

            {/* KPI Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <MetricCard 
                    title="GPU Cost Savings"
                    value={`${savings.webGpuPercent.toFixed(1)}%`}
                    subtext={`${savings.webGpuCount} WebGPU queries bypassed Cloud Groq APIs`}
                    icon={<Cpu size={24} />}
                    colorClass="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                />
                <MetricCard 
                    title="Estimated Cost-Per-Learner"
                    value={`$${cpl.estimatedCostPerLearner.toFixed(2)}`}
                    subtext={`Evaluated across ${cpl.totalActiveUsers} learners`}
                    icon={<DollarSign size={24} />}
                    colorClass="bg-blue-500/10 border border-blue-500/20 text-blue-400"
                />
                <MetricCard 
                    title="Security Intercepts"
                    value={pii.totalBlocked}
                    subtext={`${pii.emails} Emails, ${pii.tokens} Keys masked at frontend egress`}
                    icon={<ShieldAlert size={24} />}
                    colorClass="bg-red-500/10 border border-red-500/20 text-red-400"
                />
            </div>

            {/* Main Visualizations Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-4">
                {/* Weekly XP Burn Line Chart Representation */}
                <div className="bg-slate-900/30 border border-slate-800/80 p-6 rounded-3xl backdrop-blur-md">
                    <div className="flex items-center gap-2 mb-6">
                        <LineChart size={20} className="text-red-400" />
                        <h3 className="text-lg font-bold text-white">Weekly XP Burn Rate</h3>
                    </div>
                    <div className="h-48 flex items-end gap-3.5 pt-4">
                        {xpBurn.map((d: any, index: number) => {
                            const maxVal = Math.max(...xpBurn.map((x: any) => x.xp)) || 1;
                            const heightPercent = ((d.xp / maxVal) * 100).toFixed(0);
                            return (
                                <div key={index} className="flex-1 flex flex-col items-center gap-2 group">
                                    <div className="text-[10px] text-slate-400 font-mono opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                        {d.xp}
                                    </div>
                                    <div 
                                        style={{ height: `${Math.max(10, parseInt(heightPercent))}%` }} 
                                        className="w-full bg-gradient-to-t from-red-600/50 to-red-500 rounded-t-lg transition-all duration-300 hover:brightness-110 shadow-lg shadow-red-500/10"
                                    />
                                    <span className="text-[11px] font-semibold text-slate-500">{d.day}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Curriculum Demand Heatmap */}
                <div className="bg-slate-900/30 border border-slate-800/80 p-6 rounded-3xl backdrop-blur-md">
                    <div className="flex items-center gap-2 mb-6">
                        <Flame size={20} className="text-amber-500" />
                        <h3 className="text-lg font-bold text-white">Curriculum Demand (Heatmap)</h3>
                    </div>
                    <div className="space-y-4">
                        {Object.entries(heatmap).map(([topic, count]: any, index) => {
                            const maxVal = Math.max(...Object.values(heatmap) as number[]) || 1;
                            const widthPercent = ((count / maxVal) * 100).toFixed(0);
                            return (
                                <div key={index} className="space-y-1">
                                    <div className="flex justify-between text-xs font-semibold">
                                        <span className="text-slate-300">{topic}</span>
                                        <span className="text-slate-500">{count} generated paths</span>
                                    </div>
                                    <div className="w-full h-2.5 bg-slate-850 rounded-full overflow-hidden">
                                        <div 
                                            style={{ width: `${widthPercent}%` }} 
                                            className="h-full bg-gradient-to-r from-amber-500 to-red-500 rounded-full"
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Second Row Analytics Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Cohort Mentor AI Reliance */}
                <div className="bg-slate-900/30 border border-slate-800/80 p-6 rounded-2xl backdrop-blur-md">
                    <div className="flex items-center gap-2 mb-4">
                        <HelpCircle size={18} className="text-blue-400" />
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider">AI Reliance Ratio</h3>
                    </div>
                    <p className="text-xs text-slate-500 mb-4">Chat queries submitted per completed module by cohort.</p>
                    <div className="space-y-3">
                        {Object.entries(reliance).map(([cohort, ratio]: any, index) => (
                            <div key={index} className="flex justify-between items-center p-3 bg-slate-850/40 rounded-xl border border-slate-800/60">
                                <span className="text-xs font-semibold text-slate-300">{cohort}</span>
                                <span className="px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-mono font-bold">
                                    {ratio.toFixed(2)}x
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Platform Velocity & Friction */}
                <div className="bg-slate-900/30 border border-slate-800/80 p-6 rounded-2xl backdrop-blur-md flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <Zap size={18} className="text-violet-400" />
                            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Platform Friction</h3>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Upskilling Velocity</span>
                                <div className="text-xl font-bold text-white mt-0.5">{velocityDays} Days</div>
                                <span className="text-[10px] text-slate-400 block mt-0.5">Average module completion timeframe</span>
                            </div>
                            <div className="border-t border-slate-800 pt-3">
                                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider flex items-center gap-1">
                                    <AlertTriangle size={12} className="text-amber-500" />
                                    Top Abandonment Node
                                </span>
                                <div className="text-sm font-bold text-white mt-1 truncate">{friction.mostAbandonedNode}</div>
                                <span className="text-[10px] text-slate-400 block mt-0.5">{friction.abandonedCount} users stuck in_progress &gt; 7 days</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Gamification & Link Quality */}
                <div className="bg-slate-900/30 border border-slate-800/80 p-6 rounded-2xl backdrop-blur-md flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <Trophy size={18} className="text-yellow-500" />
                            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Gamification & Links</h3>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">League Distribution</span>
                                <div className="flex gap-4 mt-1.5">
                                    <div className="text-center bg-slate-850/60 border border-slate-800/80 rounded-xl p-2 flex-1">
                                        <div className="text-xs text-amber-600 font-bold">Bronze</div>
                                        <div className="text-sm font-extrabold text-white mt-0.5">{leagues.bronze}</div>
                                    </div>
                                    <div className="text-center bg-slate-850/60 border border-slate-800/80 rounded-xl p-2 flex-1">
                                        <div className="text-xs text-slate-400 font-bold">Silver</div>
                                        <div className="text-sm font-extrabold text-white mt-0.5">{leagues.silver}</div>
                                    </div>
                                    <div className="text-center bg-slate-850/60 border border-slate-800/80 rounded-xl p-2 flex-1">
                                        <div className="text-xs text-yellow-500 font-bold">Gold</div>
                                        <div className="text-sm font-extrabold text-white mt-0.5">{leagues.gold}</div>
                                    </div>
                                </div>
                            </div>
                            <div className="border-t border-slate-800 pt-3">
                                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider flex items-center gap-1">
                                    <Link2 size={12} className="text-emerald-400" />
                                    Broken Link SLA
                                </span>
                                <div className="text-xl font-bold text-emerald-400 mt-0.5">{linkSla.slaPercentage.toFixed(2)}%</div>
                                <span className="text-[10px] text-slate-400 block mt-0.5">{linkSla.reportedDeadLinks} dead links reported from {linkSla.totalResources} nodes</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminOverview;
