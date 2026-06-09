'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  CreditCard, Crown, Loader2, Receipt, CheckCircle2, Clock, XCircle,
  Download, ArrowLeft, Sparkles,
} from 'lucide-react';
import MarketingShell from '@/components/marketing/MarketingShell';
import PremiumModal from '@/components/PremiumModal';
import { useBuilderStore } from '@/lib/store';
import { brand } from '@/lib/brand';
import type { UserPaymentRow } from '@/lib/billing-server';

interface BillingData {
  planName: string;
  planSlug: string;
  isPremium: boolean;
  premiumPurchasedAt: string | null;
  totalPaid: number;
  paidOrders: number;
  pendingOrders: number;
  payments: UserPaymentRow[];
}

const STATUS_STYLE: Record<string, { icon: typeof CheckCircle2; color: string; bg: string; label: string }> = {
  paid: { icon: CheckCircle2, color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/30', label: 'Paid' },
  pending: { icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30', label: 'Pending' },
  failed: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/30', label: 'Failed' },
  expired: { icon: XCircle, color: 'text-gray-400', bg: 'bg-white/5 border-white/10', label: 'Expired' },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

function formatMoney(amount: number, currency = 'INR') {
  return currency === 'INR' ? `₹${amount.toLocaleString('en-IN')}` : `${currency} ${amount}`;
}

export default function BillingPageClient() {
  const router = useRouter();
  const { isAuthenticated, authLoading, initAuth } = useBuilderStore();
  const [billing, setBilling] = useState<BillingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showPremium, setShowPremium] = useState(false);

  useEffect(() => { initAuth(); }, [initAuth]);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      router.replace('/?login=1');
      return;
    }
    fetch('/api/billing', { credentials: 'include' })
      .then(async r => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.error || 'Failed to load billing');
        setBilling(d);
      })
      .catch(e => setError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, [isAuthenticated, authLoading, router]);

  if (authLoading || (loading && isAuthenticated)) {
    return (
      <MarketingShell>
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: brand.accent }} />
        </div>
      </MarketingShell>
    );
  }

  return (
    <MarketingShell title="Billing" subtitle="Your plan, payment history, and invoices.">
      <PremiumModal open={showPremium} onClose={() => setShowPremium(false)} reason="general" />

      <div className="max-w-5xl mx-auto px-5 sm:px-8 py-10">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white mb-8 transition">
          <ArrowLeft className="w-4 h-4" /> Back to dashboard
        </Link>

        {error && (
          <div className="mb-6 p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-300 text-sm">{error}</div>
        )}

        {billing && (
          <>
            <div className="grid sm:grid-cols-3 gap-4 mb-8">
              {[
                {
                  label: 'Current plan',
                  value: billing.planName,
                  sub: billing.isPremium ? 'Premium active' : 'Free tier',
                  icon: Crown,
                  accent: billing.isPremium,
                },
                {
                  label: 'Total paid',
                  value: formatMoney(billing.totalPaid),
                  sub: `${billing.paidOrders} successful order${billing.paidOrders === 1 ? '' : 's'}`,
                  icon: CreditCard,
                },
                {
                  label: 'Pending',
                  value: String(billing.pendingOrders),
                  sub: 'Awaiting payment',
                  icon: Clock,
                },
              ].map(({ label, value, sub, icon: Icon, accent }) => (
                <div
                  key={label}
                  className="rounded-2xl border p-5"
                  style={{ background: brand.surface, borderColor: brand.border }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <p className="text-xs text-gray-500 uppercase tracking-wider">{label}</p>
                    <Icon className={`w-4 h-4 ${accent ? 'text-amber-400' : 'text-gray-500'}`} />
                  </div>
                  <p className="text-2xl font-bold text-white">{value}</p>
                  <p className="text-xs text-gray-500 mt-1">{sub}</p>
                </div>
              ))}
            </div>

            {!billing.isPremium && (
              <div
                className="mb-8 p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                style={{ borderColor: `${brand.accent}44`, background: brand.accentMuted }}
              >
                <div className="flex items-center gap-3">
                  <Sparkles className="w-5 h-5" style={{ color: brand.accent }} />
                  <div>
                    <p className="text-sm font-semibold text-white">Upgrade to Pro</p>
                    <p className="text-xs text-gray-400">Export, deploy, and unlock premium sections</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPremium(true)}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white shrink-0"
                  style={{ background: `linear-gradient(135deg, ${brand.accent}, ${brand.accentHover})` }}
                >
                  Upgrade now
                </button>
              </div>
            )}

            <div className="rounded-2xl border overflow-hidden" style={{ borderColor: brand.border, background: brand.surface }}>
              <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: brand.border }}>
                <div className="flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-gray-400" />
                  <h2 className="font-semibold text-white text-sm">Payment history</h2>
                </div>
                {billing.payments.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      const csv = ['Order ID,Plan,Subtotal,GST Rate,GST Amount,Total,GSTIN,Status,Date,Paid At',
                        ...billing.payments.map(p =>
                          [p.orderId, p.planName || '', p.subtotal ?? '', p.gstRate ?? '', p.gstAmount ?? '', p.amount, p.gstin || '', p.status, p.createdAt, p.paidAt || ''].join(','),
                        )].join('\n');
                      const blob = new Blob([csv], { type: 'text/csv' });
                      const a = document.createElement('a');
                      a.href = URL.createObjectURL(blob);
                      a.download = `billing-${Date.now()}.csv`;
                      a.click();
                    }}
                    className="text-xs text-gray-400 hover:text-white flex items-center gap-1"
                  >
                    <Download className="w-3.5 h-3.5" /> Export CSV
                  </button>
                )}
              </div>

              {billing.payments.length === 0 ? (
                <div className="px-5 py-16 text-center">
                  <Receipt className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                  <p className="text-sm text-gray-400">No payments yet</p>
                  <p className="text-xs text-gray-600 mt-1">Your orders will appear here after checkout</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs text-gray-500 border-b" style={{ borderColor: brand.border }}>
                        <th className="px-5 py-3 font-medium">Order</th>
                        <th className="px-5 py-3 font-medium">Plan</th>
                        <th className="px-5 py-3 font-medium">Amount</th>
                        <th className="px-5 py-3 font-medium">Status</th>
                        <th className="px-5 py-3 font-medium">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {billing.payments.map(p => {
                        const st = STATUS_STYLE[p.status] || STATUS_STYLE.pending;
                        const Icon = st.icon;
                        return (
                          <tr key={p.id} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                            <td className="px-5 py-4 font-mono text-xs text-gray-300">{p.orderId}</td>
                            <td className="px-5 py-4 text-gray-300">{p.planName || '—'}</td>
                            <td className="px-5 py-4">
                              <p className="font-semibold text-white">{formatMoney(p.amount, p.currency)}</p>
                              {p.gstAmount != null && p.gstAmount > 0 && (
                                <p className="text-[10px] text-gray-500 mt-0.5">
                                  Base {formatMoney(p.subtotal ?? p.amount - p.gstAmount, p.currency)} + GST {p.gstRate ?? 18}% ({formatMoney(p.gstAmount, p.currency)})
                                </p>
                              )}
                              {p.gstin && (
                                <p className="text-[10px] text-emerald-500/80 font-mono mt-0.5">{p.gstin}</p>
                              )}
                            </td>
                            <td className="px-5 py-4">
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border ${st.bg} ${st.color}`}>
                                <Icon className="w-3 h-3" /> {st.label}
                              </span>
                            </td>
                            <td className="px-5 py-4 text-gray-500 text-xs">{formatDate(p.paidAt || p.createdAt)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <p className="mt-6 text-xs text-gray-600 text-center">
              All sales are final — no refunds. See{' '}
              <Link href="/docs#refund-policy" className="text-orange-400 hover:underline">refund policy</Link>.
            </p>
          </>
        )}
      </div>
    </MarketingShell>
  );
}
