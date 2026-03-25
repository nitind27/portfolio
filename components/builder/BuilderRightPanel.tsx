'use client';
import { useBuilderStore } from '@/lib/store';
import { TEMPLATES } from '@/lib/templates';
import { HexColorPicker } from 'react-colorful';
import { useState, useMemo } from 'react';
import { ThemeConfig, SMTPConfig, PopupConfig, SocialLinks } from '@/lib/types';
import { RightTab } from '../Builder';
import { Check, TestTube, Loader, ExternalLink } from 'lucide-react';

interface Props { tab: RightTab; setTab: (t: RightTab) => void; }

export default function BuilderRightPanel({ tab }: Props) {
  const { getActivePortfolio, updateTheme, switchTemplate, updateSEO, updateSMTP, updatePopup, updateSocial } = useBuilderStore();
  const portfolio = getActivePortfolio();
  if (!portfolio) return null;

  return (
    <aside className="w-64 border-l border-white/10 bg-[#0d0d0d] overflow-y-auto shrink-0 flex flex-col">
      {tab === 'theme' && <ThemePanel theme={portfolio.theme} onUpdate={updateTheme} />}
      {tab === 'templates' && <TemplatesPanel current={portfolio.templateId} onSwitch={switchTemplate} />}
      {tab === 'seo' && <SEOPanel seo={portfolio.seo} onUpdate={updateSEO} />}
      {tab === 'smtp' && <SMTPPanel smtp={portfolio.smtp} onUpdate={updateSMTP} />}
      {tab === 'popup' && <PopupPanel popup={portfolio.popup} theme={portfolio.theme} onUpdate={updatePopup} />}
      {tab === 'social' && <SocialPanel social={portfolio.social} onUpdate={updateSocial} />}
      {tab === 'analytics' && <AnalyticsPanel portfolio={portfolio} />}
      {tab === 'css' && <CSSPanel theme={portfolio.theme} onUpdate={updateTheme} />}
      {tab === 'sections' && <SectionsInfo />}
    </aside>
  );
}

