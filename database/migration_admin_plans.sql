-- site99 Admin Panel — roles, subscription plans, template & feature rules
-- Run after schema.sql and migration_hostinger.sql

USE portfolio_builder;

-- User role + active subscription plan
ALTER TABLE users
  ADD COLUMN role ENUM('user', 'admin') NOT NULL DEFAULT 'user' AFTER password_hash,
  ADD COLUMN plan_id INT UNSIGNED NULL AFTER premium_portfolio_id;

-- Subscription plans (admin-configurable)
CREATE TABLE IF NOT EXISTS subscription_plans (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(50) NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT NULL,
  price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  currency VARCHAR(10) NOT NULL DEFAULT 'INR',
  tier INT NOT NULL DEFAULT 0 COMMENT 'Higher tier unlocks lower-tier templates',
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  is_default TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Assigned to new users (free tier)',
  features JSON NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_plans_slug (slug),
  KEY idx_plans_active (is_active),
  KEY idx_plans_tier (tier)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Which plan is required per template (NULL min_plan_id = free for all)
CREATE TABLE IF NOT EXISTS template_rules (
  template_id VARCHAR(64) NOT NULL PRIMARY KEY,
  min_plan_id INT UNSIGNED NULL COMMENT 'NULL = free template',
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_template_rules_plan FOREIGN KEY (min_plan_id) REFERENCES subscription_plans(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE users
  ADD CONSTRAINT fk_users_plan FOREIGN KEY (plan_id) REFERENCES subscription_plans(id) ON DELETE SET NULL;

ALTER TABLE payments
  ADD COLUMN plan_id INT UNSIGNED NULL AFTER amount,
  ADD CONSTRAINT fk_payments_plan FOREIGN KEY (plan_id) REFERENCES subscription_plans(id) ON DELETE SET NULL;

-- Default plans
INSERT INTO subscription_plans (slug, name, description, price, tier, is_active, is_default, features) VALUES
(
  'free',
  'Free',
  'Build & preview in browser. Limited templates and features.',
  0.00,
  0,
  1,
  1,
  JSON_OBJECT(
    'exportHtml', false,
    'exportReact', false,
    'exportNextjs', false,
    'shareLink', true,
    'publishOnline', true,
    'hostingerDeploy', false,
    'customCss', false,
    'analytics', false,
    'smtp', false,
    'popupBuilder', true,
    'sectionBlog', false,
    'sectionTeam', false,
    'sectionPricing', false,
    'sectionFaq', true,
    'sectionTestimonials', true,
    'premiumLayouts', false,
    'unlockedPortfolios', 0,
    'storageDays', 7
  )
),
(
  'pro',
  'Premium',
  'Export, share, publish and deploy one portfolio slot.',
  99.00,
  1,
  1,
  0,
  JSON_OBJECT(
    'exportHtml', true,
    'exportReact', true,
    'exportNextjs', true,
    'shareLink', true,
    'publishOnline', true,
    'hostingerDeploy', true,
    'customCss', true,
    'analytics', true,
    'smtp', true,
    'popupBuilder', true,
    'sectionBlog', true,
    'sectionTeam', true,
    'sectionPricing', true,
    'sectionFaq', true,
    'sectionTestimonials', true,
    'premiumLayouts', true,
    'unlockedPortfolios', 1,
    'storageDays', 365
  )
);

-- Retire legacy Business tier (migrate users to Premium)
UPDATE subscription_plans SET is_active = 0 WHERE slug = 'business';
UPDATE users u
INNER JOIN subscription_plans bp ON u.plan_id = bp.id AND bp.slug = 'business'
INNER JOIN subscription_plans pp ON pp.slug = 'pro'
SET u.plan_id = pp.id, u.is_premium = 1;

-- Assign free plan to existing users
UPDATE users u
SET u.plan_id = (SELECT id FROM subscription_plans WHERE slug = 'free' LIMIT 1)
WHERE u.plan_id IS NULL;

-- Promote existing premium users to Pro plan
UPDATE users u
SET u.plan_id = (SELECT id FROM subscription_plans WHERE slug = 'pro' LIMIT 1)
WHERE u.is_premium = 1;

-- Make yourself admin (change email):
-- UPDATE users SET role = 'admin' WHERE email = 'your@email.com';
