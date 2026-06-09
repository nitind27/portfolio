/**
 * System-level email sender.
 * Reads SMTP config from:
 *   1. Database (system_settings table) — set via admin panel
 *   2. .env fallback (SYSTEM_SMTP_* vars)
 *
 * Used for: welcome emails, payment confirmations, etc.
 */
import nodemailer from 'nodemailer';
import type { RowDataPacket } from 'mysql2';
import { getPool } from './db';
import { APP_NAME, SUPPORT_EMAIL, brand } from './brand';
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
let emailSchemaReady = false;

export async function ensureEmailTrackingSchema() {
  if (emailSchemaReady) return;
  const pool = getPool();
  const exec = (sql: string) => pool.execute(sql).catch((err: { code?: string }) => {
    if (err?.code !== 'ER_DUP_FIELDNAME') throw err;
  });
  await exec(`ALTER TABLE users ADD COLUMN welcome_email_sent_at DATETIME NULL AFTER created_at`);
  await exec(`ALTER TABLE payments ADD COLUMN confirmation_email_sent_at DATETIME NULL AFTER paid_at`);
  emailSchemaReady = true;
}

export async function isSmtpConfigured(): Promise<boolean> {
  const cfg = await getSystemSmtp();
  return Boolean(cfg?.enabled && cfg.host && cfg.user && cfg.password);
}

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
  replyTo?: string;
}): Promise<{ ok: boolean; error?: string }> {
  try {
    const cfg = await getSystemSmtp();
    if (!cfg || !cfg.enabled || !cfg.host || !cfg.user || !cfg.password) {
      return { ok: false, error: 'System SMTP not configured' };
    }
    const transporter = buildTransporter(cfg);
    await transporter.sendMail({
      from: `"${cfg.fromName || APP_NAME}" <${cfg.fromEmail || cfg.user}>`,
      to: opts.to,
      replyTo: opts.replyTo,
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
  try {
    const cfg = await getSystemSmtp();
    if (!cfg || !cfg.enabled || !cfg.host || !cfg.user || !cfg.password) {
      return { ok: false, error: 'System SMTP not configured' };
    }
    const transporter = buildTransporter(cfg);
    await transporter.verify();
    const data: EmailTemplateData = { appName: APP_NAME };
    await transporter.sendMail({
      from: `"${cfg.fromName || APP_NAME}" <${cfg.fromEmail || cfg.user}>`,
      to: opts.to,
      subject: `[Test] SMTP configured correctly — ${APP_NAME}`,
      html: testEmailHtml(data),
    });
    return { ok: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Test email failed';
    console.error('[SystemEmail] test error:', message);
    return { ok: false, error: message };
  }
}

/** Send welcome email once per user (register / Google sign-up). */
export async function sendWelcomeEmailIfNeeded(userId: number): Promise<{ ok: boolean; error?: string; skipped?: string }> {
  await ensureEmailTrackingSchema();
  const pool = getPool();
  const [rows] = await pool.execute<RowDataPacket[]>(
    'SELECT id, name, email, welcome_email_sent_at FROM users WHERE id = ? LIMIT 1',
    [userId],
  );
  const row = rows[0] as { name: string; email: string; welcome_email_sent_at: Date | null } | undefined;
  if (!row?.email) return { ok: false, error: 'User not found' };
  if (row.welcome_email_sent_at) return { ok: true, skipped: 'already_sent' };

  const result = await sendWelcomeEmail({ to: row.email, name: row.name });
  if (result.ok) {
    await pool.execute('UPDATE users SET welcome_email_sent_at = NOW() WHERE id = ?', [userId]);
    console.info('[SystemEmail] welcome sent to', row.email);
  } else {
    console.error('[SystemEmail] welcome failed for user', userId, result.error);
  }
  return result;
}

/** Send payment confirmation once per order (retries if previously failed). */
export async function sendPaymentConfirmationIfNeeded(orderId: string): Promise<{ ok: boolean; error?: string; skipped?: string }> {
  await ensureEmailTrackingSchema();
  const pool = getPool();
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT p.order_id, p.amount, p.status, p.confirmation_email_sent_at,
            u.email, u.name, sp.name AS plan_name
     FROM payments p
     JOIN users u ON u.id = p.user_id
     LEFT JOIN subscription_plans sp ON sp.id = p.plan_id
     WHERE p.order_id = ? LIMIT 1`,
    [orderId],
  );
  const row = rows[0] as {
    amount: number;
    status: string;
    confirmation_email_sent_at: Date | null;
    email: string;
    name: string;
    plan_name: string | null;
  } | undefined;

  if (!row) return { ok: false, error: 'Order not found' };
  if (row.status !== 'paid') return { ok: false, skipped: 'not_paid' };
  if (row.confirmation_email_sent_at) return { ok: true, skipped: 'already_sent' };

  const result = await sendPaymentSuccessEmail({
    to: row.email,
    name: row.name,
    planName: row.plan_name || 'Premium',
    amount: Number(row.amount),
    orderId,
  });

  if (result.ok) {
    await pool.execute(
      'UPDATE payments SET confirmation_email_sent_at = NOW() WHERE order_id = ?',
      [orderId],
    );
    console.info('[SystemEmail] payment confirmation sent for', orderId, '→', row.email);
  } else {
    console.error('[SystemEmail] payment confirmation failed for', orderId, result.error);
  }
  return result;
}

export type SupportTicketType = 'complaint' | 'feedback' | 'bug' | 'billing' | 'other';

const TICKET_LABELS: Record<SupportTicketType, string> = {
  complaint: 'Complaint',
  feedback: 'Feedback',
  bug: 'Bug Report',
  billing: 'Billing Issue',
  other: 'Other',
};

function escapeHtml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** User complaint / feedback → support inbox */
export async function sendSupportTicket(opts: {
  type: SupportTicketType;
  name: string;
  email: string;
  subject: string;
  message: string;
  orderId?: string;
  userId?: number;
}): Promise<{ ok: boolean; error?: string }> {
  const typeLabel = TICKET_LABELS[opts.type] || 'Support';
  const subjectLine = `[${APP_NAME} ${typeLabel}] ${opts.subject}`.slice(0, 180);
  const appUrl = getAppUrl();

  const html = `
    <div style="font-family:system-ui,sans-serif;max-width:640px;margin:0 auto;padding:24px;background:#f8fafc;border-radius:12px;">
      <div style="background:linear-gradient(135deg,${brand.navy},${brand.steel});color:#fff;padding:20px 24px;border-radius:10px;margin-bottom:20px;">
        <p style="margin:0;font-size:12px;opacity:0.85;text-transform:uppercase;letter-spacing:0.08em;">${escapeHtml(APP_NAME)} Support</p>
        <h1 style="margin:8px 0 0;font-size:20px;">${escapeHtml(typeLabel)}</h1>
      </div>
      <table style="width:100%;border-collapse:collapse;font-size:14px;color:#334155;">
        <tr><td style="padding:8px 0;font-weight:600;width:120px;vertical-align:top;">From</td><td style="padding:8px 0;">${escapeHtml(opts.name)}</td></tr>
        <tr><td style="padding:8px 0;font-weight:600;">Email</td><td style="padding:8px 0;"><a href="mailto:${escapeHtml(opts.email)}">${escapeHtml(opts.email)}</a></td></tr>
        <tr><td style="padding:8px 0;font-weight:600;">Type</td><td style="padding:8px 0;">${escapeHtml(typeLabel)}</td></tr>
        ${opts.orderId ? `<tr><td style="padding:8px 0;font-weight:600;">Order ID</td><td style="padding:8px 0;font-family:monospace;">${escapeHtml(opts.orderId)}</td></tr>` : ''}
        ${opts.userId ? `<tr><td style="padding:8px 0;font-weight:600;">User ID</td><td style="padding:8px 0;">#${opts.userId}</td></tr>` : ''}
        <tr><td style="padding:8px 0;font-weight:600;">Subject</td><td style="padding:8px 0;">${escapeHtml(opts.subject)}</td></tr>
      </table>
      <div style="margin-top:20px;padding:16px 18px;background:#fff;border-radius:8px;border-left:4px solid ${brand.accent};">
        <p style="margin:0 0 8px;font-weight:600;color:#475569;font-size:13px;">Message</p>
        <p style="margin:0;line-height:1.7;color:#1e293b;white-space:pre-wrap;">${escapeHtml(opts.message)}</p>
      </div>
      <p style="margin-top:20px;font-size:12px;color:#94a3b8;">Submitted via <a href="${appUrl}/support">${appUrl}/support</a></p>
    </div>
  `;

  const text = [
    `${APP_NAME} ${typeLabel}`,
    `From: ${opts.name} <${opts.email}>`,
    opts.orderId ? `Order: ${opts.orderId}` : '',
    opts.userId ? `User ID: ${opts.userId}` : '',
    `Subject: ${opts.subject}`,
    '',
    opts.message,
  ].filter(Boolean).join('\n');

  const result = await sendEmail({
    to: SUPPORT_EMAIL,
    replyTo: opts.email,
    subject: subjectLine,
    html,
    text,
  });

  if (result.ok) {
    await sendEmail({
      to: opts.email,
      subject: `We received your ${typeLabel.toLowerCase()} — ${APP_NAME}`,
      html: `
        <div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;padding:24px;">
          <h2 style="color:${brand.navy};">Thank you, ${escapeHtml(opts.name)}</h2>
          <p style="color:#475569;line-height:1.7;">We received your <strong>${escapeHtml(typeLabel.toLowerCase())}</strong> and our team will review it shortly.</p>
          <p style="color:#475569;line-height:1.7;">Typical response time: <strong>24–48 hours</strong> on business days.</p>
          <p style="color:#94a3b8;font-size:13px;margin-top:24px;">Reference: ${escapeHtml(opts.subject)}</p>
          <p style="color:#94a3b8;font-size:13px;">— ${escapeHtml(APP_NAME)} Support</p>
        </div>
      `,
      text: `Thank you ${opts.name}. We received your ${typeLabel.toLowerCase()} and will respond within 24-48 hours.\n\nReference: ${opts.subject}\n— ${APP_NAME} Support`,
    }).catch(() => {});
  }

  return result;
}
