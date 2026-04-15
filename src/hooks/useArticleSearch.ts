import { useState, useEffect } from 'react';

export interface Article {
    title: string;
    link: string;
    displayLink: string;
    snippet: string;
}

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
                // console.warn("Missing Google Search API Keys. Using Mock Data.");
                // Simulate delay
                await new Promise(resolve => setTimeout(resolve, 800));

                setArticles([
                    {
                        title: `${query} - GeeksforGeeks`,
                        link: 'https://www.geeksforgeeks.org/',
                        displayLink: 'www.geeksforgeeks.org',
                        snippet: `A computer science portal for geeks. It contains well written, well thought and well explained computer science and programming articles on ${query}.`
                    },
                    {
                        title: `${query} - MDN Web Docs`,
                        link: 'https://developer.mozilla.org/',
                        displayLink: 'developer.mozilla.org',
                        snippet: `Resources for developers, by developers. Documenting web technologies, including CSS, HTML, and JavaScript for ${query}.`
                    },
                    {
                        title: `${query} - Wikipedia`,
                        link: 'https://en.wikipedia.org/wiki/Main_Page',
                        displayLink: 'en.wikipedia.org',
                        snippet: `The free encyclopedia that anyone can edit. Find comprehensive information about ${query}.`
                    }
                ]);
                setLoading(false);
                return;
            }

            // 2. Real API Call
            try {
                const url = `https://www.googleapis.com/customsearch/v1?key=${API_KEY}&cx=${CX_ID}&q=${encodeURIComponent(optimizedQuery || query)}&num=3`;
                const response = await fetch(url);
                const data = await response.json();

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
                setError("Failed to load articles");
            } finally {
                setLoading(false);
            }
        };

        fetchArticles();
    }, [query]);

    return { articles, loading, error };
};
