import type { PortfolioAccessStatus, AuthUser } from './types';
import { canExport, type PlanFeatures } from './plans-types';
import { getUserFeatures } from './plans-server';

export async function getPortfolioAccess(user: AuthUser | null, portfolioId: string): Promise<{
  status: PortfolioAccessStatus;
  boundPortfolioId: string | null;
  features?: PlanFeatures;
}> {
  const features = await getUserFeatures(user);
  const hasPaidFeatures = canExport(features) || features.shareLink || features.publishOnline || features.hostingerDeploy;

  if (!user || !hasPaidFeatures) {
    return { status: 'needs_payment', boundPortfolioId: null, features };
  }

  const bound = user.premiumPortfolioId;
  const slots = features.unlockedPortfolios || (user.isPremium ? 1 : 0);

  if (slots <= 0) {
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
