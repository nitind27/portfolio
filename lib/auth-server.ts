import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import type { NextRequest } from 'next/server';
import type { RowDataPacket } from 'mysql2';
import { getPool, type DbUser } from './db';

const COOKIE_NAME = 'pb_auth';
const TOKEN_TTL = '7d';

import type { AuthUser } from './types';

export type { AuthUser };

const USER_FIELDS = `u.id, u.name, u.email, u.phone, u.role, u.is_premium, u.premium_purchased_at,
  u.premium_portfolio_id, u.plan_id, sp.slug AS plan_slug, sp.name AS plan_name`;

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
  plan_slug?: string | null;
  plan_name?: string | null;
}): AuthUser {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    role: row.role || 'user',
    isPremium: Boolean(row.is_premium),
    premiumPurchasedAt: row.premium_purchased_at ? new Date(row.premium_purchased_at).toISOString() : null,
    premiumPortfolioId: row.premium_portfolio_id || null,
    planId: row.plan_id ?? null,
    planSlug: row.plan_slug ?? null,
    planName: row.plan_name ?? null,
  };
}

export async function createToken(user: AuthUser) {
  return new SignJWT({
    sub: String(user.id),
    email: user.email,
    isPremium: user.isPremium,
    role: user.role,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(TOKEN_TTL)
    .sign(getJwtSecret());
}

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

export async function setAuthCookie(token: string) {
  const jar = await cookies();
  jar.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
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
  const token = await createToken(user);
  await setAuthCookie(token);
}

export async function fetchUserById(userId: number): Promise<AuthUser | null> {
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
