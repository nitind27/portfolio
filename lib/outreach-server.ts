import type { RowDataPacket } from 'mysql2';
import { getPool } from './db';

export type OutreachUserStatus = 'no_project' | 'draft_only' | 'mixed' | 'published';

export type OutreachFilter =
  | 'all_users'
  | 'incomplete'
  | 'no_project'
  | 'draft'
  | 'published'
  | 'premium'
  | 'not_contacted';

export interface OutreachUserRow {
  id: number;
  name: string;
  email: string;
  phone: string;
  createdAt: string;
  isPremium: boolean;
  planName: string | null;
  totalProjects: number;
  draftCount: number;
  publishedCount: number;
  draftNames: string[];
  publishedNames: string[];
  lastActivity: string | null;
  lastOutreachAt: string | null;
  outreachCount: number;
  status: OutreachUserStatus;
}

/** @deprecated use OutreachUserRow */
export type IncompleteUserRow = OutreachUserRow;

export interface OutreachEmailLog {
  id: number;
  userId: number;
  adminId: number | null;
  subject: string;
  message: string;
  templateId: string | null;
  sentAt: string;
}

export interface OutreachStats {
  totalUsers: number;
  totalIncomplete: number;
  noProject: number;
  draftOnly: number;
  published: number;
  premium: number;
  notContacted: number;
  contactedThisWeek: number;
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

function mapStatus(draftCount: number, publishedCount: number, totalProjects: number): OutreachUserStatus {
  if (totalProjects === 0) return 'no_project';
  if (publishedCount > 0 && draftCount === 0) return 'published';
  if (publishedCount === 0) return 'draft_only';
  return 'mixed';
}

function mapRow(r: RowDataPacket): OutreachUserRow {
  const totalProjects = Number(r.total_projects || 0);
  const draftCount = Number(r.draft_count || 0);
  const publishedCount = Number(r.published_count || 0);
  const draftNamesRaw = r.draft_names_raw ? String(r.draft_names_raw) : '';
  const publishedNamesRaw = r.published_names_raw ? String(r.published_names_raw) : '';

  return {
    id: Number(r.id),
    name: String(r.name),
    email: String(r.email),
    phone: String(r.phone || ''),
    createdAt: new Date(r.created_at as Date).toISOString(),
    isPremium: Boolean(r.is_premium),
    planName: r.plan_name ? String(r.plan_name) : null,
    totalProjects,
    draftCount,
    publishedCount,
    draftNames: draftNamesRaw ? draftNamesRaw.split('|||').filter(Boolean) : [],
    publishedNames: publishedNamesRaw ? publishedNamesRaw.split('|||').filter(Boolean) : [],
    lastActivity: r.last_project_activity
      ? new Date(r.last_project_activity as Date).toISOString()
      : null,
    lastOutreachAt: r.last_outreach_at
      ? new Date(r.last_outreach_at as Date).toISOString()
      : null,
    outreachCount: Number(r.outreach_count || 0),
    status: mapStatus(draftCount, publishedCount, totalProjects),
  };
}

const BASE_SELECT = `
  SELECT
    u.id, u.name, u.email, u.phone, u.created_at, u.is_premium,
    sp.name AS plan_name,
    COUNT(up.id) AS total_projects,
    COALESCE(SUM(CASE WHEN up.published = 0 THEN 1 ELSE 0 END), 0) AS draft_count,
    COALESCE(SUM(CASE WHEN up.published = 1 THEN 1 ELSE 0 END), 0) AS published_count,
    MAX(up.updated_at) AS last_project_activity,
    GROUP_CONCAT(CASE WHEN up.published = 0 THEN up.name END SEPARATOR '|||') AS draft_names_raw,
    GROUP_CONCAT(CASE WHEN up.published = 1 THEN up.name END SEPARATOR '|||') AS published_names_raw,
    (SELECT COUNT(*) FROM outreach_emails oe WHERE oe.user_id = u.id) AS outreach_count,
    (SELECT MAX(sent_at) FROM outreach_emails oe WHERE oe.user_id = u.id) AS last_outreach_at
  FROM users u
  LEFT JOIN user_projects up ON up.user_id = u.id
  LEFT JOIN subscription_plans sp ON sp.id = u.plan_id
`;

export async function getOutreachUsers(opts?: {
  filter?: OutreachFilter;
  search?: string;
  limit?: number;
  userId?: number;
}): Promise<OutreachUserRow[]> {
  await ensureOutreachSchema();
  const pool = getPool();
  const filter = opts?.filter || 'all_users';
  const search = (opts?.search || '').trim().toLowerCase();
  const limit = Math.min(Math.max(opts?.limit || 500, 1), 1000);

  if (opts?.userId) {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `${BASE_SELECT} WHERE u.role = 'user' AND u.id = ? GROUP BY u.id LIMIT 1`,
      [opts.userId],
    );
    return rows[0] ? [mapRow(rows[0])] : [];
  }

  const where: string[] = [`u.role = 'user'`];
  const having: string[] = [];

  if (filter === 'premium') {
    where.push('u.is_premium = 1');
  } else if (filter === 'incomplete') {
    having.push('(total_projects = 0 OR draft_count > 0)');
  } else if (filter === 'no_project') {
    having.push('total_projects = 0');
  } else if (filter === 'draft') {
    having.push('draft_count > 0');
  } else if (filter === 'published') {
    having.push('published_count > 0');
  }

  if (filter === 'not_contacted') {
    having.push('outreach_count = 0');
  }

  const havingClause = having.length ? `HAVING ${having.join(' AND ')}` : '';

  const [rows] = await pool.execute<RowDataPacket[]>(
    `${BASE_SELECT}
     WHERE ${where.join(' AND ')}
     GROUP BY u.id
     ${havingClause}
     ORDER BY COALESCE(last_project_activity, u.created_at) DESC
     LIMIT ?`,
    [limit],
  );

  let result = rows.map(mapRow);

  if (search) {
    result = result.filter(u =>
      u.name.toLowerCase().includes(search)
      || u.email.toLowerCase().includes(search)
      || u.phone.includes(search)
      || u.planName?.toLowerCase().includes(search)
      || u.draftNames.some(n => n.toLowerCase().includes(search))
      || u.publishedNames.some(n => n.toLowerCase().includes(search)),
    );
  }

  return result;
}

/** @deprecated use getOutreachUsers */
export async function getIncompleteWebsiteUsers(opts?: {
  filter?: 'all' | 'no_project' | 'draft' | 'not_contacted';
  search?: string;
  limit?: number;
}): Promise<OutreachUserRow[]> {
  const filterMap: Record<string, OutreachFilter> = {
    all: 'incomplete',
    no_project: 'no_project',
    draft: 'draft',
    not_contacted: 'not_contacted',
  };
  return getOutreachUsers({
    filter: filterMap[opts?.filter || 'all'] || 'incomplete',
    search: opts?.search,
    limit: opts?.limit,
  });
}

export async function getOutreachStats(): Promise<OutreachStats> {
  const all = await getOutreachUsers({ filter: 'all_users', limit: 1000 });
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  return {
    totalUsers: all.length,
    totalIncomplete: all.filter(u => u.status !== 'published').length,
    noProject: all.filter(u => u.status === 'no_project').length,
    draftOnly: all.filter(u => u.status === 'draft_only').length,
    published: all.filter(u => u.status === 'published' || u.publishedCount > 0).length,
    premium: all.filter(u => u.isPremium).length,
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
     FROM outreach_emails WHERE user_id = ? ORDER BY sent_at DESC LIMIT 30`,
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
