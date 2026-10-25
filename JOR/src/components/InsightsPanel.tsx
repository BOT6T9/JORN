import React from 'react';
import {
  Sparkles,
  X,
  Heart,
  Compass,
  Smile,
  Feather,
  Lightbulb,
  Moon,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { MoodAnalysis, OverallDailyInsight } from '../types';

interface InsightsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  analysis?: MoodAnalysis;
  overallInsight?: OverallDailyInsight | null;
  onReanalyze: () => void;
  isAnalyzing: boolean;
}

export const InsightsPanel: React.FC<InsightsPanelProps> = ({
  isOpen,
  onClose,
  analysis,
  overallInsight,
  onReanalyze,
  isAnalyzing,
}) => {
  if (!isOpen) return null;

  return (
    <aside className="w-80 sm:w-96 h-full bg-[#FAF9F5] border-l border-[#E6E2D8] shadow-xl flex flex-col z-30 shrink-0 animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="p-4 border-b border-[#E6E2D8] flex items-center justify-between bg-white/70">
        <div className="flex items-center gap-2 text-stone-800">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <h3 className="font-serif text-base font-medium">Daily Mood & Insights</h3>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          aria-label="Close insights panel"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        {!analysis ? (
          <div className="py-12 text-center text-stone-400 space-y-3">
            <Feather className="w-8 h-8 mx-auto text-stone-300" />
            <p className="text-sm text-stone-600 font-medium">No analysis yet</p>
            <p className="text-xs text-stone-400 max-w-xs mx-auto">
              Write a reflection and tap &quot;Analyze Mood &amp; Insights&quot; to receive your
              mindful breakdown.
            </p>
            <button
              onClick={onReanalyze}
              disabled={isAnalyzing}
              className="mt-2 px-3 py-1.5 text-xs bg-stone-800 text-white rounded-lg hover:bg-stone-900 transition-colors"
            >
              Analyze Current Entry
            </button>
          </div>
        ) : (
          <>
            {/* Primary Mood & Score */}
            <div className="bg-white rounded-2xl p-4 border border-stone-200/80 shadow-2xs space-y-3">
              <div className="flex items-center justify-between text-xs text-stone-400">
                <span className="uppercase tracking-wider font-semibold text-[10px]">Primary Tone</span>
                <span>Analyzed just now</span>
              </div>

              <div>
                <h4 className="text-xl font-serif font-medium text-stone-800">
                  {analysis.primaryMood}
                </h4>
                <div className="flex items-center justify-between mt-2 text-xs text-stone-500">
                  <span>Emotional Vitality</span>
                  <span className="font-medium text-stone-800">{analysis.moodScore} / 10</span>
                </div>
                {/* Score bar */}
                <div className="w-full h-1.5 bg-stone-100 rounded-full mt-1.5 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-stone-400 via-amber-400 to-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(10, analysis.moodScore * 10))}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Emotional Spectrum Breakdown */}
            {analysis.emotionalSpectrum && analysis.emotionalSpectrum.length > 0 && (
              <div className="space-y-2">
                <div className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
                  Emotional Spectrum
                </div>
                <div className="bg-white rounded-2xl p-4 border border-stone-200/80 shadow-2xs space-y-3">
                  {analysis.emotionalSpectrum.map((item, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between text-xs text-stone-700">
                        <span>{item.emotion}</span>
                        <span className="font-medium text-stone-500">{item.percentage}%</span>
                      </div>
                      <div className="w-full h-1 bg-stone-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-stone-500 rounded-full"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Key Themes Identified */}
            {analysis.keyThemes && analysis.keyThemes.length > 0 && (
              <div className="space-y-2">
                <div className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
                  Underlying Themes
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {analysis.keyThemes.map((theme, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 text-xs rounded-lg bg-white border border-stone-200 text-stone-700 shadow-2xs"
                    >
                      {theme}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Mindful Personal Reflection */}
            <div className="bg-stone-100/80 rounded-2xl p-4 border border-stone-200/70 space-y-2">
              <div className="flex items-center gap-1.5 text-stone-700 text-xs font-medium">
                <Heart className="w-3.5 h-3.5 text-rose-500/80" />
                <span>Personalized Reflection</span>
              </div>
              <p className="text-xs sm:text-sm text-stone-700 leading-relaxed font-serif italic">
                &ldquo;{analysis.personalizedReflection}&rdquo;
              </p>
            </div>

            {/* Soothing Advice / Self Care */}
            <div className="bg-white rounded-2xl p-4 border border-stone-200/80 shadow-2xs space-y-2">
              <div className="flex items-center gap-1.5 text-stone-700 text-xs font-medium">
                <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                <span>Gentle Self-Care Suggestion</span>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed">
                {analysis.soothingAdvice}
              </p>
            </div>

            {/* Reflective Prompt for Tomorrow */}
            <div className="bg-white rounded-2xl p-4 border border-stone-200/80 shadow-2xs space-y-2">
              <div className="flex items-center gap-1.5 text-stone-700 text-xs font-medium">
                <Moon className="w-3.5 h-3.5 text-indigo-400" />
                <span>Prompt to Sleep On</span>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed font-medium">
                {analysis.reflectivePrompt}
              </p>
            </div>

            {/* Daily Overall Insight if present */}
            {overallInsight && (
              <div className="bg-[#F2EFE9] rounded-2xl p-4 border border-stone-300/60 space-y-2">
                <div className="flex items-center gap-1.5 text-stone-700 text-xs font-medium">
                  <TrendingUp className="w-3.5 h-3.5 text-stone-600" />
                  <span>Weekly Arc: {overallInsight.headline}</span>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">
                  {overallInsight.summary}
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer with Re-analyze action */}
      {analysis && (
        <div className="p-4 border-t border-[#E6E2D8] bg-white/50">
          <button
            onClick={onReanalyze}
            disabled={isAnalyzing}
            className="w-full flex items-center justify-center gap-2 py-2 text-xs font-medium text-stone-700 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>{isAnalyzing ? 'Reflecting again...' : 'Refresh Reflection'}</span>
          </button>
        </div>
      )}
    </aside>
  );
};
