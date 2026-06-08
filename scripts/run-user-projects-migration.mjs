/**
 * Create user_projects table + users.app_config if missing.
 * Usage: node scripts/run-user-projects-migration.mjs
 */

import mysql from 'mysql2/promise';
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

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || 'localhost',
  port: Number(process.env.MYSQL_PORT || 3306),
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'portfolio_builder',
});

async function main() {
  const [tables] = await pool.query("SHOW TABLES LIKE 'user_projects'");
  const exists = tables.length > 0;
  console.log('user_projects table exists:', exists);

  if (!exists) {
    console.log('Running migration...');

    await pool.query(`
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
        expires_at DATETIME NULL COMMENT 'Optional expiry',
        config JSON NOT NULL COMMENT 'Compact portfolio payload',
        UNIQUE KEY uq_user_project (user_id, project_id),
        KEY idx_user_projects_user (user_id),
        KEY idx_user_projects_updated (updated_at),
        CONSTRAINT fk_user_projects_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('OK: CREATE TABLE user_projects');

    try {
      await pool.query(`
        ALTER TABLE users
          ADD COLUMN app_config JSON NULL COMMENT 'UI prefs tours lastActiveProjectId' AFTER plan_id
      `);
      console.log('OK: ALTER TABLE users ADD app_config');
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') {
        console.log('SKIP: users.app_config already exists');
      } else {
        throw e;
      }
    }
  }

  const [cols] = await pool.query("SHOW COLUMNS FROM users LIKE 'app_config'");
  console.log('users.app_config column exists:', cols.length > 0);

  const [countRows] = await pool.query('SELECT COUNT(*) as cnt FROM user_projects');
  console.log('user_projects row count:', countRows[0].cnt);

  const [sample] = await pool.query(
    'SELECT user_id, project_id, name, template_id, published, LENGTH(config) as config_bytes FROM user_projects ORDER BY updated_at DESC LIMIT 5',
  );
  if (sample.length) {
    console.log('Recent projects:');
    for (const r of sample) console.log(' ', r);
  } else {
    console.log('No projects saved yet — login and edit a project to sync.');
  }

  await pool.end();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
