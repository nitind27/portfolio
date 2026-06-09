'use client';
import { useState } from 'react';
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useBuilderStore } from '@/lib/store';
import { HeroBlockId, HeroContentSettings, SectionEntranceType } from '@/lib/types';
import {
  DEFAULT_HERO_CONTENT,
  getHeroContent,
  HERO_ALIGN_OPTIONS,
  HERO_BLOCK_LABELS,
} from '@/lib/hero-content';
import { ENTRANCE_PRESETS } from '@/lib/section-animation';
import { GripVertical, Eye, EyeOff, Layout, ChevronDown, ChevronUp } from 'lucide-react';

interface Props { sectionId: string; }

function SortableBlockRow({
  id,
  label,
  visible,
  onToggleVisible,
  children,
}: {
  id: HeroBlockId;
  label: string;
  visible: boolean;
  onToggleVisible: () => void;
  children?: React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const [open, setOpen] = useState(false);

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }}
      className={`rounded-xl border ${visible ? 'border-white/10 bg-white/3' : 'border-white/5 bg-white/1 opacity-60'}`}
    >
      <div className="flex items-center gap-2 px-2.5 py-2">
        <button type="button" {...attributes} {...listeners}
          className="text-gray-500 hover:text-gray-300 cursor-grab active:cursor-grabbing shrink-0"
          onClick={e => e.stopPropagation()}>
          <GripVertical className="w-3.5 h-3.5" />
        </button>
        <span className="flex-1 text-xs text-white font-medium truncate">{label}</span>
        <button type="button" onClick={onToggleVisible}
          className="p-1 rounded-md hover:bg-white/10 text-gray-400 hover:text-white transition"
          title={visible ? 'Hide on site' : 'Show on site'}>
          {visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
        </button>
        <button type="button" onClick={() => setOpen(o => !o)}
          className="p-1 rounded-md hover:bg-white/10 text-gray-400 hover:text-white transition">
          {open ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>
      {open && children && (
        <div className="px-3 pb-3 pt-0 space-y-2 border-t border-white/5">{children}</div>
      )}
    </div>
  );
}

export default function HeroContentEditor({ sectionId }: Props) {
  const { getActivePortfolio, updateSectionStyle } = useBuilderStore();
  const portfolio = getActivePortfolio();
  const section = portfolio?.sections.find(s => s.id === sectionId);
  if (!section) return null;

  const hero = getHeroContent(section);
  const order = hero.blockOrder || DEFAULT_HERO_CONTENT.blockOrder!;

  const patchHero = (patch: Partial<HeroContentSettings>) => {
    updateSectionStyle(sectionId, {
      heroContent: { ...hero, ...patch },
    });
  };

  const patchBlock = (blockId: HeroBlockId, patch: Partial<NonNullable<HeroContentSettings['blocks']>[HeroBlockId]>) => {
    patchHero({
      blocks: {
        ...hero.blocks,
        [blockId]: { ...hero.blocks?.[blockId], ...patch },
      },
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = order.indexOf(active.id as HeroBlockId);
    const newIdx = order.indexOf(over.id as HeroBlockId);
    if (oldIdx < 0 || newIdx < 0) return;
    patchHero({ blockOrder: arrayMove(order, oldIdx, newIdx) });
  };

  const alignActive = (h: string, v: string) => hero.alignH === h && hero.alignV === v;

  return (
    <div className="mb-4 space-y-4 rounded-xl border border-blue-500/20 bg-blue-500/5 p-3">
      <div className="flex items-center gap-2">
        <Layout className="w-4 h-4 text-blue-400" />
        <div>
          <p className="text-xs font-semibold text-white">Hero layout & blocks</p>
          <p className="text-[10px] text-gray-500">Position, show/hide, reorder, per-block animation</p>
        </div>
      </div>

      <div>
        <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">Content position</p>
        <div className="grid grid-cols-3 gap-1.5 max-w-[168px]">
          {HERO_ALIGN_OPTIONS.map(opt => (
            <button
              key={`${opt.h}-${opt.v}`}
              type="button"
              title={opt.label}
              onClick={() => patchHero({ alignH: opt.h, alignV: opt.v })}
              className={`aspect-square rounded-lg border text-[9px] font-medium transition ${
                alignActive(opt.h, opt.v)
                  ? 'bg-blue-600 border-blue-500 text-white'
                  : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/25 hover:text-white'
              }`}
            >
              {opt.label.split(' ').map(w => w[0]).join('')}
            </button>
          ))}
        </div>
        <p className="text-[10px] text-gray-600 mt-1.5">
          {HERO_ALIGN_OPTIONS.find(o => alignActive(o.h, o.v))?.label || 'Center left'}
        </p>
      </div>

      <div>
        <div className="flex justify-between mb-1">
          <span className="text-[11px] text-gray-400">Content max width</span>
          <span className="text-[11px] text-blue-300 font-mono">{hero.maxWidth ?? 640}px</span>
        </div>
        <input type="range" min={320} max={900} step={20} value={hero.maxWidth ?? 640}
          onChange={e => patchHero({ maxWidth: parseInt(e.target.value, 10) })}
          className="w-full h-1.5 rounded-full appearance-none bg-white/10 accent-blue-500 cursor-pointer" />
      </div>

      <div className="flex flex-wrap gap-3">
        <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer">
          <input type="checkbox" checked={hero.showBadge !== false}
            onChange={e => patchHero({ showBadge: e.target.checked })}
            className="rounded border-white/20 bg-white/5 accent-blue-500" />
          Show badge
        </label>
        <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer">
          <input type="checkbox" checked={hero.staggerBlocks !== false}
            onChange={e => patchHero({ staggerBlocks: e.target.checked })}
            className="rounded border-white/20 bg-white/5 accent-blue-500" />
          Stagger animations
        </label>
      </div>

      {hero.showBadge !== false && (
        <div>
          <label className="text-[11px] text-gray-400 block mb-1">Badge text</label>
          <input value={hero.badgeText ?? 'Welcome'}
            onChange={e => patchHero({ badgeText: e.target.value })}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500" />
        </div>
      )}

      <div>
        <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">Block order · drag to reorder</p>
        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={order} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {order.map(blockId => {
                const visible = hero.blocks?.[blockId]?.visible !== false
                  && (blockId !== 'badge' || hero.showBadge !== false);
                const block = hero.blocks?.[blockId];
                return (
                  <SortableBlockRow
                    key={blockId}
                    id={blockId}
                    label={HERO_BLOCK_LABELS[blockId]}
                    visible={visible}
                    onToggleVisible={() => patchBlock(blockId, { visible: block?.visible === false })}
                  >
                    <div>
                      <label className="text-[10px] text-gray-500 block mb-1">Animation</label>
                      <select
                        value={block?.entrance || 'inherit'}
                        onChange={e => patchBlock(blockId, { entrance: e.target.value as SectionEntranceType })}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                      >
                        {ENTRANCE_PRESETS.map(p => (
                          <option key={p.id} value={p.id} className="bg-[#1a1a1a]">{p.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-[10px] text-gray-500">Delay</span>
                        <span className="text-[10px] text-blue-300 font-mono">{(block?.delay ?? 0).toFixed(2)}s</span>
                      </div>
                      <input type="range" min={0} max={1.2} step={0.05} value={block?.delay ?? 0}
                        onChange={e => patchBlock(blockId, { delay: parseFloat(e.target.value) })}
                        className="w-full h-1 rounded-full appearance-none bg-white/10 accent-blue-500 cursor-pointer" />
                    </div>
                  </SortableBlockRow>
                );
              })}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}
