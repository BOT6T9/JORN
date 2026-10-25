import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Sidebar } from './components/Sidebar';
import { DiaryCanvas } from './components/DiaryCanvas';
import { InsightsPanel } from './components/InsightsPanel';
import { JournalModal } from './components/JournalModal';
import { MoodTrendsModal } from './components/MoodTrendsModal';
import { PythonExportModal } from './components/PythonExportModal';
import { DiaryEntry, Journal, OverallDailyInsight } from './types';
import { computeMoodStats, filterEntries } from './utils/diaryLogic';
import { Menu, PanelRight, Sparkles, Feather } from 'lucide-react';

export default function App() {
  const [journals, setJournals] = useState<Journal[]>([]);
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [activeJournalId, setActiveJournalId] = useState<string>('daily');
  const [activeEntryId, setActiveEntryId] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMoodFilter, setSelectedMoodFilter] = useState('all');

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isInsightsOpen, setIsInsightsOpen] = useState(false);
  const [isNewJournalOpen, setIsNewJournalOpen] = useState(false);
  const [isMoodTrendsOpen, setIsMoodTrendsOpen] = useState(false);
  const [isPythonExportOpen, setIsPythonExportOpen] = useState(false);

  const [overallInsight, setOverallInsight] = useState<OverallDailyInsight | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Debounce timer ref for saving updates
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initial load
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [journalsRes, entriesRes, insightRes] = await Promise.all([
          fetch('/api/journals'),
          fetch('/api/entries'),
          fetch('/api/overall-insights'),
        ]);

        const journalsData = await journalsRes.json();
        const entriesData = await entriesRes.json();
        const insightData = await insightRes.json();

        setJournals(journalsData.journals || []);
        const loadedEntries: DiaryEntry[] = entriesData.entries || [];
        setEntries(loadedEntries);

        if (loadedEntries.length > 0) {
          setActiveEntryId(loadedEntries[0].id);
        }

        if (insightData.insight) {
          setOverallInsight(insightData.insight);
        }
      } catch (err) {
        console.error('Failed to load initial diary data:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Filtered entries for sidebar
  const visibleEntries = useMemo(() => {
    return filterEntries(entries, activeJournalId, searchQuery, selectedMoodFilter);
  }, [entries, activeJournalId, searchQuery, selectedMoodFilter]);

  // Current active entry
  const activeEntry = useMemo(() => {
    if (!activeEntryId) return null;
    return entries.find((e) => e.id === activeEntryId) || null;
  }, [entries, activeEntryId]);

  // Streak & stats
  const stats = useMemo(() => computeMoodStats(entries), [entries]);

  const handleSelectJournal = (journalId: string) => {
    setActiveJournalId(journalId);
    setIsMobileSidebarOpen(false);
    // Find the first matching entry in this journal
    const matching = entries.find(
      (e) => journalId === 'all' || e.journalId === journalId
    );
    if (matching) {
      setActiveEntryId(matching.id);
    } else {
      setActiveEntryId(null);
    }
  };

  // Create new blank entry
  const handleNewEntry = async () => {
    const journalIdToUse = activeJournalId === 'all' ? 'daily' : activeJournalId;
    const now = new Date();

    const newDraft: Partial<DiaryEntry> = {
      journalId: journalIdToUse,
      title: 'Untitled Entry',
      content: '',
      date: now.toISOString(),
      userMoodTag: 'peaceful',
      fontChoice: 'cormorant',
      paperStyle: journalIdToUse === 'trips' ? 'soft-sage' : 'warm-parchment',
      wordCount: 0,
      readingTimeMinutes: 1,
    };

    try {
      const res = await fetch('/api/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDraft),
      });
      const data = await res.json();
      if (data.entry) {
        setEntries((prev) => [data.entry, ...prev]);
        setActiveEntryId(data.entry.id);
        setIsMobileSidebarOpen(false);
      }
    } catch (err) {
      console.error('Failed to create new entry:', err);
    }
  };

  // Update active entry
  const handleUpdateEntry = (updates: Partial<DiaryEntry>) => {
    if (!activeEntryId) return;

    // Immediately update local state for responsive typing
    setEntries((prev) =>
      prev.map((e) => (e.id === activeEntryId ? { ...e, ...updates, updatedAt: new Date().toISOString() } : e))
    );

    // Debounce backend save
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        const current = entries.find((e) => e.id === activeEntryId);
        if (!current) return;
        const payload = { ...current, ...updates };

        await fetch('/api/entries', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } catch (err) {
        console.error('Failed to auto-save entry:', err);
      }
    }, 500);
  };

  // Delete entry
  const handleDeleteEntry = async (id: string) => {
    try {
      await fetch(`/api/entries/${id}`, { method: 'DELETE' });
      setEntries((prev) => {
        const remaining = prev.filter((e) => e.id !== id);
        if (activeEntryId === id) {
          setActiveEntryId(remaining.length > 0 ? remaining[0].id : null);
        }
        return remaining;
      });
    } catch (err) {
      console.error('Failed to delete entry:', err);
    }
  };

  // Trigger Gemini AI Mood Analysis
  const handleAnalyzeMood = async () => {
    if (!activeEntry || !activeEntry.content?.trim()) return;

    try {
      setIsAnalyzing(true);
      const res = await fetch('/api/analyze-entry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entryId: activeEntry.id,
          title: activeEntry.title,
          content: activeEntry.content,
          location: activeEntry.location,
          weather: activeEntry.weather,
          userMoodTag: activeEntry.userMoodTag,
        }),
      });

      const data = await res.json();
      if (data.analysis) {
        // Update local state with fresh analysis
        setEntries((prev) =>
          prev.map((e) =>
            e.id === activeEntry.id ? { ...e, moodAnalysis: data.analysis } : e
          )
        );
        setIsInsightsOpen(true);
      }
    } catch (err) {
      console.error('Mood analysis failed:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Create new journal
  const handleCreateJournal = async (
    name: string,
    description: string,
    icon: string,
    accentColor: string
  ) => {
    try {
      const res = await fetch('/api/journals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, icon, accentColor }),
      });
      const data = await res.json();
      if (data.journal) {
        setJournals((prev) => [...prev, data.journal]);
        setActiveJournalId(data.journal.id);
      }
    } catch (err) {
      console.error('Failed to create journal:', err);
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#FAF8F5] text-stone-600 space-y-3">
        <Feather className="w-8 h-8 text-stone-400 animate-pulse" />
        <p className="font-serif text-lg font-medium">Opening your diary...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#FAF8F5] text-stone-800 font-sans-clean select-text">
      {/* Mobile Drawer Backdrop */}
      {isMobileSidebarOpen && (
        <div
          onClick={() => setIsMobileSidebarOpen(false)}
          className="fixed inset-0 bg-stone-900/30 backdrop-blur-2xs z-40 md:hidden"
        />
      )}

      {/* Sidebar: Desktop always visible, Mobile in slide-over drawer */}
      <div
        className={`fixed md:static inset-y-0 left-0 z-40 transform transition-transform duration-300 md:translate-x-0 ${
          isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Sidebar
          journals={journals}
          activeJournalId={activeJournalId}
          onSelectJournal={handleSelectJournal}
          entries={visibleEntries}
          allEntries={entries}
          activeEntryId={activeEntryId}
          onSelectEntry={(entry) => {
            setActiveEntryId(entry.id);
            setIsMobileSidebarOpen(false);
          }}
          onNewEntry={handleNewEntry}
          onDeleteEntry={handleDeleteEntry}
          onOpenNewJournalModal={() => setIsNewJournalOpen(true)}
          onOpenMoodTrends={() => setIsMoodTrendsOpen(true)}
          onOpenPythonExport={() => setIsPythonExportOpen(true)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedMoodFilter={selectedMoodFilter}
          onMoodFilterChange={setSelectedMoodFilter}
          streakDays={stats.streakDays}
        />
      </div>

      {/* Center Diary Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        {/* Mobile Header Bar for small screens */}
        <div className="md:hidden h-12 px-4 bg-[#F7F5F0] border-b border-[#E8E4DC] flex items-center justify-between">
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="p-1.5 text-stone-600 hover:text-stone-900"
            aria-label="Open sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-serif text-sm font-medium text-stone-800">SereneNotes</span>
          <button
            onClick={() => setIsInsightsOpen(!isInsightsOpen)}
            className="p-1.5 text-stone-600 hover:text-stone-900"
            aria-label="Toggle insights panel"
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
          </button>
        </div>

        {activeEntry ? (
          <DiaryCanvas
            entry={activeEntry}
            journals={journals}
            onUpdateEntry={handleUpdateEntry}
            onAnalyzeMood={handleAnalyzeMood}
            isAnalyzing={isAnalyzing}
            hasMoodAnalysis={Boolean(activeEntry.moodAnalysis)}
            onOpenInsights={() => setIsInsightsOpen(true)}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-stone-400 space-y-4">
            <Feather className="w-12 h-12 text-stone-300 stroke-[1.2]" />
            <h2 className="font-serif text-2xl font-medium text-stone-700">A Peaceful Canvas Awaits</h2>
            <p className="text-sm text-stone-500 max-w-md leading-relaxed">
              Select an entry from the sidebar or click below to start writing today&apos;s thoughts,
              travel logs, or quiet moments.
            </p>
            <button
              onClick={handleNewEntry}
              className="px-5 py-2.5 bg-stone-800 hover:bg-stone-900 text-white text-sm font-medium rounded-xl shadow-xs transition-colors"
            >
              Write First Reflection
            </button>
          </div>
        )}
      </main>

      {/* Right Insights Slide-over or Side Panel */}
      <InsightsPanel
        isOpen={isInsightsOpen}
        onClose={() => setIsInsightsOpen(false)}
        analysis={activeEntry?.moodAnalysis}
        overallInsight={overallInsight}
        onReanalyze={handleAnalyzeMood}
        isAnalyzing={isAnalyzing}
      />

      {/* Modals */}
      <JournalModal
        isOpen={isNewJournalOpen}
        onClose={() => setIsNewJournalOpen(false)}
        onCreateJournal={handleCreateJournal}
      />

      <MoodTrendsModal
        isOpen={isMoodTrendsOpen}
        onClose={() => setIsMoodTrendsOpen(false)}
        entries={entries}
        overallInsight={overallInsight}
      />

      <PythonExportModal
        isOpen={isPythonExportOpen}
        onClose={() => setIsPythonExportOpen(false)}
      />
    </div>
  );
}
