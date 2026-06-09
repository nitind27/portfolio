'use client';

import { useState } from 'react';
import { Edit3 } from 'lucide-react';
import { brand } from '@/lib/brand';
import { SectionHeader, Badge, adminCard, adminCardStyle } from '../ui';
import type { SubscriptionPlan, PlanFeatures } from '@/lib/plans-types';
import { PLAN_FEATURE_LABELS, type PlanFeatureKey } from '@/lib/plans-types';
import PlanEditorModal from '../PlanEditorModal';
import { Check, X } from 'lucide-react';

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

  const sorted = [...plans].sort((a, b) => a.tier - b.tier);

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Subscription plans"
        desc="Free tier + Premium (₹99). Edit pricing and feature permissions — users only get what each plan allows."
        action={
          <div className="flex rounded-lg border border-white/10 p-0.5">
            {(['cards', 'compare'] as const).map(v => (
              <button key={v} onClick={() => setView(v)}
                className={`px-3 py-1.5 text-xs rounded-md capitalize ${view === v ? 'bg-blue-600 text-white' : 'text-gray-500'}`}>
                {v}
              </button>
            ))}
          </div>
        }
      />

      {view === 'cards' ? (
        <div className="grid lg:grid-cols-2 gap-4 max-w-3xl">
          {sorted.map(p => (
            <div key={p.id} className={`rounded-2xl border p-6 relative`}
              style={{ background: brand.surface, borderColor: p.isDefault ? brand.accent : brand.border }}>
              {p.isDefault && <Badge variant="info">Default</Badge>}
              {p.slug === 'pro' && !p.isDefault && <Badge variant="warning">Paid</Badge>}
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-3xl font-bold text-white">{p.price > 0 ? `₹${p.price}` : 'Free'}</span>
                {p.price > 0 && <span className="text-sm text-gray-500">/ {p.currency}</span>}
              </div>
              <h3 className="text-lg font-bold text-white mt-2">{p.name}</h3>
              <p className="text-xs text-gray-500 font-mono">{p.slug} · Tier {p.tier}</p>
              <p className="text-sm text-gray-400 mt-3 line-clamp-2 min-h-[40px]">{p.description || '—'}</p>
              <div className="flex flex-wrap gap-1 mt-4 min-h-[48px]">
                {BOOL_FEATURES.filter(k => p.features[k]).slice(0, 6).map(k => (
                  <span key={k} className="text-[9px] px-1.5 py-0.5 rounded bg-green-500/10 text-green-400">{PLAN_FEATURE_LABELS[k]}</span>
                ))}
              </div>
              <div className="flex gap-2 mt-5 pt-4 border-t border-white/5">
                <button onClick={() => setEditing({ ...p, features: { ...p.features } })}
                  className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-xs border border-white/10 hover:bg-white/5">
                  <Edit3 className="w-3.5 h-3.5" /> Edit plan
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={`${adminCard} overflow-x-auto`} style={adminCardStyle}>
          <table className="w-full text-xs min-w-[600px]">
            <thead>
              <tr className="border-b border-white/10 text-left text-gray-500">
                <th className="px-4 py-3 sticky left-0" style={{ background: brand.surface }}>Feature</th>
                {sorted.map(p => (
                  <th key={p.id} className="px-4 py-3 text-center min-w-[100px]">
                    <p className="text-white font-semibold">{p.name}</p>
                    <p className="text-[10px] font-normal">{p.price > 0 ? `₹${p.price}` : 'Free'}</p>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {BOOL_FEATURES.map(key => (
                <tr key={key} className="border-b border-white/5 hover:bg-white/[0.02]">
                  <td className="px-4 py-2.5 text-gray-300 sticky left-0" style={{ background: brand.surface }}>{PLAN_FEATURE_LABELS[key]}</td>
                  {sorted.map(p => (
                    <td key={p.id} className="px-4 py-2.5 text-center">
                      {p.features[key] ? <Check className="w-4 h-4 text-green-400 mx-auto" /> : <X className="w-4 h-4 text-gray-700 mx-auto" />}
                    </td>
                  ))}
                </tr>
              ))}
              <tr className="border-b border-white/5">
                <td className="px-4 py-2.5 text-gray-300 sticky left-0" style={{ background: brand.surface }}>Portfolio slots</td>
                {sorted.map(p => (
                  <td key={p.id} className="px-4 py-2.5 text-center font-mono text-blue-300">{p.features.unlockedPortfolios}</td>
                ))}
              </tr>
              <tr>
                <td className="px-4 py-2.5 text-gray-300 sticky left-0" style={{ background: brand.surface }}>Storage days</td>
                {sorted.map(p => (
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
