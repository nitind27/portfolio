'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Rocket, Globe, Shield, Users, Sparkles, Target, Heart,
  ArrowRight, CheckCircle2,
} from 'lucide-react';
import MarketingShell from './MarketingShell';
import CompanyInfoBlock from './CompanyInfoBlock';
import {
  APP_NAME, APP_TAGLINE, APP_DESCRIPTION,
  STORAGE_POLICY_DAYS, brand,
} from '@/lib/brand';
import { company } from '@/lib/company';

const STATS = [
  { value: '10+', label: 'Section types' },
  { value: '3', label: 'Export formats' },
  { value: `${STORAGE_POLICY_DAYS}d`, label: 'Free sharing' },
  { value: '₹99', label: 'Premium from' },
];

const VALUES = [
  { icon: Rocket, title: 'Ship fast', desc: 'From template to live site in minutes — not weeks.' },
  { icon: Globe, title: 'Launch anywhere', desc: 'Share a link, export code, or deploy to your own domain.' },
  { icon: Shield, title: 'Own your work', desc: 'Export full HTML, React, or Next.js — no lock-in.' },
  { icon: Users, title: 'Built for everyone', desc: 'Freelancers, shops, clinics, agencies — no coding required.' },
];

const OFFERINGS = [
  'Visual drag-and-drop builder with live preview on desktop & mobile',
  'Theme, navbar, footer, popup, SEO, social links & SMTP panels',
  `Free ${STORAGE_POLICY_DAYS}-day public share links for every account`,
  'Premium export (HTML, React, Next.js) and Hostinger deploy',
  `Secure one-time payments via ${company.paymentPartner}`,
];

const fade = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-40px' },
  transition: { duration: 0.45 },
};

