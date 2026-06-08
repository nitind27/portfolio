'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { APP_NAME } from '@/lib/brand';

const GOOGLE_AUTH_ENABLED = Boolean(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);
const DISMISS_KEY = 'site99_google_prompt_dismissed';

function GoogleG({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

interface Props {
  /** Show immediately (e.g. when login modal opens) */
  forceShow?: boolean;
  /** top-right near header buttons */
  className?: string;
}

export default function GoogleSignInPrompt({ forceShow = false, className = '' }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!GOOGLE_AUTH_ENABLED) return;

    try {
      if (sessionStorage.getItem(DISMISS_KEY) === '1' && !forceShow) return;
    } catch { /* ignore */ }

    if (forceShow) {
      setVisible(true);
      return;
    }

    const t = setTimeout(() => setVisible(true), 1200);
    return () => clearTimeout(t);
  }, [forceShow]);

  const dismiss = () => {
    setVisible(false);
    try {
      sessionStorage.setItem(DISMISS_KEY, '1');
    } catch { /* ignore */ }
  };

  if (!GOOGLE_AUTH_ENABLED) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          role="dialog"
          aria-label="Sign in with Google"
          initial={{ opacity: 0, y: -12, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.96 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          className={`fixed z-[220] w-[min(100vw-2rem,380px)] ${className}`}
          style={{ top: '4.5rem', right: '1rem' }}
          onClick={e => e.stopPropagation()}
        >
          <div
            className="relative bg-white rounded-xl overflow-hidden"
            style={{
              boxShadow: '0 4px 24px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.06)',
            }}
          >
            <button
              type="button"
              onClick={dismiss}
              className="absolute top-3 right-3 p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition z-10"
              aria-label="Dismiss Google sign in"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header row — Google branding */}
            <div className="flex items-center gap-2.5 px-5 pt-5 pb-1 pr-12">
              <GoogleG size={20} />
              <span className="text-[15px] text-[#3c4043] font-normal tracking-tight">
                Sign in with Google
              </span>
            </div>

            {/* Body */}
            <div className="px-5 pt-3 pb-5 text-center">
              <p className="text-[15px] leading-snug text-[#202124] font-normal mb-2">
                Use your Google Account to sign in to{' '}
                <span className="font-medium">{APP_NAME}</span>
              </p>
              <p className="text-[13px] leading-relaxed text-[#5f6368] mb-5 px-1">
                No more passwords to remember. Signing in is fast, simple and secure.
              </p>

              <a
                href="/api/auth/google"
                className="flex items-center justify-center gap-3 w-full py-2.5 px-4 rounded-md border border-[#dadce0] bg-white text-[#3c4043] text-sm font-medium transition hover:bg-[#f8f9fa] hover:border-[#c6c9cc] active:bg-[#f1f3f4]"
              >
                <GoogleG size={18} />
                Continue with Google
              </a>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export { GOOGLE_AUTH_ENABLED };
