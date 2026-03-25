'use client';
import { useBuilderStore } from '@/lib/store';
import { motion, AnimatePresence } from 'framer-motion';
import PortfolioPreview from '../preview/PortfolioPreview';
import SectionEditor from './SectionEditor';

const DEVICE_WIDTHS: Record<string, string> = {
  desktop: '100%',
  tablet: '768px',
  mobile: '390px',
};

export default function BuilderCanvas() {
  const { getActivePortfolio, deviceView, previewMode, activeSection, canvasZoom } = useBuilderStore();
  const portfolio = getActivePortfolio();

  if (!portfolio) return null;

  const isNarrow = deviceView !== 'desktop';

  return (
    <main className="flex-1 overflow-auto bg-[#060606] flex flex-col items-center p-6 gap-4"
      style={{ backgroundImage: 'radial-gradient(circle, #ffffff08 1px, transparent 1px)', backgroundSize: '24px 24px' }}>

      {/* Device frame */}
      <div className="transition-all duration-300 w-full" style={{ maxWidth: DEVICE_WIDTHS[deviceView] }}>
        <div
          className="origin-top transition-transform duration-200"
          style={{ transform: `scale(${canvasZoom / 100})`, transformOrigin: 'top center' }}
        >
          <div className={`bg-[#111] rounded-2xl overflow-hidden border border-white/10 shadow-2xl ${isNarrow ? 'mx-auto' : ''}`}>
            {/* Browser chrome */}
            <div className="flex items-center gap-2 px-4 py-2.5 bg-[#1a1a1a] border-b border-white/10 select-none">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/70" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                <div className="w-3 h-3 rounded-full bg-green-500/70" />
              </div>
              <div className="flex-1 bg-white/5 rounded-md px-3 py-1 text-xs text-gray-500 text-center truncate">
                {portfolio.slug}.portfolio.dev
              </div>
              <div className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${portfolio.published ? 'bg-green-500' : 'bg-gray-600'}`} />
                <span className="text-xs text-gray-600">{portfolio.published ? 'Live' : 'Draft'}</span>
              </div>
            </div>

            {/* Preview content */}
            <div className="overflow-y-auto" style={{ maxHeight: `calc(${100 / (canvasZoom / 100)}vh - 160px)` }}>
              <PortfolioPreview portfolio={portfolio} />
            </div>
          </div>
        </div>
      </div>

      {/* Section editor panel */}
      <AnimatePresence>
        {activeSection && !previewMode && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="w-full sticky bottom-0"
            style={{ maxWidth: DEVICE_WIDTHS[deviceView] }}
          >
            <SectionEditor sectionId={activeSection} />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
