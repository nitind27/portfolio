import fs from 'fs';
import mysql from 'mysql2/promise';

const env = Object.fromEntries(
  fs.readFileSync('.env.local', 'utf8')
    .split('\n')
    .filter(l => l && !l.startsWith('#') && l.includes('='))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; }),
);

const conn = await mysql.createConnection({
  host: env.MYSQL_HOST,
  user: env.MYSQL_USER,
  password: env.MYSQL_PASSWORD,
  database: env.MYSQL_DATABASE,
});

const [tables] = await conn.execute("SHOW TABLES LIKE 'system_settings'");
console.log('system_settings table:', tables.length ? 'EXISTS' : 'MISSING');

if (tables.length) {
  const [rows] = await conn.execute(
    'SELECT `key`, `value`, updated_at FROM system_settings ORDER BY `key`',
  );
  console.log('Total rows:', rows.length);
  for (const r of rows) {
    const preview = String(r.value).slice(0, 100);
    console.log(`\n[${r.key}] updated ${r.updated_at}`);
    console.log(preview + (String(r.value).length > 100 ? '...' : ''));
  }
  const site = rows.find(r => r.key === 'site_settings');
  if (site) {
    console.log('\n=== site_settings (parsed) ===');
    console.log(JSON.stringify(JSON.parse(site.value), null, 2));
  } else {
    console.log('\nsite_settings row: NOT YET SAVED (defaults used until admin saves in Website tab)');
  }
}

await conn.end();
