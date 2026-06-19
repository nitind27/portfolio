import type { RowDataPacket } from 'mysql2';
import { getPool } from './db';

export type IncompleteStatus = 'no_project' | 'draft_only' | 'mixed';

export interface IncompleteUserRow {
  id: number;
  name: string;
  email: string;
  phone: string;
  createdAt: string;
  totalProjects: number;
  draftCount: number;
  publishedCount: number;
  draftNames: string[];
  lastActivity: string | null;
  lastOutreachAt: string | null;
  outreachCount: number;
  status: IncompleteStatus;
}

export interface OutreachEmailLog {
  id: number;
  userId: number;
  adminId: number | null;
  subject: string;
  message: string;
  templateId: string | null;
  sentAt: string;
}

let schemaReady = false;

export async function ensureOutreachSchema() {
  if (schemaReady) return;
  const pool = getPool();
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS outreach_emails (
      id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      user_id INT UNSIGNED NOT NULL,
      admin_id INT UNSIGNED NULL,
      subject VARCHAR(300) NOT NULL,
      message TEXT NOT NULL,
      template_id VARCHAR(50) NULL,
      sent_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      KEY idx_outreach_user (user_id),
      KEY idx_outreach_sent (sent_at),
      CONSTRAINT fk_outreach_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `).catch(() => {});
  schemaReady = true;
}

function mapStatus(draftCount: number, publishedCount: number, totalProjects: number): IncompleteStatus {
  if (totalProjects === 0) return 'no_project';
  if (publishedCount === 0) return 'draft_only';
  return 'mixed';
}

export async function getIncompleteWebsiteUsers(opts?: {
  filter?: 'all' | 'no_project' | 'draft' | 'not_contacted';
  search?: string;
  limit?: number;
}): Promise<IncompleteUserRow[]> {
  await ensureOutreachSchema();
  const pool = getPool();
  const filter = opts?.filter || 'all';
  const search = (opts?.search || '').trim().toLowerCase();
  const limit = Math.min(Math.max(opts?.limit || 200, 1), 500);

  const having: string[] = [];
  if (filter === 'no_project') having.push('total_projects = 0');
  else if (filter === 'draft') having.push('draft_count > 0');
  else having.push('(total_projects = 0 OR draft_count > 0)');

  if (filter === 'not_contacted') having.push('outreach_count = 0');

  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT
       u.id, u.name, u.email, u.phone, u.created_at,
       COUNT(up.id) AS total_projects,
       COALESCE(SUM(CASE WHEN up.published = 0 THEN 1 ELSE 0 END), 0) AS draft_count,
       COALESCE(SUM(CASE WHEN up.published = 1 THEN 1 ELSE 0 END), 0) AS published_count,
       MAX(up.updated_at) AS last_project_activity,
       GROUP_CONCAT(CASE WHEN up.published = 0 THEN up.name END SEPARATOR '|||') AS draft_names_raw,
       (SELECT COUNT(*) FROM outreach_emails oe WHERE oe.user_id = u.id) AS outreach_count,
       (SELECT MAX(sent_at) FROM outreach_emails oe WHERE oe.user_id = u.id) AS last_outreach_at
     FROM users u
     LEFT JOIN user_projects up ON up.user_id = u.id
     WHERE u.role = 'user'
     GROUP BY u.id
     HAVING ${having.join(' AND ')}
     ORDER BY COALESCE(last_project_activity, u.created_at) DESC
     LIMIT ?`,
    [limit],
  );

  let result = rows.map(r => {
    const totalProjects = Number(r.total_projects || 0);
    const draftCount = Number(r.draft_count || 0);
    const publishedCount = Number(r.published_count || 0);
    const draftNamesRaw = r.draft_names_raw ? String(r.draft_names_raw) : '';
    const draftNames = draftNamesRaw ? draftNamesRaw.split('|||').filter(Boolean) : [];

    return {
      id: Number(r.id),
      name: String(r.name),
      email: String(r.email),
      phone: String(r.phone || ''),
      createdAt: new Date(r.created_at as Date).toISOString(),
      totalProjects,
      draftCount,
      publishedCount,
      draftNames,
      lastActivity: r.last_project_activity
        ? new Date(r.last_project_activity as Date).toISOString()
        : null,
      lastOutreachAt: r.last_outreach_at
        ? new Date(r.last_outreach_at as Date).toISOString()
        : null,
      outreachCount: Number(r.outreach_count || 0),
      status: mapStatus(draftCount, publishedCount, totalProjects),
    };
  });

  if (search) {
    result = result.filter(u =>
      u.name.toLowerCase().includes(search)
      || u.email.toLowerCase().includes(search)
      || u.phone.includes(search)
      || u.draftNames.some(n => n.toLowerCase().includes(search)),
    );
  }

  return result;
}

export async function getOutreachStats(): Promise<{
  totalIncomplete: number;
  noProject: number;
  draftOnly: number;
  notContacted: number;
  contactedThisWeek: number;
}> {
  const all = await getIncompleteWebsiteUsers({ limit: 500 });
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  return {
    totalIncomplete: all.length,
    noProject: all.filter(u => u.status === 'no_project').length,
    draftOnly: all.filter(u => u.status === 'draft_only').length,
    notContacted: all.filter(u => u.outreachCount === 0).length,
    contactedThisWeek: all.filter(u => u.lastOutreachAt && new Date(u.lastOutreachAt).getTime() >= weekAgo).length,
  };
}

export async function logOutreachEmail(opts: {
  userId: number;
  adminId?: number | null;
  subject: string;
  message: string;
  templateId?: string | null;
}) {
  await ensureOutreachSchema();
  const pool = getPool();
  await pool.execute(
    `INSERT INTO outreach_emails (user_id, admin_id, subject, message, template_id, sent_at)
     VALUES (?, ?, ?, ?, ?, NOW())`,
    [opts.userId, opts.adminId ?? null, opts.subject.slice(0, 300), opts.message, opts.templateId ?? null],
  );
}

export async function getUserOutreachHistory(userId: number): Promise<OutreachEmailLog[]> {
  await ensureOutreachSchema();
  const pool = getPool();
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT id, user_id, admin_id, subject, message, template_id, sent_at
     FROM outreach_emails WHERE user_id = ? ORDER BY sent_at DESC LIMIT 20`,
    [userId],
  );
  return rows.map(r => ({
    id: Number(r.id),
    userId: Number(r.user_id),
    adminId: r.admin_id != null ? Number(r.admin_id) : null,
    subject: String(r.subject),
    message: String(r.message),
    templateId: r.template_id ? String(r.template_id) : null,
    sentAt: new Date(r.sent_at as Date).toISOString(),
  }));
}
