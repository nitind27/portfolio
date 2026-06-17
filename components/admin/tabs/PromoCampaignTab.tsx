'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Gift, Power, Loader2, Save, Eye, Megaphone, Users, ToggleLeft, ToggleRight,
} from 'lucide-react';
import { SectionHeader, Badge, adminInput } from '../ui';
import { brand } from '@/lib/brand';
import type { PromoCampaignSettings } from '@/lib/promo-campaign';

interface PromoState {
  settings: PromoCampaignSettings;
  freeGrantCount: number;
  slotsRemaining: number;
}

export default function PromoCampaignTab() {
  const [state, setState] = useState<PromoState | null>(null);
  const [draft, setDraft] = useState<PromoCampaignSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/promo-campaign');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setState({ settings: data.settings, freeGrantCount: data.freeGrantCount, slotsRemaining: data.slotsRemaining });
      setDraft(data.settings);
    } catch {
      setState(null);
      setDraft(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const save = async (patch: Partial<PromoCampaignSettings>) => {
    setSaving(true);
    setMsg('');
    try {
      const res = await fetch('/api/admin/promo-campaign', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed');
      setState({ settings: data.settings, freeGrantCount: data.freeGrantCount, slotsRemaining: data.slotsRemaining });
      setDraft(data.settings);
      setMsg('Saved successfully');
      setTimeout(() => setMsg(''), 2500);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const togglePaidPlan = () => {
    if (!state) return;
    const next = !state.settings.paidPlanDisabled;
    if (next && !confirm('Disable paid plan? All users will get premium features for free. Payment checkout will be blocked.')) return;
    save({ paidPlanDisabled: next });
  };

  const toggleFreeGrant = () => {
    if (!state) return;
    save({ freeGrantEnabled: !state.settings.freeGrantEnabled });
  };

  const toggleModal = () => {
    if (!state) return;
    save({ modalEnabled: !state.settings.modalEnabled });
  };

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
      </div>
    );
  }

  if (!state || !draft) {
    return <div className="text-center py-16 text-gray-500 text-sm">Could not load promo settings.</div>;
  }

  const { settings, freeGrantCount, slotsRemaining } = state;
  const grantPct = settings.freeGrantLimit > 0
    ? Math.round((freeGrantCount / settings.freeGrantLimit) * 100)
    : 0;

  return (
    <div className="space-y-6 max-w-3xl">
      <SectionHeader
        title="Promo & subscription control"
        desc="Turn off paid plans, grant free premium to limited users, and show a promo popup to visitors."
      />

      {msg && (
        <div className={`text-xs px-4 py-2 rounded-xl border ${msg.includes('fail') || msg.includes('Fail') ? 'border-red-500/30 text-red-300 bg-red-500/10' : 'border-green-500/30 text-green-300 bg-green-500/10'}`}>
          {msg}
        </div>
      )}

      {/* Global free toggle */}
      <div className={`rounded-2xl border p-6 transition ${settings.paidPlanDisabled ? 'border-green-500/40 bg-green-500/[0.06]' : 'border-white/10 bg-white/[0.02]'}`}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${settings.paidPlanDisabled ? 'bg-green-500/20' : 'bg-white/5'}`}>
              <Power className={`w-6 h-6 ${settings.paidPlanDisabled ? 'text-green-400' : 'text-gray-400'}`} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-bold text-white">Disable paid plan</h3>
                <Badge variant={settings.paidPlanDisabled ? 'success' : 'default'}>
                  {settings.paidPlanDisabled ? 'ALL FREE' : 'Paid active'}
                </Badge>
              </div>
              <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                When ON, every user gets full premium features — export, deploy, share — without payment. Checkout is blocked.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={togglePaidPlan}
            disabled={saving}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition disabled:opacity-50 ${
              settings.paidPlanDisabled
                ? 'bg-gray-600 hover:bg-gray-500 text-white'
                : 'bg-green-600 hover:bg-green-500 text-white'
            }`}
          >
            {settings.paidPlanDisabled ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
            {settings.paidPlanDisabled ? 'Re-enable paid' : 'Make all free'}
          </button>
        </div>
      </div>

      {/* Limited free grant */}
      <div className={`rounded-2xl border p-6 space-y-5 ${settings.freeGrantEnabled ? 'border-blue-500/30 bg-blue-500/[0.04]' : 'border-white/10'}`}
        style={{ background: settings.freeGrantEnabled ? undefined : brand.surface }}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-blue-500/15">
              <Gift className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-bold text-white">Limited free premium</h3>
                <Badge variant={settings.freeGrantEnabled ? 'info' : 'default'}>
                  {settings.freeGrantEnabled ? 'ACTIVE' : 'Off'}
                </Badge>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                First N new registrations get premium free — export, download, live deploy included.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={toggleFreeGrant}
            disabled={saving || settings.paidPlanDisabled}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border border-white/10 hover:bg-white/5 disabled:opacity-40"
          >
            {settings.freeGrantEnabled ? 'Turn off' : 'Enable campaign'}
          </button>
        </div>

        {settings.paidPlanDisabled && (
          <p className="text-xs text-amber-400/80 border border-amber-500/20 rounded-lg px-3 py-2 bg-amber-500/5">
            Global free mode is ON — limited grant is not needed since everyone already has premium.
          </p>
        )}

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-400 block mb-1.5">Max free users</label>
            <input
              type="number"
              min={1}
              max={100000}
              value={draft.freeGrantLimit}
              onChange={e => setDraft(d => d ? { ...d, freeGrantLimit: Number(e.target.value) } : d)}
              className={adminInput}
              disabled={!settings.freeGrantEnabled}
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 block mb-1.5">Auto-grant on register</label>
            <button
              type="button"
              disabled={!settings.freeGrantEnabled || saving}
              onClick={() => save({ autoGrantOnRegister: !settings.autoGrantOnRegister })}
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm border transition ${
                settings.autoGrantOnRegister ? 'border-green-500/40 bg-green-500/10 text-green-300' : 'border-white/10 text-gray-500'
              }`}
            >
              <span>{settings.autoGrantOnRegister ? 'Enabled' : 'Disabled'}</span>
              {settings.autoGrantOnRegister ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {settings.freeGrantEnabled && (
          <div className="p-4 rounded-xl border border-white/10 bg-white/[0.02]">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
              <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> Slots used</span>
              <span className="font-mono text-white">{freeGrantCount} / {settings.freeGrantLimit}</span>
            </div>
            <div className="h-2.5 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${Math.min(100, grantPct)}%`,
                  background: slotsRemaining > 0
                    ? `linear-gradient(90deg, ${brand.accent}, ${brand.accentHover})`
                    : '#ef4444',
                }}
              />
            </div>
            <p className="text-[10px] text-gray-600 mt-2">
              {slotsRemaining > 0 ? `${slotsRemaining} slots remaining` : 'All slots claimed — new users get free plan'}
            </p>
          </div>
        )}

        <button
          type="button"
          disabled={saving || !settings.freeGrantEnabled}
          onClick={() => save({ freeGrantLimit: draft.freeGrantLimit })}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium border border-white/10 hover:bg-white/5 disabled:opacity-40"
        >
          <Save className="w-3.5 h-3.5" /> Save limit
        </button>
      </div>

      {/* Promo modal */}
      <div className={`rounded-2xl border p-6 space-y-4 ${settings.modalEnabled ? 'border-orange-500/30 bg-orange-500/[0.04]' : 'border-white/10'}`}
        style={{ background: settings.modalEnabled ? undefined : brand.surface }}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-orange-500/15">
              <Megaphone className="w-6 h-6 text-orange-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-bold text-white">Promo popup modal</h3>
                <Badge variant={settings.modalEnabled ? 'warning' : 'default'}>
                  {settings.modalEnabled ? 'LIVE' : 'Hidden'}
                </Badge>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Show a popup to visitors with your custom message. Users can register directly from the modal.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={toggleModal}
            disabled={saving}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition disabled:opacity-50 ${
              settings.modalEnabled
                ? 'bg-gray-600 hover:bg-gray-500 text-white'
                : 'bg-orange-600 hover:bg-orange-500 text-white'
            }`}
          >
            <Power className="w-4 h-4" />
            {settings.modalEnabled ? 'Hide modal' : 'Show modal'}
          </button>
        </div>

        <div>
          <label className="text-xs text-gray-400 block mb-1.5">Badge text</label>
          <input
            value={draft.modalBadge}
            onChange={e => setDraft(d => d ? { ...d, modalBadge: e.target.value } : d)}
            className={adminInput}
            placeholder="FREE PREMIUM"
          />
        </div>
        <div>
          <label className="text-xs text-gray-400 block mb-1.5">Modal title</label>
          <input
            value={draft.modalTitle}
            onChange={e => setDraft(d => d ? { ...d, modalTitle: e.target.value } : d)}
            className={adminInput}
            placeholder="Limited time offer"
          />
        </div>
        <div>
          <label className="text-xs text-gray-400 block mb-1.5">Message (shown to all users)</label>
          <textarea
            value={draft.modalMessage}
            onChange={e => setDraft(d => d ? { ...d, modalMessage: e.target.value } : d)}
            rows={4}
            className={adminInput + ' resize-y min-h-[100px]'}
            placeholder="Register now and get full premium access free for the first 100 users!"
          />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-400 block mb-1.5">CTA button text</label>
            <input
              value={draft.modalCtaText}
              onChange={e => setDraft(d => d ? { ...d, modalCtaText: e.target.value } : d)}
              className={adminInput}
              placeholder="Claim free access"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 block mb-1.5">CTA action</label>
            <select
              value={draft.modalCtaAction}
              onChange={e => setDraft(d => d ? { ...d, modalCtaAction: e.target.value as 'register' | 'dashboard' } : d)}
              className={adminInput}
            >
              <option value="register">Open registration</option>
              <option value="dashboard">Go to dashboard (logged in)</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            disabled={saving}
            onClick={() => save({ showSlotsRemaining: !settings.showSlotsRemaining })}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs border transition ${
              settings.showSlotsRemaining ? 'border-blue-500/40 bg-blue-500/10 text-blue-300' : 'border-white/10 text-gray-500'
            }`}
          >
            {settings.showSlotsRemaining ? <ToggleRight className="w-3.5 h-3.5" /> : <ToggleLeft className="w-3.5 h-3.5" />}
            Show slots remaining
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => save({ showToLoggedIn: !settings.showToLoggedIn })}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs border transition ${
              settings.showToLoggedIn ? 'border-blue-500/40 bg-blue-500/10 text-blue-300' : 'border-white/10 text-gray-500'
            }`}
          >
            {settings.showToLoggedIn ? <ToggleRight className="w-3.5 h-3.5" /> : <ToggleLeft className="w-3.5 h-3.5" />}
            Show to logged-in users
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            type="button"
            disabled={saving}
            onClick={() => save({
              modalTitle: draft.modalTitle,
              modalMessage: draft.modalMessage,
              modalBadge: draft.modalBadge,
              modalCtaText: draft.modalCtaText,
              modalCtaAction: draft.modalCtaAction,
            })}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
            style={{ background: brand.accent }}
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save modal content
          </button>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs border border-white/10 text-gray-400 hover:text-white hover:bg-white/5"
          >
            <Eye className="w-3.5 h-3.5" /> Preview on site
          </a>
        </div>
      </div>
    </div>
  );
}
