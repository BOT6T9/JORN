import React from 'react';
import { X, TrendingUp, BarChart2, Heart, Sparkles, BookOpen, Calendar } from 'lucide-react';
import { DiaryEntry, OverallDailyInsight } from '../types';
import { computeMoodStats, formatDiaryDate } from '../utils/diaryLogic';

interface MoodTrendsModalProps {
  isOpen: boolean;
  onClose: () => void;
  entries: DiaryEntry[];
  overallInsight?: OverallDailyInsight | null;
}

export const MoodTrendsModal: React.FC<MoodTrendsModalProps> = ({
  isOpen,
  onClose,
  entries,
  overallInsight,
}) => {
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const stats = computeMoodStats(entries);
  const recentEntries = [...entries]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 7);

  const moodColorMap: Record<string, string> = {
    peaceful: '#10B981',
    joyful: '#F59E0B',
    reflective: '#0EA5E9',
    grateful: '#14B8A6',
    anxious: '#F97316',
    melancholy: '#8B5CF6',
    energetic: '#EC4899',
    neutral: '#78716C',
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4 cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[#FAF9F5] border border-stone-200 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-6 animate-in zoom-in-95 duration-200 cursor-default"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-200">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-stone-700" />
            <div>
              <h3 className="font-serif text-lg font-medium text-stone-800">
                Mood Trends &amp; Emotional Rhythm
              </h3>
              <p className="text-xs text-stone-500">
                Insights across your journaling days and reflections.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Holistic AI Insight Banner */}
        {overallInsight && (
          <div className="p-4 rounded-2xl bg-white border border-stone-200/90 shadow-2xs space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-700">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>{overallInsight.headline}</span>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed font-serif italic">
              &ldquo;{overallInsight.summary}&rdquo;
            </p>
            <div className="pt-2 text-[11px] text-stone-500 flex items-center justify-between">
              <span>Overall Rhythm: <strong className="text-stone-800 capitalize">{overallInsight.weeklyTrend}</strong></span>
              <span>Dominant Vibe: <strong className="text-stone-800">{overallInsight.dominantMood}</strong></span>
            </div>
          </div>
        )}

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white p-3.5 rounded-xl border border-stone-200/80 shadow-2xs">
            <div className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider">
              Avg Mood Score
            </div>
            <div className="text-xl font-serif font-medium text-stone-800 mt-1">
              {stats.averageMoodScore} <span className="text-xs font-sans text-stone-400">/ 10</span>
            </div>
            <div className="text-[11px] text-stone-500 mt-0.5">Warm &amp; Grounded</div>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-stone-200/80 shadow-2xs">
            <div className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider">
              Dominant Tone
            </div>
            <div className="text-xl font-serif font-medium text-stone-800 mt-1">
              {stats.dominantMood}
            </div>
            <div className="text-[11px] text-stone-500 mt-0.5">Most recurring</div>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-stone-200/80 shadow-2xs">
            <div className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider">
              Writing Streak
            </div>
            <div className="text-xl font-serif font-medium text-stone-800 mt-1">
              {stats.streakDays} <span className="text-xs font-sans text-stone-400">days</span>
            </div>
            <div className="text-[11px] text-stone-500 mt-0.5">Consecutive rhythm</div>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-stone-200/80 shadow-2xs">
            <div className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider">
              Total Words
            </div>
            <div className="text-xl font-serif font-medium text-stone-800 mt-1">
              {stats.totalWords.toLocaleString()}
            </div>
            <div className="text-[11px] text-stone-500 mt-0.5">Mindful pages</div>
          </div>
        </div>

        {/* Mood Distribution Bars */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-2xs space-y-3">
          <div className="text-xs font-semibold text-stone-700">
            Emotional Category Distribution
          </div>
          <div className="space-y-2">
            {Object.entries(stats.categoryCounts).map(([cat, count]) => {
              const pct = stats.totalEntries > 0 ? Math.round((count / stats.totalEntries) * 100) : 0;
              return (
                <div key={cat} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="capitalize text-stone-700">{cat}</span>
                    <span className="text-stone-400 text-[11px]">{count} entries ({pct}%)</span>
                  </div>
                  <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.max(pct > 0 ? 4 : 0, pct)}%`,
                        backgroundColor: moodColorMap[cat] || '#8C9A8E',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Entries Timeline */}
        <div className="space-y-3">
          <div className="text-xs font-semibold text-stone-700">
            Recent Timeline &amp; Key Themes
          </div>
          <div className="space-y-2">
            {recentEntries.map((e) => {
              const d = formatDiaryDate(e.date);
              const mood = e.moodAnalysis?.primaryMood || e.userMoodTag || 'Peaceful';
              return (
                <div
                  key={e.id}
                  className="bg-white p-3 rounded-xl border border-stone-200/70 flex items-center justify-between text-xs"
                >
                  <div className="truncate pr-4">
                    <div className="font-medium text-stone-800 truncate">{e.title}</div>
                    <div className="text-stone-400 text-[11px]">
                      {d.displayDate} · {e.wordCount} words
                      {e.location ? ` · ${e.location}` : ''}
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-stone-100 text-stone-700 border border-stone-200 shrink-0">
                    {mood}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
