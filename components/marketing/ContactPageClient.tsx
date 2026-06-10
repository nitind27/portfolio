'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Send, Loader2, CheckCircle2, Mail, Phone, MapPin, Clock,
  MessageCircle, Headphones, AlertCircle,
} from 'lucide-react';
import MarketingShell from './MarketingShell';
import CompanyInfoBlock from './CompanyInfoBlock';
import { APP_NAME, brand } from '@/lib/brand';
import { company } from '@/lib/company';

const inputCls =
  'w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/60 transition';

const QUICK_LINKS = [
  {
    icon: Headphones,
    title: 'Support & complaints',
    desc: 'Billing issues, bugs, or feedback',
    href: '/support',
    cta: 'Open support',
  },
  {
    icon: MessageCircle,
    title: 'Ask AI',
    desc: 'Quick answers about the builder',
    href: '/ask',
    cta: 'Chat with AI',
  },
];

export default function ContactPageClient() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
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
        if (!phone && data.profile.phone) setPhone(data.profile.phone);
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
        body: JSON.stringify({
          type: 'other',
          name,
          email,
          subject: subject || 'General enquiry',
          message: phone ? `${message}\n\nPhone: ${phone}` : message,
        }),
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
      <MarketingShell title="Contact Us" subtitle="We received your message." narrow>
        <div className="max-w-lg mx-auto px-5 sm:px-8 py-16 text-center">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
            style={{ background: 'rgba(34, 197, 94, 0.15)' }}
          >
            <CheckCircle2 className="w-8 h-8 text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Thank you!</h2>
          <p className="text-sm text-gray-400 leading-relaxed mb-6">
            Your message has been sent to our team.
            {ticketRef && (
              <> Reference: <strong className="text-orange-300 font-mono">{ticketRef}</strong>.</>
            )}
            {' '}We typically respond within <strong className="text-gray-300">{company.responseTime}</strong>.
            A confirmation was sent to <strong className="text-gray-300">{email}</strong>.
          </p>
          <Link
            href="/"
            className="inline-flex px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
            style={{ background: `linear-gradient(135deg, ${brand.accent}, ${brand.accentHover})` }}
          >
            Back to home
          </Link>
        </div>
      </MarketingShell>
    );
  }

  return (
    <MarketingShell
      title="Contact Us"
      subtitle={`Get in touch with the ${APP_NAME} team — partnerships, enquiries, or general questions.`}
    >
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-10 sm:py-14">
        {/* Quick contact cards */}
        <div className="grid sm:grid-cols-3 gap-4 mb-12">
          {[
            {
              icon: Mail,
              title: 'Email',
              value: company.email,
              href: `mailto:${company.email}`,
              sub: 'Best for detailed enquiries',
            },
            ...(company.phone
              ? [{
                  icon: Phone,
                  title: 'Phone',
                  value: company.phone,
                  href: `tel:${company.phone.replace(/\s/g, '')}`,
                  sub: 'Mon–Sat, business hours',
                }]
              : []),
            {
              icon: Clock,
              title: 'Response time',
              value: company.responseTime,
              sub: company.businessHours,
            },
          ].map(({ icon: Icon, title, value, href, sub }) => (
            <div
              key={title}
              className="p-5 rounded-2xl border text-center sm:text-left"
              style={{ borderColor: brand.border, background: brand.surface }}
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center mx-auto sm:mx-0 mb-3"
                style={{ background: brand.accentMuted }}
              >
                <Icon className="w-5 h-5" style={{ color: brand.accent }} />
              </div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{title}</p>
              {href ? (
                <a href={href} className="text-sm font-semibold text-white mt-1 block hover:underline" style={{ color: brand.accentLight }}>
                  {value}
                </a>
              ) : (
                <p className="text-sm font-semibold text-white mt-1">{value}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">{sub}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <CompanyInfoBlock compact />

            {QUICK_LINKS.map(({ icon: Icon, title, desc, href, cta }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-4 p-4 rounded-2xl border transition hover:bg-white/[0.03]"
                style={{ borderColor: brand.border, background: `${brand.surface}88` }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: brand.accentMuted }}
                >
                  <Icon className="w-5 h-5" style={{ color: brand.accent }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white">{title}</p>
                  <p className="text-xs text-gray-500">{desc}</p>
                </div>
                <span className="text-xs font-medium shrink-0" style={{ color: brand.accentLight }}>{cta} →</span>
              </Link>
            ))}

            <div className="flex gap-3 p-4 rounded-xl border" style={{ borderColor: brand.border }}>
              <MapPin className="w-5 h-5 shrink-0 mt-0.5" style={{ color: brand.steelLight }} />
              <div>
                <p className="text-sm font-medium text-white">Registered address</p>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed whitespace-pre-line">
                  {company.addressLine1 || company.city
                    ? [company.addressLine1, company.addressLine2, [company.city, company.state, company.pincode].filter(Boolean).join(', '), company.country].filter(Boolean).join('\n')
                    : `${company.country} (online business)`}
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="lg:col-span-3">
            <div
              className="rounded-2xl border p-6 sm:p-8 space-y-5"
              style={{ borderColor: brand.border, background: brand.surface }}
            >
              <div>
                <h2 className="text-lg font-bold text-white">Send us a message</h2>
                <p className="text-xs text-gray-500 mt-1">
                  For complaints or billing issues, please use our{' '}
                  <Link href="/support" className="text-orange-400 hover:underline">Support page</Link> for faster handling.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">Full name <span className="text-red-400">*</span></label>
                  <input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" className={inputCls} required minLength={2} />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">Email <span className="text-red-400">*</span></label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className={inputCls} required />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">Phone <span className="text-gray-600">(optional)</span></label>
                  <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 XXXXX XXXXX" className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">Subject <span className="text-red-400">*</span></label>
                  <input value={subject} onChange={e => setSubject(e.target.value)} placeholder="How can we help?" className={inputCls} required minLength={3} />
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Message <span className="text-red-400">*</span></label>
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  rows={6}
                  placeholder="Tell us about your enquiry…"
                  className={`${inputCls} resize-y min-h-[140px]`}
                  required
                  minLength={10}
                  maxLength={5000}
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
                {loading ? 'Sending…' : 'Send message'}
              </button>

              <p className="text-[10px] text-gray-600 text-center">
                By submitting, you agree to our{' '}
                <Link href="/privacy" className="text-orange-400/80 hover:underline">Privacy Policy</Link>.
              </p>
            </div>
          </form>
        </div>
      </div>
    </MarketingShell>
  );
}
