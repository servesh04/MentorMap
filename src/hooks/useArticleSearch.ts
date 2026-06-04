import { useState, useEffect } from 'react';

export interface Article {
    title: string;
    link: string;
    displayLink: string;
    snippet: string;
}

const getFallbackArticles = (query: string): Article[] => [
    {
        title: "Search GeeksforGeeks",
        link: `https://www.geeksforgeeks.org/search/?q=${encodeURIComponent(query)}`,
        displayLink: 'www.geeksforgeeks.org',
        snippet: `Click to search for '${query}' tutorials, guides, and practice examples on GeeksforGeeks.`
    },
    {
        title: "Search MDN Web Docs",
        link: `https://developer.mozilla.org/en-US/search?q=${encodeURIComponent(query)}`,
        displayLink: 'developer.mozilla.org',
        snippet: `Click to search for '${query}' reference articles, docs, and specifications on MDN Web Docs.`
    },
    {
        title: "Search Dev.to",
        link: `https://dev.to/search?q=${encodeURIComponent(query)}`,
        displayLink: 'dev.to',
        snippet: `Click to search for '${query}' community articles, tips, and hands-on developer guides on Dev.to.`
    }
];

export const useArticleSearch = (query: string, optimizedQuery?: string) => {
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
    const CX_ID = import.meta.env.VITE_SEARCH_ENGINE_ID;

    useEffect(() => {
        if (!query) return;

        const fetchArticles = async () => {
            setLoading(true);
            setError(null);

            // 1. Check for API Keys
            if (!API_KEY || !CX_ID) {
                // Simulate delay
                await new Promise(resolve => setTimeout(resolve, 800));
                setArticles(getFallbackArticles(query));
                setLoading(false);
                return;
            }

            // 2. Real API Call
            try {
                const url = `https://www.googleapis.com/customsearch/v1?key=${API_KEY}&cx=${CX_ID}&q=${encodeURIComponent(optimizedQuery || query)}&num=3`;
                const response = await fetch(url);
                const data = await response.json();

                if (data.error) {
                    throw new Error(data.error.message || "Forbidden");
                }

                if (data.items) {
                    setArticles(data.items.map((item: any) => ({
                        title: item.title,
                        link: item.link,
                        displayLink: item.displayLink,
                        snippet: item.snippet
                    })));
                } else {
                    setArticles([]);
                }
            } catch (err) {
                console.error("Article search error:", err);
                // Graceful fallback to dynamic search links so the user is never blocked
                setArticles(getFallbackArticles(query));
                setError(null);
            } finally {
                setLoading(false);
            }
        };

        fetchArticles();
    }, [query]);

    return { articles, loading, error };
};
