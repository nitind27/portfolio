-- Hostinger integration — run after schema.sql
USE portfolio_builder;

CREATE TABLE IF NOT EXISTS hostinger_connections (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  api_token_enc TEXT NOT NULL,
  account_label VARCHAR(255) NULL COMMENT 'Optional label e.g. email from verify',
  connected_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_verified_at DATETIME NULL,
  UNIQUE KEY uq_hostinger_user (user_id),
  CONSTRAINT fk_hostinger_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS hostinger_deployments (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  portfolio_id VARCHAR(64) NOT NULL,
  domain VARCHAR(255) NOT NULL,
  status ENUM('pending', 'uploading', 'deploying', 'live', 'failed') NOT NULL DEFAULT 'pending',
  live_url VARCHAR(512) NULL,
  error_message TEXT NULL,
  deployed_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_deploy_user (user_id),
  KEY idx_deploy_portfolio (portfolio_id),
  CONSTRAINT fk_deploy_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
