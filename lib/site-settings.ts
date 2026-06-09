import type { RowDataPacket } from 'mysql2';
import { getPool } from './db';

export interface SiteSettings {
  maintenanceMode: boolean;
  maintenanceTitle: string;
  maintenanceMessage: string;
  maintenanceEta: string;
  /** Logged-in admins can browse the site while maintenance is on */
  allowAdminBypass: boolean;
}

const SETTINGS_KEY = 'site_settings';

const DEFAULTS: SiteSettings = {
  maintenanceMode: false,
  maintenanceTitle: 'We\'ll be back soon',
  maintenanceMessage: 'site99 is undergoing scheduled maintenance to improve your experience. Thank you for your patience.',
  maintenanceEta: 'We expect to be back online shortly.',
  allowAdminBypass: true,
};

let cache: { data: SiteSettings; at: number } | null = null;
const CACHE_MS = 15_000;

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

function normalize(raw: Partial<SiteSettings> | null | undefined): SiteSettings {
  return {
    maintenanceMode: Boolean(raw?.maintenanceMode),
    maintenanceTitle: String(raw?.maintenanceTitle || DEFAULTS.maintenanceTitle).slice(0, 200),
    maintenanceMessage: String(raw?.maintenanceMessage || DEFAULTS.maintenanceMessage).slice(0, 2000),
    maintenanceEta: String(raw?.maintenanceEta || DEFAULTS.maintenanceEta).slice(0, 200),
    allowAdminBypass: raw?.allowAdminBypass !== false,
  };
}

export function invalidateSiteSettingsCache() {
  cache = null;
}

export async function getSiteSettings(): Promise<SiteSettings> {
  if (cache && Date.now() - cache.at < CACHE_MS) {
    return cache.data;
  }

  try {
    await ensureSettingsTable();
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

export async function saveSiteSettings(updates: Partial<SiteSettings>): Promise<SiteSettings> {
  await ensureSettingsTable();
  const current = await getSiteSettings();
  const next = normalize({ ...current, ...updates });
  const pool = getPool();
  await pool.execute(
    `INSERT INTO system_settings (\`key\`, \`value\`) VALUES (?, ?)
     ON DUPLICATE KEY UPDATE \`value\` = VALUES(\`value\`)`,
    [SETTINGS_KEY, JSON.stringify(next)],
  );
  invalidateSiteSettingsCache();
  return next;
}

export async function getPublicSiteStatus() {
  const s = await getSiteSettings();
  return {
    maintenanceMode: s.maintenanceMode,
    maintenanceTitle: s.maintenanceTitle,
    maintenanceMessage: s.maintenanceMessage,
    maintenanceEta: s.maintenanceEta,
    allowAdminBypass: s.allowAdminBypass,
  };
}
