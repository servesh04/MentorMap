import { useState, useEffect } from 'react';

interface VideoResult {
    id: string;
    title: string;
    thumbnail: string;
    description: string;
    embedId: string;
}

export const useYouTubeSearch = (query: string) => {
    const [video, setVideo] = useState<VideoResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!query) return;

        const fetchVideo = async () => {
            setLoading(true);
            setError(null);

            const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;

            if (!API_KEY) {
                console.warn("Missing VITE_YOUTUBE_API_KEY. Using Mock Data.");
                // Simulate network delay
                await new Promise(resolve => setTimeout(resolve, 1000));

                setVideo({
                    id: 'mock-video-1',
                    title: `${query} Full Course - Learn in 10 Minutes`,
                    thumbnail: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
                    description: `A comprehensive guide to ${query}. Perfect for beginners.`,
                    embedId: 'dQw4w9WgXcQ'
                });
                setLoading(false);
                return;
            }

            try {
                const response = await fetch(
                    `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=1&q=${encodeURIComponent(query)}&type=video&key=${API_KEY}`
                );
                const data = await response.json();

                if (data.items && data.items.length > 0) {
                    const item = data.items[0];
                    setVideo({
                        id: item.id.videoId,
                        title: item.snippet.title,
                        thumbnail: item.snippet.thumbnails.high.url,
                        description: item.snippet.description,
                        embedId: item.id.videoId
                    });
                } else {
                    setVideo(null);
                }

            } catch (err) {
                console.error("YouTube search error:", err);
                setError("Failed to find video");
            } finally {
                setLoading(false);
            }
        };

        fetchVideo();
    }, [query]);

    return { video, loading, error };
};
