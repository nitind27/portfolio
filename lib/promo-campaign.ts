import type { RowDataPacket } from 'mysql2';
import { getPool } from './db';
import { getPlanBySlug } from './plans-server';

export interface PromoCampaignSettings {
  /** When true, all users get premium features — paid checkout disabled */
  paidPlanDisabled: boolean;
  /** Limited free premium slots for new registrations */
  freeGrantEnabled: boolean;
  freeGrantLimit: number;
  autoGrantOnRegister: boolean;
  /** Promo popup modal */
  modalEnabled: boolean;
  modalTitle: string;
  modalMessage: string;
  modalBadge: string;
  modalCtaText: string;
  modalCtaAction: 'register' | 'dashboard';
  showSlotsRemaining: boolean;
  showToLoggedIn: boolean;
}

const SETTINGS_KEY = 'promo_campaign';

const DEFAULTS: PromoCampaignSettings = {
  paidPlanDisabled: false,
  freeGrantEnabled: false,
  freeGrantLimit: 100,
  autoGrantOnRegister: true,
  modalEnabled: false,
  modalTitle: 'Limited time offer',
  modalMessage: 'Register now and get full premium access — export, deploy & share — completely free for the first 100 users!',
  modalBadge: 'FREE PREMIUM',
  modalCtaText: 'Claim free access',
  modalCtaAction: 'register',
  showSlotsRemaining: true,
  showToLoggedIn: false,
};

let cache: { data: PromoCampaignSettings; at: number } | null = null;
const CACHE_MS = 10_000;

let schemaReady = false;

