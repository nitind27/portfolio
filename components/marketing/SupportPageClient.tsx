'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  MessageSquare, AlertCircle, ThumbsUp, Bug, CreditCard, HelpCircle,
  Send, Loader2, CheckCircle2, Mail, Clock, Shield,
} from 'lucide-react';
import MarketingShell from './MarketingShell';
import { APP_NAME, SUPPORT_EMAIL, brand } from '@/lib/brand';

type TicketType = 'complaint' | 'feedback' | 'bug' | 'billing' | 'other';

const TICKET_TYPES: { id: TicketType; label: string; desc: string; icon: typeof MessageSquare }[] = [
  { id: 'complaint', label: 'Complaint', desc: 'Report an issue with service', icon: AlertCircle },
  { id: 'feedback', label: 'Feedback', desc: 'Share ideas & suggestions', icon: ThumbsUp },
  { id: 'bug', label: 'Bug Report', desc: 'Something not working', icon: Bug },
  { id: 'billing', label: 'Billing', desc: 'Payment or plan questions', icon: CreditCard },
  { id: 'other', label: 'Other', desc: 'General enquiry', icon: HelpCircle },
];

const inputCls =
  'w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/60 transition';

export default function SupportPageClient() {
  const [type, setType] = useState<TicketType>('feedback');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [orderId, setOrderId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [ticketRef, setTicketRef] = useState('');

  useEffect(() => {
    fetch('/api/profile')
      .then(r => (r.ok ? r.json() : null))
      .then(data => {
        if (!data?.profile) return;
        if (!name && data.profile.name) setName(data.profile.name);
        if (!email && data.profile.email) setEmail(data.profile.email);
      })
      .catch(() => {});
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, name, email, subject, message, orderId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send');
      setTicketRef(data.ticketRef || '');
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <MarketingShell title="Support" subtitle="We're here to help." narrow>
        <div className="max-w-lg mx-auto px-5 sm:px-8 py-16 text-center">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
            style={{ background: 'rgba(34, 197, 94, 0.15)' }}
          >
            <CheckCircle2 className="w-8 h-8 text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Message sent!</h2>
          <p className="text-sm text-gray-400 leading-relaxed mb-6">
            Thank you for reaching out.
            {ticketRef && (
              <> Your reference number is <strong className="text-orange-300 font-mono">{ticketRef}</strong>.</>
            )}
            {' '}Our team at <strong className="text-gray-300">{SUPPORT_EMAIL}</strong> will
            review your request and reply within <strong className="text-gray-300">24–48 hours</strong> on business days.
            A confirmation was sent to <strong className="text-gray-300">{email}</strong>.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/"
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
              style={{ background: `linear-gradient(135deg, ${brand.accent}, ${brand.accentHover})` }}
            >
              Back to app
            </Link>
            <button
              type="button"
              onClick={() => { setSent(false); setMessage(''); setSubject(''); }}
              className="px-5 py-2.5 rounded-xl text-sm font-medium border text-gray-300 hover:text-white transition"
              style={{ borderColor: brand.border }}
            >
              Send another
            </button>
          </div>
        </div>
      </MarketingShell>
    );
  }

  return (
    <MarketingShell
      title="Support & Feedback"
      subtitle={`Raise a complaint, share feedback, or report a bug. Messages go directly to our support team.`}
    >
      <div className="max-w-5xl mx-auto px-5 sm:px-8 py-10">
        <div className="grid lg:grid-cols-5 gap-8">
          {/* Sidebar info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="rounded-2xl border p-5" style={{ borderColor: brand.border, background: brand.surface }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: brand.accentMuted }}>
                  <Mail className="w-5 h-5" style={{ color: brand.accent }} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Email us directly</p>
                  <a href={`mailto:${SUPPORT_EMAIL}`} className="text-xs hover:underline" style={{ color: brand.accentLight }}>
                    {SUPPORT_EMAIL}
                  </a>
                </div>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                Prefer email? Write to us anytime — include your account email for faster help.
              </p>
            </div>

            {[
              { icon: Clock, title: 'Response time', desc: 'We aim to reply within 24–48 hours on business days.' },
              { icon: Shield, title: 'Private & secure', desc: 'Your message is only seen by the support team.' },
              { icon: MessageSquare, title: 'Ask AI first', desc: 'Quick builder questions? Try our AI assistant.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex gap-3 p-4 rounded-xl border" style={{ borderColor: brand.border, background: `${brand.surface}88` }}>
                <Icon className="w-5 h-5 shrink-0 mt-0.5" style={{ color: brand.steelLight }} />
                <div>
                  <p className="text-sm font-medium text-white">{title}</p>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}

            <Link
              href="/ask"
              className="block text-center px-4 py-2.5 rounded-xl text-sm font-medium border transition hover:bg-white/5"
              style={{ borderColor: `${brand.accent}44`, color: brand.accentLight }}
            >
              Try Ask AI →
            </Link>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="lg:col-span-3 space-y-5">
            <div
              className="rounded-2xl border p-6 sm:p-8 space-y-6"
              style={{ borderColor: brand.border, background: brand.surface }}
            >
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  What is this about?
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {TICKET_TYPES.map(t => {
                    const Icon = t.icon;
                    const active = type === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setType(t.id)}
                        className={`text-left p-3 rounded-xl border transition ${
                          active
                            ? 'border-orange-500/50 bg-orange-500/10'
                            : 'border-white/10 hover:border-white/20 hover:bg-white/[0.03]'
                        }`}
                      >
                        <Icon className={`w-4 h-4 mb-1.5 ${active ? 'text-orange-400' : 'text-gray-500'}`} />
                        <p className={`text-xs font-semibold ${active ? 'text-white' : 'text-gray-300'}`}>{t.label}</p>
                        <p className="text-[10px] text-gray-600 mt-0.5 line-clamp-1">{t.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">Your name <span className="text-red-400">*</span></label>
                  <input value={name} onChange={e => setName(e.target.value)} placeholder="Full name" className={inputCls} required />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">Email <span className="text-red-400">*</span></label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className={inputCls} required />
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Subject <span className="text-red-400">*</span></label>
                <input
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  placeholder={type === 'complaint' ? 'Brief summary of your complaint' : 'What would you like to tell us?'}
                  className={inputCls}
                  required
                />
              </div>

              {type === 'billing' && (
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">Order ID <span className="text-gray-600">(optional)</span></label>
                  <input value={orderId} onChange={e => setOrderId(e.target.value)} placeholder="e.g. order_xxxxx" className={inputCls} />
                </div>
              )}

              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Message <span className="text-red-400">*</span></label>
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  rows={6}
                  placeholder="Describe your complaint, feedback, or issue in detail. Include steps to reproduce for bugs."
                  className={`${inputCls} resize-y min-h-[140px]`}
                  required
                />
                <p className="text-[10px] text-gray-600 mt-1 text-right">{message.length} / 5000</p>
              </div>

              {error && (
                <div className="flex items-start gap-2 p-3 rounded-xl border border-red-500/30 bg-red-500/10 text-sm text-red-300">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50 transition"
                style={{ background: `linear-gradient(135deg, ${brand.accent}, ${brand.accentHover})` }}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {loading ? 'Sending…' : 'Submit to support'}
              </button>

              <p className="text-[10px] text-gray-600 text-center">
                By submitting, you agree that {APP_NAME} may contact you at the email provided regarding this request.
              </p>
            </div>
          </form>
        </div>
      </div>
    </MarketingShell>
  );
}
