import { getPool } from './db';

let ready = false;

function isIgnorable(err: unknown): boolean {
  const code = (err as { code?: string })?.code;
  return code === 'ER_DUP_FIELDNAME' || code === 'ER_DUP_KEYNAME';
}

async function execIgnore(sql: string) {
  const pool = getPool();
  try {
    await pool.execute(sql);
  } catch (err) {
    if (!isIgnorable(err)) throw err;
  }
}

export async function ensureAuthSchema() {
  if (ready) return;
  const pool = getPool();

  await execIgnore(`ALTER TABLE users MODIFY COLUMN phone VARCHAR(20) NULL DEFAULT NULL`);
  await execIgnore(`ALTER TABLE users MODIFY COLUMN password_hash VARCHAR(255) NULL`);
  await execIgnore(`ALTER TABLE users ADD COLUMN google_id VARCHAR(255) NULL AFTER password_hash`);
  await execIgnore(`ALTER TABLE users ADD COLUMN auth_provider ENUM('local', 'google') NOT NULL DEFAULT 'local' AFTER google_id`);
  await execIgnore(`ALTER TABLE users ADD COLUMN avatar_url VARCHAR(512) NULL AFTER auth_provider`);
  await execIgnore(`ALTER TABLE users ADD UNIQUE KEY uq_users_google_id (google_id)`);

  ready = true;
}
