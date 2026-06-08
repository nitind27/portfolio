import type { RowDataPacket } from 'mysql2';
import { getPool } from './db';

export interface UserPaymentRow {
  id: number;
  orderId: string;
  planId: number | null;
  planName: string | null;
  planSlug: string | null;
  amount: number;
  currency: string;
  status: 'pending' | 'paid' | 'failed' | 'expired';
  paymentMethod: string | null;
  createdAt: string;
  paidAt: string | null;
}

export interface UserBillingSummary {
  planName: string;
  planSlug: string;
  isPremium: boolean;
  premiumPurchasedAt: string | null;
  totalPaid: number;
  paidOrders: number;
  pendingOrders: number;
  payments: UserPaymentRow[];
}

export async function getUserBilling(userId: number): Promise<UserBillingSummary> {
  const pool = getPool();

  const [userRows] = await pool.execute<RowDataPacket[]>(
    `SELECT u.is_premium, u.premium_purchased_at, sp.name AS plan_name, sp.slug AS plan_slug
     FROM users u
     LEFT JOIN subscription_plans sp ON sp.id = u.plan_id
     WHERE u.id = ? LIMIT 1`,
    [userId],
  );
  const user = userRows[0];

  const [paymentRows] = await pool.execute<RowDataPacket[]>(
    `SELECT p.id, p.order_id, p.plan_id, p.amount, p.currency, p.status, p.payment_method,
            p.created_at, p.paid_at, sp.name AS plan_name, sp.slug AS plan_slug
     FROM payments p
     LEFT JOIN subscription_plans sp ON sp.id = p.plan_id
     WHERE p.user_id = ?
     ORDER BY p.created_at DESC
     LIMIT 100`,
    [userId],
  );

  const payments: UserPaymentRow[] = paymentRows.map(r => ({
    id: Number(r.id),
    orderId: String(r.order_id),
    planId: r.plan_id != null ? Number(r.plan_id) : null,
    planName: r.plan_name ? String(r.plan_name) : null,
    planSlug: r.plan_slug ? String(r.plan_slug) : null,
    amount: Number(r.amount),
    currency: String(r.currency),
    status: String(r.status) as UserPaymentRow['status'],
    paymentMethod: r.payment_method ? String(r.payment_method) : null,
    createdAt: new Date(r.created_at as Date).toISOString(),
    paidAt: r.paid_at ? new Date(r.paid_at as Date).toISOString() : null,
  }));

  const totalPaid = payments
    .filter(p => p.status === 'paid')
    .reduce((sum, p) => sum + p.amount, 0);

  return {
    planName: user?.plan_name ? String(user.plan_name) : 'Free',
    planSlug: user?.plan_slug ? String(user.plan_slug) : 'free',
    isPremium: Boolean(user?.is_premium),
    premiumPurchasedAt: user?.premium_purchased_at
      ? new Date(user.premium_purchased_at as Date).toISOString()
      : null,
    totalPaid,
    paidOrders: payments.filter(p => p.status === 'paid').length,
    pendingOrders: payments.filter(p => p.status === 'pending').length,
    payments,
  };
}
