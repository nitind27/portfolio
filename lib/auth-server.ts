import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import type { NextRequest } from 'next/server';
import type { RowDataPacket } from 'mysql2';
import { getPool, type DbUser } from './db';
import { ensureAuthSchema } from './auth-schema';

const COOKIE_NAME = 'pb_auth';
const TOKEN_TTL = '1d';
const TOKEN_TTL_REMEMBER = '30d';
const TOKEN_TTL_REGISTER = '7d';
const COOKIE_MAX_AGE_DEFAULT = 60 * 60 * 24; // 1 day
const COOKIE_MAX_AGE_REMEMBER = 60 * 60 * 24 * 30; // 30 days
const COOKIE_MAX_AGE_REGISTER = 60 * 60 * 24 * 7; // 7 days

import type { AuthUser } from './types';

export type { AuthUser };

const USER_FIELDS = `u.id, u.name, u.email, u.phone, u.role, u.is_premium, u.premium_purchased_at,
  u.premium_portfolio_id, u.plan_id, u.auth_provider, u.avatar_url, u.password_hash,
  sp.slug AS plan_slug, sp.name AS plan_name`;

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not set in environment variables');
  return new TextEncoder().encode(secret);
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function toAuthUser(row: Pick<DbUser, 'id' | 'name' | 'email' | 'phone' | 'role' | 'is_premium' | 'premium_purchased_at' | 'premium_portfolio_id' | 'plan_id'> & {
  auth_provider?: DbUser['auth_provider'];
  avatar_url?: DbUser['avatar_url'];
  password_hash?: DbUser['password_hash'];
  plan_slug?: string | null;
  plan_name?: string | null;
}): AuthUser {
  return {
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
}

export async function createToken(user: AuthUser, expiresIn: string = TOKEN_TTL) {
  return new SignJWT({
    sub: String(user.id),
    email: user.email,
    isPremium: user.isPremium,
    role: user.role,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(getJwtSecret());
}

export { TOKEN_TTL_REMEMBER, TOKEN_TTL_REGISTER, COOKIE_MAX_AGE_DEFAULT, COOKIE_MAX_AGE_REMEMBER, COOKIE_MAX_AGE_REGISTER };

export async function verifyToken(token: string) {
  const { payload } = await jwtVerify(token, getJwtSecret());
  const userId = Number(payload.sub);
  if (!userId) return null;
  return {
    userId,
    isPremium: Boolean(payload.isPremium),
    role: String(payload.role || 'user') as 'user' | 'admin',
  };
}

export async function setAuthCookie(token: string, maxAge = COOKIE_MAX_AGE_DEFAULT) {
  const jar = await cookies();
  jar.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge,
  });
}

export async function clearAuthCookie() {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
}

export async function getTokenFromRequest(req?: NextRequest) {
  if (req) {
    const header = req.cookies.get(COOKIE_NAME)?.value;
    if (header) return header;
  }
  const jar = await cookies();
  return jar.get(COOKIE_NAME)?.value ?? null;
}

export async function getCurrentUser(req?: NextRequest): Promise<AuthUser | null> {
  const token = await getTokenFromRequest(req);
  if (!token) return null;
  const decoded = await verifyToken(token);
  if (!decoded) return null;

  await ensureAuthSchema();
  const pool = getPool();
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT ${USER_FIELDS}
     FROM users u
     LEFT JOIN subscription_plans sp ON sp.id = u.plan_id
     WHERE u.id = ? LIMIT 1`,
    [decoded.userId],
  );
  const row = rows[0] as (DbUser & { plan_slug?: string; plan_name?: string }) | undefined;
  if (!row) return null;
  return toAuthUser(row);
}

export async function refreshAuthCookie(user: AuthUser) {
  const token = await createToken(user, TOKEN_TTL_REGISTER);
  await setAuthCookie(token, COOKIE_MAX_AGE_REGISTER);
}

export async function fetchUserById(userId: number): Promise<AuthUser | null> {
  await ensureAuthSchema();
  const pool = getPool();
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT ${USER_FIELDS}
     FROM users u
     LEFT JOIN subscription_plans sp ON sp.id = u.plan_id
     WHERE u.id = ? LIMIT 1`,
    [userId],
  );
  const row = rows[0] as (DbUser & { plan_slug?: string; plan_name?: string }) | undefined;
  return row ? toAuthUser(row) : null;
}
