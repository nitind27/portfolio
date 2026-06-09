'use client';

import { Layout } from 'lucide-react';
import { useBuilderStore } from '@/lib/store';
import { ABOUT_LAYOUT_OPTIONS, normalizeAboutLayout, type AboutLayoutId } from '@/lib/about-layouts';

interface Props { sectionId: string; }

function LayoutThumb({ id }: { id: AboutLayoutId }) {
  const box = 'rounded-[3px] bg-blue-500/70';
  const dim = 'rounded-[2px] bg-white/25';

  switch (id) {
    case 'split':
      return (
        <div className="flex gap-1 h-full items-stretch p-1.5">
          <div className={`w-[38%] ${box}`} />
          <div className="flex-1 flex flex-col gap-0.5 justify-center">
            <div className={`h-1 w-full ${dim}`} />
            <div className={`h-1 w-4/5 ${dim}`} />
            <div className={`h-1 w-3/5 ${dim}`} />
          </div>
        </div>
      );
    case 'image-right':
      return (
        <div className="flex gap-1 h-full items-stretch p-1.5">
          <div className="flex-1 flex flex-col gap-0.5 justify-center">
            <div className={`h-1 w-full ${dim}`} />
            <div className={`h-1 w-4/5 ${dim}`} />
            <div className={`h-1 w-3/5 ${dim}`} />
          </div>
          <div className={`w-[38%] ${box}`} />
        </div>
      );
    case 'centered':
      return (
        <div className="flex flex-col items-center gap-1 h-full p-1.5 justify-center">
          <div className={`w-8 h-8 rounded-full ${box}`} />
          <div className={`h-1 w-3/4 ${dim}`} />
          <div className={`h-1 w-full ${dim}`} />
          <div className={`h-1 w-2/3 ${dim}`} />
        </div>
      );
    case 'wide':
      return (
        <div className="flex gap-1 h-full items-stretch p-1.5">
          <div className="w-[32%] flex flex-col gap-0.5 justify-center">
            <div className={`h-1 w-full ${dim}`} />
            <div className={`h-1 w-4/5 ${dim}`} />
          </div>
          <div className={`flex-1 ${box}`} />
        </div>
      );
    case 'stacked':
      return (
        <div className="flex flex-col gap-1 h-full p-1.5">
          <div className={`h-[45%] w-full ${box}`} />
          <div className="flex-1 flex flex-col gap-0.5 justify-center">
            <div className={`h-1 w-full ${dim}`} />
            <div className={`h-1 w-4/5 ${dim}`} />
          </div>
        </div>
      );
    case 'minimal':
      return (
        <div className="flex gap-1.5 h-full items-center p-1.5">
          <div className={`w-7 h-7 rounded-full shrink-0 ${box}`} />
          <div className="flex-1 flex flex-col gap-0.5">
            <div className={`h-1 w-full ${dim}`} />
            <div className={`h-1 w-4/5 ${dim}`} />
            <div className={`h-1 w-3/5 ${dim}`} />
          </div>
        </div>
      );
    case 'overlap':
      return (
        <div className="relative h-full p-1.5">
          <div className={`absolute left-1.5 top-1.5 w-[55%] h-[70%] ${box}`} />
          <div className="absolute right-1 bottom-1 left-[28%] top-[35%] rounded-[3px] bg-white/15 border border-white/20 flex flex-col gap-0.5 justify-center px-1">
            <div className={`h-0.5 w-full ${dim}`} />
            <div className={`h-0.5 w-4/5 ${dim}`} />
          </div>
        </div>
      );
    case 'card':
      return (
        <div className="h-full p-1.5">
          <div className="h-full rounded-[4px] border border-white/20 bg-white/5 p-1 flex flex-col gap-1">
            <div className={`h-[40%] w-full ${box}`} />
            <div className={`h-1 w-full ${dim}`} />
            <div className={`h-1 w-4/5 ${dim}`} />
          </div>
        </div>
      );
    default:
      return null;
  }
}

export default function AboutLayoutEditor({ sectionId }: Props) {
  const { getActivePortfolio, updateField } = useBuilderStore();
  const portfolio = getActivePortfolio();
  const section = portfolio?.sections.find(s => s.id === sectionId);
  if (!section) return null;

  const current = normalizeAboutLayout(
    section.fields.find(f => f.id === 'aboutLayout')?.value as string | undefined,
  );

  const setLayout = (id: AboutLayoutId) => updateField(sectionId, 'aboutLayout', id);

  return (
    <div className="mb-4 space-y-3 rounded-xl border border-blue-500/20 bg-blue-500/5 p-3">
      <div className="flex items-center gap-2">
        <Layout className="w-4 h-4 text-blue-400 shrink-0" />
        <div>
          <p className="text-xs font-semibold text-white">Layout Style</p>
          <p className="text-[10px] text-gray-500">How photo and text are arranged on your About section</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {ABOUT_LAYOUT_OPTIONS.map(opt => {
          const active = current === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => setLayout(opt.id)}
              className={`rounded-xl border text-left overflow-hidden transition ${
                active
                  ? 'border-blue-500 bg-blue-600/15 ring-1 ring-blue-500/40'
                  : 'border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]'
              }`}
            >
              <div className="h-[52px] bg-[#0a0a0a]/80 border-b border-white/5">
                <LayoutThumb id={opt.id} />
              </div>
              <div className="px-2.5 py-2">
                <p className={`text-[11px] font-semibold ${active ? 'text-white' : 'text-gray-300'}`}>{opt.label}</p>
                <p className="text-[9px] text-gray-500 mt-0.5 leading-tight">{opt.description}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
