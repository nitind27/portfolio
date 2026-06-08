import type { RowDataPacket } from 'mysql2';
import { getPool } from './db';
import { fetchCashfreeOrder } from './cashfree';
import { refreshAuthCookie, fetchUserById, type AuthUser } from './auth-server';
import { activatePlanPurchase, getPlanBySlug } from './plans-server';

export async function markUserPremium(userId: number, orderId: string, planId: number) {
  await activatePlanPurchase(userId, planId, orderId);
}

export async function activatePremiumFromOrder(orderId: string): Promise<AuthUser | null> {
  const pool = getPool();
  const [paymentRows] = await pool.execute<RowDataPacket[]>(
    'SELECT user_id, status, plan_id FROM payments WHERE order_id = ? LIMIT 1',
    [orderId],
  );
  const payment = paymentRows[0] as { user_id: number; status: string; plan_id: number | null } | undefined;
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
  return fetchUserById(payment.user_id);
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
