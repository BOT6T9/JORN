🌿 SereneNotes AI Journal

A calming, minimalist AI daily diary that reflects on your mood, offers daily personalized insights, and supports custom journals, fonts, and soothing paper themes.

✨ Features

🌸 Custom Notebooks & Journals: Organize your reflections into dedicated spaces like Daily Musings, Trips & Wanderlust, or Quiet Gratitude.

✨ AI-Powered Mood Analysis: Uses Gemini AI to analyze your emotional spectrum, provide gentle self-care advice, and suggest reflective prompts.

📜 Soothing Aesthetics: Customize your writing canvas with elegant serif fonts and warm paper textures (parchment, linen, sage).

📊 Daily Insights: Track weekly emotional trends and view holistic reflections on your overall well-being.

🔒 Local Storage: Keeps your entries saved safely in local data storage.

🚀 How It Runs

SereneNotes runs as a full-stack web application:

Frontend: Built with React 19, TypeScript, and Tailwind CSS v4 for a clean, responsive UI.

Backend: An Express.js (Node.js) server that handles local storage (diary_store.json) and communicates with the Gemini API to deliver AI insights.

🛠️ Getting Started

1. Prerequisites

Ensure you have Node.js (v18 or higher) installed on your computer.

2. Installation

Clone your repository and install dependencies:

git clone https://github.com/YOUR-USERNAME/serenenotes-ai-journal.git
cd serenenotes-ai-journal
npm install


3. Environment Setup

Create a .env file in the root directory and add your Gemini API Key:

GEMINI_API_KEY=your_actual_gemini_api_key_here
PORT=3000


4. Running the App

Start the development server:

npm run dev


Open your browser and navigate to:

http://localhost:3000
