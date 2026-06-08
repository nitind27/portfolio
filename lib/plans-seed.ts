import type { RowDataPacket } from 'mysql2';
import { getPool } from './db';
import {
  BUSINESS_PLAN_FEATURES,
  PRO_PLAN_FEATURES,
  defaultBusinessPrice,
  defaultProPrice,
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
}

async function seedDefaultPlans(pool: ReturnType<typeof getPool>) {
  const proPrice = defaultProPrice();
  const businessPrice = defaultBusinessPrice();

  const plans: { slug: string; name: string; description: string; price: number; tier: number; isDefault: boolean; features: object }[] = [
    {
      slug: 'free',
      name: 'Free',
      description: 'Build & preview in browser. Limited templates and features.',
      price: 0,
      tier: 0,
      isDefault: true,
      features: {
        exportHtml: false, exportReact: false, exportNextjs: false,
        shareLink: true, publishOnline: true, hostingerDeploy: false,
        customCss: false, analytics: false, smtp: false, popupBuilder: true,
        sectionBlog: false, sectionTeam: false, sectionPricing: false,
        sectionFaq: true, sectionTestimonials: true, premiumLayouts: false,
        unlockedPortfolios: 0, storageDays: 7,
      },
    },
    {
      slug: 'pro',
      name: 'Pro',
      description: 'Export, share, publish and deploy one portfolio slot.',
      price: proPrice,
      tier: 1,
      isDefault: false,
      features: PRO_PLAN_FEATURES,
    },
    {
      slug: 'business',
      name: 'Business',
      description: 'Everything in Pro plus all premium templates and 3 portfolio slots.',
      price: businessPrice,
      tier: 2,
      isDefault: false,
      features: BUSINESS_PLAN_FEATURES,
    },
  ];

  for (const p of plans) {
    await pool.execute(
      `INSERT INTO subscription_plans (slug, name, description, price, currency, tier, is_active, is_default, features)
       VALUES (?, ?, ?, ?, 'INR', ?, 1, ?, ?)
       ON DUPLICATE KEY UPDATE
         name = VALUES(name),
         description = VALUES(description),
         price = IF(slug = 'pro', VALUES(price), price),
         features = VALUES(features),
         is_active = 1`,
      [p.slug, p.name, p.description, p.price, p.tier, p.isDefault ? 1 : 0, JSON.stringify(p.features)],
    );
  }

  await pool.execute(
    `UPDATE users SET plan_id = (SELECT id FROM subscription_plans WHERE slug = 'free' LIMIT 1) WHERE plan_id IS NULL`,
  );
}

/** Ensures subscription_plans exist and default rows are present (safe on every request). */
export async function ensurePlansReady(): Promise<void> {
  if (ready) return;
  const pool = getPool();
  await ensureSchema(pool);

  const freeFeatures = {
    exportHtml: false, exportReact: false, exportNextjs: false,
    shareLink: true, publishOnline: true, hostingerDeploy: false,
    customCss: false, analytics: false, smtp: false, popupBuilder: true,
    sectionBlog: false, sectionTeam: false, sectionPricing: false,
    sectionFaq: true, sectionTestimonials: true, premiumLayouts: false,
    unlockedPortfolios: 0, storageDays: 7,
  };
  await pool.execute(
    `UPDATE subscription_plans SET features = ? WHERE slug = 'free'`,
    [JSON.stringify(freeFeatures)],
  ).catch(() => {});

  const [rows] = await pool.execute<RowDataPacket[]>(
    'SELECT COUNT(*) AS c FROM subscription_plans WHERE is_active = 1 AND price > 0',
  );
  if (Number(rows[0]?.c ?? 0) === 0) {
    await seedDefaultPlans(pool);
  }

  ready = true;
}
