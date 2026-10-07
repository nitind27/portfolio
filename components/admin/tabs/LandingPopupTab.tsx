'use client';

import { useCallback, useEffect, useState } from 'react';
import { ImagePlus, Loader2, Save, Trash2, Eye, Power } from 'lucide-react';
import { SectionHeader, Badge, adminInput } from '../ui';
import { brand } from '@/lib/brand';
import type { PromoCampaignSettings } from '@/lib/promo-campaign';

export default function LandingPopupTab() {
  const [draft, setDraft] = useState<PromoCampaignSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/promo-campaign');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not load popup');
      setDraft(data.settings);
    } catch (e) {
      setDraft(null);
      setMsg(e instanceof Error ? e.message : 'Could not load popup');
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
      setDraft(data.settings);
      setMsg('Popup saved');
      setTimeout(() => setMsg(''), 2500);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    setMsg('');
    try {
      const body = new FormData();
      body.append('file', file);
      const res = await fetch('/api/admin/landing-popup/image', { method: 'POST', body });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      setDraft(data.settings);
      setMsg('Image uploaded. Save size if you changed it.');
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
      </div>
    );
  }

  if (!draft) {
    return <div className="text-center py-16 text-gray-500 text-sm">{msg || 'Could not load popup settings.'}</div>;
  }

  const width = draft.modalImageWidth || 480;
  const height = draft.modalImageHeight || 0;

  return (
    <div className="space-y-6 max-w-4xl">
      <SectionHeader
        title="Landing popup"
        desc="Upload an image and set its size. It opens as a modal on the public landing page."
      />

      {msg && (
        <div className={`text-xs px-4 py-2 rounded-xl border ${/fail|error|could not/i.test(msg) ? 'border-red-500/30 text-red-300 bg-red-500/10' : 'border-green-500/30 text-green-300 bg-green-500/10'}`}>
          {msg}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 p-5" style={{ background: brand.surface }}>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-white">Show on landing page</h3>
            <Badge variant={draft.modalEnabled ? 'warning' : 'default'}>{draft.modalEnabled ? 'LIVE' : 'Hidden'}</Badge>
          </div>
          <p className="text-xs text-gray-500 mt-1">Visitors see this once until they close it. A new image shows again.</p>
        </div>
        <button
          type="button"
          disabled={saving}
          onClick={() => save({ modalEnabled: !draft.modalEnabled })}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-50 ${draft.modalEnabled ? 'bg-gray-600' : 'bg-orange-600'}`}
        >
          <Power className="w-4 h-4" />
          {draft.modalEnabled ? 'Hide popup' : 'Show popup'}
        </button>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="space-y-4 rounded-2xl border border-white/10 p-5" style={{ background: brand.surface }}>
          <label className="flex items-center justify-center gap-2 px-4 py-8 rounded-xl border border-dashed border-white/15 text-sm text-gray-300 cursor-pointer hover:bg-white/[0.03]">
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImagePlus className="w-4 h-4" />}
            {uploading ? 'Uploading…' : 'Upload popup image'}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              disabled={uploading}
              onChange={e => onFile(e.target.files?.[0])}
            />
          </label>
          {draft.modalImageUrl && (
            <button
              type="button"
              disabled={saving}
              onClick={() => save({ modalImageUrl: '' })}
              className="flex items-center gap-2 text-xs text-red-300 hover:text-red-200"
            >
              <Trash2 className="w-3.5 h-3.5" /> Remove image
            </button>
          )}

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-gray-400 block mb-1.5">Width (px)</label>
              <input
                type="number"
                min={240}
                max={900}
                value={draft.modalImageWidth}
                onChange={e => setDraft(d => d ? { ...d, modalImageWidth: Number(e.target.value) } : d)}
                className={adminInput}
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1.5">Height (px)</label>
              <input
                type="number"
                min={0}
                max={1000}
                value={draft.modalImageHeight}
                onChange={e => setDraft(d => d ? { ...d, modalImageHeight: Number(e.target.value) } : d)}
                className={adminInput}
              />
              <p className="text-[10px] text-gray-600 mt-1">0 = auto height</p>
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1.5">Radius (px)</label>
              <input
                type="number"
                min={0}
                max={48}
                value={draft.modalImageRadius}
                onChange={e => setDraft(d => d ? { ...d, modalImageRadius: Number(e.target.value) } : d)}
                className={adminInput}
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-400 block mb-1.5">Click link (optional)</label>
            <input
              value={draft.modalLinkUrl}
              onChange={e => setDraft(d => d ? { ...d, modalLinkUrl: e.target.value } : d)}
              placeholder="https://… or /pricing"
              className={adminInput}
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 block mb-1.5">Button text (optional)</label>
            <input
              value={draft.modalCtaText}
              onChange={e => setDraft(d => d ? { ...d, modalCtaText: e.target.value } : d)}
              placeholder="Leave empty to hide the button"
              className={adminInput}
            />
          </div>

          <label className="flex items-center gap-2 text-xs text-gray-400">
            <input
              type="checkbox"
              checked={draft.modalLandingOnly}
              onChange={e => setDraft(d => d ? { ...d, modalLandingOnly: e.target.checked } : d)}
            />
            Only on the landing page
          </label>
          <label className="flex items-center gap-2 text-xs text-gray-400">
            <input
              type="checkbox"
              checked={draft.showToLoggedIn}
              onChange={e => setDraft(d => d ? { ...d, showToLoggedIn: e.target.checked } : d)}
            />
            Also show to logged-in users
          </label>

          <button
            type="button"
            disabled={saving}
            onClick={() => save({
              modalImageWidth: draft.modalImageWidth,
              modalImageHeight: draft.modalImageHeight,
              modalImageRadius: draft.modalImageRadius,
              modalLinkUrl: draft.modalLinkUrl,
              modalCtaText: draft.modalCtaText,
              modalLandingOnly: draft.modalLandingOnly,
              showToLoggedIn: draft.showToLoggedIn,
              modalEnabled: draft.modalEnabled,
            })}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
            style={{ background: brand.accent }}
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save popup
          </button>
        </div>

        <div className="rounded-2xl border border-white/10 p-5" style={{ background: '#070f1c' }}>
          <p className="text-xs text-gray-500 mb-4 flex items-center gap-1.5"><Eye className="w-3.5 h-3.5" /> Preview</p>
          <div className="mx-auto rounded-2xl border border-white/10 bg-[#102a43] p-4" style={{ maxWidth: width }}>
            {draft.modalImageUrl ? (
              <img
                src={draft.modalImageUrl}
                alt="Popup preview"
                className="w-full"
                style={{
                  height: height > 0 ? height : 'auto',
                  objectFit: 'contain',
                  borderRadius: draft.modalImageRadius,
                }}
              />
            ) : (
              <div className="h-40 rounded-xl border border-dashed border-white/10 flex items-center justify-center text-xs text-gray-500">
                No image yet
              </div>
            )}
            {draft.modalCtaText && (
              <div className="mt-3 py-2.5 rounded-xl text-center text-sm font-semibold text-white" style={{ background: brand.accent }}>
                {draft.modalCtaText}
              </div>
            )}
          </div>
          <p className="text-[11px] text-gray-600 mt-3 text-center">{width}px wide{height > 0 ? ` · ${height}px tall` : ' · auto height'}</p>
        </div>
      </div>
    </div>
  );
}
