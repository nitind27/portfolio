import type { RowDataPacket, ResultSetHeader } from 'mysql2';
import { getPool } from './db';
import type { AuthUser } from './types';
import {
  type PlanFeatures,
  type SubscriptionPlan,
  type TemplateRule,
  parsePlanFeatures,
  canExport,
  DEFAULT_FREE_FEATURES,
} from './plans-types';
import { TEMPLATES } from './templates';
import { ensurePlansReady } from './plans-seed';

interface DbPlanRow extends RowDataPacket {
  id: number;
  slug: string;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  tier: number;
  is_active: number;
  is_default: number;
  features: string | PlanFeatures;
}

function rowToPlan(row: DbPlanRow): SubscriptionPlan {
  const features = typeof row.features === 'string'
    ? parsePlanFeatures(JSON.parse(row.features))
    : parsePlanFeatures(row.features);
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    price: Number(row.price),
    currency: row.currency,
    tier: row.tier,
    isActive: Boolean(row.is_active),
    isDefault: Boolean(row.is_default),
    features,
  };
}

export async function getDefaultPlan(): Promise<SubscriptionPlan> {
  await ensurePlansReady();
  const pool = getPool();
  const [rows] = await pool.execute<DbPlanRow[]>(
    'SELECT * FROM subscription_plans WHERE is_default = 1 AND is_active = 1 LIMIT 1',
  );
  if (rows[0]) return rowToPlan(rows[0]);
  return {
    id: 0,
    slug: 'free',
    name: 'Free',
    description: null,
    price: 0,
    currency: 'INR',
    tier: 0,
    isActive: true,
    isDefault: true,
    features: DEFAULT_FREE_FEATURES,
  };
}

export async function getPlanById(id: number): Promise<SubscriptionPlan | null> {
  await ensurePlansReady();
  const pool = getPool();
  const [rows] = await pool.execute<DbPlanRow[]>(
    'SELECT * FROM subscription_plans WHERE id = ? LIMIT 1',
    [id],
  );
  return rows[0] ? rowToPlan(rows[0]) : null;
}

export async function getPlanBySlug(slug: string): Promise<SubscriptionPlan | null> {
  await ensurePlansReady();
  const pool = getPool();
  const [rows] = await pool.execute<DbPlanRow[]>(
    'SELECT * FROM subscription_plans WHERE slug = ? LIMIT 1',
    [slug],
  );
  return rows[0] ? rowToPlan(rows[0]) : null;
}

export async function getAllPlans(activeOnly = false): Promise<SubscriptionPlan[]> {
  await ensurePlansReady();
  const pool = getPool();
  const [rows] = await pool.execute<DbPlanRow[]>(
    activeOnly
      ? 'SELECT * FROM subscription_plans WHERE is_active = 1 ORDER BY tier ASC, price ASC'
      : 'SELECT * FROM subscription_plans ORDER BY tier ASC, price ASC',
  );
  return rows.map(rowToPlan);
}

export async function getUserPlan(user: AuthUser | null): Promise<SubscriptionPlan> {
  if (!user?.planId) return getDefaultPlan();
  const plan = await getPlanById(user.planId);
  return plan ?? getDefaultPlan();
}

export async function getUserFeatures(user: AuthUser | null): Promise<PlanFeatures> {
  const plan = await getUserPlan(user);
  return plan.features;
}

export async function userHasPaidAccess(user: AuthUser | null): Promise<boolean> {
  if (!user) return false;
  const features = await getUserFeatures(user);
  return canExport(features) || features.shareLink || features.publishOnline || features.hostingerDeploy;
}

export async function ensureTemplateRulesSeeded() {
  await ensurePlansReady();
  const pool = getPool();
  for (const t of TEMPLATES) {
    await pool.execute(
      `INSERT IGNORE INTO template_rules (template_id, min_plan_id) VALUES (?, NULL)`,
      [t.id],
    );
  }
}