export default function AboutPageClient() {
  return (
    <MarketingShell
      title={`About ${APP_NAME}`}
      subtitle={APP_TAGLINE}
    >
      {/* Hero band */}
      <section className="relative overflow-hidden border-b" style={{ borderColor: brand.border }}>
        <div
          className="absolute inset-0 opacity-40"
          style={{
            background: `radial-gradient(ellipse 80% 60% at 50% -20%, ${brand.accentGlow}, transparent)`,
          }}
        />
        <div className="relative max-w-6xl mx-auto px-5 sm:px-8 py-14 sm:py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div {...fade}>
              <p
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-5 border"
                style={{ borderColor: `${brand.accent}44`, background: brand.accentMuted, color: brand.accentLight }}
              >
                <Sparkles className="w-3.5 h-3.5" /> Est. {company.foundedYear} · {company.country}
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold text-white leading-tight mb-4">
                We help anyone build a professional website — without writing code.
              </h2>
              <p className="text-gray-400 leading-relaxed text-sm sm:text-base mb-6">
                {APP_DESCRIPTION} {APP_NAME} ({company.website.replace(/^https?:\/\//, '')}) is a visual platform
                where creators, freelancers, and businesses design, preview, and launch online.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
                  style={{ background: `linear-gradient(135deg, ${brand.accent}, ${brand.accentHover})` }}
                >
                  Contact us <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium border text-gray-300 hover:text-white transition"
                  style={{ borderColor: brand.border }}
                >
                  Start building free
                </Link>
              </div>
            </motion.div>

            <motion.div {...fade} transition={{ delay: 0.1, duration: 0.45 }}>
              <div className="grid grid-cols-2 gap-3">
                {STATS.map(({ value, label }) => (
                  <div
                    key={label}
                    className="p-5 rounded-2xl border text-center"
                    style={{ borderColor: brand.border, background: brand.surface }}
                  >
                    <p className="text-2xl sm:text-3xl font-bold" style={{ color: brand.accentLight }}>{value}</p>
                    <p className="text-xs text-gray-500 mt-1">{label}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="max-w-6xl mx-auto px-5 sm:px-8 py-14 sm:py-16">
        <div className="grid md:grid-cols-2 gap-8">
          <motion.div
            className="p-6 sm:p-8 rounded-2xl border"
            style={{ borderColor: brand.border, background: brand.surface }}
            {...fade}
          >
            <div className="flex items-center gap-3 mb-4">
              <Target className="w-5 h-5" style={{ color: brand.accent }} />
              <h3 className="text-lg font-bold text-white">Our mission</h3>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              {company.tagline} We believe every business deserves a beautiful, fast website —
              whether you&apos;re a freelancer, restaurant, clinic, or startup. {APP_NAME} removes the technical barrier
              so you can focus on your story, not on code.
            </p>
          </motion.div>
          <motion.div
            className="p-6 sm:p-8 rounded-2xl border"
            style={{ borderColor: brand.border, background: brand.surface }}
            {...fade}
          >
            <div className="flex items-center gap-3 mb-4">
              <Heart className="w-5 h-5" style={{ color: brand.accent }} />
              <h3 className="text-lg font-bold text-white">What we do</h3>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed mb-4">
              {company.legalName} operates a {company.serviceCategory.toLowerCase()}.
              Users create portfolios and business websites using our section-based editor,
              publish shareable links, and upgrade to export production-ready code or deploy to hosting.
            </p>
            <p className="text-xs text-gray-500">
              Category: {company.serviceCategory}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Offerings */}
      <section
        className="border-y py-14 sm:py-16"
        style={{ borderColor: brand.border, background: `${brand.surface}66` }}
      >
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <motion.div className="text-center mb-10" {...fade}>
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">What {APP_NAME} offers</h2>
            <p className="text-sm text-gray-500 max-w-xl mx-auto">
              Everything you need to go from idea to live website — in one platform.
            </p>
          </motion.div>
          <ul className="grid sm:grid-cols-2 gap-3 max-w-3xl mx-auto">
            {OFFERINGS.map(text => (
              <motion.li
                key={text}
                className="flex items-start gap-3 p-4 rounded-xl border"
                style={{ borderColor: brand.border, background: brand.surface }}
                {...fade}
              >
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" style={{ color: brand.success }} />
                <span className="text-sm text-gray-400 leading-relaxed">{text}</span>
              </motion.li>
            ))}
          </ul>
        </div>
      </section>

      {/* Values */}
      <section className="max-w-6xl mx-auto px-5 sm:px-8 py-14 sm:py-16">
        <h2 className="text-xl font-bold text-white mb-6 text-center">Our values</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {VALUES.map(({ icon: Icon, title, desc }) => (
            <motion.div
              key={title}
              className="p-5 rounded-2xl border"
              style={{ background: brand.surface, borderColor: brand.border }}
              {...fade}
            >
              <Icon className="w-5 h-5 mb-3" style={{ color: brand.accent }} />
              <h3 className="font-semibold text-white text-sm mb-1">{title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Company info + legal links */}
      <section
        className="border-t py-14 sm:py-16"
        style={{ borderColor: brand.border, background: brand.navy }}
      >
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <div className="grid lg:grid-cols-2 gap-8 items-start">
            <motion.div {...fade}>
              <h2 className="text-xl font-bold text-white mb-2">Company details</h2>
              <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                Registered business information for customers, partners, and payment verification.
                Need help? Visit our{' '}
                <Link href="/contact" className="text-orange-400 hover:underline">Contact</Link> or{' '}
                <Link href="/support" className="text-orange-400 hover:underline">Support</Link> page.
              </p>
              <div className="flex flex-wrap gap-3 text-xs">
                {[
                  { href: '/contact', label: 'Contact Us' },
                  { href: '/privacy', label: 'Privacy Policy' },
                  { href: '/terms', label: 'Terms of Service' },
                  { href: '/docs#refund-policy', label: 'Refund Policy' },
                ].map(l => (
                  <Link
                    key={l.href}
                    href={l.href}
                    className="px-3 py-1.5 rounded-lg border text-gray-400 hover:text-white transition"
                    style={{ borderColor: brand.border }}
                  >
                    {l.label}
                  </Link>
                ))}
              </div>
            </motion.div>
            <motion.div {...fade}>
              <CompanyInfoBlock />
            </motion.div>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
