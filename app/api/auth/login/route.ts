import { NextRequest, NextResponse } from 'next/server';
import type { RowDataPacket } from 'mysql2';
import { getPool, type DbUser } from '@/lib/db';
import { verifyPassword, createToken, setAuthCookie, toAuthUser, TOKEN_TTL_REMEMBER, COOKIE_MAX_AGE_DEFAULT, COOKIE_MAX_AGE_REMEMBER } from '@/lib/auth-server';

const USER_SQL = `SELECT u.id, u.name, u.email, u.phone, u.password_hash, u.role,
  u.is_premium, u.premium_purchased_at, u.premium_portfolio_id, u.plan_id,
  sp.slug AS plan_slug, sp.name AS plan_name
  FROM users u
  LEFT JOIN subscription_plans sp ON sp.id = u.plan_id
  WHERE u.email = ? LIMIT 1`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = String(body.email || '').trim().toLowerCase();
    const password = String(body.password || '');

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const pool = getPool();
    const [rows] = await pool.execute<RowDataPacket[]>(USER_SQL, [email]);
    const row = rows[0] as (DbUser & { plan_slug?: string; plan_name?: string }) | undefined;
    if (!row) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    if (!row.password_hash) {
      return NextResponse.json(
        { error: 'This account uses Google sign-in. Please continue with Google.' },
        { status: 401 },
      );
    }

    const valid = await verifyPassword(password, row.password_hash);
    if (!valid) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const adminOnly = Boolean(body.adminOnly);
    if (adminOnly && row.role !== 'admin') {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const rememberMe = Boolean(body.rememberMe);
    const tokenTtl = rememberMe ? TOKEN_TTL_REMEMBER : '1d';
    const cookieMaxAge = rememberMe ? COOKIE_MAX_AGE_REMEMBER : COOKIE_MAX_AGE_DEFAULT;

    const user = toAuthUser(row);
    const token = await createToken(user, tokenTtl);
    await setAuthCookie(token, cookieMaxAge);

    return NextResponse.json({ user });
  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json({ error: 'Login failed. Check database connection.' }, { status: 500 });
  }
}
