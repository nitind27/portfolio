'use client';
import { useEffect, useRef } from 'react';
import { useBuilderStore } from '@/lib/store';
import { motion, AnimatePresence } from 'framer-motion';
import PortfolioPreview from '../preview/PortfolioPreview';
import SectionEditor from './SectionEditor';
import { Eye } from 'lucide-react';
import type { RightTab } from '../Builder';
import { previewSiteUrl } from '@/lib/brand';

const DEVICE_WIDTHS: Record<string, number | string> = {
  desktop: '100%',
  tablet: 768,
  mobile: 390,
};

export default function BuilderCanvas({ rightTab, onSectionSelect }: { rightTab: RightTab; onSectionSelect: (id: string) => void }) {
  const {
    getActivePortfolio, deviceView, previewMode, activeSection, canvasZoom, setCanvasZoom,
  } = useBuilderStore();
  const portfolio = getActivePortfolio();
  const isNarrow = deviceView !== 'desktop';
  const devicePx = typeof DEVICE_WIDTHS[deviceView] === 'number' ? DEVICE_WIDTHS[deviceView] as number : null;
  const previewContentRef = useRef<HTMLDivElement>(null);

  const editorOpen = Boolean(activeSection && !previewMode && rightTab === 'sections');

  useEffect(() => {
    if (!devicePx) return;
    const fit = () => {
      const available = window.innerWidth - 32;
      if (available < devicePx) {
        const zoom = Math.max(50, Math.min(100, Math.floor((available / devicePx) * 100)));
        setCanvasZoom(zoom);
      }
    };
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, [deviceView, devicePx, setCanvasZoom]);

  useEffect(() => {
    if (!activeSection || !previewContentRef.current) return;
    const el = previewContentRef.current.querySelector(`#${CSS.escape(activeSection)}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [activeSection]);

  if (!portfolio) return null;

  return (
    <main data-tour="canvas-preview" className="flex-1 flex flex-col min-h-0 overflow-hidden bg-[#060606]">
      {editorOpen && (
        <div className="hidden lg:flex items-center justify-between gap-2 px-4 py-2 bg-blue-600/10 border-b border-blue-500/20 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <Eye className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <span className="text-xs text-blue-300 truncate">
              Edit mode — click sections or use the right panel. Changes appear instantly.
            </span>
          </div>
          <span className="text-[10px] text-blue-400/70 shrink-0">Need help? Tap Help ↘</span>
        </div>
      )}

      <div
        className="flex-1 min-h-0 overflow-auto"
        style={{ backgroundImage: 'radial-gradient(circle, #ffffff08 1px, transparent 1px)', backgroundSize: '24px 24px' }}
      >
        <div className="flex justify-center items-start p-3 sm:p-6 min-h-full">
          <div className="transition-all duration-300 w-full shrink-0" style={{ maxWidth: DEVICE_WIDTHS[deviceView] }}>
            <div
              className="origin-top transition-transform duration-200 mx-auto"
              style={{ transform: `scale(${canvasZoom / 100})`, transformOrigin: 'top center', width: devicePx ? devicePx : '100%' }}
            >
              <div className={`bg-[#111] rounded-2xl overflow-hidden border border-white/10 shadow-2xl ${isNarrow ? 'mx-auto' : ''}`}>
                <div className="flex items-center gap-2 px-4 py-2.5 bg-[#1a1a1a] border-b border-white/10 select-none">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/70" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                    <div className="w-3 h-3 rounded-full bg-green-500/70" />
                  </div>
                  <div className="flex-1 bg-white/5 rounded-md px-3 py-1 text-xs text-gray-500 text-center truncate">
                    {previewSiteUrl(portfolio.slug)}
                  </div>
                </div>

                <div
                  ref={previewContentRef}
                  data-preview-scroll-root
                  className={`relative overflow-y-auto overflow-x-hidden w-full ${
                    editorOpen ? 'max-h-[46vh] lg:max-h-[calc(100vh-7.5rem)]' : ''
                  }`}
                  style={editorOpen ? undefined : {
                    maxHeight: `calc(${100 / (canvasZoom / 100)}vh - ${deviceView === 'mobile' ? '140px' : '100px'})`,
                  }}
                >
                  <PortfolioPreview
                    portfolio={portfolio}
                    deviceView={deviceView}
                    activeSectionId={activeSection}
                    onSectionSelect={previewMode ? undefined : onSectionSelect}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {editorOpen && (
          <motion.div
            key="section-editor-mobile"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            className="lg:hidden shrink-0 border-t border-blue-500/20 bg-[#080808] overflow-y-auto max-h-[45vh]"
          >
            <SectionEditor key={activeSection} sectionId={activeSection!} variant="sidebar" />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
