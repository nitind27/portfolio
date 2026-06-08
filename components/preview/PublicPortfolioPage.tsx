'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Clock, Lock, Globe } from 'lucide-react';
import type { Portfolio } from '@/lib/types';
import PortfolioPreview from './PortfolioPreview';
import { brand, APP_NAME, STORAGE_POLICY_DAYS } from '@/lib/brand';

type LoadState =
  | { status: 'loading' }
  | { status: 'ready'; portfolio: Portfolio; daysRemaining: number }
  | { status: 'error'; reason: string; message: string };

const ERROR_COPY: Record<string, { title: string; body: string }> = {
  draft: {
    title: 'Not published yet',
    body: 'This portfolio is still a draft. Ask the owner to publish it from the builder.',
  },
  expired: {
    title: 'Share link expired',
    body: `Free shared links stay live for ${STORAGE_POLICY_DAYS} days. Upgrade to keep this portfolio online longer.`,
  },
  not_found: {
    title: 'Portfolio not found',
    body: 'This link may be wrong, or the project was removed.',
  },
};

export default function PublicPortfolioPage() {
  const params = useParams();
  const slug = typeof params.slug === 'string' ? params.slug : '';
  const [state, setState] = useState<LoadState>({ status: 'loading' });

  useEffect(() => {
    if (!slug) {
      setState({ status: 'error', reason: 'not_found', message: 'Invalid link' });
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/public/${encodeURIComponent(slug)}`);
        const data = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (!res.ok) {
          const reason = String(data.error || 'not_found');
          const copy = ERROR_COPY[reason] || ERROR_COPY.not_found;
          setState({ status: 'error', reason, message: copy.body });
          return;
        }
        setState({
          status: 'ready',
          portfolio: data.portfolio,
          daysRemaining: Number(data.daysRemaining) || 0,
        });
      } catch {
        if (!cancelled) {
          setState({ status: 'error', reason: 'not_found', message: ERROR_COPY.not_found.body });
        }
      }
    })();

    return () => { cancelled = true; };
  }, [slug]);

  useEffect(() => {
    if (state.status === 'ready' && state.portfolio.name) {
      document.title = `${state.portfolio.name} · ${APP_NAME}`;
    }
  }, [state]);

  if (state.status === 'loading') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 text-gray-400" style={{ background: brand.bg }}>
        <Loader2 className="w-8 h-8 animate-spin text-[#f28c28]" />
        <p className="text-sm">Loading portfolio…</p>
      </div>
    );
  }

  if (state.status === 'error') {
    const copy = ERROR_COPY[state.reason] || ERROR_COPY.not_found;
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: brand.bg, color: brand.text }}>
        <div className="max-w-md w-full text-center rounded-2xl border p-8" style={{ borderColor: brand.border, background: brand.surface }}>
          <div className="w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center" style={{ background: brand.accentMuted }}>
            {state.reason === 'expired' ? <Clock className="w-6 h-6 text-[#f28c28]" /> : <Lock className="w-6 h-6 text-[#f28c28]" />}
          </div>
          <h1 className="text-xl font-bold mb-2">{copy.title}</h1>
          <p className="text-sm text-gray-400 mb-6">{state.message}</p>
          <Link href="/" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white" style={{ background: brand.accent }}>
            <Globe className="w-4 h-4" /> Build on {APP_NAME}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: brand.bg }}>
      {state.daysRemaining > 0 && state.daysRemaining <= STORAGE_POLICY_DAYS && (
        <div className="text-center text-[11px] py-1.5 px-3 text-amber-200/90 border-b border-amber-500/20 bg-amber-500/10">
          Shared preview · {state.daysRemaining} day{state.daysRemaining === 1 ? '' : 's'} remaining on free plan
        </div>
      )}
      <PortfolioPreview portfolio={state.portfolio} deviceView="desktop" />
    </div>
  );
}
