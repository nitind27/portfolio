import type { RowDataPacket } from 'mysql2';
import { getPool } from './db';
import { ensureAuthSchema } from './auth-schema';
import type { AuthUser, UserProfile } from './types';

const PROFILE_FIELDS = `u.id, u.name, u.email, u.phone, u.role, u.is_premium, u.premium_purchased_at,
  u.premium_portfolio_id, u.plan_id, u.google_id, u.auth_provider, u.avatar_url, u.password_hash,
  u.created_at, sp.slug AS plan_slug, sp.name AS plan_name`;

type ProfileRow = RowDataPacket & {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  role: 'user' | 'admin';
  is_premium: number;
  premium_purchased_at: Date | null;
  premium_portfolio_id: string | null;
  plan_id: number | null;
  google_id: string | null;
  auth_provider: 'local' | 'google';
  avatar_url: string | null;
  password_hash: string | null;
  created_at: Date;
  plan_slug?: string | null;
  plan_name?: string | null;
};

export function rowToProfile(row: ProfileRow): UserProfile {
  const authUser: AuthUser = {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone || '',
    role: row.role || 'user',
    isPremium: Boolean(row.is_premium),
    premiumPurchasedAt: row.premium_purchased_at ? new Date(row.premium_purchased_at).toISOString() : null,
    premiumPortfolioId: row.premium_portfolio_id || null,
    planId: row.plan_id ?? null,
    planSlug: row.plan_slug ?? null,
    planName: row.plan_name ?? null,
    authProvider: row.auth_provider || 'local',
    hasPassword: Boolean(row.password_hash),
    avatarUrl: row.avatar_url || null,
  };

  return {
    ...authUser,
    memberSince: new Date(row.created_at).toISOString(),
    googleLinked: Boolean(row.google_id),
  };
}

export async function fetchUserProfile(userId: number): Promise<UserProfile | null> {
  await ensureAuthSchema();
  const pool = getPool();
  const [rows] = await pool.execute<ProfileRow[]>(
    `SELECT ${PROFILE_FIELDS}
     FROM users u
     LEFT JOIN subscription_plans sp ON sp.id = u.plan_id
     WHERE u.id = ? LIMIT 1`,
    [userId],
  );
  const row = rows[0];
  return row ? rowToProfile(row) : null;
}
