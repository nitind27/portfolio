import type { RowDataPacket } from 'mysql2';
import { getPool } from './db';
import { encryptVercelToken, decryptVercelToken } from './vercel-crypto';
import {
  verifyVercelToken, createVercelDeployment, waitForVercelDeployment,
  deploymentUrl, listVercelTeams, VercelApiError,
} from './vercel-client';
import { buildNextjsDeployFiles, deployProjectName } from './vercel-export';
import type { Portfolio } from './types';

export type VercelDeployStatus = 'pending' | 'uploading' | 'building' | 'live' | 'failed';

export interface VercelConnectionInfo {
  connected: boolean;
  accountLabel?: string;
  teamId?: string;
  authMethod?: 'oauth' | 'token';
  connectedAt?: string;
  lastVerifiedAt?: string;
}

let schemaReady = false;

async function ensureVercelSchema() {
  if (schemaReady) return;
  const pool = getPool();
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS vercel_connections (
      user_id INT UNSIGNED NOT NULL PRIMARY KEY,
      access_token_enc TEXT NOT NULL,
      account_label VARCHAR(200) NOT NULL DEFAULT '',
      team_id VARCHAR(64) NULL,
      auth_method ENUM('oauth','token') NOT NULL DEFAULT 'token',
      connected_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      last_verified_at DATETIME NULL,
      CONSTRAINT fk_vercel_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `).catch(() => {});
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS vercel_deployments (
      id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
      user_id INT UNSIGNED NOT NULL,
      project_id VARCHAR(64) NOT NULL,
      vercel_project_name VARCHAR(80) NOT NULL,
      deployment_id VARCHAR(64) NULL,
      live_url VARCHAR(500) NULL,
      status ENUM('pending','uploading','building','live','failed') NOT NULL DEFAULT 'pending',
      error_message VARCHAR(500) NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_user_project (user_id, project_id),
      CONSTRAINT fk_vercel_dep_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `).catch(() => {});
  schemaReady = true;
}

export async function getVercelConnection(userId: number): Promise<VercelConnectionInfo> {
  await ensureVercelSchema();
  const pool = getPool();
  const [rows] = await pool.execute<RowDataPacket[]>(
    'SELECT account_label, team_id, auth_method, connected_at, last_verified_at FROM vercel_connections WHERE user_id = ? LIMIT 1',
    [userId],
  );
  const row = rows[0];
  if (!row) return { connected: false };
  return {
    connected: true,
    accountLabel: row.account_label || undefined,
    teamId: row.team_id || undefined,
    authMethod: row.auth_method === 'oauth' ? 'oauth' : 'token',
    connectedAt: row.connected_at ? new Date(row.connected_at).toISOString() : undefined,
    lastVerifiedAt: row.last_verified_at ? new Date(row.last_verified_at).toISOString() : undefined,
  };
}

export async function getVercelAccessToken(userId: number): Promise<string | null> {
  await ensureVercelSchema();
  const pool = getPool();
  const [rows] = await pool.execute<RowDataPacket[]>(
    'SELECT access_token_enc FROM vercel_connections WHERE user_id = ? LIMIT 1',
    [userId],
  );
  const enc = rows[0]?.access_token_enc;
  if (!enc) return null;
  return decryptVercelToken(String(enc));
}

export async function saveVercelConnection(
  userId: number,
  accessToken: string,
  options?: { teamId?: string; authMethod?: 'oauth' | 'token'; label?: string },
) {
  await ensureVercelSchema();
  const verified = await verifyVercelToken(accessToken);
  const pool = getPool();
  const enc = encryptVercelToken(accessToken);
  const label = options?.label || `Vercel (@${verified.username})`;
  await pool.execute(
    `INSERT INTO vercel_connections (user_id, access_token_enc, account_label, team_id, auth_method, last_verified_at)
     VALUES (?, ?, ?, ?, ?, NOW())
     ON DUPLICATE KEY UPDATE
       access_token_enc = VALUES(access_token_enc),
       account_label = VALUES(account_label),
       team_id = VALUES(team_id),
       auth_method = VALUES(auth_method),
       last_verified_at = NOW()`,
    [userId, enc, label, options?.teamId || null, options?.authMethod || 'token'],
  );
  return { username: verified.username };
}

export async function removeVercelConnection(userId: number) {
  await ensureVercelSchema();
  const pool = getPool();
  await pool.execute('DELETE FROM vercel_connections WHERE user_id = ?', [userId]);
}

