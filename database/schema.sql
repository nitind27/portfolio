-- site99 — User & Payment tables only
-- Import this file in phpMyAdmin (create database first, then import)

CREATE DATABASE IF NOT EXISTS portfolio_builder
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE portfolio_builder;

-- Users: registration & premium status (portfolio data stays in browser localStorage)
CREATE TABLE IF NOT EXISTS users (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  is_premium TINYINT(1) NOT NULL DEFAULT 0,
  premium_purchased_at DATETIME NULL,
  premium_portfolio_id VARCHAR(64) NULL COMMENT 'Portfolio UUID unlocked for export/share (1 slot per ₹99)',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_users_email (email),
  KEY idx_users_phone (phone)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Payment orders (Cashfree)
CREATE TABLE IF NOT EXISTS payments (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  order_id VARCHAR(100) NOT NULL,
  cf_order_id VARCHAR(100) NULL,
  amount DECIMAL(10, 2) NOT NULL DEFAULT 99.00,
  currency VARCHAR(10) NOT NULL DEFAULT 'INR',
  status ENUM('pending', 'paid', 'failed', 'expired') NOT NULL DEFAULT 'pending',
  payment_method VARCHAR(50) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  paid_at DATETIME NULL,
  UNIQUE KEY uq_payments_order_id (order_id),
  KEY idx_payments_user_id (user_id),
  KEY idx_payments_status (status),
  CONSTRAINT fk_payments_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Hostinger live deploy tables: import database/migration_hostinger.sql
