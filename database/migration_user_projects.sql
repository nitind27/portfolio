-- User projects — portfolio data in compact JSON (replaces localStorage)
-- Run after migration_admin_plans.sql

USE portfolio_builder;

CREATE TABLE IF NOT EXISTS user_projects (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  project_id VARCHAR(64) NOT NULL COMMENT 'Portfolio UUID',
  name VARCHAR(200) NOT NULL,
  template_id VARCHAR(64) NOT NULL,
  slug VARCHAR(120) NOT NULL,
  published TINYINT(1) NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  expires_at DATETIME NULL COMMENT 'Optional expiry — null uses plan storage policy',
  config JSON NOT NULL COMMENT 'Compact portfolio payload',
  UNIQUE KEY uq_user_project (user_id, project_id),
  KEY idx_user_projects_user (user_id),
  KEY idx_user_projects_updated (updated_at),
  CONSTRAINT fk_user_projects_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE users
  ADD COLUMN app_config JSON NULL COMMENT 'UI prefs: tours, lastActiveProjectId' AFTER plan_id;
