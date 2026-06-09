'use client';

import { useState } from 'react';
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useBuilderStore } from '@/lib/store';
import type { CustomBlock, CustomBlockType } from '@/lib/types';
import { createCustomBlock, CUSTOM_BLOCK_TYPES, getCustomSection, SAMPLE_CUSTOM_BLOCKS } from '@/lib/custom-section';
import { GripVertical, Plus, Trash2, Eye, EyeOff, ChevronDown, ChevronUp, Layers } from 'lucide-react';

interface Props { sectionId: string; }

function BlockFields({ block, onChange }: { block: CustomBlock; onChange: (patch: Partial<CustomBlock>) => void }) {
  const input = 'w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500';
  const label = 'text-[10px] text-gray-500 uppercase tracking-wider';

  switch (block.type) {
    case 'heading':
      return (
        <div className="space-y-2">
          <div><p className={label}>Heading</p><input className={input} value={block.heading || ''} onChange={e => onChange({ heading: e.target.value })} /></div>
          <div><p className={label}>Align</p>
            <select className={input} value={block.align || 'left'} onChange={e => onChange({ align: e.target.value as CustomBlock['align'] })}>
              <option value="left" className="bg-[#1a1a1a]">Left</option>
              <option value="center" className="bg-[#1a1a1a]">Center</option>
              <option value="right" className="bg-[#1a1a1a]">Right</option>
            </select>
          </div>
        </div>
      );
    case 'text':
    case 'highlight':
      return (
        <div className="space-y-2">
          {block.type === 'highlight' && (
            <div><p className={label}>Title</p><input className={input} value={block.heading || ''} onChange={e => onChange({ heading: e.target.value })} /></div>
          )}
          <div><p className={label}>Text</p><textarea className={`${input} min-h-[72px] resize-y`} value={block.text || ''} onChange={e => onChange({ text: e.target.value })} /></div>
        </div>
      );
    case 'quote':
      return (
        <div className="space-y-2">
          <div><p className={label}>Quote</p><textarea className={`${input} min-h-[60px] resize-y`} value={block.quote || ''} onChange={e => onChange({ quote: e.target.value })} /></div>
          <div><p className={label}>Author</p><input className={input} value={block.author || ''} onChange={e => onChange({ author: e.target.value })} /></div>
        </div>
      );
    case 'image':
      return (
        <div className="space-y-2">
          <div><p className={label}>Image URL</p><input className={input} value={block.image || ''} onChange={e => onChange({ image: e.target.value })} placeholder="https://..." /></div>
          <div><p className={label}>Caption</p><input className={input} value={block.heading || ''} onChange={e => onChange({ heading: e.target.value })} /></div>
        </div>
      );
    case 'button':
      return (
        <div className="space-y-2">
          <div><p className={label}>Button label</p><input className={input} value={block.buttonLabel || ''} onChange={e => onChange({ buttonLabel: e.target.value })} /></div>
          <div><p className={label}>Link URL</p><input className={input} value={block.url || ''} onChange={e => onChange({ url: e.target.value })} placeholder="https://..." /></div>
        </div>
      );
    case 'stat':
      return (
        <div className="grid grid-cols-2 gap-2">
          <div><p className={label}>Value</p><input className={input} value={block.statValue || ''} onChange={e => onChange({ statValue: e.target.value })} /></div>
          <div><p className={label}>Label</p><input className={input} value={block.statLabel || ''} onChange={e => onChange({ statLabel: e.target.value })} /></div>
        </div>
      );
    case 'icon-card':
      return (
        <div className="space-y-2">
          <div className="grid grid-cols-[64px_1fr] gap-2">
            <div><p className={label}>Icon</p><input className={`${input} text-center text-lg`} value={block.icon || ''} onChange={e => onChange({ icon: e.target.value })} maxLength={4} /></div>
            <div><p className={label}>Title</p><input className={input} value={block.heading || ''} onChange={e => onChange({ heading: e.target.value })} /></div>
          </div>
          <div><p className={label}>Description</p><textarea className={`${input} min-h-[56px] resize-y`} value={block.subtext || ''} onChange={e => onChange({ subtext: e.target.value })} /></div>
        </div>
      );
    case 'list':
      return (
        <div className="space-y-2">
          <p className={label}>Items (one per line)</p>
          <textarea
            className={`${input} min-h-[80px] resize-y font-mono`}
            value={(block.items || []).join('\n')}
            onChange={e => onChange({ items: e.target.value.split('\n') })}
          />
        </div>
      );
    case 'video':
      return (
        <div><p className={label}>YouTube / Vimeo URL</p><input className={input} value={block.videoUrl || ''} onChange={e => onChange({ videoUrl: e.target.value })} placeholder="https://youtube.com/..." /></div>
      );
    case 'divider':
      return <p className="text-[10px] text-gray-500">A horizontal divider line — no extra settings.</p>;
    default:
      return null;
  }
}

