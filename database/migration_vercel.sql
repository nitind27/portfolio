-- Per-user Vercel connections and deployment history
CREATE TABLE IF NOT EXISTS vercel_connections (
  user_id INT UNSIGNED NOT NULL PRIMARY KEY,
  access_token_enc TEXT NOT NULL,
  account_label VARCHAR(200) NOT NULL DEFAULT '',
  team_id VARCHAR(64) NULL,
  auth_method ENUM('oauth','token') NOT NULL DEFAULT 'token',
  connected_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_verified_at DATETIME NULL,
  CONSTRAINT fk_vercel_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS vercel_deployments (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  project_id VARCHAR(64) NOT NULL,
  vercel_project_name VARCHAR(80) NOT NULL,
  deployment_id VARCHAR(64) NULL,
  live_url VARCHAR(500) NULL,
  status ENUM('pending','uploading','building','live','failed') NOT NULL DEFAULT 'pending',
  error_message VARCHAR(500) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user_project (user_id, project_id),
  CONSTRAINT fk_vercel_dep_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
