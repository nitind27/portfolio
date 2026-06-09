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

await conn.execute(`ALTER TABLE users ADD COLUMN welcome_email_sent_at DATETIME NULL`).catch(() => {});
await conn.execute(`ALTER TABLE payments ADD COLUMN confirmation_email_sent_at DATETIME NULL`).catch(() => {});

const [smtpRows] = await conn.execute(
  "SELECT `value` FROM system_settings WHERE `key` = 'system_smtp' LIMIT 1",
).catch(() => [[]]);

let smtp = null;
if (smtpRows[0]?.value) {
  smtp = JSON.parse(smtpRows[0].value);
  smtp = { ...smtp, password: smtp.password ? '***' : '(empty)' };
}

const [paidPending] = await conn.execute(
  `SELECT COUNT(*) AS c FROM payments WHERE status = 'paid' AND confirmation_email_sent_at IS NULL`,
);
const [welcomePending] = await conn.execute(
  `SELECT COUNT(*) AS c FROM users WHERE welcome_email_sent_at IS NULL`,
);

console.log('=== SMTP config ===');
console.log(smtp ? { host: smtp.host, user: smtp.user, enabled: smtp.enabled, from: smtp.fromEmail } : 'NOT CONFIGURED in database');
console.log('SYSTEM_SMTP_HOST env:', env.SYSTEM_SMTP_HOST || '(not set)');
console.log('\n=== Pending emails ===');
console.log('Paid orders without confirmation email:', paidPending[0].c);
console.log('Users without welcome email:', welcomePending[0].c);

await conn.end();
