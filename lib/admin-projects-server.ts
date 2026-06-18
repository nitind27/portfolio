import type { RowDataPacket } from 'mysql2';
import { getPool } from './db';
import type { Portfolio } from './types';
import type { AuthUser } from './types';
import { parseConfigJson, compactToPortfolio, portfolioToCompact } from './project-serialize';
import { externalizePortfolioAssets } from './project-assets-server';

export interface AdminProjectSummary {
  id: string;
  name: string;
  slug: string;
  templateId: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
  previewUrl: string;
}

export interface AdminUserProfile {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  isPremium: boolean;
  planId: number | null;
  planName: string | null;
  createdAt: string;
  projectCount: number;
}

export async function getAdminUserProfile(userId: number): Promise<AdminUserProfile | null> {
  const pool = getPool();
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT u.id, u.name, u.email, u.phone, u.role, u.is_premium, u.plan_id, u.created_at,
      sp.name AS plan_name,
      (SELECT COUNT(*) FROM user_projects up WHERE up.user_id = u.id) AS project_count
     FROM users u
     LEFT JOIN subscription_plans sp ON sp.id = u.plan_id
     WHERE u.id = ? LIMIT 1`,
    [userId],
  );
  const r = rows[0];
  if (!r) return null;
  return {
    id: Number(r.id),
    name: String(r.name),
    email: String(r.email),
    phone: String(r.phone || ''),
    role: String(r.role),
    isPremium: Boolean(r.is_premium),
    planId: r.plan_id != null ? Number(r.plan_id) : null,
    planName: r.plan_name ? String(r.plan_name) : null,
    createdAt: new Date(r.created_at as Date).toISOString(),
    projectCount: Number(r.project_count || 0),
  };
}

export async function listUserProjectsAdmin(userId: number): Promise<AdminProjectSummary[]> {
  const pool = getPool();
  let rows: RowDataPacket[];
  try {
    [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT project_id, name, slug, template_id, published, created_at, updated_at
       FROM user_projects WHERE user_id = ? ORDER BY updated_at DESC`,
      [userId],
    );
  } catch {
    return [];
  }

  return rows.map(r => ({
    id: String(r.project_id),
    name: String(r.name || 'Untitled'),
    slug: String(r.slug || ''),
    templateId: String(r.template_id || ''),
    published: Boolean(r.published),
    createdAt: new Date(r.created_at as Date).toISOString(),
    updatedAt: new Date(r.updated_at as Date).toISOString(),
    previewUrl: r.slug ? `/p/${r.slug}` : '',
  }));
}

export async function getUserProjectAdmin(userId: number, projectId: string): Promise<Portfolio | null> {
  const pool = getPool();
  const [rows] = await pool.execute<RowDataPacket[]>(
    'SELECT config, created_at FROM user_projects WHERE user_id = ? AND project_id = ? LIMIT 1',
    [userId, projectId],
  );
  const row = rows[0];
  if (!row) return null;
  try {
    const p = parseConfigJson(row.config);
    p.createdAt = p.createdAt || new Date(row.created_at as Date).toISOString();
    return p;
  } catch {
    return null;
  }
}

export async function saveUserProjectAdmin(userId: number, portfolio: Portfolio): Promise<Portfolio> {
  const pool = getPool();
  const [exists] = await pool.execute<RowDataPacket[]>(
    'SELECT id FROM users WHERE id = ? LIMIT 1',
    [userId],
  );
  if (!exists[0]) throw new Error('User not found');

  const processed = await externalizePortfolioAssets(userId, portfolio);
  const compact = portfolioToCompact({ ...processed, updatedAt: new Date().toISOString() });
  const configStr = JSON.stringify(compact);
  const now = new Date();

  await pool.execute(
    `INSERT INTO user_projects (user_id, project_id, name, template_id, slug, published, created_at, updated_at, config)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       name = VALUES(name),
       template_id = VALUES(template_id),
       slug = VALUES(slug),
       published = VALUES(published),
       updated_at = VALUES(updated_at),
       config = VALUES(config)`,
    [
      userId,
      processed.id,
      processed.name.slice(0, 200),
      processed.templateId.slice(0, 64),
      processed.slug.slice(0, 120),
      processed.published ? 1 : 0,
      new Date(processed.createdAt || now),
      now,
      configStr,
    ],
  );

  return compactToPortfolio(compact);
}

export async function deleteUserProjectAdmin(userId: number, projectId: string): Promise<void> {
  const pool = getPool();
  await pool.execute(
    'DELETE FROM user_projects WHERE user_id = ? AND project_id = ?',
    [userId, projectId],
  );
}

/** Minimal AuthUser for sync helpers when admin edits another user's project */
export function userIdToAuthStub(userId: number, profile: AdminUserProfile): AuthUser {
  return {
    id: userId,
    name: profile.name,
    email: profile.email,
    phone: profile.phone,
    role: profile.role as 'user' | 'admin',
    isPremium: profile.isPremium,
    planId: profile.planId,
    planSlug: null,
    planName: profile.planName,
    premiumPortfolioId: null,
    premiumPurchasedAt: null,
    avatarUrl: null,
    authProvider: 'local',
  };
}
