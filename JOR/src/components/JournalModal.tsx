import React, { useState } from 'react';
import { X, BookHeart, Compass, Sun, Mountain, Sparkles, Heart } from 'lucide-react';

interface JournalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateJournal: (name: string, description: string, icon: string, accentColor: string) => void;
}

export const JournalModal: React.FC<JournalModalProps> = ({
  isOpen,
  onClose,
  onCreateJournal,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('compass');
  const [accentColor, setAccentColor] = useState('#8C9A8E');

  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onCreateJournal(name.trim(), description.trim(), icon, accentColor);
    setName('');
    setDescription('');
    onClose();
  };

  const colorPresets = [
    { color: '#8C9A8E', name: 'Calm Sage' },
    { color: '#A89F91', name: 'Warm Stone' },
    { color: '#B89886', name: 'Dusty Clay' },
    { color: '#9797A6', name: 'Muted Lavender' },
    { color: '#7E919B', name: 'Nordic Slate' },
    { color: '#C0A278', name: 'Golden Wheat' },
  ];

  const iconOptions = [
    { id: 'compass', label: 'Trips & Travel', Icon: Compass },
    { id: 'book-heart', label: 'Daily Diary', Icon: BookHeart },
    { id: 'sun', label: 'Gratitude & Dawn', Icon: Sun },
    { id: 'mountain', label: 'Adventures', Icon: Mountain },
    { id: 'sparkles', label: 'Creative Ideas', Icon: Sparkles },
    { id: 'heart', label: 'Love & Relationships', Icon: Heart },
  ];

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4 cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[#FAF9F5] border border-stone-200 rounded-2xl shadow-xl w-full max-w-md p-6 space-y-5 animate-in zoom-in-95 duration-200 cursor-default"
      >
        <div className="flex items-center justify-between pb-3 border-b border-stone-200">
          <div>
            <h3 className="font-serif text-lg font-medium text-stone-800">
              Create New Journal
            </h3>
            <p className="text-xs text-stone-500">
              Separate your travel adventures, daily diary, or gratitude thoughts.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1">
              Journal Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Summer in Norway 2026, Morning Pages..."
              className="w-full px-3 py-2 text-sm bg-white rounded-xl border border-stone-200 text-stone-800 placeholder:text-stone-400 outline-none focus:border-stone-400"
              autoFocus
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1">
              Short Description (optional)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Hiking trails, train journals, and cabin musings..."
              className="w-full px-3 py-2 text-sm bg-white rounded-xl border border-stone-200 text-stone-800 placeholder:text-stone-400 outline-none focus:border-stone-400"
            />
          </div>

          {/* Icon Choice */}
          <div>
            <label className="block text-xs font-medium text-stone-700 mb-2">
              Select Journal Motif
            </label>
            <div className="grid grid-cols-3 gap-2">
              {iconOptions.map(({ id, label, Icon }) => (
                <button
                  type="button"
                  key={id}
                  onClick={() => setIcon(id)}
                  className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border text-xs transition-colors ${
                    icon === id
                      ? 'bg-white border-stone-400 text-stone-900 shadow-xs'
                      : 'bg-white/50 border-stone-200/80 text-stone-600 hover:bg-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-[10px] truncate max-w-full">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Color Accent */}
          <div>
            <label className="block text-xs font-medium text-stone-700 mb-2">
              Soothing Theme Color
            </label>
            <div className="flex items-center gap-2">
              {colorPresets.map((preset) => (
                <button
                  type="button"
                  key={preset.color}
                  onClick={() => setAccentColor(preset.color)}
                  className={`w-7 h-7 rounded-full border-2 transition-transform ${
                    accentColor === preset.color
                      ? 'border-stone-800 scale-110'
                      : 'border-transparent hover:scale-105'
                  }`}
                  style={{ backgroundColor: preset.color }}
                  title={preset.name}
                />
              ))}
            </div>
          </div>

          <div className="pt-3 flex items-center justify-end gap-2 border-t border-stone-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs text-stone-600 hover:text-stone-900 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="px-4 py-2 text-xs font-medium bg-stone-800 hover:bg-stone-900 text-white rounded-xl shadow-xs transition-colors disabled:opacity-50"
            >
              Create Journal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
