import express, { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { DiaryEntry, Journal, MoodAnalysis, OverallDailyInsight } from './src/types';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'diary_store.json');

app.use(express.json({ limit: '10mb' }));

// Initialize AI Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial Seed Data
const defaultJournals: Journal[] = [
  {
    id: 'daily',
    name: 'Daily Diary',
    description: 'Everyday thoughts, quiet reflections, and evening musings.',
    icon: 'book-heart',
    accentColor: '#A89F91',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'trips',
    name: 'Trips & Wanderlust',
    description: 'Travel logs, train rides, distant sights, and trail notes.',
    icon: 'compass',
    accentColor: '#8C9A8E',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'gratitude',
    name: 'Quiet Gratitude',
    description: 'Small blessings, warm drinks, and gentle moments of joy.',
    icon: 'sun',
    accentColor: '#B09E8C',
    createdAt: new Date().toISOString(),
  },
];

const now = new Date();
const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);

const defaultEntries: DiaryEntry[] = [
  {
    id: 'entry-1',
    journalId: 'daily',
    title: 'Rain on the Window & Herbal Tea',
    content: `A soft autumn rain began tapping against the glass around 7 AM. I made a pot of chamomile tea with a drop of wildflower honey. 
    
The morning had no rush in it. I spent twenty minutes simply watching droplets chase each other down the pane. There is an unspoken relief in letting the world spin without trying to catch up with every minute.
    
I worked on my sketchpad for a while and read three chapters of a Japanese essay on gardens. Feeling grounded, present, and thankful for the quiet rhythm today offered.`,
    date: now.toISOString(),
    location: 'Quiet Home Study',
    weather: 'Gentle Rain, 16°C',
    userMoodTag: 'peaceful',
    fontChoice: 'cormorant',
    paperStyle: 'warm-parchment',
    wordCount: 96,
    readingTimeMinutes: 1,
    tags: ['rain', 'tea', 'peaceful', 'reading'],
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    moodAnalysis: {
      primaryMood: 'Serene Contentment',
      moodCategory: 'peaceful',
      moodScore: 8.8,
      emotionalSpectrum: [
        { emotion: 'Tranquility', percentage: 70 },
        { emotion: 'Gratitude', percentage: 20 },
        { emotion: 'Presence', percentage: 10 },
      ],
      keyThemes: ['solitude', 'warm beverages', 'unrushed morning', 'mindfulness'],
      personalizedReflection:
        'Your writing reveals a wonderful ability to find richness in stillness. Welcoming the rain without rushing gave your nervous system a deep, restorative pause.',
      soothingAdvice:
        'Carry this gentle, unhurried awareness into the evening. A warm shower or ten minutes of dim lighting before sleep will seal in today’s calm.',
      reflectivePrompt:
        'What is one small, sensory comfort you would love to bring into tomorrow morning?',
      analyzedAt: now.toISOString(),
    },
  },
  {
    id: 'entry-2',
    journalId: 'trips',
    title: 'Wandering Through the Cedar Forest Trail',
    content: `We started our ascent early from the foot of Mount Takao. The canopy filtered the morning sunlight into golden ribbons across the damp moss. 
    
Every step smelled of cedar needles and fresh cedar bark. At the halfway shrine, an elder priest was gently raking gravel. We exchanged a silent bow. 
    
Reaching the ridge overlooking the valley made my chest open up completely. Travel reminds me that my daily anxieties are small compared to ancient mountains that have stood for millennia.`,
    date: yesterday.toISOString(),
    location: 'Mount Takao Cedar Trail',
    weather: 'Crisp Morning Sun, 14°C',
    userMoodTag: 'reflective',
    fontChoice: 'lora',
    paperStyle: 'soft-sage',
    wordCount: 92,
    readingTimeMinutes: 1,
    tags: ['travel', 'hiking', 'nature', 'perspective'],
    createdAt: yesterday.toISOString(),
    updatedAt: yesterday.toISOString(),
    moodAnalysis: {
      primaryMood: 'Expansive Wonder',
      moodCategory: 'reflective',
      moodScore: 9.1,
      emotionalSpectrum: [
        { emotion: 'Wonder', percentage: 65 },
        { emotion: 'Reverence', percentage: 25 },
        { emotion: 'Vitality', percentage: 10 },
      ],
      keyThemes: ['nature immersion', 'perspective shift', 'sacred spaces', 'vitality'],
      personalizedReflection:
        'Standing on the mountain ridge gave you an emotional altitude shift. Witnessing enduring natural landscapes naturally untangled small worries.',
      soothingAdvice:
        'Whenever you feel cramped by modern urgency, recall the scent of damp cedar and the spaciousness of the mountain skyline.',
      reflectivePrompt:
        'How can you bring a small piece of the mountain’s enduring patience into your daily routine?',
      analyzedAt: yesterday.toISOString(),
    },
  },
  {
    id: 'entry-3',
    journalId: 'gratitude',
    title: 'A Friend’s Laughter and Roasted Chestnuts',
    content: `Met Maya by the square. The breeze was brisk, but the smell of roasted chestnuts from the corner cart was intoxicating. 
    
We sat on a weathered stone bench and caught up for two hours without checking our phones once. Laughing until our ribs ached about old university memories reminded me how deeply healing effortless friendship is.`,
    date: twoDaysAgo.toISOString(),
    location: 'Old Town Square',
    weather: 'Brisk Breeze, 12°C',
    userMoodTag: 'grateful',
    fontChoice: 'playfair',
    paperStyle: 'linen-ruled',
    wordCount: 68,
    readingTimeMinutes: 1,
    tags: ['friendship', 'gratitude', 'laughter'],
    createdAt: twoDaysAgo.toISOString(),
    updatedAt: twoDaysAgo.toISOString(),
    moodAnalysis: {
      primaryMood: 'Warm Connection',
      moodCategory: 'joyful',
      moodScore: 9.3,
      emotionalSpectrum: [
        { emotion: 'Joyful Connection', percentage: 75 },
        { emotion: 'Affection', percentage: 15 },
        { emotion: 'Nostalgia', percentage: 10 },
      ],
      keyThemes: ['meaningful friendship', 'shared humor', 'unplugged connection'],
      personalizedReflection:
        'Genuine connection without screens is one of the highest nourishers of the human spirit. Your gratitude here shines with warm authenticity.',
      soothingAdvice:
        'Send Maya a short note during the week to thank her for the warmth. Gratitude expressed multiplies its sweetness.',
      reflectivePrompt:
        'Whose presence in your life makes you feel completely at ease being yourself?',
      analyzedAt: twoDaysAgo.toISOString(),
    },
  },
];

