'use client';
import { useState } from 'react';
import { PricingPlanBlock } from '@/lib/types';
import { createEmptyPricingPlan } from '@/lib/pricing-utils';
import { Plus, Trash2, ChevronDown, ChevronUp, Star } from 'lucide-react';

interface Props {
  items: PricingPlanBlock[];
  onChange: (items: PricingPlanBlock[]) => void;
}

export default function PricingEditor({ items, onChange }: Props) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set(items.map(t => t.id)));
  const inputCls = 'w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500';

  const update = (id: string, patch: Partial<PricingPlanBlock>) => {
    onChange(items.map(t => t.id === id ? { ...t, ...patch } : t));
  };

  const toggle = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const setFeatured = (id: string) => {
    onChange(items.map(t => ({ ...t, featured: t.id === id })));
  };

  const updateFeatures = (id: string, features: string[]) => {
    update(id, { features });
  };

  return (
    <div className="col-span-full space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Pricing Plans</p>
        <button type="button"
          onClick={() => { const p = createEmptyPricingPlan(); onChange([...items, p]); setExpanded(s => new Set([...s, p.id])); }}
          className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 bg-blue-500/10 px-2.5 py-1 rounded-lg transition">
          <Plus className="w-3.5 h-3.5" /> Add Plan
        </button>
      </div>

      {items.map((item, index) => {
        const isOpen = expanded.has(item.id);
        const features = item.features?.length ? item.features : [''];
        return (
          <div key={item.id} className={`border rounded-xl overflow-hidden ${item.featured ? 'border-blue-500/40 bg-blue-500/[0.06]' : 'border-white/10 bg-white/[0.03]'}`}>
            <button type="button" onClick={() => toggle(item.id)}
              className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-white/5 transition text-left">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-[10px] font-bold text-blue-400 bg-blue-500/15 px-1.5 py-0.5 rounded shrink-0">#{index + 1}</span>
                {item.featured && <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 shrink-0" />}
                <span className="text-sm text-white font-medium truncate">{item.name || 'New plan'}</span>
                {item.price && <span className="text-xs text-blue-300 shrink-0">{item.price}{item.period}</span>}
              </div>
              {isOpen ? <ChevronUp className="w-4 h-4 text-gray-500 shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-500 shrink-0" />}
            </button>

            {isOpen && (
              <div className="px-3 pb-3 space-y-3 border-t border-white/10 pt-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">Plan Name *</label>
                    <input value={item.name} onChange={e => update(item.id, { name: e.target.value })} placeholder="Pro" className={inputCls} />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-gray-400 block mb-1">Price *</label>
                      <input value={item.price} onChange={e => update(item.id, { price: e.target.value })} placeholder="$99" className={inputCls} />
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 block mb-1">Period (optional)</label>
                      <input value={item.period} onChange={e => update(item.id, { period: e.target.value })} placeholder="/mo" className={inputCls} />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-400 block mb-1">Tagline (optional)</label>
                  <input value={item.description} onChange={e => update(item.id, { description: e.target.value })}
                    placeholder="Best for growing teams" className={inputCls} />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-gray-400 block">Features</label>
                  {features.map((feat, fi) => (
                    <div key={fi} className="flex gap-2 items-center">
                      <span className="text-blue-400 text-xs shrink-0">✓</span>
                      <input value={feat} onChange={e => { const n = [...features]; n[fi] = e.target.value; updateFeatures(item.id, n); }}
                        placeholder="Feature included in this plan"
                        className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500" />
                      {features.length > 1 && (
                        <button type="button" onClick={() => updateFeatures(item.id, features.filter((_, j) => j !== fi))}
                          className="text-gray-600 hover:text-red-400 transition shrink-0">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button type="button" onClick={() => updateFeatures(item.id, [...features, ''])}
                    className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition mt-1">
                    <Plus className="w-3 h-3" /> Add feature
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">Button Text (optional)</label>
                    <input value={item.ctaText} onChange={e => update(item.id, { ctaText: e.target.value })} placeholder="Get Started" className={inputCls} />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">Button Link (optional)</label>
                    <input value={item.ctaLink} onChange={e => update(item.id, { ctaLink: e.target.value })} placeholder="https://… or #contact" className={inputCls} />
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={item.featured} onChange={() => setFeatured(item.id)}
                    className="rounded border-white/20 bg-white/5 text-blue-500 focus:ring-blue-500/30" />
                  <span className="text-xs text-gray-300">Highlight as &quot;Most Popular&quot;</span>
                </label>

                {items.length > 1 && (
                  <button type="button" onClick={() => onChange(items.filter(t => t.id !== item.id))}
                    className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 transition">
                    <Trash2 className="w-3.5 h-3.5" /> Delete plan
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
