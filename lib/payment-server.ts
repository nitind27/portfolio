import type { RowDataPacket } from 'mysql2';
import { getPool } from './db';
import { fetchCashfreeOrder } from './cashfree';
import { refreshAuthCookie, fetchUserById, type AuthUser } from './auth-server';
import { activatePlanPurchase, getPlanBySlug, getPlanById } from './plans-server';

export async function markUserPremium(userId: number, orderId: string, planId: number) {
  await activatePlanPurchase(userId, planId, orderId);
}

export async function activatePremiumFromOrder(orderId: string): Promise<AuthUser | null> {
  const pool = getPool();
  const [paymentRows] = await pool.execute<RowDataPacket[]>(
    'SELECT user_id, status, plan_id, amount FROM payments WHERE order_id = ? LIMIT 1',
    [orderId],
  );
  const payment = paymentRows[0] as { user_id: number; status: string; plan_id: number | null; amount: number } | undefined;
  if (!payment) return null;

  if (payment.status === 'paid') {
    return fetchUserById(payment.user_id);
  }

  const cfOrder = await fetchCashfreeOrder(orderId);
  if (cfOrder.order_status !== 'PAID') return null;

  let planId = payment.plan_id;
  if (!planId) {
    const proPlan = await getPlanBySlug('pro');
    planId = proPlan?.id ?? null;
  }
  if (!planId) return null;

  await activatePlanPurchase(payment.user_id, planId, orderId);
  const user = await fetchUserById(payment.user_id);

  // Send payment confirmation email (fire-and-forget)
  if (user) {
    const plan = await getPlanById(planId).catch(() => null);
    import('./system-email').then(({ sendPaymentSuccessEmail }) => {
      sendPaymentSuccessEmail({
        to: user.email,
        name: user.name,
        planName: plan?.name || 'Premium',
        amount: payment.amount,
        orderId,
      }).catch(() => {});
    }).catch(() => {});
  }

  return user;
}

export async function requireAuthUser() {
  const { getCurrentUser } = await import('./auth-server');
  const user = await getCurrentUser();
  if (!user) throw new Error('UNAUTHORIZED');
  return user;
}

export async function refreshSessionIfPremium(user: AuthUser) {
  await refreshAuthCookie(user);
}