interface DiaryDB {
  journals: Journal[];
  entries: DiaryEntry[];
}

function loadDB(): DiaryDB {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error loading DB file:', err);
  }
  const initial = { journals: defaultJournals, entries: defaultEntries };
  saveDB(initial);
  return initial;
}

function saveDB(db: DiaryDB) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving DB file:', err);
  }
}

// -------------------------------------------------------------
// API Endpoints
// -------------------------------------------------------------

// 1. Get all journals
app.get('/api/journals', (req: Request, res: Response) => {
  const db = loadDB();
  res.json({ journals: db.journals });
});

// 2. Create a journal
app.post('/api/journals', (req: Request, res: Response) => {
  const { name, description, icon, accentColor } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Journal name is required' });
  }

  const db = loadDB();
  const newJournal: Journal = {
    id: 'journal-' + Date.now(),
    name: name.trim(),
    description: (description || '').trim(),
    icon: icon || 'book-open',
    accentColor: accentColor || '#8C9A8E',
    createdAt: new Date().toISOString(),
  };

  db.journals.push(newJournal);
  saveDB(db);
  res.status(201).json({ journal: newJournal });
});

// 3. Delete a journal
app.delete('/api/journals/:id', (req: Request, res: Response) => {
  const id = req.params.id;
  if (id === 'daily') {
    return res.status(400).json({ error: 'The default Daily Diary cannot be deleted.' });
  }

  const db = loadDB();
  db.journals = db.journals.filter((j) => j.id !== id);
  db.entries = db.entries.filter((e) => e.journalId !== id);
  saveDB(db);
  res.json({ success: true });
});

