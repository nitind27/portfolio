'use client';

import { useMemo, useState } from 'react';
import { Search, Lock, Unlock, LayoutTemplate } from 'lucide-react';
import { brand } from '@/lib/brand';
import { SectionHeader, Badge, adminInput, adminCard, adminCardStyle, AdminSelect } from '../ui';
import type { SubscriptionPlan } from '@/lib/plans-types';

interface AdminTemplate {
  id: string;
  name: string;
  category: string;
  categoryLabel: string;
  minPlanId: number | null;
  minPlanName: string | null;
}

interface Props {
  templates: AdminTemplate[];
  plans: SubscriptionPlan[];
  onRefresh: () => void;
}

export default function TemplatesTab({ templates, plans, onRefresh }: Props) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [accessFilter, setAccessFilter] = useState<'all' | 'free' | 'premium'>('all');
  const [bulkPlanId, setBulkPlanId] = useState('');
  const [view, setView] = useState<'grid' | 'table'>('grid');

  const categories = useMemo(() => ['all', ...new Set(templates.map(t => t.category))], [templates]);

  const filtered = templates.filter(t => {
    if (category !== 'all' && t.category !== category) return false;
    if (accessFilter === 'free' && t.minPlanId != null) return false;
    if (accessFilter === 'premium' && t.minPlanId == null) return false;
    if (search) {
      const q = search.toLowerCase();
      return t.name.toLowerCase().includes(q) || t.id.toLowerCase().includes(q) || t.categoryLabel?.toLowerCase().includes(q);
    }
    return true;
  });

  const updateRule = async (templateId: string, minPlanId: number | null) => {
    await fetch('/api/admin/templates', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ templateId, minPlanId }),
    });
    onRefresh();
  };

  const bulkApply = async () => {
    if (!bulkPlanId) return;
    const minPlanId = bulkPlanId === 'free' ? null : Number(bulkPlanId);
    await fetch('/api/admin/templates', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ updates: filtered.map(t => ({ templateId: t.id, minPlanId })) }),
    });
    onRefresh();
  };

  const freeCount = templates.filter(t => !t.minPlanId).length;
  const premiumCount = templates.length - freeCount;

  return (
    <div className="space-y-5">
      <SectionHeader title="Template access control" desc={`${templates.length} templates · ${freeCount} free · ${premiumCount} premium`} />

      <div className="flex flex-wrap gap-2 p-4 rounded-2xl border" style={{ background: brand.surface, borderColor: brand.border }}>
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search templates…" className={adminInput + ' pl-9'} />
        </div>
        <AdminSelect
          value={category}
          onChange={setCategory}
          className="w-44"
          aria-label="Filter by category"
          options={categories.map(c => ({
            value: c,
            label: c === 'all' ? 'All categories' : c,
          }))}
        />
        <AdminSelect
          value={accessFilter}
          onChange={v => setAccessFilter(v as typeof accessFilter)}
          className="w-40"
          aria-label="Filter by access"
          options={[
            { value: 'all', label: 'All access' },
            { value: 'free', label: 'Free only' },
            { value: 'premium', label: 'Premium only' },
          ]}
        />
        <AdminSelect
          value={bulkPlanId}
          onChange={setBulkPlanId}
          className="w-48"
          placeholder="Bulk assign plan…"
          aria-label="Bulk assign plan"
          options={[
            { value: '', label: 'Bulk assign plan…' },
            { value: 'free', label: 'Set all filtered → Free' },
            ...plans.filter(p => p.tier > 0).map(p => ({
              value: String(p.id),
              label: `Set all → ${p.name}`,
            })),
          ]}
        />
        <button onClick={bulkApply} disabled={!bulkPlanId} className="px-4 py-2 rounded-xl text-xs border border-white/10 hover:bg-white/5 disabled:opacity-40">
          Apply bulk
        </button>
        <div className="flex rounded-lg border border-white/10 p-0.5 ml-auto">
          {(['grid', 'table'] as const).map(v => (
            <button key={v} onClick={() => setView(v)} className={`px-3 py-1.5 text-xs rounded-md capitalize ${view === v ? 'bg-blue-600 text-white' : 'text-gray-500'}`}>{v}</button>
          ))}
        </div>
      </div>

      {view === 'grid' ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {filtered.map(t => (
            <div key={t.id} className="rounded-xl border p-4 hover:border-white/20 transition group"
              style={{ background: brand.surface, borderColor: brand.border }}>
              <div className="flex items-start justify-between gap-2 mb-3">
                <LayoutTemplate className="w-8 h-8 text-blue-400/60" />
                {t.minPlanId ? <Badge variant="warning"><Lock className="w-2.5 h-2.5 inline mr-0.5" />{t.minPlanName}</Badge>
                  : <Badge variant="success"><Unlock className="w-2.5 h-2.5 inline mr-0.5" />Free</Badge>}
              </div>
              <p className="font-medium text-sm text-white truncate">{t.name}</p>
              <p className="text-[10px] text-gray-600 font-mono truncate">{t.id}</p>
              <p className="text-[10px] text-gray-500 mt-1 capitalize">{t.categoryLabel}</p>
              <AdminSelect
                size="sm"
                value={String(t.minPlanId ?? '')}
                onChange={v => updateRule(t.id, v ? Number(v) : null)}
                className="mt-3"
                aria-label={`Plan for ${t.name}`}
                options={[
                  { value: '', label: 'Free for all' },
                  ...plans.filter(p => p.tier > 0).map(p => ({
                    value: String(p.id),
                    label: p.name,
                  })),
                ]}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className={`${adminCard} overflow-x-auto`} style={adminCardStyle}>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left text-xs text-gray-500">
                <th className="px-4 py-3">Template</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Access</th>
                <th className="px-4 py-3">Required plan</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(t => (
                <tr key={t.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                  <td className="px-4 py-3">
                    <p className="font-medium text-white">{t.name}</p>
                    <p className="text-[10px] text-gray-600 font-mono">{t.id}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{t.categoryLabel}</td>
                  <td className="px-4 py-3">
                    {t.minPlanId ? <Badge variant="warning">Premium</Badge> : <Badge variant="success">Free</Badge>}
                  </td>
                  <td className="px-4 py-3">
                    <AdminSelect
                      size="sm"
                      value={String(t.minPlanId ?? '')}
                      onChange={v => updateRule(t.id, v ? Number(v) : null)}
                      className="max-w-[180px]"
                      aria-label={`Plan for ${t.name}`}
                      options={[
                        { value: '', label: 'Free' },
                        ...plans.filter(p => p.tier > 0).map(p => ({
                          value: String(p.id),
                          label: p.name,
                        })),
                      ]}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {filtered.length === 0 && (
        <p className="text-center py-12 text-gray-500 text-sm">No templates match your filters</p>
      )}
    </div>
  );
}
