'use client';

import { useState } from 'react';
import { Lightbulb, ChevronDown, ChevronUp } from 'lucide-react';
import { getSectionHelp } from '@/lib/builder-help';
import type { SectionType } from '@/lib/types';

interface Props {
  sectionType: SectionType;
  sectionTitle: string;
}

export default function SectionHelpBanner({ sectionType, sectionTitle }: Props) {
  const [open, setOpen] = useState(true);
  const help = getSectionHelp(sectionType);

  return (
    <div className="mb-3 rounded-xl border border-amber-500/25 bg-amber-500/[0.06] overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-amber-500/[0.04] transition"
      >
        <Lightbulb className="w-3.5 h-3.5 text-amber-400 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-semibold text-amber-200/90 truncate">Tips for {sectionTitle}</p>
          {!open && <p className="text-[10px] text-amber-200/50 truncate">{help.summary}</p>}
        </div>
        {open ? <ChevronUp className="w-3.5 h-3.5 text-amber-400/60 shrink-0" /> : <ChevronDown className="w-3.5 h-3.5 text-amber-400/60 shrink-0" />}
      </button>
      {open && (
        <div className="px-3 pb-3 space-y-1.5 border-t border-amber-500/15">
          <p className="text-[10px] text-amber-200/60 pt-2 leading-relaxed">{help.summary}</p>
          {help.tips.slice(0, 3).map((tip, i) => (
            <div key={i} className="flex gap-2 text-[10px]">
              <span className="shrink-0">{tip.icon}</span>
              <span className="text-gray-400"><span className="text-gray-300 font-medium">{tip.title}</span> — {tip.description}</span>
            </div>
          ))}
          <p className="text-[10px] text-amber-200/50 pt-1 border-t border-amber-500/10">
            Animation tab → choose entrance style, then <strong className="text-amber-200/70">scroll the preview</strong> to see it play.
          </p>
        </div>
      )}
    </div>
  );
}