// 4. Get all entries
app.get('/api/entries', (req: Request, res: Response) => {
  const db = loadDB();
  const { journalId } = req.query;

  let list = db.entries;
  if (journalId && journalId !== 'all') {
    list = list.filter((e) => e.journalId === journalId);
  }

  list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  res.json({ entries: list });
});

// 5. Create or save entry
app.post('/api/entries', (req: Request, res: Response) => {
  const {
    id,
    journalId,
    title,
    content,
    date,
    location,
    weather,
    userMoodTag,
    fontChoice,
    paperStyle,
    tags,
    photos,
  } = req.body;

  if (!content && !title) {
    return res.status(400).json({ error: 'Entry title or content is required' });
  }

  const db = loadDB();
  const existingIndex = id ? db.entries.findIndex((e) => e.id === id) : -1;

  const wordCount = (content || '').trim().split(/\s+/).filter(Boolean).length;
  const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));

  if (existingIndex >= 0) {
    const existing = db.entries[existingIndex];
    const updated: DiaryEntry = {
      ...existing,
      journalId: journalId || existing.journalId,
      title: title ?? existing.title,
      content: content ?? existing.content,
      date: date || existing.date,
      location: location ?? existing.location,
      weather: weather ?? existing.weather,
      userMoodTag: userMoodTag ?? existing.userMoodTag,
      fontChoice: fontChoice ?? existing.fontChoice,
      paperStyle: paperStyle ?? existing.paperStyle,
      tags: tags ?? existing.tags,
      photos: photos ?? existing.photos,
      wordCount,
      readingTimeMinutes,
      updatedAt: new Date().toISOString(),
    };
    db.entries[existingIndex] = updated;
    saveDB(db);
    return res.json({ entry: updated });
  }

  const newEntry: DiaryEntry = {
    id: 'entry-' + Date.now(),
    journalId: journalId || 'daily',
    title: (title || 'Untitled Entry').trim(),
    content: (content || '').trim(),
    date: date || new Date().toISOString(),
    location: location || '',
    weather: weather || '',
    userMoodTag: userMoodTag || 'peaceful',
    fontChoice: fontChoice || 'cormorant',
    paperStyle: paperStyle || 'warm-parchment',
    wordCount,
    readingTimeMinutes,
    tags: tags || [],
    photos: photos || [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.entries.unshift(newEntry);
  saveDB(db);
  res.status(201).json({ entry: newEntry });
});

// 6. Delete entry
app.delete('/api/entries/:id', (req: Request, res: Response) => {
  const db = loadDB();
  db.entries = db.entries.filter((e) => e.id !== req.params.id);
  saveDB(db);
  res.json({ success: true });
});

