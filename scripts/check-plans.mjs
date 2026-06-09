import fs from 'fs';
import mysql from 'mysql2/promise';

const env = Object.fromEntries(
  fs.readFileSync('.env.local', 'utf8')
    .split('\n')
    .filter(l => l && !l.startsWith('#') && l.includes('='))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; }),
);
process.env = { ...process.env, ...env };

const conn = await mysql.createConnection({
  host: process.env.MYSQL_HOST,
  port: Number(process.env.MYSQL_PORT || 3306),
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
});

const [rows] = await conn.execute(
  `SELECT id, slug, name, price, tier, is_active, is_default, features
   FROM subscription_plans ORDER BY tier, id`,
);

console.log('=== subscription_plans ===');
for (const r of rows) {
  const features = typeof r.features === 'string' ? JSON.parse(r.features) : r.features;
  console.log({
    id: r.id,
    slug: r.slug,
    name: r.name,
    price: Number(r.price),
    tier: r.tier,
    active: Boolean(r.is_active),
    default: Boolean(r.is_default),
    slots: features?.unlockedPortfolios,
    exportHtml: features?.exportHtml,
  });
}

const [inactive] = await conn.execute(
  `SELECT slug, name, is_active FROM subscription_plans WHERE slug NOT IN ('free', 'pro')`,
);
if (inactive.length) {
  console.log('\n=== retired / other plans ===');
  inactive.forEach(r => console.log({ slug: r.slug, name: r.name, active: Boolean(r.is_active) }));
}

const [users] = await conn.execute(
  `SELECT sp.slug, sp.name, COUNT(u.id) AS user_count
   FROM users u
   LEFT JOIN subscription_plans sp ON sp.id = u.plan_id
   GROUP BY sp.slug, sp.name`,
);
console.log('\n=== users by plan ===');
users.forEach(r => console.log({ plan: r.slug || 'none', name: r.name, users: r.user_count }));

await conn.end();
