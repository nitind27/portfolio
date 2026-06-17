import mysql from 'mysql2/promise';
import { readFileSync, existsSync } from 'fs';

function loadEnv() {
  for (const file of ['.env.local', '.env']) {
    if (!existsSync(file)) continue;
    for (const line of readFileSync(file, 'utf8').split('\n')) {
      const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
    }
  }
}

loadEnv();

const conn = await mysql.createConnection({
  host: process.env.MYSQL_HOST || 'localhost',
  port: Number(process.env.MYSQL_PORT || 3306),
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'portfolio_builder',
});

const checks = [
  'site_analytics_events',
  'promo_grants',
  'system_settings',
];

for (const table of checks) {
  const [rows] = await conn.query(`SHOW TABLES LIKE '${table}'`);
  console.log(`${table}: ${rows.length ? 'EXISTS' : 'MISSING'}`);
}

const [promoSetting] = await conn.execute(
  "SELECT `key`, LEFT(`value`, 80) AS preview FROM system_settings WHERE `key` = 'promo_campaign' LIMIT 1",
);
if (promoSetting.length) {
  console.log('promo_campaign setting: EXISTS');
} else {
  console.log('promo_campaign setting: NOT YET (saved when admin configures promo)');
}

const [analyticsCount] = await conn.execute('SELECT COUNT(*) AS c FROM site_analytics_events').catch(() => [[{ c: 'N/A' }]]);
if (analyticsCount?.[0]) {
  console.log(`site_analytics_events rows: ${analyticsCount[0].c}`);
}

await conn.end();
