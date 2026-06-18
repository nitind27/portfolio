'use client';

import { useCallback, useEffect, useState } from 'react';
import { FileText, Loader2, Save, Plus, Trash2, ExternalLink } from 'lucide-react';
import { SectionHeader, adminInput, adminCard, adminCardStyle } from '../ui';
import { brand, APP_NAME } from '@/lib/brand';
import type { MarketingAboutContent, AboutStat, AboutValue } from '@/lib/marketing-about';

const emptyValue = (): AboutValue => ({ title: '', description: '' });
const emptyStat = (): AboutStat => ({ value: '', label: '' });

export default function AboutPageTab() {
  const [draft, setDraft] = useState<MarketingAboutContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/marketing/about');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setDraft(data.content);
    } catch {
      setDraft(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    if (!draft) return;
    setSaving(true);
    setMsg('');
    try {
      const res = await fetch('/api/admin/marketing/about', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draft),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed');
      setDraft(data.content);
      setMsg('About page saved');
      setTimeout(() => setMsg(''), 2500);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const patch = (patch: Partial<MarketingAboutContent>) => {
    setDraft(d => d ? { ...d, ...patch } : d);
  };

  const patchSeo = (field: keyof MarketingAboutContent['seo'], value: string) => {
    setDraft(d => d ? { ...d, seo: { ...d.seo, [field]: value } } : d);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
      </div>
    );
  }

  if (!draft) {
    return <div className="text-center py-16 text-gray-500 text-sm">Could not load about page content.</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <SectionHeader
        title="About page"
        desc={`Edit the public /about page — hero, mission, values & SEO for ${APP_NAME}`}
        action={(
          <div className="flex items-center gap-2">
            <a
              href="/about"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border border-white/10 text-gray-400 hover:text-white transition"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Preview
            </a>
            <button
              type="button"
              onClick={save}
              disabled={saving}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
              style={{ background: `linear-gradient(135deg, ${brand.accent}, ${brand.accentHover})` }}
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save
            </button>
          </div>
        )}
      />

      {msg && (
        <p className={`text-sm ${msg.includes('failed') || msg.includes('error') ? 'text-red-400' : 'text-green-400'}`}>
          {msg}
        </p>
      )}

      <div className={adminCard} style={adminCardStyle}>
        <div className="p-5 border-b border-white/10 flex items-center gap-2">
          <FileText className="w-4 h-4 text-orange-400" />
          <h3 className="text-sm font-bold text-white">Hero section</h3>
        </div>
        <div className="p-5 space-y-4">
          <Field label="Badge" value={draft.heroBadge} onChange={v => patch({ heroBadge: v })} />
          <Field label="Title" value={draft.heroTitle} onChange={v => patch({ heroTitle: v })} />
          <Field label="Subtitle" value={draft.heroSubtitle} onChange={v => patch({ heroSubtitle: v })} />
          <Field label="Body" value={draft.heroBody} onChange={v => patch({ heroBody: v })} multiline />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card title="Mission">
          <Field label="Title" value={draft.missionTitle} onChange={v => patch({ missionTitle: v })} />
          <Field label="Body" value={draft.missionBody} onChange={v => patch({ missionBody: v })} multiline />
        </Card>
        <Card title="What we do">
          <Field label="Title" value={draft.whatWeDoTitle} onChange={v => patch({ whatWeDoTitle: v })} />
          <Field label="Body" value={draft.whatWeDoBody} onChange={v => patch({ whatWeDoBody: v })} multiline />
        </Card>
      </div>

      <Card title="Offerings">
        <Field label="Section title" value={draft.offeringsTitle} onChange={v => patch({ offeringsTitle: v })} />
        <ListEditor
          label="Bullet points"
          items={draft.offerings}
          onChange={offerings => patch({ offerings })}
        />
      </Card>

      <Card title="Values">
        <Field label="Section title" value={draft.valuesTitle} onChange={v => patch({ valuesTitle: v })} />
        <div className="space-y-3 mt-3">
          {draft.values.map((v, i) => (
            <div key={i} className="p-3 rounded-xl border border-white/10 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">Value {i + 1}</span>
                <button type="button" onClick={() => patch({ values: draft.values.filter((_, j) => j !== i) })} className="text-red-400 hover:text-red-300">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <input className={adminInput} value={v.title} placeholder="Title" onChange={e => {
                const values = [...draft.values];
                values[i] = { ...v, title: e.target.value };
                patch({ values });
              }} />
              <textarea className={adminInput + ' min-h-[72px]'} value={v.description} placeholder="Description" onChange={e => {
                const values = [...draft.values];
                values[i] = { ...v, description: e.target.value };
                patch({ values });
              }} />
            </div>
          ))}
          <button type="button" onClick={() => patch({ values: [...draft.values, emptyValue()] })} className="text-xs text-orange-400 flex items-center gap-1">
            <Plus className="w-3.5 h-3.5" /> Add value
          </button>
        </div>
      </Card>

      <Card title="Stats (hero cards)">
        <div className="grid sm:grid-cols-2 gap-3">
          {draft.stats.map((s, i) => (
            <div key={i} className="p-3 rounded-xl border border-white/10 space-y-2">
              <div className="flex justify-between">
                <span className="text-xs text-gray-500">Stat {i + 1}</span>
                <button type="button" onClick={() => patch({ stats: draft.stats.filter((_, j) => j !== i) })} className="text-red-400">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <input className={adminInput} value={s.value} placeholder="Value" onChange={e => {
                const stats = [...draft.stats];
                stats[i] = { ...s, value: e.target.value };
                patch({ stats });
              }} />
              <input className={adminInput} value={s.label} placeholder="Label" onChange={e => {
                const stats = [...draft.stats];
                stats[i] = { ...s, label: e.target.value };
                patch({ stats });
              }} />
            </div>
          ))}
        </div>
        <button type="button" onClick={() => patch({ stats: [...draft.stats, emptyStat()] })} className="mt-3 text-xs text-orange-400 flex items-center gap-1">
          <Plus className="w-3.5 h-3.5" /> Add stat
        </button>
      </Card>

      <Card title="SEO">
        <div className="space-y-4">
          <Field label="Meta title" value={draft.seo.title} onChange={v => patchSeo('title', v)} />
          <Field label="Meta description" value={draft.seo.description} onChange={v => patchSeo('description', v)} multiline />
          <Field label="Keywords (comma separated)" value={draft.seo.keywords} onChange={v => patchSeo('keywords', v)} />
          <Field label="OG image URL" value={draft.seo.ogImage} onChange={v => patchSeo('ogImage', v)} />
          <Field label="Canonical URL" value={draft.seo.canonicalUrl} onChange={v => patchSeo('canonicalUrl', v)} />
        </div>
      </Card>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className={adminCard} style={adminCardStyle}>
      <div className="px-5 py-3 border-b border-white/10">
        <h3 className="text-sm font-bold text-white">{title}</h3>
      </div>
      <div className="p-5 space-y-3">{children}</div>
    </div>
  );
}

function Field({
  label, value, onChange, multiline,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-xs text-gray-500 mb-1 block">{label}</span>
      {multiline ? (
        <textarea className={adminInput + ' min-h-[88px]'} value={value} onChange={e => onChange(e.target.value)} />
      ) : (
        <input className={adminInput} value={value} onChange={e => onChange(e.target.value)} />
      )}
    </label>
  );
}

function ListEditor({
  label, items, onChange,
}: {
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
}) {
  return (
    <div>
      <span className="text-xs text-gray-500 mb-2 block">{label}</span>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex gap-2">
            <input
              className={adminInput}
              value={item}
              onChange={e => {
                const next = [...items];
                next[i] = e.target.value;
                onChange(next);
              }}
            />
            <button type="button" onClick={() => onChange(items.filter((_, j) => j !== i))} className="px-2 text-red-400 shrink-0">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
        <button type="button" onClick={() => onChange([...items, ''])} className="text-xs text-orange-400 flex items-center gap-1">
          <Plus className="w-3.5 h-3.5" /> Add item
        </button>
      </div>
    </div>
  );
}
