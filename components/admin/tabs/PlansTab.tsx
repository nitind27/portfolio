'use client';

import { useState } from 'react';
import { Plus, Trash2, Edit3, Check, X } from 'lucide-react';
import { brand } from '@/lib/brand';
import { SectionHeader, Badge, adminCard, adminCardStyle } from '../ui';
import type { SubscriptionPlan, PlanFeatures } from '@/lib/plans-types';
import { PLAN_FEATURE_LABELS, type PlanFeatureKey, DEFAULT_FREE_FEATURES } from '@/lib/plans-types';
import PlanEditorModal from '../PlanEditorModal';

const BOOL_FEATURES = (Object.keys(PLAN_FEATURE_LABELS) as PlanFeatureKey[]).filter(
  k => k !== 'unlockedPortfolios' && k !== 'storageDays',
);

interface Props {
  plans: SubscriptionPlan[];
  onRefresh: () => void;
}

export default function PlansTab({ plans, onRefresh }: Props) {
  const [editing, setEditing] = useState<(Partial<SubscriptionPlan> & { features: PlanFeatures }) | null>(null);
  const [view, setView] = useState<'cards' | 'compare'>('cards');

  const deletePlan = async (id: number) => {
    if (!confirm('Delete this plan? Users on this plan may be affected.')) return;
    const res = await fetch(`/api/admin/plans/${id}`, { method: 'DELETE' });
    if (res.ok) onRefresh();
    else alert((await res.json()).error || 'Delete failed');
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Subscription plans"
        desc="Configure pricing, tiers, and feature access for each plan"
        action={
          <div className="flex gap-2">
            <div className="flex rounded-lg border border-white/10 p-0.5">
              {(['cards', 'compare'] as const).map(v => (
                <button key={v} onClick={() => setView(v)}
                  className={`px-3 py-1.5 text-xs rounded-md capitalize ${view === v ? 'bg-blue-600 text-white' : 'text-gray-500'}`}>
                  {v}
                </button>
              ))}
            </div>
            <button onClick={() => setEditing({
              slug: '', name: '', description: '', price: 99, currency: 'INR', tier: 1,
              isActive: true, isDefault: false,
              features: { ...DEFAULT_FREE_FEATURES, exportHtml: true, shareLink: true, hostingerDeploy: true, unlockedPortfolios: 1 },
            })}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium"
              style={{ background: brand.accent, color: brand.onAccent }}>
              <Plus className="w-4 h-4" /> New plan
            </button>
          </div>
        }
      />

      {view === 'cards' ? (
        <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {plans.map(p => (
            <div key={p.id} className={`rounded-2xl border p-6 relative ${!p.isActive ? 'opacity-50' : ''}`}
              style={{ background: brand.surface, borderColor: p.isDefault ? brand.accent : brand.border }}>
              {p.isDefault && <Badge variant="info">Default</Badge>}
              {!p.isActive && <Badge variant="warning">Inactive</Badge>}
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-3xl font-bold text-white">₹{p.price}</span>
                <span className="text-sm text-gray-500">/ {p.currency}</span>
              </div>
              <h3 className="text-lg font-bold text-white mt-2">{p.name}</h3>
              <p className="text-xs text-gray-500 font-mono">{p.slug} · Tier {p.tier}</p>
              <p className="text-sm text-gray-400 mt-3 line-clamp-2 min-h-[40px]">{p.description || '—'}</p>
              <div className="flex flex-wrap gap-1 mt-4 min-h-[48px]">
                {BOOL_FEATURES.filter(k => p.features[k]).slice(0, 5).map(k => (
                  <span key={k} className="text-[9px] px-1.5 py-0.5 rounded bg-green-500/10 text-green-400">{PLAN_FEATURE_LABELS[k]}</span>
                ))}
              </div>
              <div className="flex gap-2 mt-5 pt-4 border-t border-white/5">
                <button onClick={() => setEditing({ ...p, features: { ...p.features } })}
                  className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-xs border border-white/10 hover:bg-white/5">
                  <Edit3 className="w-3.5 h-3.5" /> Edit
                </button>
                {!p.isDefault && (
                  <button onClick={() => deletePlan(p.id)} className="p-2 rounded-lg border border-red-500/20 text-red-400 hover:bg-red-500/10">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={`${adminCard} overflow-x-auto`} style={adminCardStyle}>
          <table className="w-full text-xs min-w-[800px]">
            <thead>
              <tr className="border-b border-white/10 text-left text-gray-500">
                <th className="px-4 py-3 sticky left-0" style={{ background: brand.surface }}>Feature</th>
                {plans.map(p => (
                  <th key={p.id} className="px-4 py-3 text-center min-w-[100px]">
                    <p className="text-white font-semibold">{p.name}</p>
                    <p className="text-[10px] font-normal">₹{p.price}</p>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {BOOL_FEATURES.map(key => (
                <tr key={key} className="border-b border-white/5 hover:bg-white/[0.02]">
                  <td className="px-4 py-2.5 text-gray-300 sticky left-0" style={{ background: brand.surface }}>{PLAN_FEATURE_LABELS[key]}</td>
                  {plans.map(p => (
                    <td key={p.id} className="px-4 py-2.5 text-center">
                      {p.features[key] ? <Check className="w-4 h-4 text-green-400 mx-auto" /> : <X className="w-4 h-4 text-gray-700 mx-auto" />}
                    </td>
                  ))}
                </tr>
              ))}
              <tr className="border-b border-white/5">
                <td className="px-4 py-2.5 text-gray-300 sticky left-0" style={{ background: brand.surface }}>Portfolio slots</td>
                {plans.map(p => (
                  <td key={p.id} className="px-4 py-2.5 text-center font-mono text-blue-300">{p.features.unlockedPortfolios}</td>
                ))}
              </tr>
              <tr>
                <td className="px-4 py-2.5 text-gray-300 sticky left-0" style={{ background: brand.surface }}>Storage days</td>
                {plans.map(p => (
                  <td key={p.id} className="px-4 py-2.5 text-center font-mono text-blue-300">{p.features.storageDays}</td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}

      <PlanEditorModal open={!!editing} plan={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); onRefresh(); }} />
    </div>
  );
}
