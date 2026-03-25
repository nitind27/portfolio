'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBuilderStore } from '@/lib/store';
import { exportPortfolio } from '@/lib/exporter';
import { saveAs } from 'file-saver';
import { ExportFormat } from '@/lib/types';
import { RightTab } from '../Builder';
import {
  Monitor, Tablet, Smartphone, Eye, EyeOff, Download, ArrowLeft,
  Layers, Palette, Search, Mail, LayoutTemplate, Megaphone, Share2,
  Undo2, Redo2, ZoomIn, ZoomOut, Keyboard, Globe, BarChart2, Code2,
  ChevronDown, CheckCircle2, Circle
} from 'lucide-react';

interface Props {
  rightTab: RightTab;
  setRightTab: (t: RightTab) => void;
  onShowShortcuts: () => void;
}

export default function BuilderTopbar({ rightTab, setRightTab, onShowShortcuts }: Props) {
  const {
    getActivePortfolio, deviceView, setDeviceView, previewMode, setPreviewMode,
    setActivePortfolio, updatePortfolioName, undo, redo, canUndo, canRedo,
    canvasZoom, setCanvasZoom, togglePublished,
  } = useBuilderStore();
  const portfolio = getActivePortfolio();
  const [exporting, setExporting] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameVal, setNameVal] = useState(portfolio?.name || '');
  const [showShare, setShowShare] = useState(false);

  if (!portfolio) return null;

  const handleExport = async (format: ExportFormat) => {
    setExporting(true);
    setShowExport(false);
    try {
      const blob = await exportPortfolio(portfolio, format);
      saveAs(blob, `${portfolio.name.replace(/\s/g, '-')}-${format}.zip`);
    } finally {
      setExporting(false);
    }
  };

  const tabs: { id: RightTab; icon: any; label: string }[] = [
    { id: 'sections', icon: Layers, label: 'Sections' },
    { id: 'theme', icon: Palette, label: 'Theme' },
    { id: 'templates', icon: LayoutTemplate, label: 'Templates' },
    { id: 'popup', icon: Megaphone, label: 'Popup' },
    { id: 'social', icon: Globe, label: 'Social' },
    { id: 'seo', icon: Search, label: 'SEO' },
    { id: 'smtp', icon: Mail, label: 'SMTP' },
    { id: 'analytics', icon: BarChart2, label: 'Analytics' },
    { id: 'css', icon: Code2, label: 'CSS' },
  ];

  const shareUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/p/${portfolio.slug}`;

  return (
    <header className="h-14 border-b border-white/10 flex items-center px-3 gap-2 bg-[#0d0d0d] shrink-0 overflow-x-auto">
      {/* Back */}
      <button onClick={() => setActivePortfolio('')} className="flex items-center gap-1 text-gray-400 hover:text-white transition shrink-0 p-1.5 rounded-lg hover:bg-white/5">
        <ArrowLeft className="w-4 h-4" />
      </button>

      {/* Name */}
      <div className="flex items-center gap-1.5 shrink-0">
        {editingName ? (
          <input value={nameVal} onChange={e => setNameVal(e.target.value)}
            onBlur={() => { updatePortfolioName(portfolio.id, nameVal); setEditingName(false); }}
            onKeyDown={e => { if (e.key === 'Enter') { updatePortfolioName(portfolio.id, nameVal); setEditingName(false); } }}
            className="bg-white/10 border border-indigo-500 rounded px-2 py-0.5 text-sm text-white focus:outline-none w-36"
            autoFocus />
        ) : (
          <button onClick={() => { setNameVal(portfolio.name); setEditingName(true); }}
            className="text-sm font-medium text-white hover:text-indigo-400 transition max-w-[120px] truncate">
            {portfolio.name}
          </button>
        )}
        {/* Published badge */}
        <button onClick={() => togglePublished(portfolio.id)}
          className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full transition ${portfolio.published ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-white/5 text-gray-500 border border-white/10'}`}>
          {portfolio.published ? <CheckCircle2 className="w-3 h-3" /> : <Circle className="w-3 h-3" />}
          {portfolio.published ? 'Live' : 'Draft'}
        </button>
      </div>

      <div className="w-px h-6 bg-white/10 shrink-0" />

      {/* Undo / Redo */}
      <div className="flex items-center gap-0.5 shrink-0">
        <button onClick={undo} disabled={!canUndo()} title="Undo (Ctrl+Z)"
          className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition">
          <Undo2 className="w-4 h-4" />
        </button>
        <button onClick={redo} disabled={!canRedo()} title="Redo (Ctrl+Y)"
          className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition">
          <Redo2 className="w-4 h-4" />
        </button>
      </div>

      <div className="w-px h-6 bg-white/10 shrink-0" />

      {/* Right panel tabs — scrollable */}
      <div className="flex items-center gap-0.5 overflow-x-auto no-scrollbar">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setRightTab(t.id)}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap shrink-0 ${rightTab === t.id ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
            <t.icon className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">{t.label}</span>
          </button>
        ))}
      </div>

      <div className="flex-1" />

      {/* Zoom */}
      <div className="flex items-center gap-1 bg-white/5 rounded-lg px-1 py-0.5 shrink-0">
        <button onClick={() => setCanvasZoom(canvasZoom - 10)} className="p-1 text-gray-400 hover:text-white transition">
          <ZoomOut className="w-3.5 h-3.5" />
        </button>
        <span className="text-xs text-gray-400 w-10 text-center font-mono">{canvasZoom}%</span>
        <button onClick={() => setCanvasZoom(canvasZoom + 10)} className="p-1 text-gray-400 hover:text-white transition">
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Device view */}
      <div className="flex items-center gap-0.5 bg-white/5 rounded-lg p-0.5 shrink-0">
        {[{ view: 'desktop', Icon: Monitor }, { view: 'tablet', Icon: Tablet }, { view: 'mobile', Icon: Smartphone }].map(({ view, Icon }) => (
          <button key={view} onClick={() => setDeviceView(view as any)}
            className={`p-1.5 rounded transition ${deviceView === view ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'}`}>
            <Icon className="w-3.5 h-3.5" />
          </button>
        ))}
      </div>

      {/* Preview */}
      <button onClick={() => setPreviewMode(!previewMode)} title="Ctrl+P"
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition shrink-0 ${previewMode ? 'bg-green-600 text-white' : 'bg-white/5 text-gray-400 hover:text-white'}`}>
        {previewMode ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
        <span className="hidden sm:inline">{previewMode ? 'Edit' : 'Preview'}</span>
      </button>

      {/* Share */}
      <div className="relative shrink-0">
        <button onClick={() => setShowShare(!showShare)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs bg-white/5 text-gray-400 hover:text-white transition">
          <Share2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Share</span>
        </button>
        <AnimatePresence>
          {showShare && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
              className="absolute right-0 top-full mt-2 bg-[#1a1a1a] border border-white/10 rounded-xl p-4 z-50 w-72 shadow-2xl">
              <p className="text-xs text-gray-400 mb-2">Portfolio URL</p>
              <div className="flex gap-2">
                <input readOnly value={shareUrl} className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-gray-300 focus:outline-none" />
                <button onClick={() => { navigator.clipboard.writeText(shareUrl); setShowShare(false); }}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-xs transition">Copy</button>
              </div>
              <p className="text-xs text-gray-600 mt-2">{portfolio.published ? '✅ Portfolio is live' : '⚠️ Set to Live to make it public'}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Export */}
      <div className="relative shrink-0">
        <button onClick={() => setShowExport(!showExport)} disabled={exporting}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs bg-indigo-600 hover:bg-indigo-500 transition disabled:opacity-50">
          <Download className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{exporting ? 'Exporting...' : 'Export'}</span>
          <ChevronDown className="w-3 h-3" />
        </button>
        <AnimatePresence>
          {showExport && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
              className="absolute right-0 top-full mt-2 bg-[#1a1a1a] border border-white/10 rounded-xl overflow-hidden z-50 w-48 shadow-2xl">
              {([
                { fmt: 'html', label: '🌐 HTML / CSS / JS', desc: 'Static files' },
                { fmt: 'react', label: '⚛️ React.js', desc: 'Vite + React' },
                { fmt: 'nextjs', label: '▲ Next.js', desc: 'App Router' },
              ] as const).map(({ fmt, label, desc }) => (
                <button key={fmt} onClick={() => handleExport(fmt)}
                  className="w-full text-left px-4 py-3 hover:bg-white/5 transition border-b border-white/5 last:border-0">
                  <p className="text-sm">{label}</p>
                  <p className="text-xs text-gray-500">{desc}</p>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Shortcuts */}
      <button onClick={onShowShortcuts} title="Keyboard shortcuts (?)"
        className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition shrink-0">
        <Keyboard className="w-4 h-4" />
      </button>
    </header>
  );
}