function SectionsInfo() {
  return (
    <div className="p-4">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Section Editor</p>
      <p className="text-sm text-gray-400 leading-relaxed">Click any section in the left panel to open its editor. Drag the grip handle to reorder.</p>
      <div className="mt-4 space-y-2">
        {[
          { icon: '🖱️', text: 'Click section to edit' },
          { icon: '⠿', text: 'Drag to reorder' },
          { icon: '👁️', text: 'Toggle visibility' },
          { icon: '🗑️', text: 'Delete section' },
        ].map((tip, i) => (
          <div key={i} className="flex items-center gap-2 text-xs text-gray-500">
            <span>{tip.icon}</span><span>{tip.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Color palette presets ────────────────────────────────────────────────────
const PALETTES = [
  { name: 'Indigo Night', primary: '#6366f1', secondary: '#8b5cf6', accent: '#f59e0b', bg: '#0a0a0a', text: '#f1f5f9' },
  { name: 'Rose Gold', primary: '#f43f5e', secondary: '#ec4899', accent: '#fbbf24', bg: '#0f0a0a', text: '#fdf2f8' },
  { name: 'Ocean Blue', primary: '#0ea5e9', secondary: '#06b6d4', accent: '#f97316', bg: '#020f1a', text: '#e0f2fe' },
  { name: 'Forest', primary: '#22c55e', secondary: '#16a34a', accent: '#eab308', bg: '#030a05', text: '#f0fdf4' },
  { name: 'Sunset', primary: '#f97316', secondary: '#ef4444', accent: '#a855f7', bg: '#0f0805', text: '#fff7ed' },
  { name: 'Minimal Light', primary: '#18181b', secondary: '#3f3f46', accent: '#6366f1', bg: '#ffffff', text: '#18181b' },
  { name: 'Purple Haze', primary: '#a855f7', secondary: '#7c3aed', accent: '#06b6d4', bg: '#0d0014', text: '#faf5ff' },
  { name: 'Gold Luxury', primary: '#d4af37', secondary: '#b8960c', accent: '#e2e8f0', bg: '#0a0800', text: '#fefce8' },
];

function ThemePanel({ theme, onUpdate }: { theme: ThemeConfig; onUpdate: (u: Partial<ThemeConfig>) => void }) {
  const [activePicker, setActivePicker] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'colors' | 'typography' | 'layout'>('colors');

  const colorFields: { key: keyof ThemeConfig; label: string }[] = [
    { key: 'primaryColor', label: 'Primary' },
    { key: 'secondaryColor', label: 'Secondary' },
    { key: 'accentColor', label: 'Accent' },
    { key: 'backgroundColor', label: 'Background' },
    { key: 'textColor', label: 'Text' },
  ];

  const fonts = ['Inter', 'Playfair Display', 'Roboto', 'Poppins', 'Montserrat', 'Raleway', 'Space Grotesk', 'DM Sans', 'Lato', 'Nunito', 'Josefin Sans', 'Bebas Neue'];

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-white/10">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Theme</p>
        <div className="flex gap-1">
          {(['colors', 'typography', 'layout'] as const).map(t => (
            <button key={t} onClick={() => setActiveTab(t)}
              className={`flex-1 py-1 text-xs rounded transition capitalize ${activeTab === t ? 'bg-indigo-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {activeTab === 'colors' && (
          <>
            {/* Palette presets */}
            <div>
              <p className="text-xs text-gray-500 mb-2">Presets</p>
              <div className="grid grid-cols-2 gap-1.5">
                {PALETTES.map(p => (
                  <button key={p.name} onClick={() => onUpdate({ primaryColor: p.primary, secondaryColor: p.secondary, accentColor: p.accent, backgroundColor: p.bg, textColor: p.text })}
                    className="flex items-center gap-2 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition text-left border border-white/5 hover:border-white/20">
                    <div className="flex gap-0.5 shrink-0">
                      {[p.primary, p.secondary, p.accent].map((c, i) => (
                        <div key={i} className="w-3 h-3 rounded-full" style={{ background: c }} />
                      ))}
                    </div>
                    <span className="text-xs text-gray-400 truncate">{p.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Individual color pickers */}
            <div>
              <p className="text-xs text-gray-500 mb-2">Custom Colors</p>
              <div className="space-y-1.5">
                {colorFields.map(({ key, label }) => (
                  <div key={key} className="relative">
                    <button onClick={() => setActivePicker(activePicker === key ? null : key)}
                      className="w-full flex items-center gap-2 px-2.5 py-2 bg-white/5 rounded-lg hover:bg-white/10 transition">
                      <div className="w-5 h-5 rounded border border-white/20 shrink-0" style={{ background: theme[key] as string }} />
                      <span className="text-xs text-gray-300 flex-1 text-left">{label}</span>
                      <span className="text-xs text-gray-600 font-mono">{(theme[key] as string).toUpperCase()}</span>
                    </button>
                    {activePicker === key && (
                      <div className="absolute right-0 top-full mt-1 z-50 bg-[#1a1a1a] border border-white/10 rounded-xl p-3 shadow-2xl">
                        <HexColorPicker color={theme[key] as string} onChange={v => onUpdate({ [key]: v })} />
                        <input value={theme[key] as string} onChange={e => onUpdate({ [key]: e.target.value })}
                          className="mt-2 w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-white font-mono focus:outline-none" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {activeTab === 'typography' && (
          <>
            <div>
              <p className="text-xs text-gray-500 mb-2">Font Family</p>
              <select value={theme.fontFamily} onChange={e => onUpdate({ fontFamily: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none">
                {fonts.map(f => <option key={f} value={f} className="bg-[#1a1a1a]">{f}</option>)}
              </select>
              <p className="text-xs text-gray-600 mt-1" style={{ fontFamily: theme.fontFamily }}>The quick brown fox jumps over the lazy dog</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-2">Font Size</p>
              <div className="flex gap-1">
                {(['sm', 'md', 'lg'] as const).map(s => (
                  <button key={s} onClick={() => onUpdate({ fontSize: s })}
                    className={`flex-1 py-1.5 text-xs rounded transition uppercase ${theme.fontSize === s ? 'bg-indigo-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {activeTab === 'layout' && (
          <>
            <div>
              <p className="text-xs text-gray-500 mb-2">Border Radius</p>
              <div className="grid grid-cols-5 gap-1">
                {([
                  { v: 'none', preview: 'rounded-none', label: 'None' },
                  { v: 'sm', preview: 'rounded', label: 'SM' },
                  { v: 'md', preview: 'rounded-lg', label: 'MD' },
                  { v: 'lg', preview: 'rounded-2xl', label: 'LG' },
                  { v: 'full', preview: 'rounded-full', label: 'Full' },
                ] as const).map(({ v, preview, label }) => (
                  <button key={v} onClick={() => onUpdate({ borderRadius: v })}
                    className={`flex flex-col items-center gap-1 py-2 px-1 rounded-lg border transition ${theme.borderRadius === v ? 'border-indigo-500 bg-indigo-500/15' : 'border-white/10 hover:bg-white/5'}`}>
                    <div className={`w-5 h-5 border-2 ${theme.borderRadius === v ? 'border-indigo-400' : 'border-gray-500'} ${preview}`} />
                    <span className="text-xs text-gray-400">{label}</span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-2">Section Spacing</p>
              <div className="grid grid-cols-3 gap-1">
                {([
                  { v: 'compact', label: 'Compact', bars: 2 },
                  { v: 'normal', label: 'Normal', bars: 3 },
                  { v: 'relaxed', label: 'Relaxed', bars: 5 },
                ] as const).map(({ v, label, bars }) => (
                  <button key={v} onClick={() => onUpdate({ spacing: v })}
                    className={`flex flex-col items-center gap-1.5 py-2.5 rounded-xl border transition ${theme.spacing === v ? 'border-indigo-500 bg-indigo-500/15' : 'border-white/10 hover:bg-white/5'}`}>
                    <div className="flex flex-col gap-0.5 w-6">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className={`h-1 rounded-full ${theme.spacing === v ? 'bg-indigo-400' : 'bg-gray-600'}`} style={{ marginBottom: i < 2 ? bars * 1.5 : 0 }} />
                      ))}
                    </div>
                    <span className="text-xs text-gray-400">{label}</span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-2">Animation Style</p>
              <div className="grid grid-cols-2 gap-2">
                {([
                  { v: 'none', label: 'None', icon: '⏹', desc: 'No animation' },
                  { v: 'subtle', label: 'Subtle', icon: '🌊', desc: 'Gentle fade up' },
                  { v: 'moderate', label: 'Moderate', icon: '✨', desc: 'Smooth slide' },
                  { v: 'expressive', label: 'Expressive', icon: '🚀', desc: 'Bold spring' },
                ] as const).map(({ v, label, icon, desc }) => (
                  <button key={v} onClick={() => onUpdate({ animation: v })}
                    className={`p-2.5 rounded-xl border text-left transition ${theme.animation === v ? 'border-indigo-500 bg-indigo-500/15' : 'border-white/10 hover:border-white/20 hover:bg-white/5'}`}>
                    <div className="text-xl mb-1">{icon}</div>
                    <p className="text-xs font-semibold text-white">{label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Templates Panel ──────────────────────────────────────────────────────────
function TemplatesPanel({ current, onSwitch }: { current: string; onSwitch: (id: string) => void }) {
  const [filter, setFilter] = useState('all');
  const categories = ['all', 'developer', 'designer', 'photographer', 'model', 'agency', 'minimal', 'creative'];
  const filtered = TEMPLATES.filter(t => filter === 'all' || t.category === filter);

  return (
    <div className="p-3 space-y-3">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Templates</p>
      <div className="flex flex-wrap gap-1">
        {categories.map(c => (
          <button key={c} onClick={() => setFilter(c)}
            className={`px-2 py-0.5 text-xs rounded-full transition capitalize ${filter === c ? 'bg-indigo-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
            {c}
          </button>
        ))}
      </div>
      <div className="space-y-2">
        {filtered.map(t => (
          <button key={t.id} onClick={() => onSwitch(t.id)}
            className={`w-full text-left p-3 rounded-xl border transition ${current === t.id ? 'border-indigo-500 bg-indigo-500/10' : 'border-white/10 hover:border-white/20 hover:bg-white/5'}`}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-medium">{t.name}</span>
              {current === t.id && <Check className="w-3.5 h-3.5 text-indigo-400" />}
            </div>
            <p className="text-xs text-gray-500 mb-2">{t.description}</p>
            <div className="flex items-center justify-between">
              <div className="flex gap-1">
                {[t.defaultTheme.primaryColor, t.defaultTheme.secondaryColor, t.defaultTheme.accentColor, t.defaultTheme.backgroundColor].map((c, i) => (
                  <div key={i} className="w-4 h-4 rounded-full border border-white/10" style={{ background: c }} />
                ))}
              </div>
              <span className="text-xs text-gray-600 capitalize">{t.category}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── SEO Panel ────────────────────────────────────────────────────────────────
function SEOPanel({ seo, onUpdate }: { seo: any; onUpdate: (u: any) => void }) {
  const charCount = (seo.description || '').length;
  return (
    <div className="p-3 space-y-3">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">SEO Settings</p>

      {/* Preview card */}
      <div className="bg-white/5 rounded-xl p-3 border border-white/10">
        <p className="text-xs text-blue-400 truncate">{seo.canonicalUrl || 'https://yoursite.com'}</p>
        <p className="text-sm text-blue-300 font-medium mt-0.5 truncate">{seo.title || 'Page Title'}</p>
        <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{seo.description || 'Meta description will appear here...'}</p>
      </div>

      {[
        { key: 'title', label: 'Page Title', type: 'text', placeholder: 'John Doe - Portfolio', max: 60 },
        { key: 'description', label: 'Meta Description', type: 'textarea', placeholder: 'Full stack developer...', max: 160 },
        { key: 'keywords', label: 'Keywords', type: 'text', placeholder: 'developer, react, portfolio' },
        { key: 'canonicalUrl', label: 'Canonical URL', type: 'url', placeholder: 'https://yoursite.com' },
        { key: 'twitterHandle', label: 'Twitter Handle', type: 'text', placeholder: '@yourhandle' },
        { key: 'ogImage', label: 'OG Image URL', type: 'url', placeholder: 'https://...' },
      ].map(f => (
        <div key={f.key}>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs text-gray-400">{f.label}</label>
            {f.max && f.key === 'description' && (
              <span className={`text-xs ${charCount > f.max ? 'text-red-400' : 'text-gray-600'}`}>{charCount}/{f.max}</span>
            )}
          </div>
          {f.type === 'textarea' ? (
            <textarea value={seo[f.key] || ''} onChange={e => onUpdate({ [f.key]: e.target.value })} rows={3} placeholder={f.placeholder}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 resize-none" />
          ) : (
            <input type={f.type} value={seo[f.key] || ''} onChange={e => onUpdate({ [f.key]: e.target.value })} placeholder={f.placeholder}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500" />
          )}
        </div>
      ))}
    </div>
  );
}

// ── SMTP Panel ───────────────────────────────────────────────────────────────
const SMTP_PRESETS: Record<string, Partial<SMTPConfig>> = {
  gmail:    { host: 'smtp.gmail.com',     port: 587, secure: false },
  outlook:  { host: 'smtp.office365.com', port: 587, secure: false },
  sendgrid: { host: 'smtp.sendgrid.net',  port: 587, secure: false },
  mailgun:  { host: 'smtp.mailgun.org',   port: 587, secure: false },
  custom:   { host: '',                   port: 587, secure: false },
};

function SMTPPanel({ smtp, onUpdate }: { smtp: SMTPConfig; onUpdate: (u: Partial<SMTPConfig>) => void }) {
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<'idle' | 'ok' | 'fail'>('idle');

  const testConnection = async () => {
    setTesting(true); setTestResult('idle');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Test', email: smtp.user, message: 'SMTP test from Portfolio Builder', smtp }),
      });
      setTestResult(res.ok ? 'ok' : 'fail');
    } catch { setTestResult('fail'); }
    finally { setTesting(false); }
  };

  return (
    <div className="p-3 space-y-3">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Email / SMTP</p>
      <p className="text-xs text-gray-500">Connect your email to receive contact form submissions.</p>

      <div>
        <p className="text-xs text-gray-400 mb-1.5">Provider Preset</p>
        <div className="grid grid-cols-3 gap-1">
          {(['gmail', 'outlook', 'sendgrid', 'mailgun', 'custom'] as const).map(p => (
            <button key={p} onClick={() => onUpdate({ ...SMTP_PRESETS[p], provider: p })}
              className={`py-1.5 text-xs rounded transition capitalize ${smtp.provider === p ? 'bg-indigo-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
              {p}
            </button>
          ))}
        </div>
      </div>

      {smtp.provider === 'gmail' && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-2.5 text-xs text-amber-300 leading-relaxed">
          Use an App Password. Enable 2FA → Google Account → Security → App Passwords.
        </div>
      )}

      {[
        { key: 'host', label: 'SMTP Host', placeholder: 'smtp.gmail.com', type: 'text' },
        { key: 'port', label: 'Port', placeholder: '587', type: 'number' },
        { key: 'user', label: 'Username / Email', placeholder: 'you@gmail.com', type: 'text' },
        { key: 'password', label: 'Password / API Key', placeholder: '••••••••', type: 'password' },
        { key: 'fromName', label: 'From Name', placeholder: 'My Portfolio', type: 'text' },
        { key: 'toEmail', label: 'Deliver To', placeholder: 'you@gmail.com', type: 'email' },
      ].map(f => (
        <div key={f.key}>
          <label className="text-xs text-gray-400 block mb-1">{f.label}</label>
          <input type={f.type} value={(smtp as any)[f.key] || ''} placeholder={f.placeholder}
            onChange={e => onUpdate({ [f.key]: f.key === 'port' ? Number(e.target.value) : e.target.value } as any)}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500" />
        </div>
      ))}

      <label className="flex items-center gap-2 cursor-pointer">
        <div onClick={() => onUpdate({ secure: !smtp.secure })}
          className={`w-9 h-5 rounded-full transition relative shrink-0 ${smtp.secure ? 'bg-indigo-600' : 'bg-white/10'}`}>
          <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${smtp.secure ? 'left-4' : 'left-0.5'}`} />
        </div>
        <span className="text-xs text-gray-400">Use SSL/TLS (port 465)</span>
      </label>

      <button onClick={testConnection} disabled={testing || !smtp.host || !smtp.user}
        className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition text-sm">
        {testing ? <Loader className="w-4 h-4 animate-spin" /> : <TestTube className="w-4 h-4" />}
        {testing ? 'Testing...' : 'Send Test Email'}
      </button>
      {testResult === 'ok' && <p className="text-xs text-green-400 text-center">✅ Test email sent!</p>}
      {testResult === 'fail' && <p className="text-xs text-red-400 text-center">❌ Failed. Check credentials.</p>}
    </div>
  );
}

// ── Popup Panel ──────────────────────────────────────────────────────────────
function PopupPanel({ popup, theme, onUpdate }: { popup: PopupConfig; theme: ThemeConfig; onUpdate: (u: Partial<PopupConfig>) => void }) {
  const [bgPicker, setBgPicker] = useState(false);
  const [txtPicker, setTxtPicker] = useState(false);

  return (
    <div className="p-3 space-y-3">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Landing Popup</p>

      <label className="flex items-center justify-between cursor-pointer p-2 bg-white/5 rounded-lg">
        <span className="text-sm text-gray-300">Enable Popup</span>
        <div onClick={() => onUpdate({ enabled: !popup.enabled })}
          className={`w-10 h-5 rounded-full transition relative shrink-0 ${popup.enabled ? 'bg-indigo-600' : 'bg-white/10'}`}>
          <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${popup.enabled ? 'left-5' : 'left-0.5'}`} />
        </div>
      </label>

      {popup.enabled && (
        <>
          <div>
            <p className="text-xs text-gray-400 mb-1.5">Type</p>
            <div className="space-y-1">
              {([
                { v: 'message', label: '💬 Message', desc: 'Simple welcome message' },
                { v: 'email-capture', label: '📧 Email Capture', desc: 'Collect email addresses' },
                { v: 'announcement', label: '📢 Announcement', desc: 'Important notice' },
              ] as const).map(({ v, label, desc }) => (
                <button key={v} onClick={() => onUpdate({ type: v })}
                  className={`w-full text-left p-2.5 rounded-lg border transition ${popup.type === v ? 'border-indigo-500 bg-indigo-500/10' : 'border-white/10 hover:bg-white/5'}`}>
                  <p className="text-xs font-medium">{label}</p>
                  <p className="text-xs text-gray-500">{desc}</p>
                </button>
              ))}
            </div>
          </div>

          {[
            { key: 'title', label: 'Title' },
            { key: 'message', label: 'Message', textarea: true },
            ...(popup.type !== 'email-capture' ? [{ key: 'buttonText', label: 'Button Text' }] : []),
          ].map((f: any) => (
            <div key={f.key}>
              <label className="text-xs text-gray-400 block mb-1">{f.label}</label>
              {f.textarea ? (
                <textarea value={(popup as any)[f.key]} onChange={e => onUpdate({ [f.key]: e.target.value })} rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 resize-none" />
              ) : (
                <input value={(popup as any)[f.key]} onChange={e => onUpdate({ [f.key]: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500" />
              )}
            </div>
          ))}

          <div>
            <label className="text-xs text-gray-400 block mb-1">Delay (seconds)</label>
            <input type="range" min={0} max={15} value={popup.delay} onChange={e => onUpdate({ delay: Number(e.target.value) })}
              className="w-full accent-indigo-500" />
            <p className="text-xs text-gray-600 text-right">{popup.delay}s</p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Background', key: 'bgColor', open: bgPicker, setOpen: setBgPicker, closeOther: () => setTxtPicker(false) },
              { label: 'Text', key: 'textColor', open: txtPicker, setOpen: setTxtPicker, closeOther: () => setBgPicker(false) },
            ].map(({ label, key, open, setOpen, closeOther }) => (
              <div key={key} className="relative">
                <p className="text-xs text-gray-400 mb-1">{label}</p>
                <button onClick={() => { setOpen(!open); closeOther(); }}
                  className="w-full h-8 rounded-lg border border-white/10 transition hover:border-white/30" style={{ background: (popup as any)[key] }} />
                {open && (
                  <div className="absolute left-0 top-full mt-1 z-50 bg-[#1a1a1a] border border-white/10 rounded-xl p-3 shadow-2xl">
                    <HexColorPicker color={(popup as any)[key]} onChange={v => onUpdate({ [key]: v })} />
                  </div>
                )}
              </div>
            ))}
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <div onClick={() => onUpdate({ showOnce: !popup.showOnce })}
              className={`w-9 h-5 rounded-full transition relative shrink-0 ${popup.showOnce ? 'bg-indigo-600' : 'bg-white/10'}`}>
              <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${popup.showOnce ? 'left-4' : 'left-0.5'}`} />
            </div>
            <span className="text-xs text-gray-400">Show once per session</span>
          </label>
        </>
      )}
    </div>
  );
}

// ── Social Panel ─────────────────────────────────────────────────────────────
const SOCIAL_FIELDS: { key: keyof SocialLinks; label: string; placeholder: string; icon: string }[] = [
  { key: 'github', label: 'GitHub', placeholder: 'https://github.com/username', icon: '🐙' },
  { key: 'linkedin', label: 'LinkedIn', placeholder: 'https://linkedin.com/in/username', icon: '💼' },
  { key: 'twitter', label: 'Twitter / X', placeholder: 'https://twitter.com/username', icon: '🐦' },
  { key: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/username', icon: '📸' },
  { key: 'youtube', label: 'YouTube', placeholder: 'https://youtube.com/@channel', icon: '▶️' },
  { key: 'dribbble', label: 'Dribbble', placeholder: 'https://dribbble.com/username', icon: '🏀' },
  { key: 'behance', label: 'Behance', placeholder: 'https://behance.net/username', icon: '🎨' },
  { key: 'website', label: 'Website', placeholder: 'https://yourwebsite.com', icon: '🌐' },
];

function SocialPanel({ social, onUpdate }: { social: SocialLinks; onUpdate: (u: Partial<SocialLinks>) => void }) {
  return (
    <div className="p-3 space-y-3">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Social Links</p>
      <p className="text-xs text-gray-500">These appear in the hero section and footer.</p>
      {SOCIAL_FIELDS.map(f => (
        <div key={f.key}>
          <label className="text-xs text-gray-400 flex items-center gap-1.5 mb-1">
            <span>{f.icon}</span>{f.label}
          </label>
          <div className="flex gap-1.5">
            <input type="url" value={(social as any)[f.key] || ''} placeholder={f.placeholder}
              onChange={e => onUpdate({ [f.key]: e.target.value })}
              className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500" />
            {(social as any)[f.key] && (
              <a href={(social as any)[f.key]} target="_blank" rel="noopener noreferrer"
                className="p-1.5 bg-white/5 rounded-lg hover:bg-white/10 transition text-gray-400 hover:text-white">
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Analytics Panel ──────────────────────────────────────────────────────────
function AnalyticsPanel({ portfolio }: { portfolio: any }) {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const views = useMemo(() => days.map(() => Math.floor(Math.random() * 80 + 20)), []);
  const maxV = Math.max(...views);
  const totalViews = views.reduce((a, b) => a + b, 0);
  const totalSections = portfolio.sections.filter((s: any) => s.visible).length;

  return (
    <div className="p-3 space-y-4">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Analytics</p>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-2">
        {[
          { label: 'Total Views', value: totalViews, color: 'text-indigo-400' },
          { label: 'Unique Visitors', value: Math.floor(totalViews * 0.7), color: 'text-green-400' },
          { label: 'Sections', value: totalSections, color: 'text-blue-400' },
          { label: 'Avg. Time', value: '2m 34s', color: 'text-purple-400' },
        ].map((s, i) => (
          <div key={i} className="bg-white/5 rounded-xl p-3 border border-white/5">
            <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Bar chart */}
      <div>
        <p className="text-xs text-gray-500 mb-2">Views this week</p>
        <div className="flex items-end gap-1 h-20">
          {views.map((v, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full rounded-t transition-all" style={{ height: `${(v / maxV) * 64}px`, background: `linear-gradient(to top, #6366f1, #8b5cf6)` }} />
              <span className="text-xs text-gray-600">{days[i]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Portfolio info */}
      <div className="space-y-2 border-t border-white/10 pt-3">
        <div className="flex justify-between text-xs">
          <span className="text-gray-500">Status</span>
          <span className={portfolio.published ? 'text-green-400' : 'text-gray-400'}>{portfolio.published ? '🟢 Live' : '⚫ Draft'}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-gray-500">Template</span>
          <span className="text-gray-300">{portfolio.templateId}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-gray-500">Sections</span>
          <span className="text-gray-300">{portfolio.sections.length} total</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-gray-500">Language</span>
          <span className="text-gray-300 uppercase">{portfolio.language}</span>
        </div>
      </div>

      <p className="text-xs text-gray-600 text-center">Analytics are simulated. Connect a real analytics service via custom code.</p>
    </div>
  );
}

// ── Custom CSS Panel ─────────────────────────────────────────────────────────
function CSSPanel({ theme, onUpdate }: { theme: ThemeConfig; onUpdate: (u: Partial<ThemeConfig>) => void }) {
  const placeholder = `/* Custom CSS — applied globally */

/* Example: style the hero section */
.section-hero h1 {
  letter-spacing: -0.02em;
}

/* Example: custom button hover */
a[href] {
  transition: all 0.3s ease;
}`;

  return (
    <div className="p-3 space-y-3 flex flex-col h-full">
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Custom CSS</p>
        <p className="text-xs text-gray-500 mt-1">Injected into the portfolio preview and exports.</p>
      </div>

      <textarea
        value={theme.customCSS || ''}
        onChange={e => onUpdate({ customCSS: e.target.value })}
        placeholder={placeholder}
        spellCheck={false}
        className="flex-1 w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-3 py-3 text-xs text-green-300 font-mono focus:outline-none focus:border-indigo-500 resize-none leading-relaxed"
        style={{ minHeight: 300 }}
      />

      <div className="space-y-1.5">
        <p className="text-xs text-gray-500">Quick snippets</p>
        {[
          { label: 'Hide nav', css: 'nav { display: none; }' },
          { label: 'Full-width sections', css: '.section .container { max-width: 100%; }' },
          { label: 'Glassmorphism cards', css: '.card { backdrop-filter: blur(10px); background: rgba(255,255,255,0.05); }' },
        ].map(s => (
          <button key={s.label} onClick={() => onUpdate({ customCSS: (theme.customCSS || '') + '\n' + s.css })}
            className="w-full text-left px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs text-gray-400 hover:text-white transition font-mono">
            + {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}