// 7. AI Mood Analysis & Insights via Gemini 3.8 Flash
app.post('/api/analyze-entry', async (req: Request, res: Response) => {
  const { entryId, title, content, location, weather, userMoodTag } = req.body;

  if (!content || !content.trim()) {
    return res.status(400).json({ error: 'Diary content is required for mood analysis.' });
  }

  try {
    const prompt = `You are a compassionate, thoughtful, and mindful personal diary companion.
Analyze the following personal diary entry and output a structured JSON mood and insight breakdown:
Title: ${title || 'Untitled'}
Content: ${content}
Optional Context: Location: ${location || 'None'}, Weather: ${weather || 'None'}, User Stated Mood: ${userMoodTag || 'None'}

Please evaluate:
1. Primary Mood: A concise poetic description of the user's primary emotional state (e.g., "Serene Contentment", "Gentle Nostalgia", "Subtle Restlessness", "Luminous Wonder").
2. Mood Category: Exactly one of: ["peaceful", "joyful", "reflective", "anxious", "melancholy", "energetic", "neutral", "grateful"].
3. Mood Score: A decimal score between 1.0 (deep emotional distress/exhaustion) to 10.0 (peaceful bliss, deep contentment, or joy).
4. Emotional Spectrum: An array of 2 to 4 emotions with their approximate percentage breakdown summing to 100%.
5. Key Themes: 2 to 4 gentle thematic tags (e.g., "nature connection", "evening stillness", "work pressure", "friendship").
6. Personalized Reflection: 2-3 warm, empathetic sentences acknowledging their feelings with genuine care and emotional depth.
7. Soothing Advice: 1-2 practical, comforting self-care suggestions or breathing/mindfulness steps suited for this emotional tone.
8. Reflective Prompt: One thoughtful, non-judgmental question for them to ponder before sleep or in tomorrow's entry.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            primaryMood: { type: Type.STRING },
            moodCategory: {
              type: Type.STRING,
              description: 'Must be one of: peaceful, joyful, reflective, anxious, melancholy, energetic, neutral, grateful',
            },
            moodScore: { type: Type.NUMBER },
            emotionalSpectrum: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  emotion: { type: Type.STRING },
                  percentage: { type: Type.NUMBER },
                },
                required: ['emotion', 'percentage'],
              },
            },
            keyThemes: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            personalizedReflection: { type: Type.STRING },
            soothingAdvice: { type: Type.STRING },
            reflectivePrompt: { type: Type.STRING },
          },
          required: [
            'primaryMood',
            'moodCategory',
            'moodScore',
            'emotionalSpectrum',
            'keyThemes',
            'personalizedReflection',
            'soothingAdvice',
            'reflectivePrompt',
          ],
        },
      },
    });

    const parsed: MoodAnalysis = JSON.parse(response.text?.trim() || '{}');
    parsed.analyzedAt = new Date().toISOString();

    // If entryId was provided, update it in the database
    if (entryId) {
      const db = loadDB();
      const idx = db.entries.findIndex((e) => e.id === entryId);
      if (idx >= 0) {
        db.entries[idx].moodAnalysis = parsed;
        db.entries[idx].updatedAt = new Date().toISOString();
        saveDB(db);
      }
    }

    return res.json({ analysis: parsed });
  } catch (error) {
    console.error('Gemini mood analysis error:', error);

    // Fallback mindful analysis if API key is not configured or network glitch
    const fallbackScore = content.toLowerCase().includes('sad') || content.toLowerCase().includes('anxious') ? 5.2 : 7.8;
    const fallbackCategory = content.toLowerCase().includes('walk') || content.toLowerCase().includes('rain') ? 'peaceful' : 'reflective';
    const fallbackAnalysis: MoodAnalysis = {
      primaryMood: 'Calm Reflection',
      moodCategory: fallbackCategory,
      moodScore: fallbackScore,
      emotionalSpectrum: [
        { emotion: 'Tranquil Awareness', percentage: 70 },
        { emotion: 'Introspection', percentage: 30 },
      ],
      keyThemes: ['daily rhythm', 'self-observation', 'quiet contemplation'],
      personalizedReflection:
        'Your words hold an honest reflection of your thoughts today. Writing them down is in itself an act of gentle care and grounding.',
      soothingAdvice:
        'Take three deep, slow breaths. Notice the points where your body contacts the chair or floor, releasing any tension in your shoulders.',
      reflectivePrompt:
        'What moment from today brought you the softest feeling of peace or relief?',
      analyzedAt: new Date().toISOString(),
    };

    if (entryId) {
      const db = loadDB();
      const idx = db.entries.findIndex((e) => e.id === entryId);
      if (idx >= 0) {
        db.entries[idx].moodAnalysis = fallbackAnalysis;
        saveDB(db);
      }
    }

    return res.json({ analysis: fallbackAnalysis });
  }
});

// 8. Overall Daily Insights across all recent entries
app.get('/api/overall-insights', async (req: Request, res: Response) => {
  const db = loadDB();
  const recentEntries = db.entries.slice(0, 7);

  if (recentEntries.length === 0) {
    return res.json({
      insight: {
        headline: 'A Blank Canvas of Serenity',
        summary: 'Begin your journaling journey today. Each entry helps reveal patterns of peace and emotional clarity.',
        weeklyTrend: 'gentle',
        recommendation: 'Write your first thoughts for today without judging them.',
        dominantMood: 'Curious & Calm',
      },
    });
  }

  try {
    const textCorpus = recentEntries
      .map(
        (e) =>
          `[Date: ${e.date.split('T')[0]}, Title: ${e.title}, Mood: ${e.moodAnalysis?.primaryMood || e.userMoodTag || 'Not specified'}] ${e.content.slice(0, 250)}`
      )
      .join('\n\n');

    const prompt = `You are a mindful journaling guide analyzing the recent ${recentEntries.length} diary entries of a user:
${textCorpus}

Provide a holistic, gentle daily emotional overview in JSON format:
- headline: Short poetic 3-6 word summary of their recent emotional landscape (e.g. "Gentle Awakening Through Autumn Stillness")
- summary: A 2-3 sentence compassionate reflection summarizing their emotional arc and recurring themes.
- weeklyTrend: Exactly one of ["rising", "steady", "fluctuating", "gentle"]
- recommendation: One compassionate suggestion for self-care or creative focus.
- dominantMood: The overarching mood in 1-2 words.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            headline: { type: Type.STRING },
            summary: { type: Type.STRING },
            weeklyTrend: { type: Type.STRING },
            recommendation: { type: Type.STRING },
            dominantMood: { type: Type.STRING },
          },
          required: ['headline', 'summary', 'weeklyTrend', 'recommendation', 'dominantMood'],
        },
      },
    });

    const parsed: OverallDailyInsight = JSON.parse(response.text?.trim() || '{}');
    return res.json({ insight: parsed });
  } catch (err) {
    console.error('Error generating overall insights:', err);
    return res.json({
      insight: {
        headline: 'Steady Calm & Mindful Rhythm',
        summary:
          'Your recent diary entries showcase a steady return to grounding moments, finding peace in simple pleasures and natural spaces.',
        weeklyTrend: 'steady',
        recommendation: 'Continue protecting your unhurried morning and evening rituals.',
        dominantMood: 'Serene Contentment',
      },
    });
  }
});

