'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Crown, Download, Share2, Loader2, CheckCircle2, Rocket, Receipt } from 'lucide-react';
import { calculateGst, formatGstMoney, getGstTaxLabel } from '@/lib/gst';
import { useBuilderStore } from '@/lib/store';
import type { PremiumModalReason } from '@/lib/portfolio-access-client';
import type { SubscriptionPlan } from '@/lib/plans-types';
import { canExport } from '@/lib/plans-types';

declare global {
  interface Window {
    Cashfree?: (opts: { mode: string }) => {
      checkout: (opts: { paymentSessionId: string; redirectTarget?: string }) => Promise<void>;
    };
  }
}

function loadCashfreeScript() {
  return new Promise<void>((resolve, reject) => {
    if (window.Cashfree) { resolve(); return; }
    const existing = document.querySelector('script[data-cashfree-sdk]');
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('Cashfree SDK failed to load')));
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
    script.async = true;
    script.dataset.cashfreeSdk = 'true';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Cashfree SDK failed to load'));
    document.body.appendChild(script);
  });
}

interface Props {
  open: boolean;
  onClose: () => void;
  reason?: PremiumModalReason;
}

const REASON_TEXT: Record<string, string> = {
  export: 'Export this portfolio as ZIP (HTML, React, Next.js)',
  share: 'Share live link for this portfolio',
  publish: 'Publish & share this portfolio online',
  deploy: 'Deploy live to your own domain via Hostinger',
  general: 'Upgrade to unlock premium features',
  unlock_another: 'Unlock this portfolio — replaces your current download slot',
};