function SortableBlock({ block, onPatch, onRemove, onToggle }: {
  block: CustomBlock;
  onPatch: (patch: Partial<CustomBlock>) => void;
  onRemove: () => void;
  onToggle: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id });
  const [open, setOpen] = useState(true);
  const meta = CUSTOM_BLOCK_TYPES.find(t => t.id === block.type);

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.45 : block.visible === false ? 0.55 : 1 }}
      className="rounded-xl border border-white/10 bg-white/[0.03] overflow-hidden"
    >
      <div className="flex items-center gap-2 px-2.5 py-2 border-b border-white/5">
        <button type="button" {...attributes} {...listeners} className="text-gray-500 hover:text-gray-300 cursor-grab active:cursor-grabbing shrink-0">
          <GripVertical className="w-3.5 h-3.5" />
        </button>
        <span className="w-5 h-5 rounded bg-blue-500/20 text-blue-300 text-[10px] font-bold flex items-center justify-center shrink-0">{meta?.icon}</span>
        <span className="flex-1 text-xs text-white font-medium truncate">{meta?.label}</span>
        <button type="button" onClick={onToggle} className="p-1 rounded hover:bg-white/10 text-gray-400 hover:text-white">
          {block.visible === false ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
        </button>
        <button type="button" onClick={() => setOpen(o => !o)} className="p-1 rounded hover:bg-white/10 text-gray-400 hover:text-white">
          {open ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
        <button type="button" onClick={onRemove} className="p-1 rounded hover:bg-red-500/20 text-gray-400 hover:text-red-400">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
      {open && (
        <div className="px-3 py-2.5 space-y-2">
          <BlockFields block={block} onChange={onPatch} />
          {block.type === 'icon-card' || block.type === 'stat' ? (
            <div>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Bento span</p>
              <select
                className="w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white"
                value={block.span ?? 1}
                onChange={e => onPatch({ span: Number(e.target.value) as 1 | 2 })}
              >
                <option value={1} className="bg-[#1a1a1a]">1 column</option>
                <option value={2} className="bg-[#1a1a1a]">2 columns (wide)</option>
              </select>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

export default function CustomBlocksEditor({ sectionId }: Props) {
  const { getActivePortfolio, updateSectionStyle } = useBuilderStore();
  const portfolio = getActivePortfolio();
  const section = portfolio?.sections.find(s => s.id === sectionId);
  if (!section) return null;

  const cs = getCustomSection(section);
  const blocks = cs.blocks ?? [];

  const patchBlocks = (next: CustomBlock[]) => {
    updateSectionStyle(sectionId, { customSection: { ...cs, blocks: next } });
  };

  const addBlock = (type: CustomBlockType) => patchBlocks([...blocks, createCustomBlock(type)]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = blocks.findIndex(b => b.id === active.id);
    const newIdx = blocks.findIndex(b => b.id === over.id);
    patchBlocks(arrayMove(blocks, oldIdx, newIdx));
  };

  return (
    <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-3 space-y-3">
      <div className="flex items-center gap-2">
        <Layers className="w-4 h-4 text-violet-400 shrink-0" />
        <div>
          <p className="text-xs font-semibold text-white">Content Blocks</p>
          <p className="text-[10px] text-gray-500">Build unique UI with headings, stats, cards, videos & more</p>
        </div>
      </div>

      {blocks.length > 0 ? (
        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={blocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2 max-h-[28rem] overflow-y-auto pr-1">
              {blocks.map(block => (
                <SortableBlock
                  key={block.id}
                  block={block}
                  onPatch={patch => patchBlocks(blocks.map(b => b.id === block.id ? { ...b, ...patch } : b))}
                  onRemove={() => patchBlocks(blocks.filter(b => b.id !== block.id))}
                  onToggle={() => patchBlocks(blocks.map(b => b.id === block.id ? { ...b, visible: b.visible === false } : b))}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        <div className="text-center py-3 border border-dashed border-white/10 rounded-lg space-y-2">
          <p className="text-xs text-gray-500">No blocks yet — add your first block below</p>
          <button
            type="button"
            onClick={() => patchBlocks(SAMPLE_CUSTOM_BLOCKS.map(b => ({
              ...createCustomBlock(b.type),
              ...b,
              id: `cb-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            })))}
            className="text-[10px] text-violet-400 hover:text-violet-300 underline"
          >
            Load sample blocks
          </button>
        </div>
      )}

      <div>
        <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">Add block</p>
        <div className="flex flex-wrap gap-1.5">
          {CUSTOM_BLOCK_TYPES.map(t => (
            <button
              key={t.id}
              type="button"
              onClick={() => addBlock(t.id)}
              className="flex items-center gap-1.5 text-[10px] px-2 py-1.5 rounded-lg bg-white/5 hover:bg-violet-500/15 border border-white/10 hover:border-violet-500/30 text-gray-300 hover:text-white transition"
            >
              <Plus className="w-3 h-3" />
              <span>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
