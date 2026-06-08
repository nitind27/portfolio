import type { RowDataPacket } from 'mysql2';
import { getPool } from './db';
import type { Portfolio } from './types';
import { parseConfigJson } from './project-serialize';
import { parsePlanFeatures } from './plans-types';
import { isProjectExpiredWithPolicy } from './project-expiry';
import { ensurePlansReady } from './plans-seed';
import { STORAGE_POLICY_DAYS } from './brand';

export type PublicPortfolioResult =
  | { ok: true; portfolio: Portfolio; daysRemaining: number; ownerPlan: string }
  | { ok: false; reason: 'not_found' | 'draft' | 'expired' };

export async function getPublicPortfolioBySlug(slug: string): Promise<PublicPortfolioResult> {
  await ensurePlansReady();
  const pool = getPool();
  const clean = slug.trim().toLowerCase();
  if (!clean) return { ok: false, reason: 'not_found' };

  let rows: RowDataPacket[];
  try {
    [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT up.config, up.created_at, up.published, sp.slug AS plan_slug, sp.features AS plan_features
       FROM user_projects up
       JOIN users u ON u.id = up.user_id
       LEFT JOIN subscription_plans sp ON sp.id = u.plan_id
       WHERE LOWER(up.slug) = ? LIMIT 1`,
      [clean],
    );
  } catch {
    return { ok: false, reason: 'not_found' };
  }

  const row = rows[0];
  if (!row) return { ok: false, reason: 'not_found' };
  if (!row.published) return { ok: false, reason: 'draft' };

  const features = typeof row.plan_features === 'string'
    ? parsePlanFeatures(JSON.parse(row.plan_features))
    : parsePlanFeatures(row.plan_features);
  const storageDays = features.storageDays || STORAGE_POLICY_DAYS;
  const createdAt = new Date(row.created_at as Date).toISOString();

  if (isProjectExpiredWithPolicy(createdAt, storageDays)) {
    return { ok: false, reason: 'expired' };
  }

  try {
    const portfolio = parseConfigJson(row.config);
    portfolio.published = true;
    portfolio.createdAt = portfolio.createdAt || createdAt;
    const daysRemaining = Math.max(
      0,
      Math.ceil(
        (new Date(createdAt).getTime() + storageDays * 86400000 - Date.now()) / 86400000,
      ),
    );
    return {
      ok: true,
      portfolio,
      daysRemaining,
      ownerPlan: String(row.plan_slug || 'free'),
    };
  } catch {
    return { ok: false, reason: 'not_found' };
  }
}
