import React, { useState, useEffect } from 'react';
import { X, Copy, Check, Download, Code2, FileCode, FileText, Database, FolderArchive } from 'lucide-react';

interface PythonExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'python' | 'html' | 'json';

export const PythonExportModal: React.FC<PythonExportModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabType>('python');
  const [copied, setCopied] = useState(false);
  const [fileContents, setFileContents] = useState<{ appPy: string; html: string; json: string }>({
    appPy: '',
    html: '',
    json: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    async function loadFiles() {
      try {
        setLoading(true);
        const res = await fetch('/api/export/flask-files');
        const data = await res.json();
        setFileContents({
          appPy: data.appPy || '',
          html: data.html || '',
          json: data.json || '',
        });
      } catch (err) {
        console.error('Failed to load export files:', err);
      } finally {
        setLoading(false);
      }
    }
    loadFiles();

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getCurrentCode = () => {
    if (activeTab === 'python') return fileContents.appPy;
    if (activeTab === 'html') return fileContents.html;
    return fileContents.json;
  };

  const getCurrentFileName = () => {
    if (activeTab === 'python') return 'app.py';
    if (activeTab === 'html') return 'templates/index.html';
    return 'data/diary_store.json';
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getCurrentCode());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSingle = () => {
    const code = getCurrentCode();
    const type =
      activeTab === 'python'
        ? 'text/x-python'
        : activeTab === 'html'
        ? 'text/html'
        : 'application/json';
    const blob = new Blob([code], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = activeTab === 'python' ? 'app.py' : activeTab === 'html' ? 'index.html' : 'diary_store.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadZip = () => {
    window.location.href = '/api/export/flask-zip';
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4 cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[#FAF9F5] border border-stone-200 rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col p-6 space-y-4 animate-in zoom-in-95 duration-200 cursor-default"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-200">
          <div className="flex items-center gap-2">
            <Code2 className="w-5 h-5 text-stone-700" />
            <div>
              <h3 className="font-serif text-lg font-medium text-stone-800">
                Pure HTML, Python Flask &amp; JSON Codebase
              </h3>
              <p className="text-xs text-stone-500">
                100% standalone codebase containing only HTML, Python (Flask), and JSON data.
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

        {/* Architecture Info Banner */}
        <div className="text-xs text-stone-600 space-y-1 bg-white p-3 rounded-xl border border-stone-200">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-stone-800">Complete Self-Contained Project:</span>
            <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Only: HTML + Python + JSON
            </span>
          </div>
          <p className="text-[11px] text-stone-500">
            Run locally with: <code className="bg-stone-100 px-1 py-0.5 rounded text-stone-700">pip install flask flask-cors</code> then <code className="bg-stone-100 px-1 py-0.5 rounded text-stone-700">python app.py</code>.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center justify-between border-b border-stone-200 gap-2">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveTab('python')}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-b-2 transition-all ${
                activeTab === 'python'
                  ? 'border-stone-800 text-stone-900 bg-stone-100/60 rounded-t-lg'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>app.py (Python Flask)</span>
            </button>
            <button
              onClick={() => setActiveTab('html')}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-b-2 transition-all ${
                activeTab === 'html'
                  ? 'border-stone-800 text-stone-900 bg-stone-100/60 rounded-t-lg'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>index.html (HTML Template)</span>
            </button>
            <button
              onClick={() => setActiveTab('json')}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-b-2 transition-all ${
                activeTab === 'json'
                  ? 'border-stone-800 text-stone-900 bg-stone-100/60 rounded-t-lg'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>diary_store.json (JSON Store)</span>
            </button>
          </div>

          <div className="text-[11px] font-mono text-stone-400 pb-1">
            {getCurrentFileName()}
          </div>
        </div>

        {/* Code Viewer */}
        <div className="flex-1 overflow-y-auto bg-stone-900 text-stone-200 p-4 rounded-xl font-mono text-xs leading-relaxed max-h-[380px] selection:bg-stone-700">
          {loading ? (
            <div className="py-12 text-center text-stone-400">Loading code...</div>
          ) : (
            <pre>{getCurrentCode()}</pre>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-between pt-2 border-t border-stone-200 gap-2">
          <button
            onClick={handleDownloadZip}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors"
          >
            <FolderArchive className="w-3.5 h-3.5" />
            <span>Download Complete Project (.ZIP)</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-700 bg-white hover:bg-stone-50 rounded-lg border border-stone-200 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy ' + getCurrentFileName()}</span>
            </button>
            <button
              onClick={handleDownloadSingle}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-stone-800 hover:bg-stone-900 rounded-lg transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download {getCurrentFileName()}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
