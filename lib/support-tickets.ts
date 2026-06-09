import type { RowDataPacket, ResultSetHeader } from 'mysql2';
import { getPool } from './db';
import type { SupportTicketType } from './system-email';

export type SupportTicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
export type SupportTicketPriority = 'low' | 'normal' | 'high';

export interface SupportTicketRow {
  id: number;
  ticketRef: string;
  type: SupportTicketType;
  status: SupportTicketStatus;
  priority: SupportTicketPriority;
  name: string;
  email: string;
  subject: string;
  message: string;
  orderId: string | null;
  userId: number | null;
  adminNotes: string | null;
  emailSent: boolean;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SupportTicketStats {
  open: number;
  inProgress: number;
  resolved: number;
  closed: number;
  total: number;
  complaints: number;
  feedback: number;
  bugs: number;
  billing: number;
}

let schemaReady = false;

export async function ensureSupportTicketsSchema() {
  if (schemaReady) return;
  const pool = getPool();
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS support_tickets (
      id INT UNSIGNED NOT NULL AUTO_INCREMENT,
      ticket_ref VARCHAR(24) NOT NULL,
      type ENUM('complaint','feedback','bug','billing','other') NOT NULL DEFAULT 'feedback',
      status ENUM('open','in_progress','resolved','closed') NOT NULL DEFAULT 'open',
      priority ENUM('low','normal','high') NOT NULL DEFAULT 'normal',
      name VARCHAR(200) NOT NULL,
      email VARCHAR(255) NOT NULL,
      subject VARCHAR(500) NOT NULL,
      message TEXT NOT NULL,
      order_id VARCHAR(100) NULL,
      user_id INT UNSIGNED NULL,
      admin_notes TEXT NULL,
      email_sent TINYINT(1) NOT NULL DEFAULT 0,
      resolved_at DATETIME NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY uk_ticket_ref (ticket_ref),
      KEY idx_status (status),
      KEY idx_type (type),
      KEY idx_created (created_at),
      KEY idx_user (user_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
  schemaReady = true;
}

function genTicketRef(): string {
  const d = new Date();
  const ymd = d.toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `SUP-${ymd}-${rand}`;
}

function mapRow(r: RowDataPacket): SupportTicketRow {
  return {
    id: Number(r.id),
    ticketRef: String(r.ticket_ref),
    type: r.type as SupportTicketType,
    status: r.status as SupportTicketStatus,
    priority: r.priority as SupportTicketPriority,
    name: String(r.name),
    email: String(r.email),
    subject: String(r.subject),
    message: String(r.message),
    orderId: r.order_id ? String(r.order_id) : null,
    userId: r.user_id != null ? Number(r.user_id) : null,
    adminNotes: r.admin_notes ? String(r.admin_notes) : null,
    emailSent: Boolean(r.email_sent),
    resolvedAt: r.resolved_at ? new Date(r.resolved_at as Date).toISOString() : null,
    createdAt: new Date(r.created_at as Date).toISOString(),
    updatedAt: new Date(r.updated_at as Date).toISOString(),
  };
}

export async function createSupportTicket(opts: {
  type: SupportTicketType;
  name: string;
  email: string;
  subject: string;
  message: string;
  orderId?: string;
  userId?: number;
  emailSent?: boolean;
}): Promise<SupportTicketRow> {
  await ensureSupportTicketsSchema();
  const pool = getPool();
  const ticketRef = genTicketRef();
  const priority: SupportTicketPriority = opts.type === 'complaint' ? 'high' : opts.type === 'billing' ? 'normal' : 'low';

  const [result] = await pool.execute<ResultSetHeader>(
    `INSERT INTO support_tickets
      (ticket_ref, type, status, priority, name, email, subject, message, order_id, user_id, email_sent)
     VALUES (?, ?, 'open', ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      ticketRef,
      opts.type,
      priority,
      opts.name,
      opts.email,
      opts.subject,
      opts.message,
      opts.orderId || null,
      opts.userId ?? null,
      opts.emailSent ? 1 : 0,
    ],
  );

  const [rows] = await pool.execute<RowDataPacket[]>(
    'SELECT * FROM support_tickets WHERE id = ? LIMIT 1',
    [result.insertId],
  );
  return mapRow(rows[0]);
}

export async function markTicketEmailSent(id: number) {
  await ensureSupportTicketsSchema();
  const pool = getPool();
  await pool.execute('UPDATE support_tickets SET email_sent = 1 WHERE id = ?', [id]);
}

export async function getSupportTickets(opts?: {
  status?: string;
  type?: string;
  search?: string;
  limit?: number;
}): Promise<SupportTicketRow[]> {
  await ensureSupportTicketsSchema();
  const pool = getPool();
  const limit = Math.min(opts?.limit ?? 200, 500);
  const conditions: string[] = [];
  const params: (string | number)[] = [];

  if (opts?.status && opts.status !== 'all') {
    conditions.push('status = ?');
    params.push(opts.status);
  }
  if (opts?.type && opts.type !== 'all') {
    conditions.push('type = ?');
    params.push(opts.type);
  }
  if (opts?.search?.trim()) {
    const q = `%${opts.search.trim()}%`;
    conditions.push('(ticket_ref LIKE ? OR name LIKE ? OR email LIKE ? OR subject LIKE ? OR message LIKE ?)');
    params.push(q, q, q, q, q);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT * FROM support_tickets ${where} ORDER BY
      FIELD(status, 'open', 'in_progress', 'resolved', 'closed'),
      FIELD(priority, 'high', 'normal', 'low'),
      created_at DESC
     LIMIT ?`,
    [...params, limit],
  );
  return rows.map(mapRow);
}

export async function getSupportTicketById(id: number): Promise<SupportTicketRow | null> {
  await ensureSupportTicketsSchema();
  const pool = getPool();
  const [rows] = await pool.execute<RowDataPacket[]>(
    'SELECT * FROM support_tickets WHERE id = ? LIMIT 1',
    [id],
  );
  return rows[0] ? mapRow(rows[0]) : null;
}

export async function getSupportTicketStats(): Promise<SupportTicketStats> {
  await ensureSupportTicketsSchema();
  const pool = getPool();
  const [rows] = await pool.execute<RowDataPacket[]>(`
    SELECT
      COUNT(*) AS total,
      SUM(status = 'open') AS open_count,
      SUM(status = 'in_progress') AS in_progress_count,
      SUM(status = 'resolved') AS resolved_count,
      SUM(status = 'closed') AS closed_count,
      SUM(type = 'complaint') AS complaints,
      SUM(type = 'feedback') AS feedback,
      SUM(type = 'bug') AS bugs,
      SUM(type = 'billing') AS billing
    FROM support_tickets
  `);
  const r = rows[0];
  return {
    total: Number(r.total) || 0,
    open: Number(r.open_count) || 0,
    inProgress: Number(r.in_progress_count) || 0,
    resolved: Number(r.resolved_count) || 0,
    closed: Number(r.closed_count) || 0,
    complaints: Number(r.complaints) || 0,
    feedback: Number(r.feedback) || 0,
    bugs: Number(r.bugs) || 0,
    billing: Number(r.billing) || 0,
  };
}

export async function updateSupportTicket(
  id: number,
  updates: Partial<{
    status: SupportTicketStatus;
    priority: SupportTicketPriority;
    adminNotes: string;
  }>,
): Promise<SupportTicketRow | null> {
  await ensureSupportTicketsSchema();
  const pool = getPool();
  const sets: string[] = [];
  const params: (string | number)[] = [];

  if (updates.status) {
    sets.push('status = ?');
    params.push(updates.status);
    if (updates.status === 'resolved' || updates.status === 'closed') {
      sets.push('resolved_at = NOW()');
    } else {
      sets.push('resolved_at = NULL');
    }
  }
  if (updates.priority) {
    sets.push('priority = ?');
    params.push(updates.priority);
  }
  if (updates.adminNotes !== undefined) {
    sets.push('admin_notes = ?');
    params.push(updates.adminNotes);
  }

  if (!sets.length) return getSupportTicketById(id);

  params.push(id);
  await pool.execute(`UPDATE support_tickets SET ${sets.join(', ')} WHERE id = ?`, params);
  return getSupportTicketById(id);
}
