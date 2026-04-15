import { useState, useEffect, useRef } from 'react';
import type { Module } from '../types';

interface RoadmapResponse {
    modules: Module[];
    progressionTitles: string[];
    loading: boolean;
    error: string | null;
}

export const useGeminiRoadmap = (topic: string, isGenerated: boolean): RoadmapResponse => {
    const [modules, setModules] = useState<Module[]>([]);
    const [progressionTitles, setProgressionTitles] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Use a Ref to track the topic we are currently fetching or have fetched.
    const fetchedTopicRef = useRef<string | null>(null);

    useEffect(() => {
        // Only trigger if it is a generated course and has a topic
        if (!isGenerated || !topic) return;

        // Prevent duplicate requests for the same topic
        if (fetchedTopicRef.current === topic) return;

        const generateRoadmap = async () => {
            fetchedTopicRef.current = topic; // Mark as fetching
            setLoading(true);
            setError(null);

            const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
            // ... rest of the function


            if (!API_KEY) {
                console.error("Missing VITE_GEMINI_API_KEY");
                setError("Gemini API Key is missing.");
                setLoading(false);
                return;
            }

            const prompt = `
Create a detailed step-by-step learning roadmap for '${topic}'. 
Return ONLY raw JSON. Do not use Markdown formatting.
Structure: 
{ 
  "modules": [
    { 
      "id": "string (unique)", 
      "title": "string", 
      "description": "string (brief summary of what will be covered)",
      "type": "video", 
      "duration": "string (e.g. 10 min)",
      "searchHints": {
        "ytQuery": "string (optimized YouTube search query — see instructions below)",
        "articleQuery": "string (optimized Google search query — see instructions below)"
      }
    }
  ],
  "progressionTitles": ["beginner title", "novice title", "intermediate title", "advanced title", "master title"]
}
The 'id' should be unique (e.g., 'step-1', 'step-2').
The 'title' should be descriptive.
The 'description' should be a 1-2 sentence summary of the module.
Create at least 5-7 modules covering beginner to advanced concepts.
Additionally, generate an array of exactly 5 progression titles for this specific topic under the key 'progressionTitles'. These should be creative, topic-specific rank names ranging from absolute beginner to absolute master (e.g., for Cooking: ["Prep Cook", "Line Cook", "Sous Chef", "Head Chef", "Executive Chef"]).

IMPORTANT — searchHints instructions:
For 'searchHints.ytQuery': Think about which YouTube educator or channel is BEST known for teaching this specific sub-topic. Include the creator's channel name in the query so the top result is the ideal video. Examples:
  - For React hooks → "Web Dev Simplified React Hooks"
  - For CSS Flexbox → "Kevin Powell CSS Flexbox tutorial"
  - For Python basics → "Corey Schafer Python tutorial"
  - For System Design → "NeetCode system design"
  - For Machine Learning → "3Blue1Brown neural networks"
  - For Data Structures → "Abdul Bari data structures"
  Choose the most reputable and popular educator for each specific module topic.

For 'searchHints.articleQuery': Think about which website has the definitive article or guide for this topic. Include the site name. Examples:
  - For JavaScript closures → "freeCodeCamp JavaScript closures tutorial"
  - For CSS Grid → "MDN CSS Grid guide"
  - For Python decorators → "Real Python decorators guide"
  - For SQL joins → "W3Schools SQL joins tutorial"
  Choose the most authoritative and beginner-friendly source for each module topic.
            `;

            try {
                // Using 'gemini-2.5-flash' as found in the available models list for this key
                const response = await fetch(
                    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            contents: [{ parts: [{ text: prompt }] }],
                        }),
                    }
                );

                const data = await response.json();

                if (data.error) {
                    console.error("Gemini API Error details:", data.error); // Log full error details
                    throw new Error(data.error.message);
                }

                const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;

                if (!rawText) {
                    throw new Error("No content generated.");
                }

                // Clean the response: remove markdown code blocks
                const cleanedText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();

                const parsedData = JSON.parse(cleanedText);

                if (parsedData.modules && Array.isArray(parsedData.modules)) {
                    setModules(parsedData.modules);
                } else {
                    throw new Error("Invalid JSON structure");
                }

                // Extract progression titles
                if (Array.isArray(parsedData.progressionTitles) && parsedData.progressionTitles.length === 5) {
                    setProgressionTitles(parsedData.progressionTitles);
                }

            } catch (err: any) {
                console.error("Gemini Generation Error:", err);
                setError(err.message || "Failed to generate roadmap.");

                // Fallback (Optional: You could remove this if you prefer to show the error)
                setModules([
                    { id: 'fallback-1', title: `${topic} - Introduction`, description: `Introduction to ${topic} concepts.`, type: 'video', duration: '10 min' },
                    { id: 'fallback-2', title: `${topic} - Core Concepts`, description: `Deep dive into core ${topic} principles.`, type: 'video', duration: '15 min' },
                    { id: 'fallback-3', title: `${topic} - Advanced Topics`, description: `Mastering advanced techniques in ${topic}.`, type: 'video', duration: '20 min' }
                ]);

            } finally {
                setLoading(false);
            }
        };

        generateRoadmap();
    }, [topic, isGenerated]);

    return { modules, progressionTitles, loading, error };
};
