import { NextRequest, NextResponse } from 'next/server';
import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import { getPool } from '@/lib/db';
import { hashPassword, createToken, setAuthCookie, toAuthUser, TOKEN_TTL_REGISTER, COOKIE_MAX_AGE_REGISTER } from '@/lib/auth-server';
import { ensureAuthSchema } from '@/lib/auth-schema';
import { isValidEmail, isValidPhone, isValidPassword, normalizePhone } from '@/lib/validators';
import { tryGrantPromoFreeAccess } from '@/lib/promo-campaign';
import { trackSiteEvent } from '@/lib/site-analytics';
import { getPlanBySlug } from '@/lib/plans-server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const name = String(body.name || '').trim();
    const email = String(body.email || '').trim().toLowerCase();
    const phone = normalizePhone(String(body.phone || ''));
    const password = String(body.password || '');

    if (!name || name.length < 2) {
      return NextResponse.json({ error: 'Name must be at least 2 characters' }, { status: 400 });
    }
    if (!isValidEmail(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }
    if (!isValidPhone(phone)) {
      return NextResponse.json({ error: 'Enter a valid 10-digit Indian mobile number' }, { status: 400 });
    }
    if (!isValidPassword(password)) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    const pool = getPool();
    await ensureAuthSchema();
    const [existing] = await pool.execute<RowDataPacket[]>(
      'SELECT id, auth_provider, google_id FROM users WHERE email = ? LIMIT 1',
      [email],
    );
    if (existing.length) {
      const ex = existing[0] as { auth_provider?: string; google_id?: string | null };
      if (ex.auth_provider === 'google' || ex.google_id) {
        return NextResponse.json({ error: 'Email already registered with Google. Please sign in with Google.' }, { status: 409 });
      }
      return NextResponse.json({ error: 'Email already registered. Please login.' }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);

    let planId: number | null = null;
    try {
      const [planRows] = await pool.execute<RowDataPacket[]>(
        'SELECT id FROM subscription_plans WHERE is_default = 1 LIMIT 1',
      );
      planId = planRows[0] ? Number((planRows[0] as { id: number }).id) : null;
    } catch { /* plans table may not exist yet */ }

    const [result] = await pool.execute<ResultSetHeader>(
      planId
        ? 'INSERT INTO users (name, email, phone, password_hash, plan_id) VALUES (?, ?, ?, ?, ?)'
        : 'INSERT INTO users (name, email, phone, password_hash) VALUES (?, ?, ?, ?)',
      planId
        ? [name, email, phone, passwordHash, planId]
        : [name, email, phone, passwordHash],
    );

    const user = toAuthUser({
      id: result.insertId,
      name,
      email,
      phone,
      role: 'user',
      is_premium: 0,
      premium_purchased_at: null,
      premium_portfolio_id: null,
      plan_id: planId,
      plan_slug: planId ? 'free' : null,
      plan_name: planId ? 'Free' : null,
    });

    const promoGranted = await tryGrantPromoFreeAccess(result.insertId);
    if (promoGranted) {
      const proPlan = await getPlanBySlug('pro');
      if (proPlan) {
        user.planId = proPlan.id;
        user.planSlug = proPlan.slug;
        user.planName = proPlan.name;
        user.isPremium = true;
      }
    }

    trackSiteEvent({
      eventType: 'registration',
      userId: result.insertId,
      metadata: { promoGranted, source: body.promoSource || null },
    }).catch(() => {});

    const token = await createToken(user, TOKEN_TTL_REGISTER);
    await setAuthCookie(token, COOKIE_MAX_AGE_REGISTER);

    import('@/lib/system-email').then(({ sendWelcomeEmailIfNeeded }) => {
      sendWelcomeEmailIfNeeded(result.insertId).catch(() => {});
    }).catch(() => {});

    return NextResponse.json({ user });
  } catch (err) {
    console.error('Register error:', err);
    return NextResponse.json({ error: 'Registration failed. Check database connection.' }, { status: 500 });
  }
}
