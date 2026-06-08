import type { RowDataPacket } from 'mysql2';
import { getPool } from './db';
import { getAdminStats, getTemplateRules } from './plans-server';

export interface AdminPaymentRow {
  id: number;
  orderId: string;
  userId: number;
  userName: string;
  userEmail: string;
  planId: number | null;
  planName: string | null;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
  paidAt: string | null;
}

export interface DailyCount {
  date: string;
  count: number;
  amount?: number;
}

export interface ExtendedAdminStats {
  totalUsers: number;
  adminCount: number;
  premiumUsers: number;
  revenue: number;
  paidOrders: number;
  pendingPayments: number;
  failedPayments: number;
  revenueThisMonth: number;
  newUsersThisMonth: number;
  conversionRate: number;
  planBreakdown: { name: string; slug: string; userCount: number }[];
  signupsByDay: DailyCount[];
  revenueByDay: DailyCount[];
  recentUsers: { id: number; name: string; email: string; planName: string | null; createdAt: string }[];
  recentPayments: AdminPaymentRow[];
  templateStats: { total: number; free: number; premium: number; byCategory: { category: string; free: number; premium: number }[] };
}

export async function getAdminPayments(limit = 100): Promise<AdminPaymentRow[]> {
  const pool = getPool();
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT p.id, p.order_id, p.user_id, p.plan_id, p.amount, p.currency, p.status,
            p.created_at, p.paid_at, u.name AS user_name, u.email AS user_email,
            sp.name AS plan_name
     FROM payments p
     JOIN users u ON u.id = p.user_id
     LEFT JOIN subscription_plans sp ON sp.id = p.plan_id
     ORDER BY p.created_at DESC
     LIMIT ?`,
    [limit],
  );
  return rows.map(r => ({
    id: Number(r.id),
    orderId: String(r.order_id),
    userId: Number(r.user_id),
    userName: String(r.user_name),
    userEmail: String(r.user_email),
    planId: r.plan_id != null ? Number(r.plan_id) : null,
    planName: r.plan_name ? String(r.plan_name) : null,
    amount: Number(r.amount),
    currency: String(r.currency),
    status: String(r.status),
    createdAt: new Date(r.created_at as Date).toISOString(),
    paidAt: r.paid_at ? new Date(r.paid_at as Date).toISOString() : null,
  }));
}

export async function getExtendedAdminStats(): Promise<ExtendedAdminStats> {
  const pool = getPool();
  const base = await getAdminStats();

  const [[monthStats]] = await pool.execute<RowDataPacket[]>(
    `SELECT COALESCE(SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END), 0) AS revenue_month,
            (SELECT COUNT(*) FROM users WHERE created_at >= DATE_FORMAT(NOW(), '%Y-%m-01')) AS new_users_month
     FROM payments WHERE created_at >= DATE_FORMAT(NOW(), '%Y-%m-01')`,
  );

  const [[statusCounts]] = await pool.execute<RowDataPacket[]>(
    `SELECT SUM(status = 'pending') AS pending, SUM(status = 'failed') AS failed FROM payments`,
  );

  const [signupRows] = await pool.execute<RowDataPacket[]>(
    `SELECT DATE(created_at) AS d, COUNT(*) AS c FROM users
     WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 13 DAY)
     GROUP BY DATE(created_at) ORDER BY d`,
  );

  const [revenueRows] = await pool.execute<RowDataPacket[]>(
    `SELECT DATE(paid_at) AS d, SUM(amount) AS a FROM payments
     WHERE status = 'paid' AND paid_at >= DATE_SUB(CURDATE(), INTERVAL 13 DAY)
     GROUP BY DATE(paid_at) ORDER BY d`,
  );

  const [recentUserRows] = await pool.execute<RowDataPacket[]>(
    `SELECT u.id, u.name, u.email, u.created_at, sp.name AS plan_name
     FROM users u LEFT JOIN subscription_plans sp ON sp.id = u.plan_id
     ORDER BY u.created_at DESC LIMIT 8`,
  );

  const recentPayments = await getAdminPayments(8);

  const rules = await getTemplateRules();
  const { TEMPLATES } = await import('./templates');
  const premiumIds = new Set(rules.filter(r => r.minPlanId != null).map(r => r.templateId));
  const byCat = new Map<string, { free: number; premium: number }>();
  for (const t of TEMPLATES) {
    const cat = t.category || 'other';
    const cur = byCat.get(cat) || { free: 0, premium: 0 };
    if (premiumIds.has(t.id)) cur.premium++;
    else cur.free++;
    byCat.set(cat, cur);
  }

  const totalUsers = base.totalUsers;
  const conversionRate = totalUsers > 0 ? Math.round((base.premiumUsers / totalUsers) * 1000) / 10 : 0;

  return {
    ...base,
    pendingPayments: Number(statusCounts?.pending ?? 0),
    failedPayments: Number(statusCounts?.failed ?? 0),
    revenueThisMonth: Number(monthStats?.revenue_month ?? 0),
    newUsersThisMonth: Number(monthStats?.new_users_month ?? 0),
    conversionRate,
    signupsByDay: signupRows.map(r => ({ date: String(r.d), count: Number(r.c) })),
    revenueByDay: revenueRows.map(r => ({ date: String(r.d), count: 0, amount: Number(r.a) })),
    recentUsers: recentUserRows.map(r => ({
      id: Number(r.id),
      name: String(r.name),
      email: String(r.email),
      planName: r.plan_name ? String(r.plan_name) : null,
      createdAt: new Date(r.created_at as Date).toISOString(),
    })),
    recentPayments,
    templateStats: {
      total: TEMPLATES.length,
      free: TEMPLATES.length - premiumIds.size,
      premium: premiumIds.size,
      byCategory: [...byCat.entries()].map(([category, v]) => ({ category, ...v })),
    },
  };
}
