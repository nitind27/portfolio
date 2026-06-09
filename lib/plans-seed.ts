import type { RowDataPacket } from 'mysql2';
import { getPool } from './db';
import {
  FREE_PLAN_FEATURES,
  PREMIUM_PLAN_FEATURES,
  defaultPremiumPrice,
} from './default-plans';

let ready = false;

function isIgnorableDbError(err: unknown): boolean {
  const code = (err as { code?: string })?.code;
  return code === 'ER_DUP_FIELDNAME' || code === 'ER_DUP_KEYNAME' || code === 'ER_CANT_DROP_FIELD_OR_KEY';
}

async function execIgnore(pool: ReturnType<typeof getPool>, sql: string) {
  try {
    await pool.execute(sql);
  } catch (err) {
    if (!isIgnorableDbError(err)) throw err;
  }
}

async function ensureSchema(pool: ReturnType<typeof getPool>) {
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS subscription_plans (
      id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      slug VARCHAR(50) NOT NULL,
      name VARCHAR(100) NOT NULL,
      description TEXT NULL,
      price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
      currency VARCHAR(10) NOT NULL DEFAULT 'INR',
      tier INT NOT NULL DEFAULT 0,
      is_active TINYINT(1) NOT NULL DEFAULT 1,
      is_default TINYINT(1) NOT NULL DEFAULT 0,
      features JSON NOT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY uq_plans_slug (slug),
      KEY idx_plans_active (is_active),
      KEY idx_plans_tier (tier)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS template_rules (
      template_id VARCHAR(64) NOT NULL PRIMARY KEY,
      min_plan_id INT UNSIGNED NULL,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await execIgnore(pool, `ALTER TABLE users ADD COLUMN role ENUM('user', 'admin') NOT NULL DEFAULT 'user' AFTER password_hash`);
  await execIgnore(pool, `ALTER TABLE users ADD COLUMN plan_id INT UNSIGNED NULL AFTER premium_portfolio_id`);
  await execIgnore(pool, `ALTER TABLE payments ADD COLUMN plan_id INT UNSIGNED NULL AFTER amount`);
  await execIgnore(pool, `ALTER TABLE payments ADD COLUMN subtotal DECIMAL(10, 2) NULL AFTER amount`);
  await execIgnore(pool, `ALTER TABLE payments ADD COLUMN gst_rate DECIMAL(5, 2) NOT NULL DEFAULT 18.00 AFTER subtotal`);
  await execIgnore(pool, `ALTER TABLE payments ADD COLUMN gst_amount DECIMAL(10, 2) NULL AFTER gst_rate`);
  await execIgnore(pool, `ALTER TABLE payments ADD COLUMN gstin VARCHAR(15) NULL AFTER gst_amount`);
  await execIgnore(pool, `ALTER TABLE payments ADD COLUMN gst_legal_name VARCHAR(255) NULL AFTER gstin`);
  await execIgnore(pool, `ALTER TABLE payments ADD COLUMN gst_verified TINYINT(1) NOT NULL DEFAULT 0 AFTER gst_legal_name`);
}

/** Keep exactly two active tiers: Free + Premium (₹99, slug pro). Retire legacy Business plan. */
async function syncCanonicalPlans(pool: ReturnType<typeof getPool>) {
  const premiumPrice = defaultPremiumPrice();

  await pool.execute(
    `INSERT INTO subscription_plans (slug, name, description, price, currency, tier, is_active, is_default, features)
     VALUES ('free', 'Free', 'Build & preview in browser. Limited templates and features.', 0, 'INR', 0, 1, 1, ?)
     ON DUPLICATE KEY UPDATE
       name = 'Free',
       description = VALUES(description),
       tier = 0,
       is_default = 1,
       is_active = 1,
       features = VALUES(features)`,
    [JSON.stringify(FREE_PLAN_FEATURES)],
  );

  await pool.execute(
    `INSERT INTO subscription_plans (slug, name, description, price, currency, tier, is_active, is_default, features)
     VALUES ('pro', 'Premium', 'Export, share, publish and deploy one portfolio slot.', ?, 'INR', 1, 1, 0, ?)
     ON DUPLICATE KEY UPDATE
       name = 'Premium',
       description = VALUES(description),
       price = VALUES(price),
       tier = 1,
       is_active = 1,
       is_default = 0,
       features = VALUES(features)`,
    [premiumPrice, JSON.stringify(PREMIUM_PLAN_FEATURES)],
  );

  await pool.execute(
    `UPDATE subscription_plans SET is_active = 0, is_default = 0 WHERE slug NOT IN ('free', 'pro')`,
  );

  await pool.execute(
    `UPDATE users u
     INNER JOIN subscription_plans bp ON u.plan_id = bp.id AND bp.slug NOT IN ('free', 'pro')
     INNER JOIN subscription_plans pp ON pp.slug = 'pro'
     SET u.plan_id = pp.id, u.is_premium = 1`,
  );

  await pool.execute(
    `UPDATE users SET plan_id = (SELECT id FROM subscription_plans WHERE slug = 'free' LIMIT 1) WHERE plan_id IS NULL`,
  );
}

/** Ensures subscription_plans exist and canonical Free + Premium rows are synced (safe on every cold start). */
export async function ensurePlansReady(): Promise<void> {
  if (ready) return;
  const pool = getPool();
  await ensureSchema(pool);
  await syncCanonicalPlans(pool);
  ready = true;
}

/** Force re-sync after admin edits price/features (same process only). */
export function invalidatePlansSeedCache() {
  ready = false;
}
