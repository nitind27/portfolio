'use client';
import { useRef, useState } from 'react';
import { TestimonialBlock } from '@/lib/types';
import { createEmptyTestimonial } from '@/lib/testimonial-utils';
import { Plus, Trash2, ChevronDown, ChevronUp, Upload } from 'lucide-react';

interface Props {
  items: TestimonialBlock[];
  onChange: (items: TestimonialBlock[]) => void;
}

function AvatarInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);

  const readFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    setLoading(true);
    const reader = new FileReader();
    reader.onload = e => { onChange((e.target?.result as string) || ''); setLoading(false); };
    reader.onerror = () => setLoading(false);
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-1.5">
      <label className="text-xs text-gray-400">Photo (optional)</label>
      {value && (
        <div className="relative w-16 h-16 rounded-full overflow-hidden border border-white/10">
          <img src={value} alt="" className="w-full h-full object-cover" />
          <button type="button" onClick={() => onChange('')}
            className="absolute inset-0 bg-black/50 text-white text-[9px] opacity-0 hover:opacity-100 flex items-center justify-center transition">×</button>
        </div>
      )}
      <div className="flex gap-2">
        <input value={value.startsWith('data:') ? '' : value} onChange={e => onChange(e.target.value)}
          placeholder="Image URL (optional)"
          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500" />
        <button type="button" onClick={() => inputRef.current?.click()} disabled={loading}
          className="text-xs text-blue-400 hover:text-blue-300 px-2 py-1 border border-blue-500/30 rounded-lg shrink-0">
          <Upload className="w-3 h-3" />
        </button>
      </div>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) readFile(f); }} />
    </div>
  );
}

export default function TestimonialsEditor({ items, onChange }: Props) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set(items.map(t => t.id)));
  const inputCls = 'w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500';

  const update = (id: string, patch: Partial<TestimonialBlock>) => {
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
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Client Reviews</p>
        <button type="button"
          onClick={() => { const t = createEmptyTestimonial(); onChange([...items, t]); setExpanded(s => new Set([...s, t.id])); }}
          className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 bg-blue-500/10 px-2.5 py-1 rounded-lg transition">
          <Plus className="w-3.5 h-3.5" /> Add Review
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
                <span className="text-sm text-white font-medium truncate">{item.author || 'New review'}</span>
              </div>
              {isOpen ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
            </button>

            {isOpen && (
              <div className="px-3 pb-3 space-y-3 border-t border-white/10 pt-3">
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Quote *</label>
                  <textarea value={item.quote} onChange={e => update(item.id, { quote: e.target.value })} rows={3}
                    placeholder="What did they say about your work?"
                    className={`${inputCls} resize-y min-h-[72px]`} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">Name *</label>
                    <input value={item.author} onChange={e => update(item.id, { author: e.target.value })} placeholder="John Smith" className={inputCls} />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">Role (optional)</label>
                    <input value={item.role} onChange={e => update(item.id, { role: e.target.value })} placeholder="CEO" className={inputCls} />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">Company (optional)</label>
                    <input value={item.company} onChange={e => update(item.id, { company: e.target.value })} placeholder="Acme Inc." className={inputCls} />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">Rating (1–5)</label>
                    <input type="number" min={1} max={5} value={item.rating || 5}
                      onChange={e => update(item.id, { rating: Math.min(5, Math.max(1, Number(e.target.value) || 5)) })}
                      className={inputCls} />
                  </div>
                </div>

                <AvatarInput value={item.image} onChange={v => update(item.id, { image: v })} />

                {items.length > 1 && (
                  <button type="button" onClick={() => onChange(items.filter(t => t.id !== item.id))}
                    className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 transition">
                    <Trash2 className="w-3.5 h-3.5" /> Delete review
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
