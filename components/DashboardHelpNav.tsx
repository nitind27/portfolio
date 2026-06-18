'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, Bot, Receipt, ChevronDown, HelpCircle, UserCircle, MessageSquare } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useBrand, useTheme } from './theme/ThemeProvider';

const LINKS = [
  {
    href: '/profile',
    label: 'My Profile',
    short: 'Profile',
    icon: UserCircle,
    hint: 'Account & password',
  },
  {
    href: '/docs',
    label: 'Documentation',
    short: 'Docs',
    icon: BookOpen,
    hint: 'Builder guides & policies',
  },
  {
    href: '/ask',
    label: 'Ask AI',
    short: 'Ask AI',
    icon: Bot,
    hint: 'Instant help from docs',
    accent: true,
  },
  {
    href: '/billing',
    label: 'Billing',
    short: 'Billing',
    icon: Receipt,
    hint: 'Plans & payment history',
  },
  {
    href: '/support',
    label: 'Support',
    short: 'Support',
    icon: MessageSquare,
    hint: 'Complaints & feedback',
  },
] as const;

function NavPill({
  href,
  label,
  short,
  icon: Icon,
  accent,
  active,
}: {
  href: string;
  label: string;
  short: string;
  icon: typeof BookOpen;
  accent?: boolean;
  active: boolean;
}) {
  const brand = useBrand();
  const { isLight } = useTheme();

  let pillStyle: React.CSSProperties | undefined;
  let pillClass = 'group flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200';

  if (active && accent) {
    pillClass += ' shadow-sm';
    pillStyle = {
      background: `linear-gradient(135deg, ${brand.accent}, ${brand.accentHover})`,
      color: brand.onAccent,
    };
  } else if (active) {
    pillStyle = {
      background: isLight ? brand.accentMuted : 'rgba(255,255,255,0.1)',
      color: brand.text,
    };
  } else if (accent) {
    pillStyle = {
      background: brand.accentMuted,
      border: `1px solid ${brand.accent}33`,
      color: brand.accent,
    };
  } else {
    pillStyle = { color: brand.textMuted };
  }

  return (
    <Link href={href} title={label} className={pillClass} style={pillStyle}>
      <span
        className="flex items-center justify-center w-6 h-6 rounded-md shrink-0 transition-colors"
        style={{
          background: active
            ? accent
              ? 'rgba(255,255,255,0.2)'
              : isLight ? 'rgba(15,23,42,0.06)' : 'rgba(255,255,255,0.1)'
            : accent
              ? brand.accentMuted
              : isLight ? 'rgba(15,23,42,0.04)' : 'rgba(255,255,255,0.04)',
        }}
      >
        <Icon className="w-3.5 h-3.5" style={accent && !active ? { color: brand.accent } : undefined} />
      </span>
      <span className="whitespace-nowrap">
        <span className="hidden lg:inline">{label}</span>
        <span className="lg:hidden">{short}</span>
      </span>
    </Link>
  );
}

export default function DashboardHelpNav() {
  const pathname = usePathname();
  const brand = useBrand();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  return (
    <>
      <nav
        className="hidden sm:flex items-center gap-0.5 p-1 rounded-xl border backdrop-blur-sm"
        style={{ borderColor: brand.border, background: `${brand.surface}ee` }}
        aria-label="Help and account links"
      >
        {LINKS.map(link => (
          <NavPill
            key={link.href}
            {...link}
            active={pathname === link.href || pathname.startsWith(`${link.href}/`)}
          />
        ))}
      </nav>

      <div ref={ref} className="relative sm:hidden">
        <button
          type="button"
          onClick={() => setOpen(v => !v)}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border transition"
          style={{
            borderColor: brand.border,
            background: brand.surface,
            color: brand.textMuted,
          }}
        >
          <HelpCircle className="w-4 h-4" style={{ color: brand.accent }} />
          <span>Help & Billing</span>
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>

        {open && (
          <div
            className="absolute right-0 top-full mt-2 w-56 rounded-xl border shadow-2xl overflow-hidden z-50 py-1"
            style={{ borderColor: brand.border, background: brand.surface }}
          >
            {LINKS.map(link => {
              const Icon = link.icon;
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="flex items-start gap-3 px-3 py-2.5 transition"
                  style={{ background: active ? brand.accentMuted : undefined }}
                >
                  <span
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                    style={{
                      background: 'accent' in link && link.accent ? brand.accentMuted : brand.surfaceHover,
                      color: 'accent' in link && link.accent ? brand.accent : brand.textMuted,
                    }}
                  >
                    <Icon className="w-4 h-4" />
                  </span>
                  <span>
                    <span className="block text-sm font-medium" style={{ color: brand.text }}>{link.label}</span>
                    <span className="block text-[11px] mt-0.5" style={{ color: brand.textDim }}>{link.hint}</span>
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
