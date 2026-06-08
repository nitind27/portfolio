import type { PortfolioAccessStatus } from './types';

export type PremiumModalReason = 'export' | 'share' | 'publish' | 'deploy' | 'general' | 'unlock_another';

export async function fetchPortfolioAccess(portfolioId: string): Promise<{
  status: PortfolioAccessStatus;
  boundPortfolioId: string | null;
}> {
  const res = await fetch(`/api/portfolio/access?portfolioId=${encodeURIComponent(portfolioId)}`);
  if (!res.ok) throw new Error('Access check failed');
  return res.json();
}

export async function bindPortfolioSlot(portfolioId: string): Promise<{ ok: boolean; code?: string; error?: string }> {
  const res = await fetch('/api/portfolio/bind', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ portfolioId }),
  });
  const data = await res.json();
  if (!res.ok) return { ok: false, code: data.code, error: data.error };
  return { ok: true };
}

export function accessToModalReason(
  status: PortfolioAccessStatus,
  action: 'export' | 'share' | 'publish' | 'deploy',
): PremiumModalReason | null {
  if (status === 'needs_payment') return action;
  if (status === 'wrong_portfolio') return 'unlock_another';
  return null;
}
