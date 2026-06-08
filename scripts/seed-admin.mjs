/**
 * Create or update default admin user in MySQL.
 * Usage: node scripts/seed-admin.mjs
 *
 * Env (from .env.local):
 *   ADMIN_EMAIL    default admin@webquro.com
 *   ADMIN_PASSWORD default admin123 (or NEXT_PUBLIC_ADMIN_PASSWORD)
 */

import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

function loadEnvLocal() {
  const p = resolve(process.cwd(), '.env.local');
  if (!existsSync(p)) return;
  for (const line of readFileSync(p, 'utf8').split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const i = t.indexOf('=');
    if (i < 0) continue;
    const key = t.slice(0, i).trim();
    const val = t.slice(i + 1).trim();
    if (!process.env[key]) process.env[key] = val;
  }
}

loadEnvLocal();

const email = (process.env.ADMIN_EMAIL || 'admin@webquro.com').toLowerCase();
const password = process.env.ADMIN_PASSWORD || process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin123';
const name = process.env.ADMIN_NAME || 'Webquro Admin';
const phone = process.env.ADMIN_PHONE || '9876543210';

async function main() {
  const pool = mysql.createPool({
    host: process.env.MYSQL_HOST || 'localhost',
    port: Number(process.env.MYSQL_PORT || 3306),
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'portfolio_builder',
  });

  const hash = await bcrypt.hash(password, 12);

  const [planRows] = await pool.execute(
    'SELECT id FROM subscription_plans WHERE is_default = 1 LIMIT 1',
  );
  const planId = planRows[0]?.id ?? null;

  const [existing] = await pool.execute(
    'SELECT id FROM users WHERE email = ? LIMIT 1',
    [email],
  );

  if (existing.length) {
    if (planId) {
      await pool.execute(
        'UPDATE users SET name = ?, phone = ?, password_hash = ?, role = ?, plan_id = ? WHERE email = ?',
        [name, phone, hash, 'admin', planId, email],
      );
    } else {
      await pool.execute(
        'UPDATE users SET name = ?, phone = ?, password_hash = ?, role = ? WHERE email = ?',
        [name, phone, hash, 'admin', email],
      );
    }
    console.log('Updated existing user to admin:', email);
  } else {
    if (planId) {
      await pool.execute(
        `INSERT INTO users (name, email, phone, password_hash, role, plan_id)
         VALUES (?, ?, ?, ?, 'admin', ?)`,
        [name, email, phone, hash, planId],
      );
    } else {
      await pool.execute(
        `INSERT INTO users (name, email, phone, password_hash, role)
         VALUES (?, ?, ?, ?, 'admin')`,
        [name, email, phone, hash],
      );
    }
    console.log('Created admin user:', email);
  }

  console.log('Password:', password);
  console.log('Login at http://localhost:3000 then open /admin');

  await pool.end();
}

main().catch(err => {
  console.error('Failed:', err.message);
  if (err.message.includes('role')) {
    console.error('Run database/migration_admin_plans.sql first.');
  }
  process.exit(1);
});
