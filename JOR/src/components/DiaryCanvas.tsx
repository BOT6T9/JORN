import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Type,
  Palette,
  MapPin,
  CloudSun,
  Smile,
  Image as ImageIcon,
  Check,
  Calendar,
  Clock,
  Compass,
  BookHeart,
  ChevronDown,
  ExternalLink,
} from 'lucide-react';
import { DiaryEntry, FontChoice, Journal, MoodCategory, PaperStyle } from '../types';
import {
  calculateReadingTime,
  calculateWordCount,
  formatDiaryDate,
  getFontClass,
  getPaperClasses,
} from '../utils/diaryLogic';

interface DiaryCanvasProps {
  entry: DiaryEntry;
  journals: Journal[];
  onUpdateEntry: (updated: Partial<DiaryEntry>) => void;
  onAnalyzeMood: () => void;
  isAnalyzing: boolean;
  hasMoodAnalysis: boolean;
  onOpenInsights: () => void;
}

export const DiaryCanvas: React.FC<DiaryCanvasProps> = ({
  entry,
  journals,
  onUpdateEntry,
  onAnalyzeMood,
  isAnalyzing,
  hasMoodAnalysis,
  onOpenInsights,
}) => {
  const [showFontMenu, setShowFontMenu] = useState(false);
  const [showPaperMenu, setShowPaperMenu] = useState(false);
  const [showPhotoInput, setShowPhotoInput] = useState(false);
  const [photoUrl, setPhotoUrl] = useState('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('saved');

  const currentJournal = journals.find((j) => j.id === entry.journalId) || journals[0];
  const paperClass = getPaperClasses(entry.paperStyle || 'warm-parchment');
  const fontClass = getFontClass(entry.fontChoice || 'cormorant');
  const dateInfo = formatDiaryDate(entry.date);

  // Auto-save debounce effect indicator
  useEffect(() => {
    setSaveStatus('saved');
  }, [entry.id]);

  const handleTitleChange = (val: string) => {
    setSaveStatus('saving');
    onUpdateEntry({ title: val });
    setTimeout(() => setSaveStatus('saved'), 600);
  };

  const handleContentChange = (val: string) => {
    setSaveStatus('saving');
    const wordCount = calculateWordCount(val);
    const readingTimeMinutes = calculateReadingTime(wordCount);
    onUpdateEntry({
      content: val,
      wordCount,
      readingTimeMinutes,
    });
    setTimeout(() => setSaveStatus('saved'), 600);
  };

  const handleAddPhoto = () => {
    if (!photoUrl.trim()) return;
    const currentPhotos = entry.photos || [];
    onUpdateEntry({ photos: [...currentPhotos, photoUrl.trim()] });
    setPhotoUrl('');
    setShowPhotoInput(false);
  };

  const removePhoto = (idx: number) => {
    const currentPhotos = entry.photos || [];
    const next = currentPhotos.filter((_, i) => i !== idx);
    onUpdateEntry({ photos: next });
  };

  const fontOptions: { id: FontChoice; label: string; preview: string }[] = [
    { id: 'cormorant', label: 'Classic Book', preview: 'Cormorant Garamond' },
    { id: 'playfair', label: 'Literary Editorial', preview: 'Playfair Display' },
    { id: 'caveat', label: 'Handwritten Script', preview: 'Caveat Script' },
    { id: 'lora', label: 'Gentle Novel', preview: 'Lora Serif' },
    { id: 'sans-clean', label: 'Modern Clean', preview: 'Plus Jakarta Sans' },
    { id: 'typewriter', label: 'Vintage Typewriter', preview: 'Courier Prime' },
  ];

  const paperOptions: { id: PaperStyle; label: string; color: string; desc: string }[] = [
    { id: 'warm-parchment', label: 'Warm Parchment', color: '#FAF7F2', desc: 'Soft ivory warmth' },
    { id: 'soft-sage', label: 'Soft Sage', color: '#F2F5F3', desc: 'Calming botanical green' },
    { id: 'lavender-mist', label: 'Lavender Mist', color: '#F6F4F8', desc: 'Soothing evening haze' },
    { id: 'linen-ruled', label: 'Linen Ruled', color: '#FBF9F5', desc: 'Gentle notebook lines' },
    { id: 'vintage-grid', label: 'Vintage Grid', color: '#FAF8F4', desc: 'Delicate light dot grid' },
    { id: 'blush-rose', label: 'Blush Rose', color: '#FDF7F7', desc: 'Tender dawn warmth' },
    { id: 'night-velvet', label: 'Midnight Velvet', color: '#1E2129', desc: 'Deep indigo night mode' },
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-[#EFECE6] overflow-hidden relative">
      {/* Top Canvas Customization Toolbar */}
      <header className="h-14 px-6 border-b border-[#DFDAD0] bg-white/70 backdrop-blur-xs flex items-center justify-between gap-4 z-20 shrink-0">
        {/* Left: Journal Selector & Date */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-stone-100 border border-stone-200/70 text-xs text-stone-700 font-medium">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: currentJournal?.accentColor || '#8C9A8E' }}
            />
            <span>{currentJournal?.name || 'Diary'}</span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-xs text-stone-500">
            <span>{dateInfo.weekday}</span>
            <span aria-hidden="true">·</span>
            <span>{dateInfo.displayDate}</span>
          </div>
        </div>

        {/* Center: Font & Background Customization Controls */}
        <div className="flex items-center gap-2">
          {/* Font Picker */}
          <div className="relative">
            <button
              onClick={() => {
                setShowFontMenu(!showFontMenu);
                setShowPaperMenu(false);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-700 bg-white hover:bg-stone-50 rounded-lg border border-stone-200/90 shadow-2xs transition-colors"
              aria-label="Customize Font"
            >
              <Type className="w-3.5 h-3.5 text-stone-500" />
              <span className="hidden md:inline">Font:</span>
              <span className="capitalize">{entry.fontChoice || 'Classic'}</span>
              <ChevronDown className="w-3 h-3 text-stone-400" />
            </button>

            {showFontMenu && (
              <div className="absolute right-0 mt-1.5 w-56 bg-white rounded-xl shadow-lg border border-stone-200/90 py-1.5 z-50">
                <div className="px-3 py-1 text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
                  Diary Typography
                </div>
                {fontOptions.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => {
                      onUpdateEntry({ fontChoice: opt.id });
                      setShowFontMenu(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs text-left transition-colors ${
                      (entry.fontChoice || 'cormorant') === opt.id
                        ? 'bg-stone-100 font-medium text-stone-900'
                        : 'text-stone-700 hover:bg-stone-50'
                    }`}
                  >
                    <span>{opt.label}</span>
                    <span className="text-[11px] text-stone-400 italic">{opt.preview}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Paper Background Picker */}
          <div className="relative">
            <button
              onClick={() => {
                setShowPaperMenu(!showPaperMenu);
                setShowFontMenu(false);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-700 bg-white hover:bg-stone-50 rounded-lg border border-stone-200/90 shadow-2xs transition-colors"
              aria-label="Customize Paper Background"
            >
              <Palette className="w-3.5 h-3.5 text-stone-500" />
              <span className="hidden md:inline">Paper:</span>
              <span className="capitalize">
                {paperOptions.find((p) => p.id === entry.paperStyle)?.label || 'Parchment'}
              </span>
              <ChevronDown className="w-3 h-3 text-stone-400" />
            </button>

            {showPaperMenu && (
              <div className="absolute right-0 mt-1.5 w-60 bg-white rounded-xl shadow-lg border border-stone-200/90 py-1.5 z-50">
                <div className="px-3 py-1 text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
                  Journal Paper Theme
                </div>
                {paperOptions.map((paper) => (
                  <button
                    key={paper.id}
                    onClick={() => {
                      onUpdateEntry({ paperStyle: paper.id });
                      setShowPaperMenu(false);
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs text-left transition-colors ${
                      (entry.paperStyle || 'warm-parchment') === paper.id
                        ? 'bg-stone-100 font-medium text-stone-900'
                        : 'text-stone-700 hover:bg-stone-50'
                    }`}
                  >
                    <span
                      className="w-4 h-4 rounded-full border border-stone-300 shrink-0 shadow-2xs"
                      style={{ backgroundColor: paper.color }}
                    />
                    <div>
                      <div className="leading-tight">{paper.label}</div>
                      <div className="text-[10px] text-stone-400">{paper.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Add Image Button */}
          <button
            onClick={() => setShowPhotoInput(!showPhotoInput)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-700 bg-white hover:bg-stone-50 rounded-lg border border-stone-200/90 shadow-2xs transition-colors"
            title="Attach a photo memory"
          >
            <ImageIcon className="w-3.5 h-3.5 text-stone-500" />
            <span className="hidden lg:inline">Photo</span>
          </button>
        </div>

        {/* Right: AI Mood & Insights Trigger */}
        <div className="flex items-center gap-2">
          {hasMoodAnalysis && (
            <button
              onClick={onOpenInsights}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-700 bg-white hover:bg-stone-50 rounded-lg border border-stone-200 shadow-2xs transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>View Insights</span>
            </button>
          )}

          <button
            onClick={onAnalyzeMood}
            disabled={isAnalyzing || !entry.content?.trim()}
            className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium text-white bg-stone-800 hover:bg-stone-900 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-xs transition-all"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : 'text-amber-300'}`} />
            <span>{isAnalyzing ? 'Reflecting on Mood...' : 'Analyze Mood & Insights'}</span>
          </button>
        </div>
      </header>

      {/* Photo URL Input Bar */}
      {showPhotoInput && (
        <div className="px-6 py-2 bg-stone-100 border-b border-stone-200 flex items-center gap-2 animate-in fade-in duration-200">
          <input
            type="text"
            value={photoUrl}
            onChange={(e) => setPhotoUrl(e.target.value)}
            placeholder="Paste an image URL (e.g. travel photo, landscape, photo link)..."
            className="flex-1 px-3 py-1 text-xs bg-white rounded-lg border border-stone-300 text-stone-800 outline-none"
          />
          <button
            onClick={handleAddPhoto}
            className="px-3 py-1 text-xs font-medium bg-stone-800 text-white rounded-lg hover:bg-stone-900"
          >
            Attach Photo
          </button>
          <button
            onClick={() => setShowPhotoInput(false)}
            className="px-2 py-1 text-xs text-stone-500 hover:text-stone-800"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Journal Book Container (Middle Page) */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 flex justify-center">
        <div
          className={`w-full max-w-3xl min-h-[750px] rounded-2xl shadow-md border ${paperClass.borderClass} ${paperClass.containerClass} flex flex-col p-6 sm:p-10 md:p-14 relative transition-colors duration-300`}
        >
          {/* Subtle Diary Book Spine visual hint */}
          <div className="absolute top-0 bottom-0 left-3 w-px bg-stone-400/20 pointer-events-none hidden sm:block" />

          {/* Top Metadata Row: Date, Location, Weather, User Mood */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-stone-300/40 text-xs text-stone-500">
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-stone-400" />
              <input
                type="date"
                value={entry.date.split('T')[0]}
                onChange={(e) => {
                  const d = new Date(e.target.value);
                  if (!isNaN(d.getTime())) {
                    onUpdateEntry({ date: d.toISOString() });
                  }
                }}
                className="bg-transparent border-b border-transparent hover:border-stone-300 focus:border-stone-500 outline-none text-inherit cursor-pointer"
              />
              <span className="hidden sm:inline text-stone-400">·</span>
              <span className="hidden sm:inline">{dateInfo.time}</span>
            </div>

            {/* Location & Weather & Stated Mood Inputs */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-stone-400" />
                <input
                  type="text"
                  value={entry.location || ''}
                  onChange={(e) => onUpdateEntry({ location: e.target.value })}
                  placeholder="Add location..."
                  className="w-24 sm:w-32 bg-transparent text-xs placeholder:text-stone-400 outline-none border-b border-transparent hover:border-stone-300 focus:border-stone-500"
                />
              </div>

              <div className="flex items-center gap-1">
                <CloudSun className="w-3 h-3 text-stone-400" />
                <input
                  type="text"
                  value={entry.weather || ''}
                  onChange={(e) => onUpdateEntry({ weather: e.target.value })}
                  placeholder="Weather..."
                  className="w-20 sm:w-24 bg-transparent text-xs placeholder:text-stone-400 outline-none border-b border-transparent hover:border-stone-300 focus:border-stone-500"
                />
              </div>

              <div className="flex items-center gap-1">
                <Smile className="w-3 h-3 text-stone-400" />
                <select
                  value={entry.userMoodTag || 'peaceful'}
                  onChange={(e) => onUpdateEntry({ userMoodTag: e.target.value })}
                  className="bg-transparent text-xs text-stone-600 outline-none cursor-pointer"
                  aria-label="Diary mood selector"
                >
                  <option value="peaceful">Peaceful</option>
                  <option value="joyful">Joyful</option>
                  <option value="reflective">Reflective</option>
                  <option value="grateful">Grateful</option>
                  <option value="anxious">Anxious</option>
                  <option value="melancholy">Melancholy</option>
                  <option value="energetic">Energetic</option>
                </select>
              </div>
            </div>
          </div>

          {/* Title Input */}
          <div className="pt-6 pb-2">
            <input
              type="text"
              value={entry.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Title of your reflection..."
              className={`w-full bg-transparent text-2xl sm:text-3xl font-medium outline-none placeholder:text-stone-400/70 ${
                entry.fontChoice === 'playfair' || entry.fontChoice === 'cormorant'
                  ? 'font-serif'
                  : ''
              } ${fontClass}`}
            />
          </div>

          {/* Attached Photos Showcase */}
          {entry.photos && entry.photos.length > 0 && (
            <div className="flex flex-wrap gap-3 my-4">
              {entry.photos.map((src, i) => (
                <div key={i} className="relative group rounded-xl overflow-hidden border border-stone-200/80 shadow-xs max-w-[200px]">
                  <img
                    src={src}
                    alt={`Memory ${i + 1}`}
                    referrerPolicy="no-referrer"
                    className="w-full h-32 object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLElement).style.display = 'none';
                    }}
                  />
                  <button
                    onClick={() => removePhoto(i)}
                    className="absolute top-1 right-1 p-1 bg-stone-900/70 text-white rounded-md text-[10px] opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Remove photo"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Main Diary Content Writing Textarea */}
          <div className="flex-1 mt-4 relative">
            <textarea
              value={entry.content}
              onChange={(e) => handleContentChange(e.target.value)}
              placeholder="Write your thoughts freely... How are you feeling today? What moments stayed with you?"
              className={`w-full h-full min-h-[460px] bg-transparent resize-none outline-none leading-relaxed text-base sm:text-lg ${fontClass} ${paperClass.textClass}`}
              autoFocus
            />
          </div>

          {/* Bottom Diary Footer: Word Count, Reading Time, Save status */}
          <div className="pt-4 mt-6 border-t border-stone-300/30 flex items-center justify-between text-xs text-stone-400">
            <div className="flex items-center gap-3">
              <span>{entry.wordCount || 0} words</span>
              <span aria-hidden="true">·</span>
              <span>{entry.readingTimeMinutes || 1} min read</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-[11px] text-stone-400">
                <Check className="w-3 h-3 text-emerald-600" />
                <span>{saveStatus === 'saving' ? 'Saving...' : 'Saved to diary'}</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
