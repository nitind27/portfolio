'use client';

import Link from 'next/link';
import { Rocket, Globe, Shield, Users, Sparkles } from 'lucide-react';
import MarketingShell from './MarketingShell';
import { APP_NAME, APP_DOMAIN, APP_TAGLINE, APP_DESCRIPTION, STORAGE_POLICY_DAYS, brand } from '@/lib/brand';

const VALUES = [
  { icon: Rocket, title: 'Ship fast', desc: 'From template to live site in minutes — not weeks.' },
  { icon: Globe, title: 'Launch anywhere', desc: 'Share link, export code, or deploy to your Hostinger domain.' },
  { icon: Shield, title: 'Own your work', desc: 'Export full HTML/React/Next.js — no lock-in.' },
  { icon: Users, title: 'Built for everyone', desc: 'Freelancers, agencies, shops, and startups — no coding required.' },
];

export default function AboutPageClient() {
  return (
    <MarketingShell
      title={`About ${APP_NAME}`}
      subtitle={APP_TAGLINE}
      narrow
    >
      <div className="max-w-3xl mx-auto px-5 sm:px-8 py-12 space-y-12">
        <section className="prose prose-invert max-w-none">
          <p className="text-gray-300 leading-relaxed text-base">{APP_DESCRIPTION}</p>
          <p className="text-gray-400 leading-relaxed mt-4">
            {APP_NAME} is developed for {APP_DOMAIN} — a platform where anyone can design professional websites
            with a visual builder, rich section library, and production-ready export tools.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5" style={{ color: brand.accent }} /> What we offer
          </h2>
          <ul className="space-y-2 text-sm text-gray-400">
            <li>• Visual drag-and-drop section builder with live preview</li>
            <li>• Theme, navbar, footer, popup, SEO, social & SMTP panels</li>
            <li>• Free {STORAGE_POLICY_DAYS}-day public share links for every user</li>
            <li>• Premium export (HTML, React, Next.js) and Hostinger deploy</li>
            <li>• Secure payments via Cashfree</li>
          </ul>
        </section>

        <section className="grid sm:grid-cols-2 gap-4">
          {VALUES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="p-5 rounded-2xl border" style={{ background: brand.surface, borderColor: brand.border }}>
              <Icon className="w-5 h-5 mb-3" style={{ color: brand.accent }} />
              <h3 className="font-semibold text-white text-sm mb-1">{title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </section>

        <section className="rounded-2xl border p-6" style={{ borderColor: brand.border, background: brand.surface }}>
          <h2 className="text-lg font-bold text-white mb-2">Contact & support</h2>
          <p className="text-sm text-gray-400 leading-relaxed">
            Need help? Use our <Link href="/ask" className="text-orange-400 hover:underline">Ask AI</Link> assistant
            or read the full <Link href="/docs" className="text-orange-400 hover:underline">documentation</Link>.
            For billing questions see your <Link href="/billing" className="text-orange-400 hover:underline">Billing</Link> page.
          </p>
        </section>
      </div>
    </MarketingShell>
  );
}
