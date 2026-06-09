'use client';

import { useCallback, useEffect, useState } from 'react';
import { Globe, Wrench, Loader2, AlertTriangle, Eye, Save, Power } from 'lucide-react';
import { SectionHeader, Badge, adminInput } from '../ui';
import { brand, APP_NAME } from '@/lib/brand';
import type { SiteSettings } from '@/lib/site-settings';

export default function WebsiteSettingsTab() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [draft, setDraft] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/site-settings');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSettings(data.settings);
      setDraft(data.settings);
    } catch {
      setSettings(null);
      setDraft(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const save = async (patch: Partial<SiteSettings>) => {
    setSaving(true);
    setMsg('');
    try {
      const res = await fetch('/api/admin/site-settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed');
      setSettings(data.settings);
      setDraft(data.settings);
      setMsg('Settings saved');
      setTimeout(() => setMsg(''), 2500);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const toggleMaintenance = () => {
    if (!settings) return;
    const next = !settings.maintenanceMode;
    if (next && !confirm('Turn ON maintenance mode? Public visitors will see the maintenance page instead of the website.')) return;
    save({ maintenanceMode: next });
  };

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
      </div>
    );
  }

  if (!settings || !draft) {
    return (
      <div className="text-center py-16 text-gray-500 text-sm">Could not load website settings.</div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <SectionHeader
        title="Website settings"
        desc={`Control public site availability and maintenance page for ${APP_NAME}`}
      />

      <div
        className={`rounded-2xl border p-6 transition ${settings.maintenanceMode ? 'border-amber-500/40 bg-amber-500/[0.06]' : 'border-white/10 bg-white/[0.02]'}`}
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${settings.maintenanceMode ? 'bg-amber-500/20' : 'bg-white/5'}`}
            >
              {settings.maintenanceMode
                ? <AlertTriangle className="w-6 h-6 text-amber-400" />
                : <Globe className="w-6 h-6 text-green-400" />}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-bold text-white">Maintenance mode</h3>
                <Badge variant={settings.maintenanceMode ? 'warning' : 'success'}>
                  {settings.maintenanceMode ? 'ACTIVE' : 'Site live'}
                </Badge>
              </div>
              <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                {settings.maintenanceMode
                  ? 'Public visitors see the maintenance page. You may still see the live site if logged in as admin with preview enabled — use incognito to test.'
                  : 'Website is publicly accessible. Turn on during updates or deployments.'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={toggleMaintenance}
            disabled={saving}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition disabled:opacity-50 ${
              settings.maintenanceMode
                ? 'bg-green-600 hover:bg-green-500 text-white'
                : 'bg-amber-600 hover:bg-amber-500 text-white'
            }`}
          >
            <Power className="w-4 h-4" />
            {settings.maintenanceMode ? 'Go live' : 'Enable maintenance'}
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 p-6 space-y-4" style={{ background: brand.surface }}>
        <div className="flex items-center gap-2 mb-1">
          <Wrench className="w-4 h-4 text-gray-500" />
          <h3 className="text-sm font-semibold text-white">Maintenance page content</h3>
        </div>
        <p className="text-xs text-gray-600 -mt-2">Shown to visitors when maintenance mode is on.</p>

        <div>
          <label className="text-xs text-gray-400 block mb-1.5">Headline</label>
          <input
            value={draft.maintenanceTitle}
            onChange={e => setDraft(d => d ? { ...d, maintenanceTitle: e.target.value } : d)}
            className={adminInput}
            placeholder="We'll be back soon"
          />
        </div>
        <div>
          <label className="text-xs text-gray-400 block mb-1.5">Message</label>
          <textarea
            value={draft.maintenanceMessage}
            onChange={e => setDraft(d => d ? { ...d, maintenanceMessage: e.target.value } : d)}
            rows={4}
            className={adminInput + ' resize-y min-h-[100px]'}
            placeholder="Explain why the site is down…"
          />
        </div>
        <div>
          <label className="text-xs text-gray-400 block mb-1.5">Estimated return / ETA line</label>
          <input
            value={draft.maintenanceEta}
            onChange={e => setDraft(d => d ? { ...d, maintenanceEta: e.target.value } : d)}
            className={adminInput}
            placeholder="Back online in ~2 hours"
          />
        </div>

        <label className="flex items-center justify-between cursor-pointer p-3 rounded-xl bg-white/[0.03] border border-white/10 gap-3">
          <div>
            <p className="text-xs text-gray-300">Allow admin preview</p>
            <p className="text-[10px] text-gray-600 mt-0.5">When ON, logged-in admins see the live site (with a banner). Turn OFF to see maintenance page yourself too.</p>
          </div>
          <button
            type="button"
            onClick={() => setDraft(d => d ? { ...d, allowAdminBypass: !d.allowAdminBypass } : d)}
            className={`w-10 h-5 rounded-full transition relative shrink-0 ${draft.allowAdminBypass ? 'bg-blue-600' : 'bg-white/10'}`}
          >
            <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${draft.allowAdminBypass ? 'left-5' : 'left-0.5'}`} />
          </button>
        </label>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            type="button"
            disabled={saving}
            onClick={() => save({
              maintenanceTitle: draft.maintenanceTitle,
              maintenanceMessage: draft.maintenanceMessage,
              maintenanceEta: draft.maintenanceEta,
              allowAdminBypass: draft.allowAdminBypass,
            })}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
            style={{ background: brand.accent }}
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save content
          </button>
          <a
            href="/maintenance"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs border border-white/10 text-gray-400 hover:text-white hover:bg-white/5"
          >
            <Eye className="w-3.5 h-3.5" /> Preview page
          </a>
          {msg && <span className="text-xs text-gray-500">{msg}</span>}
        </div>
      </div>
    </div>
  );
}
