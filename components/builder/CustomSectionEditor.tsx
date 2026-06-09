'use client';

import { Layout, Palette, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import { useBuilderStore } from '@/lib/store';
import type { CustomContentWidth, CustomLayoutId } from '@/lib/types';
import {
  CUSTOM_CONTAINER_OPTIONS,
  CUSTOM_LAYOUT_OPTIONS,
  CUSTOM_WIDTH_OPTIONS,
  getCustomSection,
  normalizeCustomLayout,
} from '@/lib/custom-section';
import CustomBlocksEditor from './CustomBlocksEditor';

interface Props { sectionId: string; }

function LayoutThumb({ id }: { id: CustomLayoutId }) {
  const box = 'rounded-[3px] bg-violet-500/70';
  const dim = 'rounded-[2px] bg-white/25';

  switch (id) {
    case 'default':
      return (
        <div className="h-full p-1.5">
          <div className="h-full rounded border border-white/15 p-1 flex flex-col gap-1">
            <div className={`h-1.5 w-2/3 ${dim}`} />
            <div className={`flex-1 ${box} opacity-60`} />
          </div>
        </div>
      );
    case 'centered':
      return (
        <div className="flex flex-col items-center justify-center gap-1 h-full p-1.5">
          <div className={`h-1.5 w-3/4 ${dim}`} />
          <div className={`h-1 w-full ${dim}`} />
          <div className={`w-8 h-4 ${box}`} />
        </div>
      );
    case 'split':
      return (
        <div className="flex gap-1 h-full p-1.5">
          <div className="flex-1 flex flex-col gap-0.5 justify-center"><div className={`h-1 w-full ${dim}`} /><div className={`h-1 w-4/5 ${dim}`} /></div>
          <div className={`w-[42%] ${box}`} />
        </div>
      );
    case 'magazine':
      return (
        <div className="flex flex-col gap-1 h-full p-1.5">
          <div className={`h-2 w-full ${dim}`} />
          <div className="flex gap-1 flex-1"><div className={`flex-1 ${box}`} /><div className={`flex-1 ${box} opacity-70`} /></div>
        </div>
      );
    case 'columns-2':
      return (
        <div className="grid grid-cols-2 gap-1 h-full p-1.5">
          <div className={`${box}`} /><div className={`${box} opacity-80`} />
        </div>
      );
    case 'columns-3':
      return (
        <div className="grid grid-cols-3 gap-0.5 h-full p-1.5">
          <div className={box} /><div className={`${box} opacity-85`} /><div className={`${box} opacity-70`} />
        </div>
      );
    case 'bento':
      return (
        <div className="grid grid-cols-3 grid-rows-2 gap-0.5 h-full p-1.5">
          <div className={`col-span-2 ${box}`} /><div className={box} /><div className={box} /><div className={`col-span-2 ${box} opacity-80`} />
        </div>
      );
    case 'strip':
      return (
        <div className="flex gap-0.5 h-full items-stretch p-1.5">
          <div className={`flex-1 ${box}`} /><div className={`flex-1 ${box} opacity-85`} /><div className={`flex-1 ${box} opacity-70`} />
        </div>
      );
    case 'banner':
      return (
        <div className="h-full p-1"><div className={`h-full rounded ${box} flex items-center justify-center`}><div className={`h-1 w-1/2 bg-white/30 rounded`} /></div></div>
      );
    case 'minimal':
      return (
        <div className="flex flex-col gap-1 h-full p-1.5 justify-center">
          <div className={`h-1 w-2/3 ${dim}`} /><div className={`h-1 w-full ${dim}`} /><div className={`h-1 w-4/5 ${dim}`} />
        </div>
      );
    default:
      return null;
  }
}

export default function CustomSectionEditor({ sectionId }: Props) {
  const { getActivePortfolio, updateSectionStyle } = useBuilderStore();
  const portfolio = getActivePortfolio();
  const section = portfolio?.sections.find(s => s.id === sectionId);
  if (!section) return null;

  const cs = getCustomSection(section);
  const layout = normalizeCustomLayout(cs.layout);

  const patch = (patch: Partial<typeof cs>) => {
    updateSectionStyle(sectionId, { customSection: { ...cs, ...patch } });
  };

  return (
    <div className="col-span-full space-y-4 mb-2">
      <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-3 space-y-3">
        <div className="flex items-center gap-2">
          <Layout className="w-4 h-4 text-violet-400 shrink-0" />
          <div>
            <p className="text-xs font-semibold text-white">Section Layout</p>
            <p className="text-[10px] text-gray-500">Choose how your custom section is structured</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[220px] overflow-y-auto pr-1">
          {CUSTOM_LAYOUT_OPTIONS.map(opt => {
            const active = layout === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => patch({ layout: opt.id })}
                className={`rounded-xl border text-left overflow-hidden transition ${
                  active ? 'border-violet-500 bg-violet-600/15 ring-1 ring-violet-500/40' : 'border-white/10 bg-white/[0.03] hover:border-white/20'
                }`}
              >
                <div className="h-[44px] bg-[#0a0a0a]/80 border-b border-white/5"><LayoutThumb id={opt.id} /></div>
                <div className="px-2 py-1.5">
                  <p className={`text-[10px] font-semibold ${active ? 'text-white' : 'text-gray-300'}`}>{opt.label}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 space-y-3">
        <div className="flex items-center gap-2">
          <Palette className="w-4 h-4 text-gray-400 shrink-0" />
          <p className="text-xs font-semibold text-white">Appearance</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1.5">Container</p>
            <div className="flex flex-wrap gap-1">
              {CUSTOM_CONTAINER_OPTIONS.map(c => (
                <button key={c.id} type="button" onClick={() => patch({ container: c.id })}
                  className={`text-[10px] px-2 py-1 rounded-md border transition ${
                    cs.container === c.id ? 'border-violet-500 bg-violet-500/15 text-white' : 'border-white/10 text-gray-400 hover:text-white'
                  }`}>{c.label}</button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1.5">Content width</p>
            <div className="flex flex-wrap gap-1">
              {CUSTOM_WIDTH_OPTIONS.map(w => (
                <button key={w.id} type="button" onClick={() => patch({ contentWidth: w.id as CustomContentWidth })}
                  className={`text-[10px] px-2 py-1 rounded-md border transition ${
                    cs.contentWidth === w.id ? 'border-violet-500 bg-violet-500/15 text-white' : 'border-white/10 text-gray-400 hover:text-white'
                  }`}>{w.label}</button>
              ))}
            </div>
          </div>
        </div>
        <div>
          <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1.5">Text alignment</p>
          <div className="flex gap-1">
            {([
              { id: 'left' as const, icon: AlignLeft },
              { id: 'center' as const, icon: AlignCenter },
              { id: 'right' as const, icon: AlignRight },
            ]).map(({ id, icon: Icon }) => (
              <button key={id} type="button" onClick={() => patch({ align: id })}
                className={`flex items-center gap-1 text-[10px] px-2.5 py-1.5 rounded-md border transition ${
                  cs.align === id ? 'border-violet-500 bg-violet-500/15 text-white' : 'border-white/10 text-gray-400 hover:text-white'
                }`}>
                <Icon className="w-3 h-3" /> {id}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap gap-3 pt-1">
          <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer">
            <input type="checkbox" checked={!cs.hideTitle} onChange={e => patch({ hideTitle: !e.target.checked })} className="rounded" />
            Show title
          </label>
          <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer">
            <input type="checkbox" checked={!cs.hideSubtitle} onChange={e => patch({ hideSubtitle: !e.target.checked })} className="rounded" />
            Show subtitle
          </label>
          <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer">
            <input type="checkbox" checked={cs.showBadge !== false} onChange={e => patch({ showBadge: e.target.checked })} className="rounded" />
            Show badge
          </label>
          {cs.showBadge !== false && (
            <input
              value={cs.badgeText || 'Custom'}
              onChange={e => patch({ badgeText: e.target.value })}
              placeholder="Badge text"
              className="text-xs bg-white/5 border border-white/10 rounded-md px-2 py-1 text-white w-28"
            />
          )}
        </div>
      </div>

      <CustomBlocksEditor sectionId={sectionId} />
    </div>
  );
}
