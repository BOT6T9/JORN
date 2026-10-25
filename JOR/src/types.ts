export type MoodCategory = 
  | 'peaceful'
  | 'joyful'
  | 'reflective'
  | 'anxious'
  | 'melancholy'
  | 'energetic'
  | 'neutral'
  | 'grateful';

export interface EmotionSpectrumItem {
  emotion: string;
  percentage: number;
}

export interface MoodAnalysis {
  primaryMood: string;
  moodCategory: MoodCategory;
  moodScore: number; // 1 to 10 (1 = very low/stressed, 10 = euphoric/blissful)
  emotionalSpectrum: EmotionSpectrumItem[];
  keyThemes: string[];
  personalizedReflection: string;
  soothingAdvice: string;
  reflectivePrompt: string;
  analyzedAt: string;
}

export type FontChoice = 
  | 'cormorant'
  | 'playfair'
  | 'caveat'
  | 'sans-clean'
  | 'typewriter'
  | 'lora';

export type PaperStyle = 
  | 'warm-parchment'
  | 'soft-sage'
  | 'lavender-mist'
  | 'linen-ruled'
  | 'vintage-grid'
  | 'night-velvet'
  | 'blush-rose';

export interface Journal {
  id: string;
  name: string;
  description: string;
  icon: string;
  accentColor: string;
  createdAt: string;
}

export interface DiaryEntry {
  id: string;
  journalId: string;
  title: string;
  content: string;
  date: string; // ISO date string
  location?: string;
  weather?: string;
  userMoodTag?: string;
  fontChoice?: FontChoice;
  paperStyle?: PaperStyle;
  moodAnalysis?: MoodAnalysis;
  wordCount: number;
  readingTimeMinutes: number;
  tags?: string[];
  photos?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CustomizationSettings {
  fontChoice: FontChoice;
  paperStyle: PaperStyle;
  fontSize: 'sm' | 'base' | 'lg';
  lineSpacing: 'normal' | 'relaxed' | 'loose';
}

export interface OverallDailyInsight {
  headline: string;
  summary: string;
  weeklyTrend: 'rising' | 'steady' | 'fluctuating' | 'gentle';
  recommendation: string;
  dominantMood: string;
}
