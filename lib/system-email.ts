/**
 * System-level email sender.
 * Reads SMTP config from:
 *   1. Database (system_settings table) — set via admin panel
 *   2. .env fallback (SYSTEM_SMTP_* vars)
 *
 * Used for: welcome emails, payment confirmations, etc.
 */
import nodemailer from 'nodemailer';
import { getPool } from './db';
import { APP_NAME } from './brand';
import {
  welcomeEmailHtml, welcomeEmailText,
  paymentSuccessEmailHtml, paymentSuccessEmailText,
  paymentFailedEmailHtml, testEmailHtml,
  type EmailTemplateData,
} from './email-templates';

export interface SystemSmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  password: string;
  fromName: string;
  fromEmail: string;
  provider: string;
  enabled: boolean;
  // Custom message overrides
  welcomeMessage?: string;
  paymentMessage?: string;
}

// ── DB helpers ────────────────────────────────────────────────────────────────
async function ensureSettingsTable() {
  const pool = getPool();
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS system_settings (
      \`key\` VARCHAR(100) NOT NULL PRIMARY KEY,
      \`value\` LONGTEXT NOT NULL,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `).catch(() => {});
}

export async function getSystemSmtp(): Promise<SystemSmtpConfig | null> {
  try {
    await ensureSettingsTable();
    const pool = getPool();
    const [rows] = await pool.execute<any[]>(
      'SELECT `value` FROM system_settings WHERE `key` = ? LIMIT 1',
      ['system_smtp'],
    );
    if (rows[0]?.value) {
      return JSON.parse(rows[0].value) as SystemSmtpConfig;
    }
  } catch { /* silent */ }

  // fallback to env vars
  const host = process.env.SYSTEM_SMTP_HOST;
  if (!host) return null;
  return {
    host,
    port: Number(process.env.SYSTEM_SMTP_PORT || 587),
    secure: process.env.SYSTEM_SMTP_SECURE === 'true',
    user: process.env.SYSTEM_SMTP_USER || '',
    password: process.env.SYSTEM_SMTP_PASS || '',
    fromName: process.env.SYSTEM_SMTP_FROM_NAME || APP_NAME,
    fromEmail: process.env.SYSTEM_SMTP_FROM_EMAIL || process.env.SYSTEM_SMTP_USER || '',
    provider: process.env.SYSTEM_SMTP_PROVIDER || 'custom',
    enabled: true,
  };
}

export async function saveSystemSmtp(config: SystemSmtpConfig): Promise<void> {
  await ensureSettingsTable();
  const pool = getPool();
  await pool.execute(
    `INSERT INTO system_settings (\`key\`, \`value\`) VALUES (?, ?)
     ON DUPLICATE KEY UPDATE \`value\` = VALUES(\`value\`)`,
    ['system_smtp', JSON.stringify(config)],
  );
}

// ── Transporter ───────────────────────────────────────────────────────────────
function buildTransporter(cfg: SystemSmtpConfig) {
  return nodemailer.createTransport({
    host: cfg.host,
    port: cfg.port,
    secure: cfg.secure || cfg.port === 465,
    auth: { user: cfg.user, pass: cfg.password },
    tls: { rejectUnauthorized: false },
  });
}

function getAppUrl() {
  return (process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || 'http://localhost:3000').replace(/\/$/, '');
}

// ── Send helpers ──────────────────────────────────────────────────────────────
async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}): Promise<{ ok: boolean; error?: string }> {
  try {
    const cfg = await getSystemSmtp();
    if (!cfg || !cfg.enabled || !cfg.host || !cfg.user || !cfg.password) {
      return { ok: false, error: 'System SMTP not configured' };
    }
    const transporter = buildTransporter(cfg);
    await transporter.verify();
    await transporter.sendMail({
      from: `"${cfg.fromName || APP_NAME}" <${cfg.fromEmail || cfg.user}>`,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
      text: opts.text,
    });
    return { ok: true };
  } catch (err: any) {
    console.error('[SystemEmail] error:', err.message);
    return { ok: false, error: err.message };
  }
}

// ── Public API ────────────────────────────────────────────────────────────────
export async function sendWelcomeEmail(opts: {
  to: string;
  name: string;
  customMessage?: string;
}): Promise<{ ok: boolean; error?: string }> {
  const cfg = await getSystemSmtp();
  const data: EmailTemplateData = {
    userName: opts.name,
    userEmail: opts.to,
    loginUrl: `${getAppUrl()}/`,
    dashboardUrl: `${getAppUrl()}/`,
    supportEmail: cfg?.fromEmail || cfg?.user || '',
    customMessage: opts.customMessage || cfg?.welcomeMessage || '',
    appName: APP_NAME,
  };
  return sendEmail({
    to: opts.to,
    subject: `Welcome to ${APP_NAME}! 🎉`,
    html: welcomeEmailHtml(data),
    text: welcomeEmailText(data),
  });
}

export async function sendPaymentSuccessEmail(opts: {
  to: string;
  name: string;
  planName: string;
  amount: number;
  orderId: string;
  customMessage?: string;
}): Promise<{ ok: boolean; error?: string }> {
  const cfg = await getSystemSmtp();
  const data: EmailTemplateData = {
    userName: opts.name,
    userEmail: opts.to,
    planName: opts.planName,
    amount: `₹${opts.amount.toFixed(2)} INR`,
    orderId: opts.orderId,
    dashboardUrl: `${getAppUrl()}/`,
    supportEmail: cfg?.fromEmail || cfg?.user || '',
    customMessage: opts.customMessage || cfg?.paymentMessage || '',
    appName: APP_NAME,
  };
  return sendEmail({
    to: opts.to,
    subject: `Payment confirmed — ${opts.planName} plan activated! ✅`,
    html: paymentSuccessEmailHtml(data),
    text: paymentSuccessEmailText(data),
  });
}

export async function sendPaymentFailedEmail(opts: {
  to: string;
  name: string;
  orderId: string;
}): Promise<{ ok: boolean; error?: string }> {
  const cfg = await getSystemSmtp();
  const data: EmailTemplateData = {
    userName: opts.name,
    userEmail: opts.to,
    orderId: opts.orderId,
    dashboardUrl: `${getAppUrl()}/`,
    supportEmail: cfg?.fromEmail || cfg?.user || '',
    appName: APP_NAME,
  };
  return sendEmail({
    to: opts.to,
    subject: `Payment unsuccessful — ${APP_NAME}`,
    html: paymentFailedEmailHtml(data),
  });
}

export async function sendTestEmail(opts: {
  to: string;
}): Promise<{ ok: boolean; error?: string }> {
  const data: EmailTemplateData = { appName: APP_NAME };
  return sendEmail({
    to: opts.to,
    subject: `[Test] SMTP configured correctly — ${APP_NAME}`,
    html: testEmailHtml(data),
  });
}