export async function fetchUserVercelTeams(userId: number) {
  const token = await getVercelAccessToken(userId);
  if (!token) throw new VercelApiError('Vercel not connected', 401);
  return listVercelTeams(token);
}

export async function setVercelTeam(userId: number, teamId: string | null) {
  await ensureVercelSchema();
  const pool = getPool();
  await pool.execute('UPDATE vercel_connections SET team_id = ? WHERE user_id = ?', [teamId, userId]);
}

async function recordDeployment(
  userId: number,
  projectId: string,
  projectName: string,
  patch: Partial<{
    deploymentId: string;
    liveUrl: string;
    status: VercelDeployStatus;
    errorMessage: string;
  }>,
) {
  await ensureVercelSchema();
  const pool = getPool();
  const [rows] = await pool.execute<RowDataPacket[]>(
    'SELECT id FROM vercel_deployments WHERE user_id = ? AND project_id = ? ORDER BY id DESC LIMIT 1',
    [userId, projectId],
  );
  const existing = rows[0]?.id;
  if (existing) {
    await pool.execute(
      `UPDATE vercel_deployments SET
        vercel_project_name = COALESCE(?, vercel_project_name),
        deployment_id = COALESCE(?, deployment_id),
        live_url = COALESCE(?, live_url),
        status = COALESCE(?, status),
        error_message = COALESCE(?, error_message)
       WHERE id = ?`,
      [
        projectName,
        patch.deploymentId ?? null,
        patch.liveUrl ?? null,
        patch.status ?? null,
        patch.errorMessage ?? null,
        existing,
      ],
    );
  } else {
    await pool.execute(
      `INSERT INTO vercel_deployments (user_id, project_id, vercel_project_name, deployment_id, live_url, status, error_message)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        projectId,
        projectName,
        patch.deploymentId ?? null,
        patch.liveUrl ?? null,
        patch.status ?? 'pending',
        patch.errorMessage ?? null,
      ],
    );
  }
}

export async function getLatestVercelDeployment(userId: number, projectId: string) {
  await ensureVercelSchema();
  const pool = getPool();
  const [rows] = await pool.execute<RowDataPacket[]>(
    'SELECT * FROM vercel_deployments WHERE user_id = ? AND project_id = ? ORDER BY id DESC LIMIT 1',
    [userId, projectId],
  );
  const r = rows[0];
  if (!r) return null;
  return {
    projectName: String(r.vercel_project_name),
    deploymentId: r.deployment_id ? String(r.deployment_id) : null,
    liveUrl: r.live_url ? String(r.live_url) : null,
    status: r.status as VercelDeployStatus,
    errorMessage: r.error_message ? String(r.error_message) : null,
    updatedAt: new Date(r.updated_at as Date).toISOString(),
  };
}

export async function deployPortfolioToVercel(
  userId: number,
  portfolio: Portfolio,
  options?: { teamId?: string; format?: 'nextjs' | 'static' },
) {
  const token = await getVercelAccessToken(userId);
  if (!token) throw new VercelApiError('Connect your Vercel account first', 401);

  const conn = await getVercelConnection(userId);
  const teamId = options?.teamId ?? conn.teamId ?? undefined;
  const existing = await getLatestVercelDeployment(userId, portfolio.id);
  const projectName = existing?.projectName || deployProjectName(portfolio);
  const format = options?.format || 'nextjs';

  await recordDeployment(userId, portfolio.id, projectName, { status: 'uploading' });

  try {
    const files = format === 'static'
      ? await (await import('./vercel-export')).buildStaticDeployFiles(portfolio)
      : await buildNextjsDeployFiles(portfolio);

    const created = await createVercelDeployment(token, projectName, files, {
      teamId,
      framework: format === 'static' ? null : 'nextjs',
    });

    const deploymentId = String(created.id || created.deploymentId || '');
    await recordDeployment(userId, portfolio.id, projectName, {
      deploymentId,
      status: 'building',
    });

    const ready = await waitForVercelDeployment(token, deploymentId, teamId);
    const liveUrl = deploymentUrl(ready);

    await recordDeployment(userId, portfolio.id, projectName, {
      deploymentId,
      liveUrl,
      status: 'live',
    });

    return { liveUrl, projectName, deploymentId, teamId };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Deploy failed';
    await recordDeployment(userId, portfolio.id, projectName, {
      status: 'failed',
      errorMessage: msg.slice(0, 500),
    });
    throw err;
  }
}
