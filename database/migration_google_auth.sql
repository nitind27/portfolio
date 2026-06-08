-- Google OAuth + profile fields
-- Run after schema.sql / migration_admin_plans.sql

USE portfolio_builder;

ALTER TABLE users
  MODIFY COLUMN phone VARCHAR(20) NULL DEFAULT NULL,
  MODIFY COLUMN password_hash VARCHAR(255) NULL;

ALTER TABLE users
  ADD COLUMN google_id VARCHAR(255) NULL AFTER password_hash,
  ADD COLUMN auth_provider ENUM('local', 'google') NOT NULL DEFAULT 'local' AFTER google_id,
  ADD COLUMN avatar_url VARCHAR(512) NULL AFTER auth_provider;

ALTER TABLE users
  ADD UNIQUE KEY uq_users_google_id (google_id);
