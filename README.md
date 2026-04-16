# 🗺️ MentorMap

MentorMap is an intelligent, gamified Progressive Web App (PWA) designed to provide users with dynamic, AI-generated learning roadmaps. By leveraging the power of Large Language Models and curated web resources, MentorMap builds personalized courses for any topic you want to learn.

## ✨ Core Features

### 🧠 AI-Generated Roadmaps (Gemini API)
Users can request a course on any topic (e.g., "Full Stack Development"). The app uses the **Google Gemini API** to generate a structured, multi-module learning roadmap ranging from beginner to advanced concepts, complete with creative progression titles.

### 📼 Smart Resource Curation (YouTube & Google PSE APIs)
Instead of relying on generic search queries, MentorMap prompts the AI to identify the absolute best educational creators and articles for each specific module. 
- The **YouTube Data API** pulls the top recommended video tutorial.
- The **Google Programmable Search Engine (PSE) API** fetches the most authoritative written guides (like MDN, freeCodeCamp).

### 🎮 Gamification & Engagement
Learning is made addictive through various gamified systems:
- **XP & Leveling System:** Earn XP by completing modules and passing quizzes.
- **Daily Streaks:** Keep the momentum going by logging in and learning daily.
- **Weekly Leaderboards/Leagues:** Compete against others in weekly brackets (Bronze, Silver, Gold, etc.).
- **Economy:** Earn coins to purchase power-ups like Streak Freezes or double XP boosts.
- **Daily Bounties:** Complete specific daily challenges for bonus rewards.

## 🛠️ Technology Stack
- **Frontend Framework:** React 19 + TypeScript + Vite
- **Styling:** Tailwind CSS V4
- **State Management:** Zustand
- **Database / Auth:** Firebase (Firestore & Authentication)
- **APIs Used:** 
  - Google Gemini API (Roadmap generation)
  - Google YouTube Data API v3 (Video fetching)
  - Google Custom Search JSON API (Article fetching)
- **Deployment:** Vercel / GitHub Actions (PWA ready)

## 🚀 Getting Started

### Prerequisites
Make sure you have Node.js installed, and environment variables defined for the following:
\`\`\`env
VITE_GEMINI_API_KEY=your_key
VITE_YOUTUBE_API_KEY=your_key
VITE_GOOGLE_API_KEY=your_key
VITE_SEARCH_ENGINE_ID=your_cx_id
# Firebase variables...
\`\`\`

### Installation
\`\`\`bash
npm install
npm run dev
\`\`\`

Build for production:
\`\`\`bash
npm run build
\`\`\`
