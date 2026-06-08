-- Webquro — default admin user
-- Run AFTER migration_admin_plans.sql
-- Login: admin@webquro.com / admin123  (change password after first login)

USE portfolio_builder;

INSERT INTO users (name, email, phone, password_hash, role, plan_id, is_premium)
SELECT
  'Webquro Admin',
  'admin@webquro.com',
  '9876543210',
  '$2b$12$klkIjXlyjsW41VS2hLSMDOrhw9u3Bd8Uij1K4K.aQGbkE610x/nQO',
  'admin',
  sp.id,
  0
FROM subscription_plans sp
WHERE sp.slug = 'free'
  AND NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@webquro.com')
LIMIT 1;

-- If user already exists, just promote to admin:
UPDATE users SET role = 'admin' WHERE email = 'admin@webquro.com';
