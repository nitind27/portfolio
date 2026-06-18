-- Marketing blog posts for public /blog pages (admin-managed CMS)
CREATE TABLE IF NOT EXISTS marketing_blog_posts (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(160) NOT NULL,
  title VARCHAR(300) NOT NULL,
  excerpt VARCHAR(500) NOT NULL DEFAULT '',
  body LONGTEXT NOT NULL,
  status ENUM('draft','published') NOT NULL DEFAULT 'draft',
  author_name VARCHAR(120) NOT NULL DEFAULT '',
  seo_title VARCHAR(200) NOT NULL DEFAULT '',
  seo_description VARCHAR(320) NOT NULL DEFAULT '',
  seo_keywords VARCHAR(500) NOT NULL DEFAULT '',
  og_image VARCHAR(500) NOT NULL DEFAULT '',
  published_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_slug (slug),
  INDEX idx_status_published (status, published_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- About page content is stored in system_settings key `marketing_about` (JSON)
