'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles } from 'lucide-react';
import BrandLogo from './BrandLogo';
import { APP_NAME, brand } from '@/lib/brand';

const GOOGLE_AUTH_ENABLED = Boolean(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);
const DISMISS_KEY = 'site99_google_prompt_dismissed';

function GoogleG({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" className="shrink-0">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

interface Props {
  /** @deprecated Auth modal includes Google sign-in — landing nudge only */
  forceShow?: boolean;
  className?: string;
}

export default function GoogleSignInPrompt({ forceShow = false, className = '' }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!GOOGLE_AUTH_ENABLED || forceShow) return;

    try {
      if (sessionStorage.getItem(DISMISS_KEY) === '1') return;
    } catch { /* ignore */ }

    const t = setTimeout(() => setVisible(true), 1200);
    return () => clearTimeout(t);
  }, [forceShow]);

  const dismiss = () => {
    setVisible(false);
    try {
      sessionStorage.setItem(DISMISS_KEY, '1');
    } catch { /* ignore */ }
  };

  if (!GOOGLE_AUTH_ENABLED || forceShow) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          role="dialog"
          aria-label="Sign in with Google"
          initial={{ opacity: 0, y: -16, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.96 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          className={`fixed z-[150] w-[min(100vw-2rem,360px)] ${className}`}
          style={{ top: '5rem', right: '1rem' }}
          onClick={e => e.stopPropagation()}
        >
          <div
            className="rounded-2xl border overflow-hidden shadow-2xl shadow-black/50"
            style={{ borderColor: `${brand.accent}33`, background: brand.surface }}
          >
            {/* Header — matches auth modal */}
            <div
              className="relative px-5 pt-4 pb-3 border-b"
              style={{
                borderColor: brand.border,
                background: `linear-gradient(145deg, rgba(242,140,40,0.18) 0%, ${brand.navy} 50%, ${brand.surface} 100%)`,
              }}
            >
              <button
                type="button"
                onClick={dismiss}
                className="absolute top-3 right-3 p-1.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition border border-white/10"
                aria-label="Dismiss"
              >
                <X className="w-3.5 h-3.5" />
              </button>

              <div className="flex items-center gap-3 pr-8">
                <BrandLogo size="xs" />
                <div className="min-w-0">
                  <p className="text-sm font-bold text-white leading-tight">Sign in with Google</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">Fast & secure access to {APP_NAME}</p>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="px-5 py-4">
              <div className="flex items-start gap-2 mb-4 p-3 rounded-xl border border-white/[0.06] bg-white/[0.02]">
                <Sparkles className="w-4 h-4 shrink-0 mt-0.5" style={{ color: brand.accentLight }} />
                <p className="text-xs text-gray-400 leading-relaxed">
                  Use your Google account — no password to remember. One click and you&apos;re in the builder.
                </p>
              </div>

              <a
                href="/api/auth/google"
                className="flex items-center justify-center gap-2.5 w-full py-2.5 px-4 rounded-xl text-sm font-semibold border transition hover:bg-white/[0.06] active:scale-[0.99]"
                style={{ borderColor: brand.border, background: 'rgba(255,255,255,0.03)', color: brand.text }}
              >
                <GoogleG size={18} />
                Continue with Google
              </a>

              <button
                type="button"
                onClick={dismiss}
                className="w-full mt-2.5 py-2 text-[11px] text-gray-600 hover:text-gray-400 transition"
              >
                Maybe later
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export { GOOGLE_AUTH_ENABLED, GoogleG };
