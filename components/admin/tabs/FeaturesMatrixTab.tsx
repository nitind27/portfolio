'use client';

import { useState } from 'react';
import { Check, X, Loader2, Layers } from 'lucide-react';
import { brand } from '@/lib/brand';
import { SectionHeader, adminCard, adminCardStyle } from '../ui';
import type { SubscriptionPlan, PlanFeatures, PlanFeatureKey } from '@/lib/plans-types';
import { PLAN_FEATURE_LABELS } from '@/lib/plans-types';

const FEATURE_GROUPS: { title: string; keys: PlanFeatureKey[] }[] = [
  { title: 'Export', keys: ['exportHtml', 'exportReact', 'exportNextjs'] },
  { title: 'Publish & deploy', keys: ['shareLink', 'publishOnline', 'hostingerDeploy'] },
  { title: 'Builder tools', keys: ['customCss', 'analytics', 'smtp', 'popupBuilder', 'premiumLayouts'] },
  { title: 'Premium sections', keys: ['sectionBlog', 'sectionTeam', 'sectionPricing', 'sectionFaq', 'sectionTestimonials'] },
  { title: 'Limits', keys: ['unlockedPortfolios', 'storageDays'] },
];

interface Props {
  plans: SubscriptionPlan[];
  onRefresh: () => void;
}

export default function FeaturesMatrixTab({ plans, onRefresh }: Props) {
  const [saving, setSaving] = useState<string | null>(null);

  const toggle = async (plan: SubscriptionPlan, key: PlanFeatureKey) => {
    const id = `${plan.id}-${key}`;
    setSaving(id);
    const features: PlanFeatures = { ...plan.features };
    if (key === 'unlockedPortfolios' || key === 'storageDays') return;
    features[key] = !features[key];
    try {
      const res = await fetch(`/api/admin/plans/${plan.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...plan, features }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      onRefresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Update failed');
    } finally {
      setSaving(null);
    }
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Feature matrix"
        desc="Click any cell to toggle permissions per plan — changes apply instantly"
      />

      {FEATURE_GROUPS.map(group => (
        <div key={group.title} className={`${adminCard}`} style={adminCardStyle}>
          <div className="px-5 py-3 border-b border-white/5 flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-400" />
            <h3 className="font-semibold text-sm">{group.title}</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs min-w-[600px]">
              <thead>
                <tr className="border-b border-white/5 text-gray-500">
                  <th className="px-4 py-2 text-left sticky left-0 z-10" style={{ background: brand.surface }}>Feature</th>
                  {plans.map(p => (
                    <th key={p.id} className="px-3 py-2 text-center min-w-[88px]">
                      <span className="text-white font-medium">{p.name}</span>
                      <span className="block text-[9px] font-normal text-gray-600">T{p.tier}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {group.keys.map(key => (
                  <tr key={key} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                    <td className="px-4 py-2.5 text-gray-300 sticky left-0 z-10" style={{ background: brand.surface }}>
                      {PLAN_FEATURE_LABELS[key]}
                    </td>
                    {plans.map(plan => {
                      const val = plan.features[key];
                      const isBool = typeof val === 'boolean';
                      const cellId = `${plan.id}-${key}`;
                      if (!isBool) {
                        return (
                          <td key={plan.id} className="px-3 py-2.5 text-center font-mono text-blue-300">{val}</td>
                        );
                      }
                      return (
                        <td key={plan.id} className="px-3 py-2.5 text-center">
                          <button type="button" disabled={saving === cellId || plan.isDefault && key === 'storageDays'}
                            onClick={() => toggle(plan, key)}
                            className={`w-8 h-8 rounded-lg mx-auto flex items-center justify-center transition border ${
                              val
                                ? 'bg-green-500/15 border-green-500/30 text-green-400 hover:bg-green-500/25'
                                : 'bg-white/5 border-white/10 text-gray-600 hover:bg-white/10'
                            }`}>
                            {saving === cellId ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              : val ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}
