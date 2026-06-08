'use client';

import { useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  ArrowRight, Globe, LayoutTemplate, Rocket, Shield, Sparkles,
  Clock, Palette, Zap, ChevronRight, Monitor, Smartphone, Download,
  Layers, MousePointer2, Wand2, Star, Check, HelpCircle,
} from 'lucide-react';
import LoginPage from './LoginPage';
import BrandLogo from './BrandLogo';
import { APP_NAME, APP_TAGLINE, APP_DESCRIPTION, APP_DOMAIN, STORAGE_POLICY_DAYS, brand } from '@/lib/brand';
import { TEMPLATES } from '@/lib/templates';

const PREMIUM_PRICE = process.env.NEXT_PUBLIC_PREMIUM_PRICE || 99;
const TEMPLATE_COUNT = TEMPLATES.length;

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Templates', href: '#templates' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'FAQ', href: '#faq' },
];

const STEPS = [
  { step: '01', title: 'Pick a template', desc: 'Choose from portfolio, business, shop & landing layouts — all fully responsive.', icon: LayoutTemplate },
  { step: '02', title: 'Customize live', desc: 'Edit sections, colors, navbar & footer with instant preview on every device.', icon: MousePointer2 },
  { step: '03', title: 'Launch your way', desc: 'Export ZIP, share a live link, or deploy to your Hostinger domain.', icon: Rocket },
];

const FEATURES = [
  { icon: LayoutTemplate, title: `${TEMPLATE_COUNT}+ pro templates`, desc: 'Curated designs for creators, agencies, stores & startups.', span: 'lg:col-span-2' },
  { icon: Palette, title: 'Visual theme editor', desc: 'Colors, fonts, spacing & custom CSS — no code needed.', span: '' },
  { icon: Monitor, title: 'Multi-device preview', desc: 'Desktop, tablet & mobile views side by side.', span: '' },
  { icon: Globe, title: 'Go live on your domain', desc: 'One-click Hostinger deploy with domain picker.', span: 'lg:col-span-2' },
  { icon: Download, title: 'Export anywhere', desc: 'HTML, React & Next.js ZIP — yours to host anywhere.', span: '' },
  { icon: Wand2, title: 'Section library', desc: 'Hero, pricing, FAQ, blog, team, gallery & more.', span: 'lg:col-span-2' },
  { icon: Shield, title: 'Premium unlock', desc: 'Export, share & deploy with one portfolio slot.', span: '' },
  { icon: Zap, title: 'Real-time editing', desc: 'Changes reflect instantly — what you see is what you ship.', span: '' },
];

const TEMPLATE_PREVIEWS = [
  { name: 'Agency Pro', colors: ['#f28c28', '#102a43', '#2d5a7b'] },
  { name: 'Dev Portfolio', colors: ['#6366f1', '#0a0a0a', '#8b5cf6'] },
  { name: 'SaaS Launch', colors: ['#06b6d4', '#020617', '#0ea5e9'] },
  { name: 'Creative Studio', colors: ['#e11d48', '#0f0f0f', '#fbbf24'] },
  { name: 'Business Co', colors: ['#22c55e', '#052e16', '#16a34a'] },
  { name: 'Shop Front', colors: ['#a855f7', '#1a0a2e', '#ec4899'] },
];

const FAQS = [
  { q: 'Do I need coding skills?', a: 'No. Everything is visual — drag sections, edit content, pick colors, and preview instantly.' },
  { q: 'How long are projects stored?', a: `Projects stay in your account for ${STORAGE_POLICY_DAYS} days on the free plan. Export or go premium to keep them permanently.` },
  { q: 'Can I use my own domain?', a: 'Yes. Connect Hostinger and deploy to your chosen domain with a guided setup flow.' },
  { q: 'What does premium include?', a: `Export ZIP, long-term share, and one live deploy slot — from ₹${PREMIUM_PRICE} one-time per portfolio. No refunds on premium purchases.` },
  { q: 'What is the refund policy?', a: 'All premium sales are final. We do not offer refunds once payment is confirmed. See Privacy Policy and Documentation for details.' },
];

