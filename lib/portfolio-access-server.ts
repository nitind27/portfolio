import type { PortfolioAccessAction } from './types';
import type { PortfolioAccessStatus, AuthUser } from './types';
import { canExport, type PlanFeatures } from './plans-types';
import { getUserFeatures } from './plans-server';
import { isProjectExpiredWithPolicy, getDaysRemaining } from './project-expiry';

function paidSlotFeatures(features: PlanFeatures): boolean {
  return canExport(features) || features.hostingerDeploy;
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

  const bound = user.premiumPortfolioId;
  const slots = features.unlockedPortfolios || (user.isPremium ? 1 : 0);

  if (slots <= 0 && paidSlotFeatures(features)) {
    return { status: 'needs_payment', boundPortfolioId: null, features };
  }

  if (!bound) {
    return { status: 'bind_on_action', boundPortfolioId: null, features };
  }
  if (bound === portfolioId) {
    return { status: 'allowed', boundPortfolioId: bound, features };
  }
  return { status: 'wrong_portfolio', boundPortfolioId: bound, features };
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

  const [rows] = await pool.execute(
    'SELECT premium_portfolio_id FROM users WHERE id = ? LIMIT 1',
    [userId],
  );
  const row = (rows as { premium_portfolio_id: string | null }[])[0];
  if (row?.premium_portfolio_id && row.premium_portfolio_id !== portfolioId) {
    throw new Error('SLOT_USED');
  }
  if (!row?.premium_portfolio_id) {
    await pool.execute(
      'UPDATE users SET premium_portfolio_id = ? WHERE id = ?',
      [portfolioId, userId],
    );
  }
}

export async function userCanUseFeature(user: AuthUser | null, feature: keyof PlanFeatures): Promise<boolean> {
  const features = await getUserFeatures(user);
  const v = features[feature];
  if (typeof v === 'boolean') return v;
  if (typeof v === 'number') return v > 0;
  return false;
}
