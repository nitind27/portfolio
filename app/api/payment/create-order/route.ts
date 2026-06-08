import { NextRequest, NextResponse } from 'next/server';
import type { ResultSetHeader } from 'mysql2';
import { getPool } from '@/lib/db';
import { createCashfreeOrder, getCashfreeCheckoutMode, formatCashfreePhone } from '@/lib/cashfree';
import { getCurrentUser } from '@/lib/auth-server';
import { getPlanById, getPlanBySlug, getUserPlan } from '@/lib/plans-server';
import { canExport } from '@/lib/plans-types';

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Please login first' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const repurchase = Boolean(body?.repurchase);
    const planIdParam = body?.planId != null ? Number(body.planId) : null;

    let plan = planIdParam ? await getPlanById(planIdParam) : null;
    if (!plan) plan = await getPlanBySlug('pro');
    if (!plan || !plan.isActive) {
      return NextResponse.json({ error: 'Invalid plan selected' }, { status: 400 });
    }

    const userPlan = await getUserPlan(user);
    const hasPaid = canExport(userPlan.features) || userPlan.features.shareLink;

    if (hasPaid && !repurchase) {
      if (!user.premiumPortfolioId && userPlan.features.unlockedPortfolios > 0) {
        return NextResponse.json({
          error: 'Premium active. Export a portfolio to bind your download slot.',
          code: 'BIND_FIRST',
        }, { status: 400 });
      }
      if (user.premiumPortfolioId) {
        return NextResponse.json({
          error: 'Your plan slot is bound to another portfolio. Upgrade or repurchase to unlock more.',
          code: 'NEED_REPURCHASE',
        }, { status: 400 });
      }
    }

    const amount = plan.price;
    const orderId = `pb_${user.id}_${Date.now()}`;
    const pool = getPool();

    const cfOrder = await createCashfreeOrder({
      orderId,
      amount,
      customerId: `user_${user.id}`,
      customerName: user.name || 'Customer',
      customerEmail: user.email,
      customerPhone: formatCashfreePhone(user.phone),
    });

    await pool.execute<ResultSetHeader>(
      `INSERT INTO payments (user_id, order_id, cf_order_id, amount, plan_id, currency, status)
       VALUES (?, ?, ?, ?, ?, 'INR', 'pending')`,
      [user.id, orderId, cfOrder.cf_order_id, amount, plan.id],
    );

    return NextResponse.json({
      orderId,
      paymentSessionId: cfOrder.payment_session_id,
      amount,
      currency: 'INR',
      planId: plan.id,
      planName: plan.name,
      repurchase,
      checkoutMode: getCashfreeCheckoutMode(),
    });
  } catch (err) {
    console.error('Create order error:', err);
    const message = err instanceof Error ? err.message : 'Payment order failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
