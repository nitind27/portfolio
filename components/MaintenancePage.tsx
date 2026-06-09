'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Wrench, Clock, Mail, Shield } from 'lucide-react';
import BrandLogo from './BrandLogo';
import { APP_NAME, APP_TAGLINE, SUPPORT_EMAIL, brand } from '@/lib/brand';

interface PublicStatus {
  maintenanceTitle: string;
  maintenanceMessage: string;
  maintenanceEta: string;
}

const FALLBACK: PublicStatus = {
  maintenanceTitle: 'We\'ll be back soon',
  maintenanceMessage: `${APP_NAME} is undergoing scheduled maintenance. Thank you for your patience.`,
  maintenanceEta: 'We expect to be back online shortly.',
};

export default function MaintenancePage() {
  const [status, setStatus] = useState<PublicStatus>(FALLBACK);

  useEffect(() => {
    fetch('/api/site-status')
      .then(r => r.json())
      .then(data => {
        if (data.maintenanceTitle) {
          setStatus({
            maintenanceTitle: data.maintenanceTitle,
            maintenanceMessage: data.maintenanceMessage || FALLBACK.maintenanceMessage,
            maintenanceEta: data.maintenanceEta || FALLBACK.maintenanceEta,
          });
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden" style={{ background: brand.bg, color: brand.text }}>
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at 50% -20%, ${brand.accent}18, transparent),
            radial-gradient(ellipse 60% 40% at 100% 100%, ${brand.steel}22, transparent)
          `,
        }}
      />
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{ background: brand.accent }}
      />

      <header className="relative z-10 px-6 py-6 flex items-center justify-center max-w-4xl mx-auto w-full">
        <BrandLogo size="sm" />
      </header>

      <main className="relative z-10 flex-1 flex items-center justify-center px-6 py-12">
        <div className="max-w-lg w-full text-center">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-2xl"
            style={{
              background: `linear-gradient(135deg, ${brand.accentMuted}, rgba(45, 90, 123, 0.25))`,
              border: `1px solid ${brand.accent}44`,
              boxShadow: `0 20px 60px ${brand.accentGlow}`,
            }}
          >
            <Wrench className="w-9 h-9 animate-pulse" style={{ color: brand.accent }} />
          </div>

          <p className="text-xs font-semibold uppercase tracking-[0.2em] mb-3" style={{ color: brand.accentLight }}>
            Maintenance Mode
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4 leading-tight">
            {status.maintenanceTitle}
          </h1>
          <p className="text-gray-400 text-sm sm:text-base leading-relaxed mb-8">
            {status.maintenanceMessage}
          </p>

          <div
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm mb-10"
            style={{ background: brand.surface, border: `1px solid ${brand.border}` }}
          >
            <Clock className="w-4 h-4 shrink-0" style={{ color: brand.accent }} />
            <span className="text-gray-300">{status.maintenanceEta}</span>
          </div>

          <div className="grid sm:grid-cols-2 gap-3 text-left">
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="flex items-start gap-3 p-4 rounded-xl border transition hover:border-orange-500/30"
              style={{ borderColor: brand.border, background: `${brand.surface}99` }}
            >
              <Mail className="w-5 h-5 shrink-0 mt-0.5" style={{ color: brand.accent }} />
              <div>
                <p className="text-sm font-medium text-white">Need help?</p>
                <p className="text-xs text-gray-500 mt-0.5">{SUPPORT_EMAIL}</p>
              </div>
            </a>
            <Link
              href="/support"
              className="flex items-start gap-3 p-4 rounded-xl border transition hover:border-orange-500/30"
              style={{ borderColor: brand.border, background: `${brand.surface}99` }}
            >
              <Shield className="w-5 h-5 shrink-0 mt-0.5" style={{ color: brand.steelLight }} />
              <div>
                <p className="text-sm font-medium text-white">Urgent issue?</p>
                <p className="text-xs text-gray-500 mt-0.5">Submit support request</p>
              </div>
            </Link>
          </div>
        </div>
      </main>

      <footer className="relative z-10 py-6 text-center text-xs text-gray-600">
        © {new Date().getFullYear()} {APP_NAME}. {APP_TAGLINE}
      </footer>
    </div>
  );
}
