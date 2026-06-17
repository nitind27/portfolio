import { createHash, randomInt } from 'crypto';
import type { RowDataPacket } from 'mysql2';
import { getPool } from './db';
import { isValidEmail } from './validators';
import { sendOtpEmail, isSmtpConfigured } from './system-email';

const OTP_TTL_MINUTES = 10;
const MAX_ATTEMPTS = 5;
const RESEND_COOLDOWN_SEC = 60;

let schemaReady = false;

export async function ensureOtpSchema() {
  if (schemaReady) return;
  const pool = getPool();
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS email_otps (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(255) NOT NULL,
      otp_hash VARCHAR(64) NOT NULL,
      purpose VARCHAR(30) NOT NULL DEFAULT 'register',
      attempts INT UNSIGNED NOT NULL DEFAULT 0,
      verified TINYINT UNSIGNED NOT NULL DEFAULT 0,
      expires_at DATETIME NOT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_email_purpose (email, purpose),
      INDEX idx_expires (expires_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `).catch(() => {});
  schemaReady = true;
}

function hashOtp(email: string, otp: string): string {
  const secret = process.env.JWT_SECRET || process.env.OTP_SECRET || 'otp-fallback-secret';
  return createHash('sha256').update(`${email.toLowerCase()}:${otp}:${secret}`).digest('hex');
}

function generateOtp(): string {
  return String(randomInt(100000, 1000000));
}

function formatOtpDisplay(otp: string): string {
  return `${otp.slice(0, 3)} ${otp.slice(3)}`;
}

export async function sendRegistrationOtp(email: string): Promise<{
  ok: boolean;
  error?: string;
  expiresIn?: number;
  cooldown?: number;
}> {
  const normalized = email.trim().toLowerCase();
  if (!isValidEmail(normalized)) {
    return { ok: false, error: 'Invalid email address' };
  }

  const smtpOk = await isSmtpConfigured();
  if (!smtpOk) {
    return { ok: false, error: 'Email service not configured. Contact support.' };
  }

  await ensureOtpSchema();
  const pool = getPool();

  const [existingUser] = await pool.execute<RowDataPacket[]>(
    'SELECT id FROM users WHERE email = ? LIMIT 1',
    [normalized],
  );
  if (existingUser.length) {
    return { ok: false, error: 'Email already registered. Please sign in.' };
  }

  const [recent] = await pool.execute<RowDataPacket[]>(
    `SELECT created_at FROM email_otps
     WHERE email = ? AND purpose = 'register' AND created_at > DATE_SUB(NOW(), INTERVAL ? SECOND)
     ORDER BY created_at DESC LIMIT 1`,
    [normalized, RESEND_COOLDOWN_SEC],
  );
  if (recent.length) {
    const created = new Date(recent[0].created_at as Date).getTime();
    const wait = Math.ceil(RESEND_COOLDOWN_SEC - (Date.now() - created) / 1000);
    return { ok: false, error: `Please wait ${wait}s before requesting a new code`, cooldown: wait };
  }

  const otp = generateOtp();
  const otpHash = hashOtp(normalized, otp);

  await pool.execute(
    `DELETE FROM email_otps WHERE email = ? AND purpose = 'register' AND verified = 0`,
    [normalized],
  );

  await pool.execute(
    `INSERT INTO email_otps (email, otp_hash, purpose, expires_at)
     VALUES (?, ?, 'register', DATE_ADD(NOW(), INTERVAL ? MINUTE))`,
    [normalized, otpHash, OTP_TTL_MINUTES],
  );

  const sent = await sendOtpEmail({
    to: normalized,
    otp,
    otpDisplay: formatOtpDisplay(otp),
    expiresMinutes: OTP_TTL_MINUTES,
  });

  if (!sent.ok) {
    return { ok: false, error: sent.error || 'Failed to send verification email' };
  }

  return { ok: true, expiresIn: OTP_TTL_MINUTES * 60 };
}

export async function verifyRegistrationOtp(email: string, otp: string): Promise<{
  ok: boolean;
  error?: string;
}> {
  const normalized = email.trim().toLowerCase();
  const code = String(otp || '').replace(/\D/g, '');

  if (!/^\d{6}$/.test(code)) {
    return { ok: false, error: 'Enter the 6-digit verification code' };
  }

  await ensureOtpSchema();
  const pool = getPool();

  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT id, otp_hash, attempts, verified, expires_at
     FROM email_otps
     WHERE email = ? AND purpose = 'register'
     ORDER BY created_at DESC LIMIT 1`,
    [normalized],
  );

  const row = rows[0] as {
    id: number;
    otp_hash: string;
    attempts: number;
    verified: number;
    expires_at: Date;
  } | undefined;

  if (!row) {
    return { ok: false, error: 'No verification code found. Please request a new one.' };
  }

  if (row.verified) {
    return { ok: true };
  }

  if (new Date(row.expires_at) < new Date()) {
    return { ok: false, error: 'Verification code expired. Please request a new one.' };
  }

  if (row.attempts >= MAX_ATTEMPTS) {
    return { ok: false, error: 'Too many failed attempts. Please request a new code.' };
  }

  const match = hashOtp(normalized, code) === row.otp_hash;

  if (!match) {
    await pool.execute(
      'UPDATE email_otps SET attempts = attempts + 1 WHERE id = ?',
      [row.id],
    );
    const left = MAX_ATTEMPTS - row.attempts - 1;
    return {
      ok: false,
      error: left > 0
        ? `Invalid code. ${left} attempt${left === 1 ? '' : 's'} remaining.`
        : 'Invalid code. Please request a new one.',
    };
  }

  await pool.execute(
    'UPDATE email_otps SET verified = 1 WHERE id = ?',
    [row.id],
  );

  return { ok: true };
}

export async function isEmailOtpVerified(email: string): Promise<boolean> {
  await ensureOtpSchema();
  const pool = getPool();
  const normalized = email.trim().toLowerCase();
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT id FROM email_otps
     WHERE email = ? AND purpose = 'register' AND verified = 1
       AND expires_at > NOW()
     ORDER BY created_at DESC LIMIT 1`,
    [normalized],
  );
  return rows.length > 0;
}

export async function consumeVerifiedOtp(email: string): Promise<void> {
  await ensureOtpSchema();
  const pool = getPool();
  await pool.execute(
    `DELETE FROM email_otps WHERE email = ? AND purpose = 'register'`,
    [email.trim().toLowerCase()],
  );
}
