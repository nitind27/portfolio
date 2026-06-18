'use client';

import { useState } from 'react';
import { HelpCircle } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import BuilderHelpPanel from './BuilderHelpPanel';
import type { RightTab } from '../Builder';
import type { SectionType } from '@/lib/types';

interface Props {
  rightTab: RightTab;
  setRightTab: (tab: RightTab) => void;
  activeSectionType?: SectionType;
  activeSectionTitle?: string;
  previewMode: boolean;
  sectionCount: number;
  onShowTour: () => void;
}

export default function BuilderHelpFab({
  rightTab,
  setRightTab,
  activeSectionType,
  activeSectionTitle,
  previewMode,
  sectionCount,
  onShowTour,
}: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Side tab — clear of bottom mobile nav */}
      <AnimatePresence>
        {!open && (
          <motion.button
            type="button"
            data-tour="builder-help"
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 8 }}
            onClick={() => setOpen(true)}
            className="fixed z-40 flex flex-col items-center justify-center gap-1 px-1.5 py-3 rounded-l-xl shadow-lg border border-r-0 border-blue-500/30 bg-[#141414] hover:bg-[#1a1a1a] text-blue-300 hover:text-blue-200 transition right-0 top-1/2 -translate-y-1/2"
            title="Help & tips"
            aria-label="Open help and tips"
          >
            <HelpCircle className="w-4 h-4" />
            <span className="text-[9px] font-bold uppercase tracking-wider [writing-mode:vertical-rl] rotate-180">
              Help
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Side drawer — no backdrop, builder stays clickable behind */}
      <AnimatePresence>
        {open && (
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="fixed z-40 top-12 bottom-14 lg:bottom-0 right-0 w-[min(100vw,340px)] bg-[#0d0d0d] border-l border-white/10 shadow-[-8px_0_32px_rgba(0,0,0,0.45)] flex flex-col pointer-events-auto"
            aria-label="Builder help panel"
          >
            <BuilderHelpPanel
              variant="drawer"
              rightTab={rightTab}
              activeSectionType={activeSectionType}
              activeSectionTitle={activeSectionTitle}
              previewMode={previewMode}
              sectionCount={sectionCount}
              onClose={() => setOpen(false)}
              onShowTour={() => { setOpen(false); onShowTour(); }}
              onNavigateTab={(tab) => { setRightTab(tab); setOpen(false); }}
            />
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