async function ensurePromoSchema() {
  if (schemaReady) return;
  const pool = getPool();
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS system_settings (
      \`key\` VARCHAR(100) NOT NULL PRIMARY KEY,
      \`value\` LONGTEXT NOT NULL,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `).catch(() => {});
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS promo_grants (
      id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
      user_id INT UNSIGNED NOT NULL,
      grant_type VARCHAR(30) NOT NULL DEFAULT 'free_slot',
      granted_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY uq_user_grant (user_id, grant_type),
      INDEX idx_grant_type (grant_type)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `).catch(() => {});
  schemaReady = true;
}

function normalize(raw: Partial<PromoCampaignSettings> | null | undefined): PromoCampaignSettings {
  const limit = Math.max(1, Math.min(100000, Number(raw?.freeGrantLimit) || DEFAULTS.freeGrantLimit));
  return {
    paidPlanDisabled: Boolean(raw?.paidPlanDisabled),
    freeGrantEnabled: Boolean(raw?.freeGrantEnabled),
    freeGrantLimit: limit,
    autoGrantOnRegister: raw?.autoGrantOnRegister !== false,
    modalEnabled: Boolean(raw?.modalEnabled),
    modalTitle: String(raw?.modalTitle || DEFAULTS.modalTitle).slice(0, 200),
    modalMessage: String(raw?.modalMessage || DEFAULTS.modalMessage).slice(0, 3000),
    modalBadge: String(raw?.modalBadge || DEFAULTS.modalBadge).slice(0, 60),
    modalCtaText: String(raw?.modalCtaText || DEFAULTS.modalCtaText).slice(0, 80),
    modalCtaAction: raw?.modalCtaAction === 'dashboard' ? 'dashboard' : 'register',
    showSlotsRemaining: raw?.showSlotsRemaining !== false,
    showToLoggedIn: Boolean(raw?.showToLoggedIn),
  };
}

export function invalidatePromoCache() {
  cache = null;
}

export async function getPromoCampaignSettings(): Promise<PromoCampaignSettings> {
  if (cache && Date.now() - cache.at < CACHE_MS) {
    return cache.data;
  }
  try {
    await ensurePromoSchema();
    const pool = getPool();
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT `value` FROM system_settings WHERE `key` = ? LIMIT 1',
      [SETTINGS_KEY],
    );
    const row = rows[0] as { value: string } | undefined;
    const data = normalize(row?.value ? JSON.parse(row.value) : null);
    cache = { data, at: Date.now() };
    return data;
  } catch {
    return { ...DEFAULTS };
  }
}

export async function savePromoCampaignSettings(
  updates: Partial<PromoCampaignSettings>,
): Promise<PromoCampaignSettings> {
  await ensurePromoSchema();
  const current = await getPromoCampaignSettings();
  const next = normalize({ ...current, ...updates });
  const pool = getPool();
  await pool.execute(
    `INSERT INTO system_settings (\`key\`, \`value\`) VALUES (?, ?)
     ON DUPLICATE KEY UPDATE \`value\` = VALUES(\`value\`)`,
    [SETTINGS_KEY, JSON.stringify(next)],
  );
  invalidatePromoCache();
  return next;
}

export async function getPromoGrantCount(): Promise<number> {
  await ensurePromoSchema();
  const pool = getPool();
  const [[row]] = await pool.execute<RowDataPacket[]>(
    `SELECT COUNT(*) AS c FROM promo_grants WHERE grant_type = 'free_slot'`,
  );
  return Number(row?.c ?? 0);
}

export async function getPromoSlotsRemaining(): Promise<number> {
  const settings = await getPromoCampaignSettings();
  if (!settings.freeGrantEnabled) return 0;
  const used = await getPromoGrantCount();
  return Math.max(0, settings.freeGrantLimit - used);
}

export async function isPaidPlanGloballyDisabled(): Promise<boolean> {
  const s = await getPromoCampaignSettings();
  return s.paidPlanDisabled;
}

export async function tryGrantPromoFreeAccess(userId: number): Promise<boolean> {
  const settings = await getPromoCampaignSettings();
  if (!settings.freeGrantEnabled || !settings.autoGrantOnRegister) return false;

  const used = await getPromoGrantCount();
  if (used >= settings.freeGrantLimit) return false;

  const proPlan = await getPlanBySlug('pro');
  if (!proPlan) return false;

  const pool = getPool();
  await ensurePromoSchema();

  const [existing] = await pool.execute<RowDataPacket[]>(
    `SELECT id FROM promo_grants WHERE user_id = ? AND grant_type = 'free_slot' LIMIT 1`,
    [userId],
  );
  if (existing.length) return false;

  const [paidCheck] = await pool.execute<RowDataPacket[]>(
    `SELECT COUNT(*) AS c FROM payments WHERE user_id = ? AND status = 'paid'`,
    [userId],
  );
  if (Number(paidCheck[0]?.c) > 0) return false;

  await pool.execute(
    `UPDATE users SET plan_id = ?, is_premium = 1, premium_purchased_at = IFNULL(premium_purchased_at, NOW()) WHERE id = ?`,
    [proPlan.id, userId],
  );
  await pool.execute(
    `INSERT INTO promo_grants (user_id, grant_type) VALUES (?, 'free_slot')`,
    [userId],
  );
  return true;
}

export async function getPublicPromoStatus() {
  const settings = await getPromoCampaignSettings();
  const grantCount = await getPromoGrantCount();
  const slotsRemaining = Math.max(0, settings.freeGrantLimit - grantCount);

  return {
    paidPlanDisabled: settings.paidPlanDisabled,
    freeGrantEnabled: settings.freeGrantEnabled,
    freeGrantLimit: settings.freeGrantLimit,
    freeGrantCount: grantCount,
    slotsRemaining,
    grantsExhausted: settings.freeGrantEnabled && grantCount >= settings.freeGrantLimit,
    modal: settings.modalEnabled ? {
      title: settings.modalTitle,
      message: settings.modalMessage,
      badge: settings.modalBadge,
      ctaText: settings.modalCtaText,
      ctaAction: settings.modalCtaAction,
      showSlotsRemaining: settings.showSlotsRemaining,
      showToLoggedIn: settings.showToLoggedIn,
      slotsRemaining: settings.showSlotsRemaining ? slotsRemaining : undefined,
      freeGrantLimit: settings.showSlotsRemaining ? settings.freeGrantLimit : undefined,
    } : null,
  };
}
