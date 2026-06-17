'use client';

import { useCallback, useEffect, useState } from 'react';

export interface PublicPromoModal {
  title: string;
  message: string;
  badge: string;
  ctaText: string;
  ctaAction: 'register' | 'dashboard';
  showSlotsRemaining?: boolean;
  slotsRemaining?: number;
  freeGrantLimit?: number;
  campaignKey: string;
}

export interface PublicPromoStatus {
  paidPlanDisabled: boolean;
  freeGrantEnabled: boolean;
  freeGrantLimit: number;
  slotsRemaining: number;
  grantsExhausted: boolean;
  hidePaidPricing: boolean;
  modal: PublicPromoModal | null;
}

const DEFAULT: PublicPromoStatus = {
  paidPlanDisabled: false,
  freeGrantEnabled: false,
  freeGrantLimit: 100,
  slotsRemaining: 0,
  grantsExhausted: false,
  hidePaidPricing: false,
  modal: null,
};

let cache: { data: PublicPromoStatus; at: number } | null = null;
const CACHE_MS = 30_000;

export function usePromoStatus() {
  const [status, setStatus] = useState<PublicPromoStatus>(cache?.data ?? DEFAULT);
  const [loading, setLoading] = useState(!cache);

  const refresh = useCallback(async () => {
    try {
      if (cache && Date.now() - cache.at < CACHE_MS) {
        setStatus(cache.data);
        setLoading(false);
        return cache.data;
      }
      const res = await fetch('/api/site/promo');
      const data = await res.json();
      const next: PublicPromoStatus = {
        paidPlanDisabled: Boolean(data.paidPlanDisabled),
        freeGrantEnabled: Boolean(data.freeGrantEnabled),
        freeGrantLimit: Number(data.freeGrantLimit ?? 100),
        slotsRemaining: Number(data.slotsRemaining ?? 0),
        grantsExhausted: Boolean(data.grantsExhausted),
        hidePaidPricing: Boolean(data.hidePaidPricing),
        modal: data.modal ?? null,
      };
      cache = { data: next, at: Date.now() };
      setStatus(next);
      return next;
    } catch {
      return status;
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => { refresh(); }, [refresh]);

  return { ...status, loading, refresh };
}

export function invalidatePromoClientCache() {
  cache = null;
}