export async function getTemplateRules(): Promise<TemplateRule[]> {
  await ensureTemplateRulesSeeded();
  const pool = getPool();
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT tr.template_id, tr.min_plan_id, sp.name AS min_plan_name, sp.slug AS min_plan_slug
     FROM template_rules tr
     LEFT JOIN subscription_plans sp ON sp.id = tr.min_plan_id
     ORDER BY tr.template_id`,
  );
  return rows.map(r => ({
    templateId: String(r.template_id),
    minPlanId: r.min_plan_id != null ? Number(r.min_plan_id) : null,
    minPlanName: r.min_plan_name ? String(r.min_plan_name) : null,
    minPlanSlug: r.min_plan_slug ? String(r.min_plan_slug) : null,
  }));
}

export async function canUseTemplate(user: AuthUser | null, templateId: string): Promise<boolean> {
  await ensureTemplateRulesSeeded();
  const pool = getPool();
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT tr.min_plan_id, sp.tier AS required_tier
     FROM template_rules tr
     LEFT JOIN subscription_plans sp ON sp.id = tr.min_plan_id
     WHERE tr.template_id = ? LIMIT 1`,
    [templateId],
  );
  const rule = rows[0];
  if (!rule || rule.min_plan_id == null) return true;
  const userPlan = await getUserPlan(user);
  return userPlan.tier >= Number(rule.required_tier ?? 0);
}

export async function getLockedTemplateIds(user: AuthUser | null): Promise<Set<string>> {
  const rules = await getTemplateRules();
  const locked = new Set<string>();
  for (const r of rules) {
    if (!(await canUseTemplate(user, r.templateId))) locked.add(r.templateId);
  }
  return locked;
}

