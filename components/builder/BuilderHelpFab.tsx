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
      <button
        type="button"
        data-tour="builder-help"
        onClick={() => setOpen(true)}
        className="fixed z-[9000] flex items-center gap-2 px-3.5 py-2.5 rounded-full shadow-lg shadow-blue-500/20 border border-blue-500/30 bg-[#141414] hover:bg-[#1a1a1a] text-blue-300 hover:text-blue-200 transition bottom-[4.5rem] right-4 lg:bottom-6"
        title="Help & tips"
      >
        <HelpCircle className="w-4 h-4" />
        <span className="text-xs font-semibold">Help</span>
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-[9001]"
              onClick={() => setOpen(false)}
            />
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-[380px] z-[9002] bg-[#0d0d0d] border-l border-white/10 shadow-2xl flex flex-col"
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
          </>
        )}
      </AnimatePresence>
    </>
  );
}
