'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Monitor, Smartphone, X } from 'lucide-react';
import { APP_NAME } from '@/lib/brand';
import { shouldRecommendDesktop } from '@/lib/mobile-device';
import { useBrand } from '@/components/theme/ThemeProvider';

const DISMISS_KEY = 'site99_mobile_desktop_notice';

const SKIP_PREFIXES = ['/p/', '/preview/'];

export default function MobileDesktopNotice() {
  const pathname = usePathname();
  const brand = useBrand();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (SKIP_PREFIXES.some(p => pathname?.startsWith(p))) return;

    try {
      if (sessionStorage.getItem(DISMISS_KEY) === '1') return;
    } catch { /* ignore */ }

    const ua = navigator.userAgent || '';
    if (!shouldRecommendDesktop(ua)) return;

    const t = setTimeout(() => setVisible(true), 600);
    return () => clearTimeout(t);
  }, [pathname]);

  const dismiss = () => {
    setVisible(false);
    try { sessionStorage.setItem(DISMISS_KEY, '1'); } catch { /* ignore */ }
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          role="dialog"
          aria-labelledby="mobile-desktop-notice-title"
          aria-describedby="mobile-desktop-notice-desc"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-x-0 bottom-0 z-[300] p-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
        >
          <div
            className="theme-aware mx-auto max-w-lg rounded-2xl border shadow-2xl overflow-hidden"
            style={{ background: brand.surface, borderColor: brand.border }}
          >
            <div
              className="h-1"
              style={{ background: `linear-gradient(90deg, ${brand.accent}, ${brand.accentHover})` }}
            />

            <div className="p-5 relative">
              <button
                type="button"
                onClick={dismiss}
                className="absolute top-4 right-4 p-1.5 rounded-lg transition"
                style={{ color: brand.textDim }}
                aria-label="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-start gap-4 pr-8">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: brand.accentMuted }}
                >
                  <Monitor className="w-6 h-6" style={{ color: brand.accent }} />
                </div>

                <div>
                  <h2
                    id="mobile-desktop-notice-title"
                    className="text-base font-bold leading-snug"
                    style={{ color: brand.text }}
                  >
                    Best on laptop or desktop
                  </h2>
                  <p
                    id="mobile-desktop-notice-desc"
                    className="text-sm leading-relaxed mt-2"
                    style={{ color: brand.textMuted }}
                  >
                    {APP_NAME} is designed for larger screens. For the best experience — full builder,
                    easier editing, and smoother workflow — please open{' '}
                    <strong style={{ color: brand.text }}>site99.online</strong> on a laptop or desktop.
                  </p>
                  <p className="text-xs mt-2 flex items-center gap-1.5" style={{ color: brand.textDim }}>
                    <Smartphone className="w-3.5 h-3.5 shrink-0" />
                    You can continue on mobile, but some features may be harder to use.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={dismiss}
                className="w-full mt-4 py-2.5 rounded-xl text-sm font-semibold transition hover:brightness-110"
                style={{
                  background: `linear-gradient(135deg, ${brand.accent}, ${brand.accentHover})`,
                  color: brand.onAccent,
                }}
              >
                Continue on mobile
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
