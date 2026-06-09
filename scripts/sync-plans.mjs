import fs from 'fs';
import mysql from 'mysql2/promise';

const env = Object.fromEntries(
  fs.readFileSync('.env.local', 'utf8')
    .split('\n')
    .filter(l => l && !l.startsWith('#') && l.includes('='))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; }),
);

const FREE_FEATURES = JSON.stringify({
  exportHtml: false, exportReact: false, exportNextjs: false,
  shareLink: true, publishOnline: true, hostingerDeploy: false,
  customCss: false, analytics: false, smtp: false, popupBuilder: true,
  sectionBlog: false, sectionTeam: false, sectionPricing: false,
  sectionFaq: true, sectionTestimonials: true, premiumLayouts: false,
  unlockedPortfolios: 0, storageDays: 7,
});

const PREMIUM_FEATURES = JSON.stringify({
  exportHtml: true, exportReact: true, exportNextjs: true,
  shareLink: true, publishOnline: true, hostingerDeploy: true,
  customCss: true, analytics: true, smtp: true, popupBuilder: true,
  sectionBlog: true, sectionTeam: true, sectionPricing: true,
  sectionFaq: true, sectionTestimonials: true, premiumLayouts: true,
  unlockedPortfolios: 1, storageDays: 365,
});

const premiumPrice = Number(env.PREMIUM_PRICE || env.NEXT_PUBLIC_PREMIUM_PRICE || 99);

const conn = await mysql.createConnection({
  host: env.MYSQL_HOST,
  port: Number(env.MYSQL_PORT || 3306),
  user: env.MYSQL_USER,
  password: env.MYSQL_PASSWORD,
  database: env.MYSQL_DATABASE,
});

console.log('Syncing canonical plans...');

await conn.execute(
  `UPDATE subscription_plans SET name='Free', tier=0, is_default=1, is_active=1, features=? WHERE slug='free'`,
  [FREE_FEATURES],
);

await conn.execute(
  `UPDATE subscription_plans SET name='Premium', description='Export, share, publish and deploy one portfolio slot.', price=?, tier=1, is_active=1, is_default=0, features=? WHERE slug='pro'`,
  [premiumPrice, PREMIUM_FEATURES],
);

await conn.execute(`UPDATE subscription_plans SET is_active=0, is_default=0 WHERE slug='business'`);

const [migrated] = await conn.execute(
  `UPDATE users u
   INNER JOIN subscription_plans bp ON u.plan_id = bp.id AND bp.slug = 'business'
   INNER JOIN subscription_plans pp ON pp.slug = 'pro'
   SET u.plan_id = pp.id, u.is_premium = 1`,
);
console.log('Business users migrated:', migrated.affectedRows);

const [rows] = await conn.execute(
  `SELECT id, slug, name, price, tier, is_active, is_default FROM subscription_plans ORDER BY tier`,
);
console.log('\nAfter sync:');
rows.forEach(r => console.log({
  slug: r.slug, name: r.name, price: Number(r.price), active: Boolean(r.is_active), default: Boolean(r.is_default),
}));

await conn.end();
console.log('\nDone.');
