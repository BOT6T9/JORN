import { DiaryEntry, FontChoice, MoodCategory, PaperStyle } from '../types';

/**
 * Calculates accurate word count ignoring excessive whitespace.
 */
export function calculateWordCount(text: string): number {
  if (!text || !text.trim()) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * Calculates estimated reading time in minutes (average 200 words per minute).
 */
export function calculateReadingTime(wordCount: number): number {
  if (wordCount <= 0) return 0;
  return Math.max(1, Math.ceil(wordCount / 200));
}

/**
 * Formats an ISO date string into calming editorial date representations.
 */
export function formatDiaryDate(dateString: string): {
  displayDate: string;
  time: string;
  weekday: string;
  shortDate: string;
} {
  const d = new Date(dateString);
  if (isNaN(d.getTime())) {
    return {
      displayDate: 'Unknown date',
      time: '',
      weekday: '',
      shortDate: '',
    };
  }

  const options: Intl.DateTimeFormatOptions = {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  };

  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  };

  const weekdayOptions: Intl.DateTimeFormatOptions = {
    weekday: 'long',
  };

  const shortOptions: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
  };

  return {
    displayDate: d.toLocaleDateString('en-US', options),
    time: d.toLocaleTimeString('en-US', timeOptions),
    weekday: d.toLocaleDateString('en-US', weekdayOptions),
    shortDate: d.toLocaleDateString('en-US', shortOptions),
  };
}

/**
 * Groups entries into natural time categories:
 * "Today", "Yesterday", "This Week", "This Month", "Older"
 */
export function groupEntriesByDate(entries: DiaryEntry[]): Record<string, DiaryEntry[]> {
  const sorted = [...entries].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const oneDayMs = 24 * 60 * 60 * 1000;
  const yesterdayStart = todayStart - oneDayMs;
  const sevenDaysAgo = todayStart - 6 * oneDayMs;
  const thirtyDaysAgo = todayStart - 29 * oneDayMs;

  const groups: Record<string, DiaryEntry[]> = {};

  for (const entry of sorted) {
    const entryTime = new Date(entry.date).getTime();
    let label = 'Older';

    if (entryTime >= todayStart) {
      label = 'Today';
    } else if (entryTime >= yesterdayStart) {
      label = 'Yesterday';
    } else if (entryTime >= sevenDaysAgo) {
      label = 'This Week';
    } else if (entryTime >= thirtyDaysAgo) {
      label = 'This Month';
    }

    if (!groups[label]) {
      groups[label] = [];
    }
    groups[label].push(entry);
  }

  return groups;
}

/**
 * Computes mood statistics, writing streaks, and average score.
 */
export function computeMoodStats(entries: DiaryEntry[]): {
  totalEntries: number;
  averageMoodScore: number;
  dominantMood: string;
  categoryCounts: Record<MoodCategory, number>;
  streakDays: number;
  totalWords: number;
} {
  const defaultCategories: Record<MoodCategory, number> = {
    peaceful: 0,
    joyful: 0,
    reflective: 0,
    anxious: 0,
    melancholy: 0,
    energetic: 0,
    neutral: 0,
    grateful: 0,
  };

  if (!entries || entries.length === 0) {
    return {
      totalEntries: 0,
      averageMoodScore: 7,
      dominantMood: 'Serene',
      categoryCounts: defaultCategories,
      streakDays: 0,
      totalWords: 0,
    };
  }

  let totalScore = 0;
  let scoredCount = 0;
  let totalWords = 0;
  const categoryCounts = { ...defaultCategories };

  for (const entry of entries) {
    totalWords += entry.wordCount || 0;
    if (entry.moodAnalysis) {
      totalScore += entry.moodAnalysis.moodScore;
      scoredCount++;
      const cat = entry.moodAnalysis.moodCategory;
      if (cat in categoryCounts) {
        categoryCounts[cat]++;
      }
    }
  }

  // Calculate dominant category
  let maxCount = -1;
  let dominantMood = 'Peaceful';
  for (const [cat, count] of Object.entries(categoryCounts)) {
    if (count > maxCount && count > 0) {
      maxCount = count;
      dominantMood = cat.charAt(0).toUpperCase() + cat.slice(1);
    }
  }

  // Calculate writing streak (unique days)
  const uniqueDays = new Set(
    entries.map((e) => {
      const d = new Date(e.date);
      return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
    })
  );

  return {
    totalEntries: entries.length,
    averageMoodScore: scoredCount > 0 ? Number((totalScore / scoredCount).toFixed(1)) : 7.2,
    dominantMood,
    categoryCounts,
    streakDays: uniqueDays.size,
    totalWords,
  };
}

/**
 * Filters entries by journal ID, search text, and optional mood.
 */
