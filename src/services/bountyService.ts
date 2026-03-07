/**
 * Daily AI Bounty Service
 * Generates a 3-question Gemini quiz and manages bounty lockout.
 */
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useStore } from '../store/useStore';
import { awardXP } from './userService';

export interface BountyQuestion {
    question: string;
    options: string[];
    correctAnswer: string; // Exact string of the correct option
}

const BOUNTY_XP_REWARD = 500;

export const canClaimBounty = (_lastBountyDate: string): boolean => {
    // const today = new Date().toLocaleDateString('en-CA');
    // return _lastBountyDate !== today;
    return true; // Temporarily disabled for testing
};

/**
 * Consume the bounty attempt — mark today as used in Firestore + Zustand.
 */
export const consumeBountyAttempt = async (userId: string): Promise<void> => {
    const today = new Date().toLocaleDateString('en-CA');
    useStore.getState().setLastBountyDate(today);
    try {
        await updateDoc(doc(db, 'users', userId), { lastBountyDate: today });
    } catch (error) {
        console.error('Failed to update bounty date:', error);
    }
};

/**
 * Robust parser for Gemini quiz responses — handles markdown hallucination.
 */
const parseGeminiQuiz = (rawText: string): BountyQuestion[] | null => {
    try {
        // 1. Strip out markdown code blocks if the AI accidentally includes them
        let cleanText = rawText.replace(/```json/gi, '').replace(/```/g, '');

        // 2. Trim any leading/trailing whitespace or invisible characters
        cleanText = cleanText.trim();

        // 3. Try to extract just the JSON array if there's surrounding junk text
        const arrayStart = cleanText.indexOf('[');
        const arrayEnd = cleanText.lastIndexOf(']');
        if (arrayStart !== -1 && arrayEnd !== -1 && arrayEnd > arrayStart) {
            cleanText = cleanText.substring(arrayStart, arrayEnd + 1);
        }

        // 4. Attempt to parse
        const parsedData = JSON.parse(cleanText);

        // 5. Validate the schema structurally before returning
        if (!Array.isArray(parsedData) || parsedData.length === 0) {
            throw new Error('AI did not return a valid array of questions.');
        }

        return parsedData as BountyQuestion[];
    } catch (error: any) {
        console.error('Bounty Parsing Error:', error.message);
        return null;
    }
};

/**
 * Generate a 3-question bounty quiz from Gemini.
 */
export const generateBountyQuiz = async (moduleTopic: string): Promise<BountyQuestion[]> => {
    const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
    if (!API_KEY) throw new Error('Gemini API Key is missing.');

    const prompt = `You are an expert technical interviewer. Generate a 3-question multiple-choice quiz about the topic: '${moduleTopic}'. The questions must be challenging. Return ONLY a valid JSON array of objects, with no markdown formatting or backticks. Schema: [{ "question": "...", "options": ["A", "B", "C", "D"], "correctAnswer": "Exact string of the correct option" }]`;

    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
            }),
        }
    );

    const data = await response.json();

    if (data.error) {
        throw new Error(data.error.message || 'Gemini API error');
    }

    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) throw new Error('No content generated.');

    const parsed = parseGeminiQuiz(rawText);
    if (!parsed) throw new Error('Bounty unavailable — failed to parse AI response. Try again later.');

    return parsed;
};

/**
 * Award the bounty XP reward.
 */
export const awardBountyXP = async (userId: string): Promise<number> => {
    await awardXP(userId, BOUNTY_XP_REWARD);
    return BOUNTY_XP_REWARD;
};
