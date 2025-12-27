import React, { useState } from 'react';
import { Search, ExternalLink, PlaySquare } from 'lucide-react';

interface VideoResult {
    id: string;
    title: string;
    thumbnail: string;
    url: string;
}

// Mock Data for "API" results
const MOCK_VIDEOS: Record<string, VideoResult[]> = {
    default: [
        { id: '1', title: 'Python Tutorial for Beginners', thumbnail: 'https://placehold.co/320x180/red/white?text=Python', url: '#' },
        { id: '2', title: 'Learn React In 30 Minutes', thumbnail: 'https://placehold.co/320x180/blue/white?text=React', url: '#' },
        { id: '3', title: 'System Design Interview Prep', thumbnail: 'https://placehold.co/320x180/green/white?text=System+Design', url: '#' },
    ],
    recursion: [
        { id: 'r1', title: 'Recursion in 5 Minutes', thumbnail: 'https://placehold.co/320x180/orange/white?text=Recursion', url: '#' },
        { id: 'r2', title: 'Recursion Tree Method', thumbnail: 'https://placehold.co/320x180/purple/white?text=Trees', url: '#' },
        { id: 'r3', title: 'Mastering Recursive Algorithms', thumbnail: 'https://placehold.co/320x180/black/white?text=Algorithms', url: '#' },
    ]
};

const ResourceRecommender: React.FC = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<VideoResult[]>([]);
    const [hasSearched, setHasSearched] = useState(false);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        setHasSearched(true);
        // Simulate API delay
        setTimeout(() => {
            const keyword = query.toLowerCase();
            if (keyword.includes('recursion')) {
                setResults(MOCK_VIDEOS.recursion);
            } else {
                setResults(MOCK_VIDEOS.default);
            }
        }, 500);
    };

    return (
        <div className="bg-gradient-to-br from-indigo-50 to-white p-6 rounded-2xl border border-indigo-100 shadow-sm mt-8">
            <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                    <PlaySquare className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="font-bold text-gray-900">Smart Resource Finder</h3>
                    <p className="text-xs text-gray-500">Stuck? Find help instantly.</p>
                </div>
            </div>

            <form onSubmit={handleSearch} className="mb-6 relative">
                <input
                    type="text"
                    placeholder="What are you stuck on? (e.g. Recursion)"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none text-sm"
                />
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <button
                    type="submit"
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                    Find
                </button>
            </form>

            {hasSearched && (
                <div className="space-y-3 animation-fade-in">
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Recommended for you</h4>
                    {results.map((video) => (
                        <a
                            key={video.id}
                            href={video.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex gap-3 p-2 rounded-xl group hover:bg-white transition-colors border border-transparent hover:border-gray-100"
                        >
                            <img src={video.thumbnail} alt={video.title} className="w-24 h-16 object-cover rounded-lg bg-gray-200" />
                            <div className="flex-1 min-w-0">
                                <h5 className="font-medium text-gray-900 text-sm leading-snug mb-1 line-clamp-2 group-hover:text-primary transition-colors">
                                    {video.title}
                                </h5>
                                <div className="flex items-center text-xs text-gray-400 gap-1">
                                    <span>YouTube</span>
                                    <ExternalLink className="w-3 h-3" />
                                </div>
                            </div>
                        </a>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ResourceRecommender;
