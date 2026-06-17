'use client';

import { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Gift, Sparkles } from 'lucide-react';
import { brand } from '@/lib/brand';
import { trackAnalytics } from '@/lib/analytics-client';

const DISMISS_KEY = 'pb_promo_modal_dismissed';

interface PromoModalData {
  title: string;
  message: string;
  badge: string;
  ctaText: string;
  ctaAction: 'register' | 'dashboard';
  showSlotsRemaining?: boolean;
  slotsRemaining?: number;
  freeGrantLimit?: number;
}

interface Props {
  isAuthenticated?: boolean;
  onRegister?: () => void;
}

export default function PromoModal({ isAuthenticated = false, onRegister }: Props) {
  const [modal, setModal] = useState<PromoModalData | null>(null);
  const [visible, setVisible] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/site/promo');
      const data = await res.json();
      if (!data.modal) return;
      if (isAuthenticated && !data.modal.showToLoggedIn) return;

      const dismissed = sessionStorage.getItem(DISMISS_KEY);
      if (dismissed === '1') return;

      setModal(data.modal);
      setVisible(true);
      trackAnalytics('modal_view', { metadata: { slotsRemaining: data.modal.slotsRemaining } });
    } catch { /* ignore */ }
  }, [isAuthenticated]);

  useEffect(() => {
    const t = setTimeout(load, 1200);
    return () => clearTimeout(t);
  }, [load]);

  const dismiss = () => {
    setVisible(false);
    try { sessionStorage.setItem(DISMISS_KEY, '1'); } catch { /* ignore */ }
  };

  const handleCta = () => {
    trackAnalytics('modal_cta', { metadata: { action: modal?.ctaAction } });
    dismiss();
    if (modal?.ctaAction === 'register' && onRegister) {
      onRegister();
    }
  };

  if (!modal) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
          onClick={dismiss}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: 'spring', damping: 22, stiffness: 280 }}
            className="relative w-full max-w-md rounded-2xl border overflow-hidden shadow-2xl"
            style={{ background: brand.surface, borderColor: brand.border }}
            onClick={e => e.stopPropagation()}
          >
            <div className="absolute inset-x-0 top-0 h-1" style={{ background: `linear-gradient(90deg, ${brand.accent}, ${brand.accentHover})` }} />

            <button
              type="button"
              onClick={dismiss}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition z-10"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="p-8 pt-10 text-center">
              {modal.badge && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-5"
                  style={{ background: brand.accentMuted, color: brand.accentLight }}>
                  <Sparkles className="w-3 h-3" />
                  {modal.badge}
                </span>
              )}

              <div className="w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center"
                style={{ background: `linear-gradient(135deg, ${brand.accent}33, ${brand.accentHover}22)` }}>
                <Gift className="w-8 h-8" style={{ color: brand.accent }} />
              </div>

              <h2 className="text-xl font-bold text-white mb-3">{modal.title}</h2>
              <p className="text-sm text-gray-400 leading-relaxed whitespace-pre-line mb-5">{modal.message}</p>

              {modal.showSlotsRemaining && modal.slotsRemaining != null && modal.freeGrantLimit != null && (
                <div className="mb-6 p-3 rounded-xl border border-white/10 bg-white/[0.03]">
                  <div className="flex justify-between text-xs text-gray-500 mb-2">
                    <span>Free slots remaining</span>
                    <span className="font-mono text-white">{modal.slotsRemaining} / {modal.freeGrantLimit}</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${Math.max(4, (modal.slotsRemaining / modal.freeGrantLimit) * 100)}%`,
                        background: `linear-gradient(90deg, ${brand.accent}, ${brand.accentHover})`,
                      }}
                    />
                  </div>
                </div>
              )}

              {(modal.ctaAction === 'register' && !isAuthenticated) && (
                <button
                  type="button"
                  onClick={handleCta}
                  className="w-full py-3 rounded-xl font-semibold text-sm transition hover:scale-[1.02] active:scale-[0.98]"
                  style={{ background: `linear-gradient(135deg, ${brand.accent}, ${brand.accentHover})`, color: brand.onAccent }}
                >
                  {modal.ctaText}
                </button>
              )}

              {modal.ctaAction === 'dashboard' && isAuthenticated && (
                <button
                  type="button"
                  onClick={handleCta}
                  className="w-full py-3 rounded-xl font-semibold text-sm transition hover:scale-[1.02] active:scale-[0.98]"
                  style={{ background: `linear-gradient(135deg, ${brand.accent}, ${brand.accentHover})`, color: brand.onAccent }}
                >
                  {modal.ctaText}
                </button>
              )}

              <button type="button" onClick={dismiss} className="mt-3 text-xs text-gray-600 hover:text-gray-400 transition">
                Maybe later
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
