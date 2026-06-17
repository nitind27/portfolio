-- Site analytics events
CREATE TABLE IF NOT EXISTS site_analytics_events (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  event_type VARCHAR(40) NOT NULL,
  session_id VARCHAR(64) NULL,
  user_id INT UNSIGNED NULL,
  path VARCHAR(500) NULL,
  query VARCHAR(500) NULL,
  referrer VARCHAR(1000) NULL,
  metadata JSON NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_event_type (event_type),
  INDEX idx_created_at (created_at),
  INDEX idx_session (session_id),
  INDEX idx_user (user_id),
  INDEX idx_query (query(100))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Promo free grant tracking
CREATE TABLE IF NOT EXISTS promo_grants (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  grant_type VARCHAR(30) NOT NULL DEFAULT 'free_slot',
  granted_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_user_grant (user_id, grant_type),
  INDEX idx_grant_type (grant_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
