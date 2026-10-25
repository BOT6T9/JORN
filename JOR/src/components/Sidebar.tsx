import React, { useState } from 'react';
import {
  BookHeart,
  Compass,
  Sun,
  Plus,
  Search,
  BookOpen,
  Calendar,
  Sparkles,
  Trash2,
  ChevronDown,
  BarChart3,
  Code2,
  FolderPlus,
  Heart,
  Mountain,
} from 'lucide-react';
import { DiaryEntry, Journal, MoodCategory } from '../types';
import { formatDiaryDate, groupEntriesByDate } from '../utils/diaryLogic';

interface SidebarProps {
  journals: Journal[];
  activeJournalId: string;
  onSelectJournal: (id: string) => void;
  entries: DiaryEntry[];
  allEntries?: DiaryEntry[];
  activeEntryId: string | null;
  onSelectEntry: (entry: DiaryEntry) => void;
  onNewEntry: () => void;
  onDeleteEntry: (id: string) => void;
  onOpenNewJournalModal: () => void;
  onOpenMoodTrends: () => void;
  onOpenPythonExport: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedMoodFilter: string;
  onMoodFilterChange: (m: string) => void;
  streakDays: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  journals,
  activeJournalId,
  onSelectJournal,
  entries,
  allEntries = [],
  activeEntryId,
  onSelectEntry,
  onNewEntry,
  onDeleteEntry,
  onOpenNewJournalModal,
  onOpenMoodTrends,
  onOpenPythonExport,
  searchQuery,
  onSearchChange,
  selectedMoodFilter,
  onMoodFilterChange,
  streakDays,
}) => {
  const [isJournalDropdownOpen, setIsJournalDropdownOpen] = useState(false);

  const activeJournal = journals.find((j) => j.id === activeJournalId) || {
    id: 'all',
    name: 'All Entries',
    description: 'Every written page',
    icon: 'book-open',
    accentColor: '#8C9A8E',
    createdAt: '',
  };

  const grouped = groupEntriesByDate(entries);
  const groupKeys = ['Today', 'Yesterday', 'This Week', 'This Month', 'Older'].filter(
    (key) => grouped[key] && grouped[key].length > 0
  );

  const renderJournalIcon = (iconName: string, className = 'w-4 h-4') => {
    switch (iconName) {
      case 'compass':
        return <Compass className={className} />;
      case 'sun':
        return <Sun className={className} />;
      case 'heart':
      case 'book-heart':
        return <BookHeart className={className} />;
      case 'mountain':
        return <Mountain className={className} />;
      default:
        return <BookOpen className={className} />;
    }
  };

  const getMoodBadgeStyle = (category?: MoodCategory | string) => {
    switch (category) {
      case 'peaceful':
        return 'text-emerald-700 bg-emerald-50/70 border-emerald-200/50';
      case 'joyful':
        return 'text-amber-700 bg-amber-50/70 border-amber-200/50';
      case 'reflective':
        return 'text-sky-700 bg-sky-50/70 border-sky-200/50';
      case 'grateful':
        return 'text-teal-700 bg-teal-50/70 border-teal-200/50';
      case 'anxious':
        return 'text-orange-700 bg-orange-50/70 border-orange-200/50';
      case 'melancholy':
        return 'text-stone-600 bg-stone-100/70 border-stone-200/50';
      default:
        return 'text-stone-600 bg-stone-50 border-stone-200/50';
    }
  };

  return (
    <aside className="w-80 md:w-88 h-full bg-[#F7F5F0] border-r border-[#E8E4DC] flex flex-col shrink-0 select-none">
      {/* Brand & Journal Switcher */}
      <div className="p-4 border-b border-[#E8E4DC]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-stone-800">
            <span className="w-2.5 h-2.5 rounded-full bg-stone-500/70"></span>
            <span className="font-serif text-lg font-medium tracking-tight">SereneNotes</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-stone-500">
            <span>{streakDays}d streak</span>
            <span aria-hidden="true">·</span>
            <span>{entries.length} entries</span>
          </div>
        </div>

        {/* Current Journal Selector Card */}
        <div className="relative">
          <button
            onClick={() => setIsJournalDropdownOpen(!isJournalDropdownOpen)}
            className="w-full flex items-center justify-between px-3 py-2.5 bg-white/80 hover:bg-white rounded-xl border border-stone-200/80 shadow-xs transition-all text-left"
            aria-expanded={isJournalDropdownOpen}
            aria-label="Switch Journal"
          >
            <div className="flex items-center gap-2.5 truncate">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center text-stone-700 shrink-0"
                style={{ backgroundColor: `${activeJournal.accentColor}25` }}
              >
                {renderJournalIcon(activeJournal.icon)}
              </div>
              <div className="truncate">
                <div className="text-sm font-medium text-stone-800 truncate">
                  {activeJournal.name}
                </div>
                <div className="text-xs text-stone-500 truncate">
                  {activeJournal.description || 'Active journal'}
                </div>
              </div>
            </div>
            <ChevronDown className="w-4 h-4 text-stone-400 shrink-0 ml-2" />
          </button>

          {/* Journal Dropdown Menu */}
          {isJournalDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-xl shadow-lg border border-stone-200/90 py-1.5 z-50">
              <button
                onClick={() => {
                  onSelectJournal('all');
                  setIsJournalDropdownOpen(false);
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors text-left ${
                  activeJournalId === 'all'
                    ? 'bg-stone-100/80 font-medium text-stone-900'
                    : 'text-stone-700 hover:bg-stone-50'
                }`}
              >
                <BookOpen className="w-4 h-4 text-stone-500" />
                <span>All Journals & Trips</span>
              </button>

              <div className="my-1 border-t border-stone-100" />

              {journals.map((journal) => (
                <button
                  key={journal.id}
                  onClick={() => {
                    onSelectJournal(journal.id);
                    setIsJournalDropdownOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-sm transition-colors text-left ${
                    activeJournalId === journal.id
                      ? 'bg-stone-100/80 font-medium text-stone-900'
                      : 'text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: journal.accentColor }}
                    />
                    <span className="truncate">{journal.name}</span>
                  </div>
                  <span className="text-xs text-stone-400">
                    {(allEntries.length > 0 ? allEntries : entries).filter((e) => e.journalId === journal.id).length}
                  </span>
                </button>
              ))}

              <div className="my-1 border-t border-stone-100" />

              <button
                onClick={() => {
                  setIsJournalDropdownOpen(false);
                  onOpenNewJournalModal();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-50 transition-colors"
              >
                <FolderPlus className="w-3.5 h-3.5" />
                <span>Create New Journal or Trip...</span>
              </button>
            </div>
          )}
        </div>

        {/* Action: New Entry Button */}
        <button
          onClick={onNewEntry}
          className="w-full mt-3 flex items-center justify-center gap-2 px-4 py-2.5 bg-stone-800 hover:bg-stone-900 text-stone-100 text-sm font-medium rounded-xl shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Write New Entry</span>
        </button>
      </div>

      {/* Search and Mood Filter Bar */}
      <div className="px-4 py-2.5 border-b border-[#E8E4DC] space-y-2">
        <div className="relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search entries or memories..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white/70 focus:bg-white rounded-lg border border-stone-200/80 placeholder:text-stone-400 text-stone-800 outline-none focus:border-stone-400 transition-colors"
          />
        </div>

        {/* Mood filter pill-bar */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs no-scrollbar">
          {[
            { id: 'all', label: 'All Moods' },
            { id: 'peaceful', label: 'Peaceful' },
            { id: 'joyful', label: 'Joyful' },
            { id: 'reflective', label: 'Reflective' },
            { id: 'grateful', label: 'Grateful' },
            { id: 'anxious', label: 'Anxious' },
          ].map((mood) => (
            <button
              key={mood.id}
              onClick={() => onMoodFilterChange(mood.id)}
              className={`px-2.5 py-1 rounded-md text-xs whitespace-nowrap transition-colors ${
                selectedMoodFilter === mood.id
                  ? 'bg-stone-200/90 text-stone-800 font-medium'
                  : 'text-stone-500 hover:text-stone-800 hover:bg-stone-200/50'
              }`}
            >
              {mood.label}
            </button>
          ))}
        </div>
      </div>

      {/* Past Entries List grouped by natural timeframe */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-4">
        {groupKeys.length === 0 ? (
          <div className="py-12 text-center text-stone-400 text-xs px-4">
            <BookOpen className="w-8 h-8 mx-auto mb-2 text-stone-300 stroke-[1.5]" />
            <p>No diary entries found.</p>
            <p className="mt-1 text-stone-400">Click &quot;Write New Entry&quot; to begin.</p>
          </div>
        ) : (
          groupKeys.map((group) => (
            <div key={group} className="space-y-1.5">
              <div className="px-2 text-[11px] font-semibold tracking-wider uppercase text-stone-400">
                {group}
              </div>

              {grouped[group].map((entry) => {
                const isActive = activeEntryId === entry.id;
                const dateInfo = formatDiaryDate(entry.date);
                const moodLabel = entry.moodAnalysis?.primaryMood || entry.userMoodTag || 'Reflective';
                const moodCat = entry.moodAnalysis?.moodCategory || entry.userMoodTag;

                return (
                  <div
                    key={entry.id}
                    onClick={() => onSelectEntry(entry)}
                    className={`group relative p-3 rounded-xl cursor-pointer transition-all border ${
                      isActive
                        ? 'bg-white shadow-xs border-stone-300/80 text-stone-900'
                        : 'bg-white/40 hover:bg-white/80 border-transparent hover:border-stone-200/60 text-stone-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className="text-sm font-medium leading-snug truncate pr-4">
                        {entry.title || 'Untitled Entry'}
                      </h4>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm('Are you sure you want to delete this diary entry?')) {
                            onDeleteEntry(entry.id);
                          }
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 text-stone-400 hover:text-rose-600 transition-opacity"
                        title="Delete entry"
                        aria-label={`Delete entry ${entry.title}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <p className="text-xs text-stone-500 line-clamp-2 mb-2 leading-relaxed font-normal">
                      {entry.content || 'Empty entry...'}
                    </p>

                    <div className="flex items-center justify-between text-[11px] text-stone-400">
                      <div className="flex items-center gap-1.5">
                        <span>{dateInfo.shortDate}</span>
                        <span aria-hidden="true">·</span>
                        <span>{entry.wordCount || 0} words</span>
                        {entry.location && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="truncate max-w-[80px]">{entry.location}</span>
                          </>
                        )}
                      </div>

                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-medium border ${getMoodBadgeStyle(
                          moodCat
                        )}`}
                      >
                        {moodLabel}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        )}
      </div>

      {/* Bottom Bar: Mood Analytics & Python Export */}
      <div className="p-3 border-t border-[#E8E4DC] bg-[#F3F0E9] flex items-center justify-between gap-2">
        <button
          onClick={onOpenMoodTrends}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 text-xs text-stone-700 bg-white/70 hover:bg-white rounded-lg border border-stone-200 transition-colors"
        >
          <BarChart3 className="w-3.5 h-3.5 text-stone-500" />
          <span>Mood Trends</span>
        </button>

        <button
          onClick={onOpenPythonExport}
          className="flex items-center gap-1.5 py-2 px-2.5 text-xs text-stone-700 bg-white/70 hover:bg-white rounded-lg border border-stone-200 transition-colors"
          title="View & Export HTML, Python Flask, and JSON Codebase"
        >
          <Code2 className="w-3.5 h-3.5 text-stone-500" />
          <span className="hidden sm:inline">HTML / Flask Code</span>
        </button>
      </div>
    </aside>
  );
};
