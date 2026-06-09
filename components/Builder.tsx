'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useBuilderStore } from '@/lib/store';
import BuilderSidebar from './builder/BuilderSidebar';
import BuilderCanvas from './builder/BuilderCanvas';
import BuilderTopbar from './builder/BuilderTopbar';
import BuilderRightPanel from './builder/BuilderRightPanel';
import ResizeHandle from './builder/ResizeHandle';
import { useDesktopLayout } from './builder/useDesktopLayout';
import KeyboardShortcutsModal from './builder/KeyboardShortcutsModal';
import OnboardingTour from './builder/OnboardingTour';
import BuilderHelpFab from './builder/BuilderHelpFab';
import { BUILDER_TOUR_STEPS } from '@/lib/tour-steps';
import { clampSidebarWidth, loadBuilderLayout, saveBuilderLayout } from '@/lib/builder-layout';
import { Layers, Eye, Settings2 } from 'lucide-react';

export type RightTab = 'sections' | 'theme' | 'navbar' | 'footer' | 'seo' | 'smtp' | 'templates' | 'popup' | 'social' | 'analytics' | 'css';

export default function Builder() {
  const [rightTab, setRightTab] = useState<RightTab>('sections');
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showTour, setShowTour] = useState(false);
  const [leftWidth, setLeftWidth] = useState(208);
  const [rightWidth, setRightWidth] = useState(288);
  const leftWidthRef = useRef(leftWidth);
  const rightWidthRef = useRef(rightWidth);
  const isDesktop = useDesktopLayout();
  const {
    undo, redo, canUndo, canRedo, setPreviewMode, previewMode,
    hasSeenBuilderTour, completeBuilderTour, mobilePanel, setMobilePanel,
    setActiveSection, activeSection, getActivePortfolio,
  } = useBuilderStore();

  const portfolio = getActivePortfolio();
  const activeSectionData = portfolio?.sections.find(s => s.id === activeSection);

  const focusSectionEditor = useCallback((sectionId: string) => {
    setActiveSection(sectionId);
    setRightTab('sections');
  }, [setActiveSection]);

  useEffect(() => {
    const layout = loadBuilderLayout();
    setLeftWidth(layout.left);
    setRightWidth(layout.right);
    leftWidthRef.current = layout.left;
    rightWidthRef.current = layout.right;
  }, []);

  const resizeLeft = useCallback((delta: number) => {
    setLeftWidth(w => {
      const next = clampSidebarWidth(w + delta, 'left');
      leftWidthRef.current = next;
      return next;
    });
  }, []);

  const resizeRight = useCallback((delta: number) => {
    setRightWidth(w => {
      const next = clampSidebarWidth(w + delta, 'right');
      rightWidthRef.current = next;
      return next;
    });
  }, []);

  const saveLayout = useCallback(() => {
    saveBuilderLayout(leftWidthRef.current, rightWidthRef.current);
  }, []);

  useEffect(() => {
    if (!hasSeenBuilderTour) {
      const t = setTimeout(() => setShowTour(true), 600);
      return () => clearTimeout(t);
    }
  }, [hasSeenBuilderTour]);

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

  const handleTourStep = useCallback((step: typeof BUILDER_TOUR_STEPS[number]) => {
    if (step.mobilePanel) setMobilePanel(step.mobilePanel);
    if (step.target === 'settings-panel') setRightTab('theme');
    if (step.target === 'panel-tabs') setRightTab('theme');
  }, [setMobilePanel]);

  const handleTourComplete = () => {
    setShowTour(false);
    completeBuilderTour();
  };

  const restartTour = () => {
    setShowTour(true);
  };

  return (
    <div className="h-screen bg-[#0a0a0a] text-white flex flex-col overflow-hidden">
      <BuilderTopbar
        rightTab={rightTab}
        setRightTab={setRightTab}
        onShowShortcuts={() => setShowShortcuts(true)}
        onShowTour={restartTour}
      />

      <div className="flex flex-1 overflow-hidden min-h-0">
        <div
          className={`${mobilePanel === 'sections' ? 'flex' : 'hidden'} lg:flex h-full shrink-0 relative w-full`}
          style={isDesktop ? { width: leftWidth } : undefined}
        >
          <BuilderSidebar onSectionSelect={focusSectionEditor} />
          <ResizeHandle side="left" onResize={resizeLeft} onResizeEnd={saveLayout} />
        </div>

        <div className={`${mobilePanel === 'preview' ? 'flex' : 'hidden'} lg:flex flex-1 min-w-0 flex-col`}>
          <BuilderCanvas rightTab={rightTab} onSectionSelect={focusSectionEditor} />
        </div>

        <div
          className={`${mobilePanel === 'settings' ? 'flex' : 'hidden'} lg:flex h-full shrink-0 relative w-full`}
          style={isDesktop ? { width: rightWidth } : undefined}
        >
          <ResizeHandle side="right" onResize={resizeRight} onResizeEnd={saveLayout} />
          <BuilderRightPanel tab={rightTab} setTab={setRightTab} onShowTour={restartTour} />
        </div>
      </div>

      {/* Mobile bottom navigation */}
      <nav className="lg:hidden border-t border-white/10 bg-[#0d0d0d] flex shrink-0 safe-area-pb">
        {([
          { id: 'sections' as const, icon: Layers, label: 'Sections' },
          { id: 'preview' as const, icon: Eye, label: 'Preview' },
          { id: 'settings' as const, icon: Settings2, label: 'Settings' },
        ]).map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => setMobilePanel(id)}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 transition ${
              mobilePanel === id ? 'text-blue-400' : 'text-gray-500'
            }`}
          >
            <Icon className="w-5 h-5" />
            <span className="text-[10px] font-medium">{label}</span>
          </button>
        ))}
      </nav>

      {showShortcuts && <KeyboardShortcutsModal onClose={() => setShowShortcuts(false)} />}
      {showTour && (
        <OnboardingTour
          steps={BUILDER_TOUR_STEPS}
          onComplete={handleTourComplete}
          onStepChange={handleTourStep}
        />
      )}

      {portfolio && (
        <BuilderHelpFab
          rightTab={rightTab}
          setRightTab={setRightTab}
          activeSectionType={activeSectionData?.type}
          activeSectionTitle={activeSectionData?.title}
          previewMode={previewMode}
          sectionCount={portfolio.sections.length}
          onShowTour={restartTour}
        />
      )}
    </div>
  );
}
