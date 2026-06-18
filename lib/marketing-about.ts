import type { RowDataPacket } from 'mysql2';
import { getPool } from './db';
import { APP_NAME, APP_DESCRIPTION, APP_TAGLINE, STORAGE_POLICY_DAYS } from './brand';
import { company } from './company';
import { normalizeSeo, type MarketingSeoFields } from './marketing-seo';

export interface AboutStat {
  value: string;
  label: string;
}

export interface AboutValue {
  title: string;
  description: string;
}

export interface MarketingAboutContent {
  heroBadge: string;
  heroTitle: string;
  heroSubtitle: string;
  heroBody: string;
  missionTitle: string;
  missionBody: string;
  whatWeDoTitle: string;
  whatWeDoBody: string;
  offeringsTitle: string;
  offerings: string[];
  valuesTitle: string;
  values: AboutValue[];
  stats: AboutStat[];
  seo: MarketingSeoFields;
}

const SETTINGS_KEY = 'marketing_about';

export const DEFAULT_ABOUT: MarketingAboutContent = {
  heroBadge: `Est. ${company.foundedYear} · ${company.country}`,
  heroTitle: 'We help anyone build a professional website — without writing code.',
  heroSubtitle: APP_TAGLINE,
  heroBody: `${APP_DESCRIPTION} ${APP_NAME} (${company.website.replace(/^https?:\/\//, '')}) is a visual platform where creators, freelancers, and businesses design, preview, and launch online.`,
  missionTitle: 'Our mission',
  missionBody: `${company.tagline} We believe every business deserves a beautiful, fast website — whether you're a freelancer, restaurant, clinic, or startup. ${APP_NAME} removes the technical barrier so you can focus on your story, not on code.`,
  whatWeDoTitle: 'What we do',
  whatWeDoBody: `${company.legalName} operates a ${company.serviceCategory.toLowerCase()}. Users create portfolios and business websites using our section-based editor, publish shareable links, and upgrade to export production-ready code or deploy to hosting.`,
  offeringsTitle: `What ${APP_NAME} offers`,
  offerings: [
    'Visual drag-and-drop builder with live preview on desktop & mobile',
    'Theme, navbar, footer, popup, SEO, social links & SMTP panels',
    `Free ${STORAGE_POLICY_DAYS}-day public share links for every account`,
    'Premium export (HTML, React, Next.js) and Hostinger deploy',
    `Secure one-time payments via ${company.paymentPartner}`,
  ],
  valuesTitle: 'Our values',
  values: [
    { title: 'Ship fast', description: 'From template to live site in minutes — not weeks.' },
    { title: 'Launch anywhere', description: 'Share a link, export code, or deploy to your own domain.' },
    { title: 'Own your work', description: 'Export full HTML, React, or Next.js — no lock-in.' },
    { title: 'Built for everyone', description: 'Freelancers, shops, clinics, agencies — no coding required.' },
  ],
  stats: [
    { value: '70+', label: 'Templates' },
    { value: '15+', label: 'Section types' },
    { value: `${STORAGE_POLICY_DAYS}d`, label: 'Free sharing' },
    { value: '₹99', label: 'Premium from' },
  ],
  seo: normalizeSeo(null, {
    title: `About Us — ${APP_NAME}`,
    description: `${company.description} Learn about ${company.legalName} and our mission.`,
    path: '/about',
  }),
};

let cache: { data: MarketingAboutContent; at: number } | null = null;
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

function normalizeList(items: unknown, fallback: string[]): string[] {
  if (!Array.isArray(items)) return fallback;
  const list = items.map(i => String(i).trim()).filter(Boolean).slice(0, 20);
  return list.length ? list : fallback;
}

function normalizeValues(items: unknown, fallback: AboutValue[]): AboutValue[] {
  if (!Array.isArray(items)) return fallback;
  const list = items
    .map(v => ({
      title: String((v as AboutValue)?.title || '').trim().slice(0, 80),
      description: String((v as AboutValue)?.description || '').trim().slice(0, 300),
    }))
    .filter(v => v.title)
    .slice(0, 8);
  return list.length ? list : fallback;
}

function normalizeStats(items: unknown, fallback: AboutStat[]): AboutStat[] {
  if (!Array.isArray(items)) return fallback;
  const list = items
    .map(s => ({
      value: String((s as AboutStat)?.value || '').trim().slice(0, 20),
      label: String((s as AboutStat)?.label || '').trim().slice(0, 60),
    }))
    .filter(s => s.value && s.label)
    .slice(0, 8);
  return list.length ? list : fallback;
}

function normalize(raw: Partial<MarketingAboutContent> | null | undefined): MarketingAboutContent {
  const base = DEFAULT_ABOUT;
  return {
    heroBadge: String(raw?.heroBadge ?? base.heroBadge).slice(0, 120),
    heroTitle: String(raw?.heroTitle ?? base.heroTitle).slice(0, 300),
    heroSubtitle: String(raw?.heroSubtitle ?? base.heroSubtitle).slice(0, 200),
    heroBody: String(raw?.heroBody ?? base.heroBody).slice(0, 2000),
    missionTitle: String(raw?.missionTitle ?? base.missionTitle).slice(0, 120),
    missionBody: String(raw?.missionBody ?? base.missionBody).slice(0, 2000),
    whatWeDoTitle: String(raw?.whatWeDoTitle ?? base.whatWeDoTitle).slice(0, 120),
    whatWeDoBody: String(raw?.whatWeDoBody ?? base.whatWeDoBody).slice(0, 2000),
    offeringsTitle: String(raw?.offeringsTitle ?? base.offeringsTitle).slice(0, 200),
    offerings: normalizeList(raw?.offerings, base.offerings),
    valuesTitle: String(raw?.valuesTitle ?? base.valuesTitle).slice(0, 120),
    values: normalizeValues(raw?.values, base.values),
    stats: normalizeStats(raw?.stats, base.stats),
    seo: normalizeSeo(raw?.seo, {
      title: base.seo.title,
      description: base.seo.description,
      path: '/about',
    }),
  };
}

export function invalidateAboutCache() {
  cache = null;
}

export async function getMarketingAbout(): Promise<MarketingAboutContent> {
  if (cache && Date.now() - cache.at < CACHE_MS) return cache.data;
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
    return { ...DEFAULT_ABOUT };
  }
}

export async function saveMarketingAbout(updates: Partial<MarketingAboutContent>): Promise<MarketingAboutContent> {
  await ensureSettingsTable();
  const current = await getMarketingAbout();
  const next = normalize({ ...current, ...updates });
  const pool = getPool();
  await pool.execute(
    `INSERT INTO system_settings (\`key\`, \`value\`) VALUES (?, ?)
     ON DUPLICATE KEY UPDATE \`value\` = VALUES(\`value\`)`,
    [SETTINGS_KEY, JSON.stringify(next)],
  );
  invalidateAboutCache();
  return next;
}
