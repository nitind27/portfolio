import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import { getPool } from '@/lib/db';
import { ensureAuthSchema } from '@/lib/auth-schema';
import {
  createToken,
  setAuthCookie,
  toAuthUser,
  TOKEN_TTL_REGISTER,
  COOKIE_MAX_AGE_REGISTER,
} from '@/lib/auth-server';
import {
  exchangeGoogleCode,
  fetchGoogleProfile,
  getAppBaseUrl,
  isGoogleAuthConfigured,
} from '@/lib/google-auth';

const STATE_COOKIE = 'google_oauth_state';

function redirectWithError(message: string) {
  const url = new URL('/', getAppBaseUrl());
  url.searchParams.set('login', '1');
  url.searchParams.set('error', message);
  return NextResponse.redirect(url.toString());
}

export async function GET(req: NextRequest) {
  if (!isGoogleAuthConfigured()) {
    return redirectWithError('Google sign-in is not configured.');
  }

  const { searchParams } = new URL(req.url);
  const error = searchParams.get('error');
  if (error) {
    return redirectWithError('Google sign-in was cancelled.');
  }

  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const jar = await cookies();
  const savedState = jar.get(STATE_COOKIE)?.value;
  jar.delete(STATE_COOKIE);

  if (!code || !state || !savedState || state !== savedState) {
    return redirectWithError('Invalid Google sign-in session. Please try again.');
  }

  try {
    await ensureAuthSchema();
    const { access_token } = await exchangeGoogleCode(code);
    const profile = await fetchGoogleProfile(access_token);
    const pool = getPool();

    const [byGoogle] = await pool.execute<RowDataPacket[]>(
      `SELECT u.id, u.name, u.email, u.phone, u.password_hash, u.role, u.is_premium,
        u.premium_purchased_at, u.premium_portfolio_id, u.plan_id, u.auth_provider, u.avatar_url,
        sp.slug AS plan_slug, sp.name AS plan_name
       FROM users u
       LEFT JOIN subscription_plans sp ON sp.id = u.plan_id
       WHERE u.google_id = ? LIMIT 1`,
      [profile.id],
    );

    let row = byGoogle[0] as RowDataPacket | undefined;

    if (!row) {
      const [byEmail] = await pool.execute<RowDataPacket[]>(
        `SELECT u.id, u.name, u.email, u.phone, u.password_hash, u.role, u.is_premium,
          u.premium_purchased_at, u.premium_portfolio_id, u.plan_id, u.auth_provider, u.avatar_url,
          u.google_id, sp.slug AS plan_slug, sp.name AS plan_name
         FROM users u
         LEFT JOIN subscription_plans sp ON sp.id = u.plan_id
         WHERE u.email = ? LIMIT 1`,
        [profile.email],
      );
      row = byEmail[0] as RowDataPacket | undefined;

      if (row) {
        if (row.google_id && row.google_id !== profile.id) {
          return redirectWithError('This email is linked to another Google account.');
        }
        await pool.execute(
          `UPDATE users SET google_id = ?, auth_provider = 'google', avatar_url = ?, name = ?
           WHERE id = ?`,
          [profile.id, profile.picture || row.avatar_url || null, profile.name || row.name, row.id],
        );
        row.auth_provider = 'google';
        row.avatar_url = profile.picture || row.avatar_url;
        row.name = profile.name || row.name;
      } else {
        let planId: number | null = null;
        try {
          const [planRows] = await pool.execute<RowDataPacket[]>(
            'SELECT id FROM subscription_plans WHERE is_default = 1 LIMIT 1',
          );
          planId = planRows[0] ? Number((planRows[0] as { id: number }).id) : null;
        } catch { /* ignore */ }

        const [result] = await pool.execute<ResultSetHeader>(
          planId
            ? `INSERT INTO users (name, email, phone, password_hash, google_id, auth_provider, avatar_url, plan_id)
               VALUES (?, ?, NULL, NULL, ?, 'google', ?, ?)`
            : `INSERT INTO users (name, email, phone, password_hash, google_id, auth_provider, avatar_url)
               VALUES (?, ?, NULL, NULL, ?, 'google', ?)`,
          planId
            ? [profile.name, profile.email, profile.id, profile.picture || null, planId]
            : [profile.name, profile.email, profile.id, profile.picture || null],
        );

        row = {
          id: result.insertId,
          name: profile.name,
          email: profile.email,
          phone: null,
          password_hash: null,
          role: 'user',
          is_premium: 0,
          premium_purchased_at: null,
          premium_portfolio_id: null,
          plan_id: planId,
          auth_provider: 'google',
          avatar_url: profile.picture || null,
          plan_slug: planId ? 'free' : null,
          plan_name: planId ? 'Free' : null,
        } as RowDataPacket;
      }
    } else {
      await pool.execute(
        `UPDATE users SET avatar_url = ?, name = ? WHERE id = ?`,
        [profile.picture || row.avatar_url || null, profile.name || row.name, row.id],
      );
      row.avatar_url = profile.picture || row.avatar_url;
      row.name = profile.name || row.name;
    }

    const user = toAuthUser(row as Parameters<typeof toAuthUser>[0]);
    const token = await createToken(user, TOKEN_TTL_REGISTER);
    await setAuthCookie(token, COOKIE_MAX_AGE_REGISTER);

    return NextResponse.redirect(getAppBaseUrl());
  } catch (err) {
    console.error('Google callback error:', err);
    return redirectWithError('Google sign-in failed. Please try again.');
  }
}
