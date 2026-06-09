'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Loader2 } from 'lucide-react';
import { brand } from '@/lib/brand';
import { adminInput } from './ui';
import type { SubscriptionPlan, PlanFeatures, PlanFeatureKey } from '@/lib/plans-types';
import { PLAN_FEATURE_LABELS } from '@/lib/plans-types';
import { invalidatePlansCache } from '@/lib/plans-client';

const BOOL_FEATURES = (Object.keys(PLAN_FEATURE_LABELS) as PlanFeatureKey[]).filter(
  k => k !== 'unlockedPortfolios' && k !== 'storageDays',
);

interface Props {
  open: boolean;
  plan: (Partial<SubscriptionPlan> & { features: PlanFeatures }) | null;
  onClose: () => void;
  onSaved: () => void;
}

export default function PlanEditorModal({ open, plan, onClose, onSaved }: Props) {
  const [editing, setEditing] = useState(plan);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) setEditing(plan);
  }, [open, plan]);

  const save = async () => {
    if (!editing?.name || !editing.slug) return;
    setSaving(true);
    try {
      const isNew = !editing.id;
      const res = await fetch(isNew ? '/api/admin/plans' : `/api/admin/plans/${editing.id}`, {
        method: isNew ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editing),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      invalidatePlansCache();
      onSaved();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (!open || !editing) return null;

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
        onClick={onClose}>
        <motion.div initial={{ scale: 0.96, y: 12 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.96, y: 12 }}
          onClick={e => e.stopPropagation()}
          className="bg-[#0d1117] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
          <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between shrink-0">
            <div>
              <h2 className="font-bold text-lg">Edit plan</h2>
              <p className="text-xs text-gray-500">Changes apply to all users on this plan immediately</p>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/5"><X className="w-4 h-4" /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            <div className="grid sm:grid-cols-2 gap-3">
              <div><label className="text-xs text-gray-500 mb-1 block">Plan name</label>
                <input value={editing.name || ''} onChange={e => setEditing(p => p ? { ...p, name: e.target.value } : p)} className={adminInput} /></div>
              <div><label className="text-xs text-gray-500 mb-1 block">Slug</label>
                <input value={editing.slug || ''} readOnly className={adminInput + ' opacity-60 cursor-not-allowed'} /></div>
              <div><label className="text-xs text-gray-500 mb-1 block">Price (₹)</label>
                <input type="number" value={editing.price ?? 0} onChange={e => setEditing(p => p ? { ...p, price: Number(e.target.value) } : p)} className={adminInput} /></div>
              <div><label className="text-xs text-gray-500 mb-1 block">Tier level</label>
                <input type="number" value={editing.tier ?? 0} onChange={e => setEditing(p => p ? { ...p, tier: Number(e.target.value) } : p)} className={adminInput} /></div>
            </div>
            <div><label className="text-xs text-gray-500 mb-1 block">Description</label>
              <textarea value={editing.description || ''} onChange={e => setEditing(p => p ? { ...p, description: e.target.value } : p)}
                className={adminInput + ' resize-none h-16'} /></div>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" checked={editing.isActive !== false} onChange={e => setEditing(p => p ? { ...p, isActive: e.target.checked } : p)} /> Active plan</label>
              {editing.slug === 'free' && (
                <span className="text-xs text-gray-500">Default tier for new users</span>
              )}
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Feature permissions</p>
              <div className="grid sm:grid-cols-2 gap-1.5">
                {BOOL_FEATURES.map(key => (
                  <label key={key} className="flex items-center gap-2 text-xs cursor-pointer p-2.5 rounded-lg hover:bg-white/[0.04] border border-transparent hover:border-white/5">
                    <input type="checkbox" checked={Boolean(editing.features[key])}
                      onChange={e => setEditing(p => p ? { ...p, features: { ...p.features, [key]: e.target.checked } } : p)} />
                    {PLAN_FEATURE_LABELS[key]}
                  </label>
                ))}
              </div>
              <div className="grid sm:grid-cols-2 gap-3 mt-3">
                <div><label className="text-xs text-gray-500 mb-1 block">Portfolio unlock slots</label>
                  <input type="number" min={0} value={editing.features.unlockedPortfolios}
                    onChange={e => setEditing(p => p ? { ...p, features: { ...p.features, unlockedPortfolios: Number(e.target.value) } } : p)} className={adminInput} /></div>
                <div><label className="text-xs text-gray-500 mb-1 block">Device storage (days)</label>
                  <input type="number" min={1} value={editing.features.storageDays}
                    onChange={e => setEditing(p => p ? { ...p, features: { ...p.features, storageDays: Number(e.target.value) } } : p)} className={adminInput} /></div>
              </div>
            </div>
          </div>
          <div className="px-6 py-4 border-t border-white/10 shrink-0">
            <button onClick={save} disabled={saving}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold disabled:opacity-60"
              style={{ background: brand.accent, color: brand.onAccent }}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save plan
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
