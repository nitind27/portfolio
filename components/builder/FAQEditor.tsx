'use client';
import { useState } from 'react';
import { FAQItemBlock } from '@/lib/types';
import { createEmptyFAQItem } from '@/lib/faq-utils';
import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';

interface Props {
  items: FAQItemBlock[];
  onChange: (items: FAQItemBlock[]) => void;
}

export default function FAQEditor({ items, onChange }: Props) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set(items.map(t => t.id)));
  const inputCls = 'w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500';

  const update = (id: string, patch: Partial<FAQItemBlock>) => {
    onChange(items.map(t => t.id === id ? { ...t, ...patch } : t));
  };

  const toggle = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <div className="col-span-full space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Questions & Answers</p>
        <button type="button"
          onClick={() => { const f = createEmptyFAQItem(); onChange([...items, f]); setExpanded(s => new Set([...s, f.id])); }}
          className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 bg-blue-500/10 px-2.5 py-1 rounded-lg transition">
          <Plus className="w-3.5 h-3.5" /> Add Question
        </button>
      </div>

      {items.map((item, index) => {
        const isOpen = expanded.has(item.id);
        return (
          <div key={item.id} className="border border-white/10 rounded-xl bg-white/[0.03] overflow-hidden">
            <button type="button" onClick={() => toggle(item.id)}
              className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-white/5 transition text-left">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-[10px] font-bold text-blue-400 bg-blue-500/15 px-1.5 py-0.5 rounded shrink-0">#{index + 1}</span>
                <span className="text-sm text-white font-medium truncate">{item.question || 'New question'}</span>
              </div>
              {isOpen ? <ChevronUp className="w-4 h-4 text-gray-500 shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-500 shrink-0" />}
            </button>

            {isOpen && (
              <div className="px-3 pb-3 space-y-3 border-t border-white/10 pt-3">
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Question *</label>
                  <input value={item.question} onChange={e => update(item.id, { question: e.target.value })}
                    placeholder="What services do you offer?"
                    className={inputCls} />
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Answer *</label>
                  <textarea value={item.answer} onChange={e => update(item.id, { answer: e.target.value })} rows={3}
                    placeholder="Write a clear, helpful answer…"
                    className={`${inputCls} resize-y min-h-[72px]`} />
                </div>

                {items.length > 1 && (
                  <button type="button" onClick={() => onChange(items.filter(t => t.id !== item.id))}
                    className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 transition">
                    <Trash2 className="w-3.5 h-3.5" /> Delete question
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
