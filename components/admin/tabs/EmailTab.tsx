'use client';
import { useEffect, useState } from 'react';
import {
  Mail, Send, CheckCircle, XCircle, Loader2, Eye, EyeOff,
  RefreshCw, Zap, Settings, MessageSquare, CreditCard,
} from 'lucide-react';

interface SmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  password: string;
  fromName: string;
  fromEmail: string;
  provider: string;
  enabled: boolean;
  welcomeMessage: string;
  paymentMessage: string;
  hasPassword?: boolean;
}

const PROVIDERS = [
  { id: 'custom', label: 'Custom SMTP', host: '' },
  { id: 'gmail', label: 'Gmail', host: 'smtp.gmail.com' },
  { id: 'outlook', label: 'Outlook / Hotmail', host: 'smtp-mail.outlook.com' },
  { id: 'sendgrid', label: 'SendGrid', host: 'smtp.sendgrid.net' },
  { id: 'mailgun', label: 'Mailgun', host: 'smtp.mailgun.org' },
  { id: 'zoho', label: 'Zoho Mail', host: 'smtp.zoho.com' },
  { id: 'brevo', label: 'Brevo (Sendinblue)', host: 'smtp-relay.brevo.com' },
];

const defaultCfg: SmtpConfig = {
  host: '', port: 587, secure: false, user: '', password: '',
  fromName: '', fromEmail: '', provider: 'custom', enabled: true,
  welcomeMessage: '', paymentMessage: '',
};

type PreviewType = 'welcome' | 'payment' | 'failed' | 'test';

const PREVIEW_OPTIONS: { id: PreviewType; label: string; icon: typeof Mail }[] = [
  { id: 'welcome', label: 'Welcome Email', icon: Mail },
  { id: 'payment', label: 'Payment Confirmed', icon: CreditCard },
  { id: 'failed', label: 'Payment Failed', icon: XCircle },
  { id: 'test', label: 'Test Email', icon: Zap },
];

