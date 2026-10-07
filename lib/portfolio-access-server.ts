import type { PortfolioAccessAction } from './types';
import type { PortfolioAccessStatus, AuthUser } from './types';
import { canExport, type PlanFeatures } from './plans-types';
import { getUserFeatures } from './plans-server';
import { isProjectExpiredWithPolicy, getDaysRemaining } from './project-expiry';
import { parsePortfolioSlotIds } from './portfolio-slots';

function paidSlotFeatures(features: PlanFeatures): boolean {
  return canExport(features) || features.hostingerDeploy || features.vercelDeploy;
}

function withinShareWindow(createdAt: string | undefined, storageDays: number): boolean {
  if (!createdAt) return true;
  if (storageDays >= 365) return true;
  return !isProjectExpiredWithPolicy(createdAt, storageDays);
}

export async function getPortfolioAccess(
  user: AuthUser | null,
  portfolioId: string,
  action: PortfolioAccessAction = 'export',
  options?: { createdAt?: string },
): Promise<{
  status: PortfolioAccessStatus;
  boundPortfolioId: string | null;
  features?: PlanFeatures;
  shareDaysRemaining?: number;
}> {
  const features = await getUserFeatures(user);
  const storageDays = features.storageDays || 7;
  const createdAt = options?.createdAt;

  if (!user) {
    return { status: 'needs_payment', boundPortfolioId: null, features };
  }

  if (action === 'share' || action === 'publish') {
    const allowedByPlan = action === 'share' ? features.shareLink : features.publishOnline;
    if (!allowedByPlan) {
      return { status: 'needs_payment', boundPortfolioId: null, features };
    }
    if (!withinShareWindow(createdAt, storageDays)) {
      return { status: 'needs_payment', boundPortfolioId: user.premiumPortfolioId, features };
    }

    if (!paidSlotFeatures(features)) {
      return {
        status: 'allowed',
        boundPortfolioId: null,
        features,
        shareDaysRemaining: storageDays >= 365 ? undefined : getDaysRemaining(createdAt || new Date().toISOString(), storageDays),
      };
    }
  }

  const hasPaidFeatures = paidSlotFeatures(features) || (action === 'share' && features.shareLink) || features.publishOnline;

  if (action === 'export' || action === 'deploy') {
    if (!hasPaidFeatures || !paidSlotFeatures(features)) {
      return { status: 'needs_payment', boundPortfolioId: null, features };
    }
  } else if (!hasPaidFeatures) {
    return { status: 'needs_payment', boundPortfolioId: null, features };
  }

  const boundIds = parsePortfolioSlotIds(user.premiumPortfolioIds, user.premiumPortfolioId);
  const slots = features.unlockedPortfolios || (user.isPremium ? 1 : 0);

  if (slots <= 0 && paidSlotFeatures(features)) {
    return { status: 'needs_payment', boundPortfolioId: null, features };
  }

  if (boundIds.includes(portfolioId)) {
    return { status: 'allowed', boundPortfolioId: portfolioId, features };
  }
  if (boundIds.length < slots) {
    return { status: 'bind_on_action', boundPortfolioId: boundIds[0] || null, features };
  }
  return { status: 'wrong_portfolio', boundPortfolioId: boundIds[0] || null, features };
}

export async function bindPortfolioToUser(userId: number, portfolioId: string) {
  const { getPool } = await import('./db');
  const { fetchUserById } = await import('./auth-server');
  const pool = getPool();
  const user = await fetchUserById(userId);
  if (!user) throw new Error('NOT_FOUND');

  const features = await getUserFeatures(user);
  const hasPaidFeatures = canExport(features) || features.shareLink || features.publishOnline;
  if (!hasPaidFeatures && !user.isPremium) throw new Error('NOT_PREMIUM');
  if (!paidSlotFeatures(features)) throw new Error('FREE_SHARE_ONLY');

  const slots = Math.max(1, features.unlockedPortfolios || 1);
  const [rows] = await pool.execute(
    'SELECT premium_portfolio_id, premium_slot_ids FROM users WHERE id = ? LIMIT 1',
    [userId],
  );
  const row = (rows as { premium_portfolio_id: string | null; premium_slot_ids: string | null }[])[0];
  const bound = parsePortfolioSlotIds(row?.premium_slot_ids, row?.premium_portfolio_id);
  if (bound.includes(portfolioId)) return;
  if (bound.length >= slots) throw new Error('SLOT_USED');

  const next = [...bound, portfolioId];
  await pool.execute(
    'UPDATE users SET premium_portfolio_id = ?, premium_slot_ids = ? WHERE id = ?',
    [next[0], JSON.stringify(next), userId],
  );
}

export async function userCanUseFeature(user: AuthUser | null, feature: keyof PlanFeatures): Promise<boolean> {
  const features = await getUserFeatures(user);
  const v = features[feature];
  if (typeof v === 'boolean') return v;
  if (typeof v === 'number') return v > 0;
  return false;
}