function PrimaryBtn({ children, onClick, className = '' }: { children: React.ReactNode; onClick: () => void; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-orange-500/20 ${className}`}
      style={{ background: `linear-gradient(135deg, ${brand.accent}, ${brand.accentHover})`, color: brand.onAccent }}
    >
      {children}
      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
    </button>
  );
}

function GhostBtn({ children, onClick, href }: { children: React.ReactNode; onClick?: () => void; href?: string }) {
  const cls = 'inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-sm border border-white/10 text-[#c8d0da] hover:bg-white/[0.06] hover:border-white/20 transition-all';
  if (href) return <a href={href} className={cls}>{children}</a>;
  return <button type="button" onClick={onClick} className={cls}>{children}</button>;
}

function BuilderMockup() {
  return (
    <div className="relative">
      {/* Glow behind mockup */}
      <div
        className="absolute -inset-8 rounded-3xl blur-3xl opacity-40 pointer-events-none"
        style={{ background: `radial-gradient(circle, ${brand.accent}55, transparent 70%)` }}
      />

      {/* Floating badges */}
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -left-4 top-8 z-20 hidden md:flex items-center gap-2 px-3 py-2 rounded-xl border backdrop-blur-md text-xs font-medium shadow-xl"
        style={{ background: `${brand.surface}ee`, borderColor: brand.border, color: brand.accentLight }}
      >
        <Sparkles className="w-3.5 h-3.5" /> Live preview
      </motion.div>
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
        className="absolute -right-2 bottom-16 z-20 hidden md:flex items-center gap-2 px-3 py-2 rounded-xl border backdrop-blur-md text-xs font-medium shadow-xl"
        style={{ background: `${brand.surface}ee`, borderColor: brand.border, color: brand.success }}
      >
        <Check className="w-3.5 h-3.5" /> Auto-saved
      </motion.div>

      <div
        className="relative rounded-2xl border overflow-hidden shadow-2xl shadow-black/40"
        style={{ borderColor: brand.border, background: brand.surface }}
      >
        {/* Browser chrome */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06]" style={{ background: brand.navy }}>
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
          </div>
          <div className="flex-1 mx-2 h-7 rounded-lg bg-white/[0.06] flex items-center px-3 gap-2">
            <Globe className="w-3 h-3 text-[#64748b]" />
            <span className="text-[10px] text-[#94a3b8] font-mono">studio.{APP_DOMAIN}</span>
          </div>
          <div className="hidden sm:flex gap-1">
            {[Monitor, Smartphone].map((Icon, i) => (
              <div key={i} className={`p-1 rounded ${i === 0 ? 'bg-orange-500/20 text-orange-400' : 'text-gray-600'}`}>
                <Icon className="w-3 h-3" />
              </div>
            ))}
          </div>
        </div>

        {/* Builder layout mock */}
        <div className="flex min-h-[320px]">
          <div className="w-14 shrink-0 border-r border-white/[0.06] p-2 space-y-1.5 hidden sm:block" style={{ background: brand.navy }}>
            {['Hero', 'About', 'Work', 'Contact'].map((s, i) => (
              <div key={s} className={`text-[8px] px-1.5 py-1 rounded-md truncate ${i === 0 ? 'bg-orange-500/25 text-orange-300' : 'text-gray-600'}`}>{s}</div>
            ))}
          </div>
          <div className="flex-1 p-4 space-y-3 relative overflow-hidden">
            <div
              className="rounded-xl p-5 min-h-[120px] flex flex-col justify-end relative overflow-hidden"
              style={{ background: `linear-gradient(135deg, ${brand.navySoft}, ${brand.steel}44)` }}
            >
              <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-30" style={{ background: brand.accent }} />
              <div className="h-2.5 w-16 rounded-full mb-2" style={{ background: brand.accent, opacity: 0.8 }} />
              <div className="h-4 w-3/4 max-w-[200px] rounded bg-white/25 mb-1.5" />
              <div className="h-2.5 w-1/2 max-w-[140px] rounded bg-white/10" />
              <div className="flex gap-2 mt-3">
                <div className="h-7 w-20 rounded-lg" style={{ background: brand.accent }} />
                <div className="h-7 w-16 rounded-lg bg-white/10" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-14 rounded-lg border border-white/[0.06] bg-white/[0.03]" />
              ))}
            </div>
          </div>
          <div className="w-20 shrink-0 border-l border-white/[0.06] p-2 hidden md:block" style={{ background: brand.navy }}>
            <div className="text-[7px] text-gray-600 mb-1">Theme</div>
            <div className="space-y-1">
              {[brand.accent, brand.steel, brand.navySoft].map(c => (
                <div key={c} className="w-full h-4 rounded" style={{ background: c }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const [showAuth, setShowAuth] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const { scrollYProgress } = useScroll();
  const headerBg = useTransform(
    scrollYProgress,
    [0, 0.12],
    ['rgba(10, 29, 55, 0)', 'rgba(10, 29, 55, 0.92)'],
  );

  if (showAuth) {
    return (
      <div className="min-h-screen" style={{ background: brand.bg }}>
        <button
          type="button"
          onClick={() => setShowAuth(false)}
          className="fixed top-4 left-4 z-50 text-sm text-[#8b9aab] hover:text-white transition flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-white/5 backdrop-blur-sm border border-white/10"
        >
          ← Back to home
        </button>
        <LoginPage />
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: brand.bg, color: brand.text }}>
      {/* ── Background layers ── */}
      <div className="fixed inset-0 pointer-events-none">
        <div
          className="absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
            backgroundSize: '64px 64px',
          }}
        />
        <div
          className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full blur-[120px] opacity-25"
          style={{ background: brand.accent }}
        />
        <div
          className="absolute bottom-[10%] right-[-10%] w-[500px] h-[500px] rounded-full blur-[100px] opacity-15"
          style={{ background: brand.steelLight }}
        />
        <div
          className="absolute top-[40%] left-[-15%] w-[400px] h-[400px] rounded-full blur-[90px] opacity-10"
          style={{ background: brand.warm }}
        />
      </div>

      {/* ── Nav ── */}
      <motion.header
        style={{ backgroundColor: headerBg }}
        className="sticky top-0 z-50 border-b border-white/[0.06] backdrop-blur-xl"
      >
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-3 flex items-center justify-between gap-4">
          <BrandLogo size="sm" />
          <nav className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map(link => (
              <a
                key={link.href}
                href={link.href}
                className="px-3 py-2 text-sm text-[#94a3b8] hover:text-white rounded-lg hover:bg-white/[0.04] transition"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setShowAuth(true)}
              className="text-sm text-[#94a3b8] hover:text-white transition px-3 py-2 hidden sm:block"
            >
              Sign in
            </button>
            <PrimaryBtn onClick={() => setShowAuth(true)} className="!px-4 !py-2.5 !text-sm">
              Start free
            </PrimaryBtn>
          </div>
        </div>
      </motion.header>

      {/* ── Hero ── */}
      <section className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 pt-14 pb-20 lg:pt-20 lg:pb-28">
        <div className="grid lg:grid-cols-2 gap-14 lg:gap-16 items-center">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium mb-6"
              style={{ borderColor: `${brand.accent}40`, background: brand.accentMuted, color: brand.accentLight }}
            >
              <Sparkles className="w-3.5 h-3.5" />
              No code · {TEMPLATE_COUNT}+ templates · Instant preview
            </div>

            <h1 className="text-4xl sm:text-5xl xl:text-[3.5rem] font-bold leading-[1.08] tracking-tight text-white mb-5">
              Design stunning sites with{' '}
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: `linear-gradient(135deg, ${brand.accentLight}, ${brand.accent})` }}
              >
                {APP_NAME}
              </span>
            </h1>
            <p className="text-xl sm:text-2xl text-[#94a3b8] font-light mb-4">{APP_TAGLINE}</p>
            <p className="text-[#64748b] text-base leading-relaxed max-w-lg mb-8">
              {APP_DESCRIPTION} Drag sections, customize themes, preview on every device — then export or go live on your domain.
            </p>

            <div className="flex flex-wrap gap-3 mb-10">
              <PrimaryBtn onClick={() => setShowAuth(true)}>Create your site</PrimaryBtn>
              <GhostBtn href="#how-it-works">See how it works</GhostBtn>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-8 pt-6 border-t border-white/[0.06]">
              {[
                { val: `${TEMPLATE_COUNT}+`, label: 'Templates' },
                { val: '15+', label: 'Section types' },
                { val: `${STORAGE_POLICY_DAYS}d`, label: 'Free storage' },
                { val: `₹${PREMIUM_PRICE}`, label: 'Go premium' },
              ].map(s => (
                <div key={s.label}>
                  <p className="text-2xl font-bold text-white">{s.val}</p>
                  <p className="text-xs text-[#64748b] mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          >
            <BuilderMockup />
          </motion.div>
        </div>
      </section>

      {/* ── Social proof strip ── */}
      <section className="relative z-10 border-y border-white/[0.06]" style={{ background: `${brand.surface}88` }}>
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-3 text-sm text-[#64748b]">
          {['Portfolios', 'Business sites', 'Landing pages', 'Online stores', 'Agencies'].map(label => (
            <span key={label} className="flex items-center gap-2">
              <Star className="w-3.5 h-3.5" style={{ color: brand.accent }} />
              {label}
            </span>
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how-it-works" className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 py-24">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={fadeUp} custom={0} className="text-center mb-14">
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: brand.accent }}>How it works</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">Launch in three simple steps</h2>
          <p className="text-[#94a3b8] max-w-lg mx-auto">From blank canvas to live website — faster than you think.</p>
        </motion.div>
        <div className="grid md:grid-cols-3 gap-6">
          {STEPS.map(({ step, title, desc, icon: Icon }, i) => (
            <motion.div
              key={step}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              custom={i}
              className="relative p-6 rounded-2xl border group hover:border-orange-500/30 transition-all duration-300"
              style={{ background: brand.surface, borderColor: brand.border }}
            >
              <span className="text-5xl font-black opacity-[0.06] absolute top-4 right-4 text-white">{step}</span>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4" style={{ background: brand.accentMuted }}>
                <Icon className="w-6 h-6" style={{ color: brand.accent }} />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
              <p className="text-sm text-[#94a3b8] leading-relaxed">{desc}</p>
              {i < STEPS.length - 1 && (
                <ChevronRight className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 text-[#334155] z-10" />
              )}
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Templates showcase ── */}
      <section id="templates" className="relative z-10 py-24 overflow-hidden" style={{ background: brand.surface }}>
        <div className="max-w-7xl mx-auto px-5 sm:px-8 mb-12">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}>
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: brand.accent }}>Templates</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">Start with a pro design</h2>
            <p className="text-[#94a3b8] max-w-xl">{TEMPLATE_COUNT}+ handcrafted templates — switch anytime without losing your content.</p>
          </motion.div>
        </div>
        <div className="flex gap-5 overflow-x-auto pb-4 px-5 sm:px-8 no-scrollbar snap-x snap-mandatory">
          {TEMPLATE_PREVIEWS.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="snap-start shrink-0 w-[220px] rounded-2xl border overflow-hidden group cursor-default hover:scale-[1.02] transition-transform duration-300"
              style={{ borderColor: brand.border, background: brand.bg }}
            >
              <div className="h-36 p-3 flex flex-col gap-2">
                <div className="h-8 rounded-lg" style={{ background: `linear-gradient(135deg, ${t.colors[0]}, ${t.colors[1]})` }} />
                <div className="flex-1 grid grid-cols-2 gap-1.5">
                  <div className="rounded-md" style={{ background: t.colors[1] }} />
                  <div className="rounded-md" style={{ background: t.colors[2] }} />
                </div>
              </div>
              <div className="px-4 py-3 border-t border-white/[0.06] flex items-center justify-between">
                <span className="text-sm font-medium text-white">{t.name}</span>
                <Layers className="w-4 h-4 text-[#64748b] group-hover:text-orange-400 transition-colors" />
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Features bento ── */}
      <section id="features" className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 py-24">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0} className="mb-14">
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: brand.accent }}>Features</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">Everything to ship faster</h2>
          <p className="text-[#94a3b8] max-w-xl">Professional tools without the learning curve — built for speed and polish.</p>
        </motion.div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURES.map(({ icon: Icon, title, desc, span }, i) => (
            <motion.div
              key={title}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              custom={i}
              className={`p-6 rounded-2xl border hover:border-orange-500/25 transition-all duration-300 group ${span}`}
              style={{ background: brand.surface, borderColor: brand.border }}
            >
              <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform" style={{ background: brand.accentMuted }}>
                <Icon className="w-5 h-5" style={{ color: brand.accent }} />
              </div>
              <h3 className="font-semibold text-white mb-1.5">{title}</h3>
              <p className="text-sm text-[#94a3b8] leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Storage notice ── */}
      <section className="relative z-10 border-y border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${brand.warm}22` }}>
            <Clock className="w-5 h-5" style={{ color: brand.warm }} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-[#c8d0da]">
              Free cloud storage for {STORAGE_POLICY_DAYS} days — export or go premium to keep forever
            </p>
            <p className="text-xs text-[#64748b] mt-1">
              Projects sync to your account. After {STORAGE_POLICY_DAYS} days inactive projects are removed automatically.
            </p>
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 py-24">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0} className="text-center mb-12">
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: brand.accent }}>Pricing</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">Start free, upgrade when ready</h2>
        </motion.div>
        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {[
            {
              name: 'Free',
              price: '₹0',
              desc: 'Perfect to explore & design',
              features: ['Unlimited editing', `${STORAGE_POLICY_DAYS}-day cloud save`, 'Live preview', 'All templates'],
              cta: 'Start free',
              highlight: false,
            },
            {
              name: 'Premium',
              price: `₹${PREMIUM_PRICE}`,
              desc: 'One portfolio slot — export & deploy',
              features: ['Export HTML / React / Next.js', 'Public share link', 'Hostinger deploy', 'Priority support'],
              cta: 'Get started',
              highlight: true,
            },
          ].map((plan, i) => (
            <motion.div
              key={plan.name}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              custom={i}
              className={`relative p-8 rounded-2xl border ${plan.highlight ? 'ring-1 ring-orange-500/40' : ''}`}
              style={{
                background: plan.highlight ? `linear-gradient(160deg, ${brand.accentMuted}, ${brand.surface})` : brand.surface,
                borderColor: plan.highlight ? `${brand.accent}50` : brand.border,
              }}
            >
              {plan.highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-white" style={{ background: brand.accent }}>
                  Most popular
                </span>
              )}
              <h3 className="text-lg font-semibold text-white">{plan.name}</h3>
              <p className="text-3xl font-bold text-white mt-2 mb-1">{plan.price}</p>
              <p className="text-sm text-[#64748b] mb-6">{plan.desc}</p>
              <ul className="space-y-2.5 mb-8">
                {plan.features.map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-[#94a3b8]">
                    <Check className="w-4 h-4 shrink-0" style={{ color: brand.accent }} />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() => setShowAuth(true)}
                className={`w-full py-3 rounded-xl font-semibold text-sm transition ${plan.highlight ? '' : 'border border-white/10 text-white hover:bg-white/5'}`}
                style={plan.highlight ? { background: `linear-gradient(135deg, ${brand.accent}, ${brand.accentHover})`, color: brand.onAccent } : undefined}
              >
                {plan.cta}
              </button>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="relative z-10 max-w-3xl mx-auto px-5 sm:px-8 py-24">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0} className="text-center mb-10">
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: brand.accent }}>FAQ</p>
          <h2 className="text-3xl font-bold text-white">Common questions</h2>
        </motion.div>
        <div className="space-y-3">
          {FAQS.map((item, i) => (
            <motion.div
              key={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              custom={i}
              className="rounded-xl border overflow-hidden"
              style={{ background: brand.surface, borderColor: brand.border }}
            >
              <button
                type="button"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
              >
                <span className="font-medium text-white text-sm">{item.q}</span>
                <HelpCircle className={`w-4 h-4 shrink-0 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} style={{ color: brand.accent }} />
              </button>
              {openFaq === i && (
                <motion.p
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  className="px-5 pb-4 text-sm text-[#94a3b8] leading-relaxed border-t border-white/[0.06] pt-3"
                >
                  {item.a}
                </motion.p>
              )}
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 pb-24">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          custom={0}
          className="relative rounded-3xl p-10 sm:p-16 text-center overflow-hidden border"
          style={{ borderColor: `${brand.accent}35`, background: `linear-gradient(135deg, ${brand.surface}, ${brand.navy})` }}
        >
          <div className="absolute inset-0 opacity-30 pointer-events-none" style={{ background: `radial-gradient(circle at 50% 0%, ${brand.accent}44, transparent 60%)` }} />
          <div className="relative">
            <Sparkles className="w-10 h-10 mx-auto mb-5" style={{ color: brand.accentLight }} />
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Ready to build the future online?</h2>
            <p className="text-[#94a3b8] mb-8 max-w-md mx-auto">
              Join {APP_NAME} free. No credit card. Start designing in under a minute.
            </p>
            <PrimaryBtn onClick={() => setShowAuth(true)} className="!px-10 !py-4 !text-base">
              Get started free
            </PrimaryBtn>
          </div>
        </motion.div>
      </section>

      {/* ── Footer ── */}
      <footer className="relative z-10 border-t border-white/[0.06] py-10" style={{ background: brand.navy }}>
        <div className="max-w-7xl mx-auto px-5 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <BrandLogo size="xs" />
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-[#64748b]">
            {NAV_LINKS.map(l => (
              <a key={l.href} href={l.href} className="hover:text-white transition">{l.label}</a>
            ))}
            <a href="/docs" className="hover:text-white transition">Docs</a>
            <a href="/ask" className="hover:text-white transition">Ask AI</a>
            <a href="/about" className="hover:text-white transition">About</a>
            <a href="/privacy" className="hover:text-white transition">Privacy</a>
          </div>
          <p className="text-xs text-[#64748b]">
            © {new Date().getFullYear()} {APP_NAME}. {APP_TAGLINE}
          </p>
        </div>
      </footer>
    </div>
  );
}
