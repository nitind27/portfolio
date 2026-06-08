-- Run this in phpMyAdmin if you already imported schema.sql earlier
USE portfolio_builder;

-- Skip if column already exists (ignore error in phpMyAdmin)
ALTER TABLE users
  ADD COLUMN premium_portfolio_id VARCHAR(64) NULL
    COMMENT 'Client-side portfolio UUID unlocked for export/share (1 per ₹99 payment)'
    AFTER premium_purchased_at;