export default function EmailTab() {
  const [cfg, setCfg] = useState<SmtpConfig>(defaultCfg);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [testing, setTesting] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [saved, setSaved] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; msg: string } | null>(null);
  const [preview, setPreview] = useState<PreviewType>('welcome');
  const [previewHtml, setPreviewHtml] = useState('');
  const [loadingPreview, setLoadingPreview] = useState(false);

  // ── Load config ──
  useEffect(() => {
    fetch('/api/admin/smtp').then(r => r.json()).then(d => {
      if (d.smtp) setCfg({ ...defaultCfg, ...d.smtp });
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  // ── Load preview HTML ──
  useEffect(() => {
    setLoadingPreview(true);
    fetch(`/api/admin/email-preview?type=${preview}`)
      .then(r => r.text())
      .then(html => { setPreviewHtml(html); setLoadingPreview(false); })
      .catch(() => setLoadingPreview(false));
  }, [preview]);

  const patch = (u: Partial<SmtpConfig>) => setCfg(p => ({ ...p, ...u }));

  const onProviderChange = (id: string) => {
    const p = PROVIDERS.find(x => x.id === id);
    patch({ provider: id, host: p?.host || '' });
  };

  const save = async () => {
    setSaving(true); setSaved(false);
    try {
      const res = await fetch('/api/admin/smtp', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cfg),
      });
      if (res.ok) { setSaved(true); setTimeout(() => setSaved(false), 3000); }
    } finally { setSaving(false); }
  };

  const sendTest = async () => {
    if (!testEmail) return;
    setTesting(true); setTestResult(null);
    try {
      const res = await fetch('/api/admin/smtp', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: testEmail }),
      });
      const d = await res.json();
      setTestResult(d.ok ? { ok: true, msg: `Test email sent to ${testEmail}` } : { ok: false, msg: d.error || 'Failed to send' });
    } finally { setTesting(false); }
  };

  const inputCls = 'w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition placeholder-gray-600';
  const labelCls = 'block text-xs font-medium text-gray-400 mb-1.5';

  if (loading) return (
    <div className="flex items-center justify-center py-32">
      <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
    </div>
  );

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2"><Mail className="w-5 h-5 text-blue-400" /> Email & SMTP</h2>
          <p className="text-sm text-gray-500 mt-0.5">Configure transactional emails sent to users on registration and payment.</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Enable toggle */}
          <label className="flex items-center gap-2 cursor-pointer px-3 py-2 rounded-xl border border-white/10 bg-white/3">
            <span className="text-xs text-gray-300">Emails enabled</span>
            <div onClick={() => patch({ enabled: !cfg.enabled })}
              className={`w-9 h-5 rounded-full relative transition shrink-0 ${cfg.enabled ? 'bg-blue-600' : 'bg-white/10'}`}>
              <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${cfg.enabled ? 'left-4' : 'left-0.5'}`} />
            </div>
          </label>
          <button onClick={save} disabled={saving}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-sm font-semibold transition">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <CheckCircle className="w-4 h-4 text-green-300" /> : <Settings className="w-4 h-4" />}
            {saved ? 'Saved!' : 'Save Config'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        {/* ── LEFT: Config ── */}
        <div className="space-y-5">

          {/* Provider */}
          <div className="p-4 rounded-2xl border border-white/10 bg-white/[0.02] space-y-4">
            <p className="text-xs font-semibold text-gray-300 uppercase tracking-wider flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-blue-400" /> SMTP Provider
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {PROVIDERS.map(p => (
                <button key={p.id} type="button" onClick={() => onProviderChange(p.id)}
                  className={`py-2 px-3 rounded-xl text-xs font-medium border transition text-left ${
                    cfg.provider === p.id
                      ? 'border-blue-500 bg-blue-500/15 text-white'
                      : 'border-white/10 text-gray-400 hover:bg-white/5 hover:text-white'
                  }`}>
                  {p.label}
                </button>
              ))}
            </div>

            {cfg.provider === 'gmail' && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-xs text-amber-300 leading-relaxed">
                Gmail requires an <strong>App Password</strong> (not your regular password). Enable 2FA on your Google account → Security → App Passwords → generate one.
              </div>
            )}
            {cfg.provider === 'sendgrid' && (
              <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/25 text-xs text-blue-300 leading-relaxed">
                SendGrid: use <code className="bg-black/30 px-1 rounded">apikey</code> as username and your SendGrid API key as password.
              </div>
            )}
          </div>

          {/* Connection */}
          <div className="p-4 rounded-2xl border border-white/10 bg-white/[0.02] space-y-3">
            <p className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Connection</p>
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className={labelCls}>SMTP Host</label>
                <input value={cfg.host} onChange={e => patch({ host: e.target.value })} placeholder="smtp.gmail.com" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Port</label>
                <input type="number" value={cfg.port} onChange={e => patch({ port: Number(e.target.value) })} className={inputCls} />
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={cfg.secure} onChange={e => patch({ secure: e.target.checked })}
                className="w-4 h-4 rounded accent-blue-500" />
              <span className="text-xs text-gray-300">Use SSL/TLS (port 465)</span>
            </label>
            <div>
              <label className={labelCls}>Username / Email</label>
              <input value={cfg.user} onChange={e => patch({ user: e.target.value })} placeholder="you@gmail.com" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Password / App Password</label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} value={cfg.password}
                  onChange={e => patch({ password: e.target.value })}
                  placeholder={cfg.hasPassword ? '••••••••  (saved)' : 'Enter password'}
                  className={`${inputCls} pr-10`} />
                <button type="button" onClick={() => setShowPass(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {cfg.hasPassword && !cfg.password && (
                <p className="text-[10px] text-green-400 mt-1">✓ Password already saved — leave blank to keep it</p>
              )}
            </div>
          </div>

          {/* Sender identity */}
          <div className="p-4 rounded-2xl border border-white/10 bg-white/[0.02] space-y-3">
            <p className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Sender Identity</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>From Name</label>
                <input value={cfg.fromName} onChange={e => patch({ fromName: e.target.value })} placeholder="Your App Name" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>From Email</label>
                <input value={cfg.fromEmail} onChange={e => patch({ fromEmail: e.target.value })} placeholder="noreply@yourapp.com" className={inputCls} />
              </div>
            </div>
          </div>

          {/* Custom messages */}
          <div className="p-4 rounded-2xl border border-white/10 bg-white/[0.02] space-y-4">
            <p className="text-xs font-semibold text-gray-300 uppercase tracking-wider flex items-center gap-2">
              <MessageSquare className="w-3.5 h-3.5 text-purple-400" /> Custom Message Overrides
            </p>
            <div>
              <label className={labelCls}>Welcome Email — Custom Message</label>
              <textarea value={cfg.welcomeMessage} onChange={e => patch({ welcomeMessage: e.target.value })}
                rows={3} placeholder="Add a personal welcome note to new users... (optional)"
                className={`${inputCls} resize-none`} />
              <p className="text-[10px] text-gray-600 mt-1">Appears as a highlighted note inside the welcome email body.</p>
            </div>
            <div>
              <label className={labelCls}>Payment Confirmation — Custom Message</label>
              <textarea value={cfg.paymentMessage} onChange={e => patch({ paymentMessage: e.target.value })}
                rows={3} placeholder="Add a thank-you note to paying users... (optional)"
                className={`${inputCls} resize-none`} />
              <p className="text-[10px] text-gray-600 mt-1">Appears as a highlighted note inside the payment confirmation email.</p>
            </div>
          </div>

          {/* Test send */}
          <div className="p-4 rounded-2xl border border-white/10 bg-white/[0.02] space-y-3">
            <p className="text-xs font-semibold text-gray-300 uppercase tracking-wider flex items-center gap-2">
              <Send className="w-3.5 h-3.5 text-green-400" /> Send Test Email
            </p>
            <p className="text-xs text-gray-500">Sends a test email to verify your SMTP config is working before going live.</p>
            <div className="flex gap-2">
              <input value={testEmail} onChange={e => setTestEmail(e.target.value)}
                placeholder="test@example.com" className={`${inputCls} flex-1`}
                onKeyDown={e => e.key === 'Enter' && sendTest()} />
              <button onClick={sendTest} disabled={testing || !testEmail}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-600 hover:bg-green-500 disabled:opacity-40 text-sm font-semibold transition shrink-0">
                {testing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Send
              </button>
            </div>
            {testResult && (
              <div className={`flex items-start gap-2 p-3 rounded-xl text-sm ${
                testResult.ok ? 'bg-green-500/10 border border-green-500/25 text-green-300' : 'bg-red-500/10 border border-red-500/25 text-red-300'
              }`}>
                {testResult.ok ? <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" /> : <XCircle className="w-4 h-4 shrink-0 mt-0.5" />}
                {testResult.msg}
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT: Email preview ── */}
        <div className="space-y-4">
          <div className="p-4 rounded-2xl border border-white/10 bg-white/[0.02] h-full flex flex-col">
            <div className="flex items-center justify-between mb-4 shrink-0">
              <p className="text-xs font-semibold text-gray-300 uppercase tracking-wider flex items-center gap-2">
                <Eye className="w-3.5 h-3.5 text-orange-400" /> Email Preview
              </p>
              <button onClick={() => {
                setLoadingPreview(true);
                fetch(`/api/admin/email-preview?type=${preview}`)
                  .then(r => r.text())
                  .then(h => { setPreviewHtml(h); setLoadingPreview(false); })
                  .catch(() => setLoadingPreview(false));
              }} className="p-1.5 rounded-lg hover:bg-white/10 text-gray-500 hover:text-gray-300 transition">
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Type selector */}
            <div className="grid grid-cols-2 gap-1.5 mb-4 shrink-0">
              {PREVIEW_OPTIONS.map(o => (
                <button key={o.id} type="button" onClick={() => setPreview(o.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition ${
                    preview === o.id
                      ? 'border-blue-500 bg-blue-500/15 text-white'
                      : 'border-white/10 text-gray-400 hover:bg-white/5'
                  }`}>
                  <o.icon className="w-3.5 h-3.5 shrink-0" />
                  {o.label}
                </button>
              ))}
            </div>

            {/* iframe preview */}
            <div className="flex-1 min-h-[480px] rounded-xl overflow-hidden border border-white/10 relative bg-white">
              {loadingPreview && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-10">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
                </div>
              )}
              {previewHtml && (
                <iframe
                  srcDoc={previewHtml}
                  className="w-full h-full"
                  style={{ minHeight: 480, border: 'none' }}
                  title="Email preview"
                  sandbox="allow-same-origin"
                />
              )}
            </div>

            <p className="text-[10px] text-gray-600 mt-2 shrink-0">
              Preview uses sample data. Actual emails include real user name, plan, and order details.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