export default function PremiumModal({ open, onClose, reason = 'general' }: Props) {
  const { user, refreshSession } = useBuilderStore();
  const [loading, setLoading] = useState(false);
  const [plansLoading, setPlansLoading] = useState(false);
  const [error, setError] = useState('');
  const [plansError, setPlansError] = useState('');
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
  const [taxRate, setTaxRate] = useState(18);
  const [taxLabel, setTaxLabel] = useState('GST (18%)');

  const isRepurchase = reason === 'unlock_another' || Boolean(user?.isPremium);

  useEffect(() => {
    if (!open) return;
    setPlansLoading(true);
    setPlansError('');
    fetch('/api/plans')
      .then(async r => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.error || 'Could not load plans');
        return d;
      })
      .then(d => {
        const paid = (d.plans || []).filter((p: SubscriptionPlan) => p.price > 0);
        setPlans(paid);
        if (paid[0]) setSelectedPlanId(paid[0].id);
        else setPlansError('No paid plans configured. Contact support.');
        if (d.tax?.rate != null) setTaxRate(Number(d.tax.rate));
        if (d.tax?.label) setTaxLabel(String(d.tax.label));
      })
      .catch((err: unknown) => {
        setPlans([]);
        setPlansError(err instanceof Error ? err.message : 'Could not load plans');
      })
      .finally(() => setPlansLoading(false));
  }, [open]);

  const selectedPlan = plans.find(p => p.id === selectedPlanId);
  const pricing = selectedPlan ? calculateGst(selectedPlan.price, taxRate) : null;

  const handleUpgrade = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ repurchase: isRepurchase, planId: selectedPlanId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not start payment');

      await loadCashfreeScript();
      const mode = data.checkoutMode || (process.env.NEXT_PUBLIC_CASHFREE_ENV === 'production' ? 'production' : 'sandbox');
      const cashfree = window.Cashfree!({ mode });
      await cashfree.checkout({
        paymentSessionId: data.paymentSessionId,
        redirectTarget: '_self',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment failed');
      setLoading(false);
    }
  };

  if (user?.isPremium && reason !== 'unlock_another' && user.premiumPortfolioId) {
    return (
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={onClose}>
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="bg-[#111] border border-green-500/30 rounded-2xl p-8 max-w-md w-full text-center">
              <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-white mb-2">Plan Active</h2>
              <p className="text-gray-400 text-sm mb-2">{user.planName || 'Premium'} plan · {user.premiumPortfolioId ? '1 slot bound' : 'Slot available'}</p>
              <button onClick={() => { refreshSession(); onClose(); }}
                className="w-full bg-green-600 hover:bg-green-500 text-white font-semibold py-3 rounded-xl transition mt-4">
                Continue
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={onClose}>
          <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
            onClick={e => e.stopPropagation()}
            className="bg-[#111] border border-white/10 rounded-2xl max-w-lg w-full overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="relative px-6 pt-6 pb-4 border-b border-white/10 bg-gradient-to-br from-[#f28c28]/20 to-[#0a1d37]">
              <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition">
                <X className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                  <Crown className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">{isRepurchase ? 'Unlock This Portfolio' : 'Upgrade to Premium'}</h2>
                  <p className="text-xs text-gray-400">{user?.planName || 'Free'} → ₹{selectedPlan?.price ?? process.env.NEXT_PUBLIC_PREMIUM_PRICE ?? 99} one-time</p>
                </div>
              </div>
              <p className="text-sm text-blue-200/80">{REASON_TEXT[reason]}</p>
            </div>

            <div className="p-6 space-y-4">
              {plansLoading ? (
                <p className="text-sm text-gray-400 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Loading plans…
                </p>
              ) : selectedPlan ? (
                <div className="p-4 rounded-xl border border-blue-500/30 bg-blue-500/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-white">{selectedPlan.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{selectedPlan.description}</p>
                    </div>
                    <p className="text-lg font-bold text-white">
                      {formatGstMoney(calculateGst(selectedPlan.price, taxRate).total)}
                      <span className="text-[10px] font-normal text-gray-500 block">incl. {taxLabel}</span>
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {canExport(selectedPlan.features) && <span className="text-[9px] px-1.5 py-0.5 rounded bg-green-500/10 text-green-400">Export</span>}
                    {selectedPlan.features.hostingerDeploy && <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400">Deploy</span>}
                    {selectedPlan.features.unlockedPortfolios > 0 && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400">{selectedPlan.features.unlockedPortfolios} portfolio slot</span>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-amber-400/90">{plansError || 'No plans available.'}</p>
              )}

              <div className="space-y-2.5">
                {[
                  { icon: Download, text: 'Export as HTML, React, or Next.js ZIP' },
                  { icon: Share2, text: 'Share live portfolio link' },
                  { icon: Rocket, text: 'Deploy to Hostinger domain' },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-3 text-sm text-gray-300">
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-blue-400" />
                    </div>
                    {text}
                  </div>
                ))}
              </div>

              {pricing && (
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 space-y-2">
                  <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                    <Receipt className="w-3.5 h-3.5" /> Price breakdown
                  </div>
                  <div className="flex justify-between text-sm text-gray-300">
                    <span>Plan amount</span>
                    <span>{formatGstMoney(pricing.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-300">
                    <span>{taxLabel}</span>
                    <span>{formatGstMoney(pricing.gstAmount)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-white/10">
                    <span>Total payable</span>
                    <span>{formatGstMoney(pricing.total)}</span>
                  </div>
                  <p className="text-[10px] text-gray-500 pt-1">
                    {getGstTaxLabel(pricing.gstRate)} applied as per India digital services tax rules. All prices are exclusive of tax.
                  </p>
                </div>
              )}

              {error && <p className="text-red-400 text-sm">{error}</p>}

              <button onClick={handleUpgrade} disabled={loading || plansLoading || !selectedPlanId}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#f28c28] to-[#e07d10] hover:from-[#ffa033] hover:to-[#f28c28] disabled:opacity-60 text-white font-bold py-3.5 rounded-xl transition">
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Starting payment…</> : <>Pay {pricing ? formatGstMoney(pricing.total) : '…'} with Cashfree</>}
              </button>

              <p className="text-center text-[10px] text-gray-600">Secure payment via Cashfree · {taxLabel} included at checkout</p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
