import type { RowDataPacket, ResultSetHeader } from 'mysql2';
import { getPool } from './db';
import type { Portfolio } from './types';
import { parseConfigJson, portfolioToCompact, compactToPortfolio } from './project-serialize';
import { externalizePortfolioAssets } from './project-assets-server';
import { isProjectExpiredWithPolicy } from './project-expiry';
import { getUserFeatures, getDefaultPlan } from './plans-server';
import type { AuthUser } from './types';
import { STORAGE_POLICY_DAYS } from './brand';

export interface UserAppConfig {
  hasSeenDashboardTour?: boolean;
  hasSeenBuilderTour?: boolean;
  lastActiveProjectId?: string | null;
}

export async function getUserAppConfig(userId: number): Promise<UserAppConfig> {
  const pool = getPool();
  try {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT app_config FROM users WHERE id = ? LIMIT 1',
      [userId],
    );
    const raw = rows[0]?.app_config;
    if (!raw) return {};
    return typeof raw === 'string' ? JSON.parse(raw) : raw;
  } catch {
    return {};
  }
}

export async function saveUserAppConfig(userId: number, config: UserAppConfig) {
  const pool = getPool();
  await pool.execute(
    'UPDATE users SET app_config = ? WHERE id = ?',
    [JSON.stringify(config), userId],
  );
}

async function getStorageDays(user: AuthUser | null): Promise<number> {
  if (!user) return STORAGE_POLICY_DAYS;
  const features = await getUserFeatures(user);
  return features.storageDays || STORAGE_POLICY_DAYS;
}

export async function loadUserProjects(user: AuthUser): Promise<Portfolio[]> {
  const pool = getPool();
  const storageDays = await getStorageDays(user);

  let rows: RowDataPacket[];
  try {
    [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT project_id, config, created_at FROM user_projects
       WHERE user_id = ? ORDER BY updated_at DESC`,
      [user.id],
    );
  } catch {
    return [];
  }

  const portfolios: Portfolio[] = [];
  const expiredIds: string[] = [];

  for (const row of rows) {
    try {
      const p = parseConfigJson(row.config);
      p.createdAt = p.createdAt || new Date(row.created_at as Date).toISOString();
      if (isProjectExpiredWithPolicy(p.createdAt, storageDays)) {
        expiredIds.push(String(row.project_id));
        continue;
      }
      portfolios.push(p);
    } catch {
      /* skip corrupt row */
    }
  }

  if (expiredIds.length) {
    await pool.execute(
      `DELETE FROM user_projects WHERE user_id = ? AND project_id IN (${expiredIds.map(() => '?').join(',')})`,
      [user.id, ...expiredIds],
    );
  }

  return portfolios;
}

export async function syncUserProjects(
  user: AuthUser,
  portfolios: Portfolio[],
  appConfig?: UserAppConfig,
  options?: { merge?: boolean },
): Promise<Portfolio[]> {
  const pool = getPool();
  const storageDays = await getStorageDays(user);
  const now = new Date();
  const kept = portfolios.filter(p => !isProjectExpiredWithPolicy(p.createdAt, storageDays));
  const projectIds = kept.map(p => p.id);

  if (!options?.merge) {
    if (projectIds.length === 0) {
      await pool.execute('DELETE FROM user_projects WHERE user_id = ?', [user.id]);
    } else {
      await pool.execute(
        `DELETE FROM user_projects WHERE user_id = ? AND project_id NOT IN (${projectIds.map(() => '?').join(',')})`,
        [user.id, ...projectIds],
      );
    }
  }

  const saved: Portfolio[] = [];

  for (const raw of kept) {
    const p = await externalizePortfolioAssets(user.id, raw);
    const compact = portfolioToCompact({ ...p, updatedAt: new Date().toISOString() });
    const configStr = JSON.stringify(compact);
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
        user.id,
        p.id,
        p.name.slice(0, 200),
        p.templateId.slice(0, 64),
        p.slug.slice(0, 120),
        p.published ? 1 : 0,
        new Date(p.createdAt || now),
        now,
        configStr,
      ],
    );
    saved.push(compactToPortfolio(compact));
  }

  if (appConfig) {
    await saveUserAppConfig(user.id, appConfig);
  }

  return saved;
}

export async function deleteUserProject(userId: number, projectId: string) {
  const pool = getPool();
  await pool.execute(
    'DELETE FROM user_projects WHERE user_id = ? AND project_id = ?',
    [userId, projectId],
  );
}