export async function upsertPlan(data: {
  id?: number;
  slug: string;
  name: string;
  description?: string;
  price: number;
  currency?: string;
  tier: number;
  isActive?: boolean;
  isDefault?: boolean;
  features: PlanFeatures;
}): Promise<number> {
  const pool = getPool();
  const featuresJson = JSON.stringify(data.features);

  if (data.isDefault) {
    await pool.execute('UPDATE subscription_plans SET is_default = 0');
  }

  if (data.id) {
    await pool.execute(
      `UPDATE subscription_plans SET slug=?, name=?, description=?, price=?, currency=?, tier=?, is_active=?, is_default=?, features=?
       WHERE id=?`,
      [
        data.slug, data.name, data.description ?? null, data.price,
        data.currency ?? 'INR', data.tier, data.isActive !== false ? 1 : 0,
        data.isDefault ? 1 : 0, featuresJson, data.id,
      ],
    );
    return data.id;
  }

  const [result] = await pool.execute<ResultSetHeader>(
    `INSERT INTO subscription_plans (slug, name, description, price, currency, tier, is_active, is_default, features)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.slug, data.name, data.description ?? null, data.price,
      data.currency ?? 'INR', data.tier, data.isActive !== false ? 1 : 0,
      data.isDefault ? 1 : 0, featuresJson,
    ],
  );
  return result.insertId;
}

export async function deletePlan(id: number) {
  const pool = getPool();
  const plan = await getPlanById(id);
  if (!plan) throw new Error('Plan not found');
  if (plan.isDefault) throw new Error('Cannot delete default free plan');
  const [users] = await pool.execute<RowDataPacket[]>(
    'SELECT COUNT(*) AS c FROM users WHERE plan_id = ?',
    [id],
  );
  if (Number(users[0]?.c) > 0) throw new Error('Plan has active users');
  await pool.execute('DELETE FROM subscription_plans WHERE id = ?', [id]);
}

export async function updateTemplateRule(templateId: string, minPlanId: number | null) {
  await ensureTemplateRulesSeeded();
  const pool = getPool();
  await pool.execute(
    `INSERT INTO template_rules (template_id, min_plan_id) VALUES (?, ?)
     ON DUPLICATE KEY UPDATE min_plan_id = VALUES(min_plan_id)`,
    [templateId, minPlanId],
  );
}

export async function assignUserPlan(userId: number, planId: number) {
  const plan = await getPlanById(planId);
  if (!plan) throw new Error('Plan not found');
  const pool = getPool();
  const isPaid = plan.price > 0 && canExport(plan.features);
  await pool.execute(
    `UPDATE users SET plan_id = ?, is_premium = ?, premium_purchased_at = IF(? = 1 AND premium_purchased_at IS NULL, NOW(), premium_purchased_at) WHERE id = ?`,
    [planId, isPaid ? 1 : 0, isPaid ? 1 : 0, userId],
  );
}

export async function activatePlanPurchase(userId: number, planId: number, orderId: string) {
  const pool = getPool();
  await pool.execute(
    `UPDATE payments SET status = 'paid', paid_at = NOW() WHERE order_id = ? AND user_id = ?`,
    [orderId, userId],
  );
  await pool.execute(
    `UPDATE users SET plan_id = ?, is_premium = 1, premium_purchased_at = NOW(), premium_portfolio_id = NULL WHERE id = ?`,
    [planId, userId],
  );
}

export interface AdminUserRow {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  isPremium: boolean;
  planId: number | null;
  planName: string | null;
  planSlug: string | null;
  premiumPurchasedAt: string | null;
  createdAt: string;
  totalPaid: number;
  paymentCount: number;
}

export async function getAdminUsers(): Promise<AdminUserRow[]> {
  const pool = getPool();
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT u.id, u.name, u.email, u.phone, u.role, u.is_premium, u.plan_id,
            u.premium_purchased_at, u.created_at,
            sp.name AS plan_name, sp.slug AS plan_slug,
            COALESCE(SUM(CASE WHEN p.status = 'paid' THEN p.amount ELSE 0 END), 0) AS total_paid,
            COUNT(CASE WHEN p.status = 'paid' THEN 1 END) AS payment_count
     FROM users u
     LEFT JOIN subscription_plans sp ON sp.id = u.plan_id
     LEFT JOIN payments p ON p.user_id = u.id
     GROUP BY u.id
     ORDER BY u.created_at DESC`,
  );
  return rows.map(r => ({
    id: Number(r.id),
    name: String(r.name),
    email: String(r.email),
    phone: String(r.phone),
    role: String(r.role),
    isPremium: Boolean(r.is_premium),
    planId: r.plan_id != null ? Number(r.plan_id) : null,
    planName: r.plan_name ? String(r.plan_name) : null,
    planSlug: r.plan_slug ? String(r.plan_slug) : null,
    premiumPurchasedAt: r.premium_purchased_at ? new Date(r.premium_purchased_at as Date).toISOString() : null,
    createdAt: new Date(r.created_at as Date).toISOString(),
    totalPaid: Number(r.total_paid),
    paymentCount: Number(r.payment_count),
  }));
}

export async function getAdminStats() {
  const pool = getPool();
  const [[userStats]] = await pool.execute<RowDataPacket[]>(
    `SELECT COUNT(*) AS total_users,
            SUM(role = 'admin') AS admins,
            SUM(is_premium = 1) AS premium_users
     FROM users`,
  );
  const [[payStats]] = await pool.execute<RowDataPacket[]>(
    `SELECT COALESCE(SUM(amount), 0) AS revenue,
            COUNT(*) AS paid_orders
     FROM payments WHERE status = 'paid'`,
  );
  const [planBreakdown] = await pool.execute<RowDataPacket[]>(
    `SELECT sp.name, sp.slug, COUNT(u.id) AS user_count
     FROM subscription_plans sp
     LEFT JOIN users u ON u.plan_id = sp.id
     GROUP BY sp.id
     ORDER BY sp.tier`,
  );
  return {
    totalUsers: Number(userStats?.total_users ?? 0),
    adminCount: Number(userStats?.admins ?? 0),
    premiumUsers: Number(userStats?.premium_users ?? 0),
    revenue: Number(payStats?.revenue ?? 0),
    paidOrders: Number(payStats?.paid_orders ?? 0),
    planBreakdown: planBreakdown.map(r => ({
      name: String(r.name),
      slug: String(r.slug),
      userCount: Number(r.user_count),
    })),
  };
}
