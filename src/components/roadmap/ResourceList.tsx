import React from 'react';
import { ExternalLink, BookOpen, Loader, Search } from 'lucide-react';
import { useArticleSearch } from '../../hooks/useArticleSearch';

interface ResourceListProps {
    query: string;
    optimizedQuery?: string;
}

const getSourceBadge = (displayLink: string) => {
    if (displayLink.includes('geeksforgeeks')) {
        return { label: 'GFG', color: 'bg-green-100 text-green-700' };
    }
    if (displayLink.includes('mozilla')) {
        return { label: 'MDN', color: 'bg-gray-900 text-white' };
    }
    if (displayLink.includes('wikipedia')) {
        return { label: 'Wiki', color: 'bg-gray-100 text-gray-700' };
    }
    if (displayLink.includes('wikihow')) {
        return { label: 'How-To', color: 'bg-yellow-100 text-yellow-800' };
    }
    return { label: 'Web', color: 'bg-blue-50 text-blue-600' };
};

const ResourceList: React.FC<ResourceListProps> = ({ query, optimizedQuery }) => {
    const { articles, loading, error } = useArticleSearch(query, optimizedQuery);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-8 space-y-2 text-muted-foreground bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <Loader className="w-5 h-5 animate-spin" />
                <span className="text-xs">Finding trusted articles...</span>
            </div>
        );
    }

    if (error) {
        return <div className="text-red-500 text-sm p-4">{error}</div>;
    }

    if (articles.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-8 space-y-3 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <BookOpen className="w-8 h-8 text-gray-300" />
                <div>
                    <p className="text-sm font-medium text-gray-600">No verified guide found.</p>
                </div>
                <a
                    href={`https://google.com/search?q=${encodeURIComponent(query)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Search className="w-3 h-3" />
                    Search Google
                </a>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-600" />
                Trusted Articles
            </h4>
            <div className="grid gap-3">
                {articles.map((article, index) => {
                    const badge = getSourceBadge(article.displayLink);
                    return (
                        <a
                            key={index}
                            href={article.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group block p-3 bg-white border border-gray-100 rounded-xl hover:shadow-md hover:border-indigo-100 transition-all"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${badge.color}`}>
                                            {badge.label}
                                        </span>
                                        <span className="text-xs text-gray-400 truncate max-w-[120px]">
                                            {article.displayLink}
                                        </span>
                                    </div>
                                    <h5 className="text-sm font-medium text-gray-800 group-hover:text-indigo-600 transition-colors line-clamp-1">
                                        {article.title}
                                    </h5>
                                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                        {article.snippet}
                                    </p>
                                </div>
                                <ExternalLink className="w-4 h-4 text-gray-300 group-hover:text-indigo-500 flex-shrink-0 mt-1" />
                            </div>
                        </a>
                    );
                })}
            </div>
        </div>
    );
};

export default ResourceList;