// 9. Python Flask & HTML & JSON Codebase Exporter
app.get('/api/export/flask-zip', (req: Request, res: Response) => {
  const zipPath = path.join(__dirname, 'serenenotes-flask-html-json.zip');
  if (fs.existsSync(zipPath)) {
    res.download(zipPath, 'serenenotes-flask-html-json.zip');
  } else {
    res.status(404).json({ error: 'Zip archive not found' });
  }
});

app.get('/api/export/flask-files', (req: Request, res: Response) => {
  try {
    const flaskAppPath = path.join(__dirname, 'python_flask_app', 'app.py');
    const htmlPath = path.join(__dirname, 'python_flask_app', 'templates', 'index.html');
    const jsonPath = path.join(__dirname, 'python_flask_app', 'data', 'diary_store.json');

    const appPy = fs.existsSync(flaskAppPath) ? fs.readFileSync(flaskAppPath, 'utf-8') : '';
    const html = fs.existsSync(htmlPath) ? fs.readFileSync(htmlPath, 'utf-8') : '';
    const json = fs.existsSync(jsonPath) ? fs.readFileSync(jsonPath, 'utf-8') : '';

    res.json({ appPy, html, json });
  } catch (err) {
    res.status(500).json({ error: 'Failed to read export files' });
  }
});

// Setup dev server with Vite or production static files
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SereneNotes AI Journal server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
