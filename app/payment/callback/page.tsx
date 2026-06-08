'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Loader2, Crown } from 'lucide-react';
import { useBuilderStore } from '@/lib/store';

function PaymentCallbackInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { refreshSession } = useBuilderStore();
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');
  const orderId = searchParams.get('order_id');

  useEffect(() => {
    if (!orderId) {
      setStatus('failed');
      return;
    }

    const verify = async () => {
      try {
        const res = await fetch('/api/payment/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId }),
        });
        const data = await res.json();
        if (data.success) {
          await refreshSession();
          setStatus('success');
          setTimeout(() => router.push('/'), 3000);
        } else {
          setStatus('failed');
        }
      } catch {
        setStatus('failed');
      }
    };

    verify();
  }, [orderId, refreshSession, router]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-[#111] border border-white/10 rounded-2xl p-10 max-w-md w-full text-center">
        {status === 'loading' && (
          <>
            <Loader2 className="w-12 h-12 text-blue-400 animate-spin mx-auto mb-4" />
            <h1 className="text-xl font-bold text-white mb-2">Verifying Payment…</h1>
            <p className="text-gray-400 text-sm">Please wait while we confirm your premium purchase.</p>
          </>
        )}
        {status === 'success' && (
          <>
            <CheckCircle2 className="w-14 h-14 text-green-400 mx-auto mb-4" />
            <div className="flex items-center justify-center gap-2 mb-2">
              <Crown className="w-5 h-5 text-amber-400" />
              <h1 className="text-xl font-bold text-white">Premium Activated!</h1>
            </div>
            <p className="text-gray-400 text-sm mb-4">You can now export, share, and publish your portfolios.</p>
            <p className="text-xs text-gray-600">Redirecting to dashboard…</p>
          </>
        )}
        {status === 'failed' && (
          <>
            <XCircle className="w-14 h-14 text-red-400 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-white mb-2">Payment Not Confirmed</h1>
            <p className="text-gray-400 text-sm mb-6">Payment may still be processing. Try again from the dashboard.</p>
            <button onClick={() => router.push('/')}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-xl transition">
              Back to Dashboard
            </button>
          </>
        )}
      </motion.div>
    </div>
  );
}

export default function PaymentCallbackPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a0a0a]" />}>
      <PaymentCallbackInner />
    </Suspense>
  );
}