export function filterEntries(
  entries: DiaryEntry[],
  journalId?: string,
  searchQuery?: string,
  moodFilter?: string
): DiaryEntry[] {
  return entries.filter((entry) => {
    if (journalId && journalId !== 'all' && entry.journalId !== journalId) {
      return false;
    }

    if (moodFilter && moodFilter !== 'all') {
      const matchCategory = entry.moodAnalysis?.moodCategory === moodFilter;
      const matchTag = entry.userMoodTag?.toLowerCase() === moodFilter.toLowerCase();
      if (!matchCategory && !matchTag) return false;
    }

    if (searchQuery && searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const inTitle = entry.title.toLowerCase().includes(q);
      const inContent = entry.content.toLowerCase().includes(q);
      const inLocation = entry.location?.toLowerCase().includes(q) || false;
      const inTags = entry.tags?.some((t) => t.toLowerCase().includes(q)) || false;
      return inTitle || inContent || inLocation || inTags;
    }

    return true;
  });
}

/**
 * Returns CSS styling attributes for each paper style.
 */
export function getPaperClasses(style: PaperStyle): {
  id: PaperStyle;
  label: string;
  bgHex: string;
  containerClass: string;
  textClass: string;
  borderClass: string;
  linePatternClass: string;
  previewBg: string;
} {
  switch (style) {
    case 'soft-sage':
      return {
        id: 'soft-sage',
        label: 'Soft Sage',
        bgHex: '#F2F5F3',
        containerClass: 'bg-[#F2F5F3] text-stone-800',
        textClass: 'text-stone-800 placeholder:text-stone-400',
        borderClass: 'border-stone-200/80',
        linePatternClass: '',
        previewBg: '#F2F5F3',
      };
    case 'lavender-mist':
      return {
        id: 'lavender-mist',
        label: 'Lavender Mist',
        bgHex: '#F6F4F8',
        containerClass: 'bg-[#F6F4F8] text-stone-800',
        textClass: 'text-stone-800 placeholder:text-stone-400',
        borderClass: 'border-purple-200/60',
        linePatternClass: '',
        previewBg: '#F6F4F8',
      };
    case 'linen-ruled':
      return {
        id: 'linen-ruled',
        label: 'Linen Ruled',
        bgHex: '#FBF9F5',
        containerClass: 'bg-[#FBF9F5] text-stone-800 paper-lined',
        textClass: 'text-stone-800 placeholder:text-stone-400',
        borderClass: 'border-stone-200',
        linePatternClass: 'paper-lined',
        previewBg: '#FBF9F5',
      };
    case 'vintage-grid':
      return {
        id: 'vintage-grid',
        label: 'Vintage Grid',
        bgHex: '#FAF8F4',
        containerClass: 'bg-[#FAF8F4] text-stone-800 paper-grid',
        textClass: 'text-stone-800 placeholder:text-stone-400',
        borderClass: 'border-stone-200',
        linePatternClass: 'paper-grid',
        previewBg: '#FAF8F4',
      };
    case 'night-velvet':
      return {
        id: 'night-velvet',
        label: 'Midnight Velvet',
        bgHex: '#1E2129',
        containerClass: 'bg-[#1E2129] text-stone-200',
        textClass: 'text-stone-100 placeholder:text-stone-500',
        borderClass: 'border-stone-700',
        linePatternClass: '',
        previewBg: '#1E2129',
      };
    case 'blush-rose':
      return {
        id: 'blush-rose',
        label: 'Blush Rose',
        bgHex: '#FDF7F7',
        containerClass: 'bg-[#FDF7F7] text-stone-800',
        textClass: 'text-stone-800 placeholder:text-stone-400',
        borderClass: 'border-rose-100',
        linePatternClass: '',
        previewBg: '#FDF7F7',
      };
    case 'warm-parchment':
    default:
      return {
        id: 'warm-parchment',
        label: 'Warm Parchment',
        bgHex: '#FAF7F2',
        containerClass: 'bg-[#FAF7F2] text-stone-800',
        textClass: 'text-stone-800 placeholder:text-stone-400',
        borderClass: 'border-stone-200',
        linePatternClass: '',
        previewBg: '#FAF7F2',
      };
  }
}

/**
 * Returns font class mapping.
 */
export function getFontClass(font: FontChoice): string {
  switch (font) {
    case 'cormorant':
      return 'font-cormorant';
    case 'playfair':
      return 'font-playfair';
    case 'caveat':
      return 'font-caveat text-xl';
    case 'sans-clean':
      return 'font-sans-clean';
    case 'typewriter':
      return 'font-typewriter';
    case 'lora':
      return 'font-lora';
    default:
      return 'font-lora';
  }
}
