'use client';
import { useState, useEffect } from 'react';
import { useBuilderStore } from '@/lib/store';
import BuilderSidebar from './builder/BuilderSidebar';
import BuilderCanvas from './builder/BuilderCanvas';
import BuilderTopbar from './builder/BuilderTopbar';
import BuilderRightPanel from './builder/BuilderRightPanel';
import KeyboardShortcutsModal from './builder/KeyboardShortcutsModal';

export type RightTab = 'sections' | 'theme' | 'seo' | 'smtp' | 'templates' | 'popup' | 'social' | 'analytics' | 'css';

export default function Builder() {
  const [rightTab, setRightTab] = useState<RightTab>('sections');
  const [showShortcuts, setShowShortcuts] = useState(false);
  const { undo, redo, canUndo, canRedo, setPreviewMode, previewMode } = useBuilderStore();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const ctrl = e.ctrlKey || e.metaKey;
      if (ctrl && e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo(); }
      if (ctrl && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) { e.preventDefault(); redo(); }
      if (ctrl && e.key === 'p') { e.preventDefault(); setPreviewMode(!previewMode); }
      if (e.key === '?' && !e.ctrlKey) setShowShortcuts(s => !s);
      if (e.key === 'Escape') setShowShortcuts(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [undo, redo, previewMode, setPreviewMode]);

  return (
    <div className="h-screen bg-[#0a0a0a] text-white flex flex-col overflow-hidden">
      <BuilderTopbar rightTab={rightTab} setRightTab={setRightTab} onShowShortcuts={() => setShowShortcuts(true)} />
      <div className="flex flex-1 overflow-hidden">
        <BuilderSidebar />
        <BuilderCanvas />
        <BuilderRightPanel tab={rightTab} setTab={setRightTab} />
      </div>
      {showShortcuts && <KeyboardShortcutsModal onClose={() => setShowShortcuts(false)} />}
    </div>
  );
}
