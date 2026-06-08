'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight, Globe, LayoutTemplate, Rocket, Shield, Sparkles,
  Clock, Palette, Zap,
} from 'lucide-react';
import LoginPage from './LoginPage';
import BrandLogo from './BrandLogo';
import { APP_NAME, APP_TAGLINE, APP_DESCRIPTION, STORAGE_POLICY_DAYS, brand } from '@/lib/brand';

export default function LandingPage() {
  const [showAuth, setShowAuth] = useState(false);

  if (showAuth) {
    return (
      <div className="min-h-screen" style={{ background: brand.bg }}>
        <button
          type="button"
          onClick={() => setShowAuth(false)}
          className="fixed top-4 left-4 z-50 text-sm text-[#8b9aab] hover:text-white transition flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-white/5"
        >
          ← Back to home
        </button>
        <LoginPage />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: brand.bg, color: brand.text }}>
      {/* Blue glow — logo accent */}
      <div
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] pointer-events-none opacity-30"
        style={{ background: `radial-gradient(ellipse, ${brand.accentGlow} 0%, transparent 70%)` }}
      />

      {/* Nav */}
      <header className="relative z-10 border-b border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <BrandLogo size="sm" />
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowAuth(true)}
              className="text-sm text-[#8b9aab] hover:text-white transition px-3 py-1.5"
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => setShowAuth(true)}
              className="text-sm font-medium px-4 py-2 rounded-lg transition"
              style={{ background: brand.accent, color: brand.onAccent }}
            >
              Start free
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pt-16 pb-20 lg:pt-24 lg:pb-28">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <p className="text-xs font-medium uppercase tracking-widest mb-4" style={{ color: brand.accent }}>
              Website builder for creators & businesses
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-[3.25rem] font-bold leading-[1.1] tracking-tight text-white mb-5">
              {APP_TAGLINE.split('. ')[0]}.
              <span className="block mt-1 text-[#8b9aab] font-normal text-3xl sm:text-4xl lg:text-[2.5rem]">
                {APP_TAGLINE.split('. ').slice(1).join('. ')}
              </span>
            </h1>
            <p className="text-[#8b9aab] text-lg leading-relaxed max-w-lg mb-8">
              {APP_DESCRIPTION} Design in the browser, preview instantly, export or go live on your domain.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setShowAuth(true)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition hover:opacity-90"
                style={{ background: brand.accent, color: brand.onAccent }}
              >
                Create your site <ArrowRight className="w-4 h-4" />
              </button>
              <a
                href="#features"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium border border-white/10 text-[#c8d0da] hover:bg-white/5 transition"
              >
                See features
              </a>
            </div>
            <p className="mt-6 text-xs text-[#5c6b7a] flex items-center gap-2">
              <Clock className="w-3.5 h-3.5" />
              Free preview · {STORAGE_POLICY_DAYS}-day cloud storage · Premium export from ₹{process.env.NEXT_PUBLIC_PREMIUM_PRICE || 99}
            </p>
          </motion.div>

          {/* Preview box */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="relative"
          >
            <div
              className="rounded-2xl border overflow-hidden shadow-2xl"
              style={{ borderColor: brand.border, background: brand.surface }}
            >
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06] bg-[#0a0e14]">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                </div>
                <div className="flex-1 mx-3 h-6 rounded-md bg-white/5 flex items-center px-3">
                  <span className="text-[10px] text-[#5c6b7a] font-mono">yourbrand.com</span>
                </div>
              </div>
              <div className="p-6 space-y-4 min-h-[280px]">
                <div className="h-24 rounded-xl border border-white/5 p-4 flex flex-col justify-end" style={{ background: `linear-gradient(135deg, ${brand.navySoft}88, ${brand.surface})` }}>
                  <div className="h-3 w-2/3 rounded bg-white/20 mb-2" />
                  <div className="h-2 w-1/2 rounded bg-white/10" />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-16 rounded-lg bg-white/[0.04] border border-white/5" />
                  ))}
                </div>
                <div className="flex gap-2">
                  <div className="h-8 w-24 rounded-lg" style={{ background: brand.accent, opacity: 0.7 }} />
                  <div className="h-8 w-20 rounded-lg bg-white/10" />
                </div>
              </div>
            </div>
            <div
              className="absolute -bottom-4 -right-4 px-3 py-2 rounded-xl border text-xs font-medium shadow-lg"
              style={{ background: brand.surface, borderColor: brand.border, color: brand.accent }}
            >
              Live preview while you edit
            </div>
          </motion.div>
        </div>
      </section>

      {/* Storage notice */}
      <section className="relative z-10 border-y border-white/[0.06]" style={{ background: brand.surface }}>
        <div className="max-w-6xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <Clock className="w-5 h-5 shrink-0" style={{ color: brand.warm }} />
          <div>
            <p className="text-sm font-medium text-[#c8d0da]">
              Your projects stay on this device for {STORAGE_POLICY_DAYS} days
            </p>
            <p className="text-xs text-[#5c6b7a] mt-0.5">
              After {STORAGE_POLICY_DAYS} days, projects are removed automatically from this browser.
              Only visible here — export or deploy to keep them permanently.
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative z-10 max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-2xl font-bold text-white mb-2">Everything you need to launch</h2>
        <p className="text-[#8b9aab] mb-10 max-w-xl">Professional templates, real-time editing, and one-click export — without touching code.</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { icon: LayoutTemplate, title: '40+ templates', desc: 'Portfolio, business, shop, blog & landing layouts' },
            { icon: Palette, title: 'Full customization', desc: 'Colors, fonts, sections, navbar & footer control' },
            { icon: Globe, title: 'Go live', desc: 'Deploy to Hostinger on your own domain' },
            { icon: Rocket, title: 'Export anywhere', desc: 'Download HTML, React, or Next.js ZIP' },
            { icon: Zap, title: 'Instant preview', desc: 'Desktop, tablet & mobile views in the builder' },
            { icon: Shield, title: 'Premium unlock', desc: 'Export, share & deploy with one portfolio slot' },
          ].map(({ icon: Icon, title, desc }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="p-5 rounded-2xl border hover:border-blue-500/25 transition"
              style={{ background: brand.surface, borderColor: brand.border }}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: brand.accentMuted }}>
                <Icon className="w-5 h-5" style={{ color: brand.accent }} />
              </div>
              <h3 className="font-semibold text-white mb-1">{title}</h3>
              <p className="text-sm text-[#8b9aab]">{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pb-20">
        <div
          className="rounded-2xl p-8 sm:p-12 text-center border"
          style={{ background: `linear-gradient(135deg, ${brand.accentMuted}, transparent)`, borderColor: 'rgba(37,99,235,0.25)' }}
        >
          <Sparkles className="w-8 h-8 mx-auto mb-4" style={{ color: brand.accent }} />
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">Ready to build your site?</h2>
          <p className="text-[#8b9aab] mb-6 max-w-md mx-auto">Join free. Start designing in minutes. No credit card required.</p>
          <button
            type="button"
            onClick={() => setShowAuth(true)}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-semibold transition hover:opacity-90"
            style={{ background: brand.accent, color: brand.onAccent }}
          >
            Get started free <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      <footer className="relative z-10 border-t border-white/[0.06] py-8 text-center text-xs text-[#5c6b7a]">
        © {new Date().getFullYear()} {APP_NAME}. Build smarter, launch faster.
      </footer>
    </div>
  );
}
