'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import BrandLogo from '@/components/BrandLogo';
import { APP_NAME, brand } from '@/lib/brand';

const MAIN_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/docs', label: 'Documentation' },
  { href: '/ask', label: 'Ask AI' },
  { href: '/about', label: 'About' },
];

const LEGAL_LINKS = [
  { href: '/privacy', label: 'Privacy Policy' },
  { href: '/docs#refund-policy', label: 'Refund Policy' },
  { href: '/billing', label: 'Billing' },
];

interface Props {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  narrow?: boolean;
}

export default function MarketingShell({ children, title, subtitle, narrow }: Props) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: brand.bg, color: brand.text }}>
      <header
        className="sticky top-0 z-50 border-b backdrop-blur-md"
        style={{ background: `${brand.bg}ee`, borderColor: brand.border }}
      >
        <div className="max-w-6xl mx-auto px-5 sm:px-8 h-14 flex items-center justify-between gap-4">
          <Link href="/" className="shrink-0">
            <BrandLogo size="sm" />
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {[...MAIN_LINKS, ...LEGAL_LINKS.slice(0, 1)].map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 rounded-lg text-sm transition ${
                  pathname === link.href || pathname.startsWith(link.href + '/')
                    ? 'text-white bg-white/10'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-2">
            <Link
              href="/ask"
              className="px-3 py-1.5 rounded-lg text-sm font-medium border transition"
              style={{ borderColor: `${brand.accent}55`, color: brand.accentLight, background: brand.accentMuted }}
            >
              Ask AI
            </Link>
            <Link
              href="/"
              className="px-4 py-1.5 rounded-lg text-sm font-semibold text-white"
              style={{ background: `linear-gradient(135deg, ${brand.accent}, ${brand.accentHover})` }}
            >
              Open app
            </Link>
          </div>

          <button
            type="button"
            className="md:hidden p-2 text-gray-400"
            onClick={() => setMobileOpen(v => !v)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {mobileOpen && (
          <div className="md:hidden border-t px-5 py-4 space-y-1" style={{ borderColor: brand.border, background: brand.surface }}>
            {[...MAIN_LINKS, ...LEGAL_LINKS].map(link => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-white/5"
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </header>

      {(title || subtitle) && (
        <div className="border-b" style={{ borderColor: brand.border, background: brand.surface }}>
          <div className={`mx-auto px-5 sm:px-8 py-10 ${narrow ? 'max-w-3xl' : 'max-w-6xl'}`}>
            {title && <h1 className="text-3xl sm:text-4xl font-bold text-white">{title}</h1>}
            {subtitle && <p className="mt-3 text-gray-400 text-sm sm:text-base max-w-2xl">{subtitle}</p>}
          </div>
        </div>
      )}

      <main className="flex-1">{children}</main>

      <footer className="border-t mt-auto" style={{ borderColor: brand.border, background: brand.navy }}>
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-10">
          <div className="grid sm:grid-cols-3 gap-8 mb-8">
            <div>
              <BrandLogo size="xs" />
              <p className="text-xs text-gray-500 mt-3 leading-relaxed">{APP_NAME} — build & launch websites without code.</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Product</p>
              <div className="space-y-2">
                {MAIN_LINKS.map(l => (
                  <Link key={l.href} href={l.href} className="block text-sm text-gray-500 hover:text-white transition">{l.label}</Link>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Legal</p>
              <div className="space-y-2">
                {LEGAL_LINKS.map(l => (
                  <Link key={l.href} href={l.href} className="block text-sm text-gray-500 hover:text-white transition">{l.label}</Link>
                ))}
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-600 text-center">© {new Date().getFullYear()} {APP_NAME}. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
