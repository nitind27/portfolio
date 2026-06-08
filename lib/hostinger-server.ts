import type { RowDataPacket } from 'mysql2';
import { getPool } from './db';
import { encryptHostingerToken, decryptHostingerToken } from './hostinger-crypto';
import {
  verifyHostingerToken, listHostingerDomains, listHostingerWebsites,
  deployStaticWebsite, HostingerApiError,
} from './hostinger-client';
import { buildStaticSiteZip } from './export-server';
import type { Portfolio } from './types';

export type DeployStatus = 'pending' | 'uploading' | 'deploying' | 'live' | 'failed';

export interface HostingerConnectionInfo {
  connected: boolean;
  accountLabel?: string;
  connectedAt?: string;
  lastVerifiedAt?: string;
}

export async function getHostingerConnection(userId: number): Promise<HostingerConnectionInfo> {
  const pool = getPool();
  const [rows] = await pool.execute<RowDataPacket[]>(
    'SELECT account_label, connected_at, last_verified_at FROM hostinger_connections WHERE user_id = ? LIMIT 1',
    [userId],
  );
  const row = rows[0];
  if (!row) return { connected: false };
  return {
    connected: true,
    accountLabel: row.account_label || undefined,
    connectedAt: row.connected_at ? new Date(row.connected_at).toISOString() : undefined,
    lastVerifiedAt: row.last_verified_at ? new Date(row.last_verified_at).toISOString() : undefined,
  };
}

export async function getHostingerApiToken(userId: number): Promise<string | null> {
  const pool = getPool();
  const [rows] = await pool.execute<RowDataPacket[]>(
    'SELECT api_token_enc FROM hostinger_connections WHERE user_id = ? LIMIT 1',
    [userId],
  );
  const enc = rows[0]?.api_token_enc;
  if (!enc) return null;
  return decryptHostingerToken(String(enc));
}

export async function saveHostingerConnection(userId: number, apiToken: string, label?: string) {
  const verified = await verifyHostingerToken(apiToken);
  const pool = getPool();
  const enc = encryptHostingerToken(apiToken);
  await pool.execute(
    `INSERT INTO hostinger_connections (user_id, api_token_enc, account_label, last_verified_at)
     VALUES (?, ?, ?, NOW())
     ON DUPLICATE KEY UPDATE api_token_enc = VALUES(api_token_enc), account_label = VALUES(account_label), last_verified_at = NOW()`,
    [userId, enc, label || `Hostinger (${verified.domainCount} domains)`],
  );
  return { domainCount: verified.domainCount };
}

export async function removeHostingerConnection(userId: number) {
  const pool = getPool();
  await pool.execute('DELETE FROM hostinger_connections WHERE user_id = ?', [userId]);
}

export async function fetchUserDomains(userId: number) {
  const token = await getHostingerApiToken(userId);
  if (!token) throw new HostingerApiError('Hostinger not connected', 401);

  const [domains, websites] = await Promise.all([
    listHostingerDomains(token),
    listHostingerWebsites(token),
  ]);

  const websiteDomains = new Set(websites.map(w => w.domain.toLowerCase()));
  const merged = [
    ...websites.map(w => ({
      domain: w.domain,
      source: 'website' as const,
      ready: Boolean(w.is_enabled !== false),
      username: w.username,
    })),
    ...domains
      .filter(d => !websiteDomains.has(d.domain.toLowerCase()))
      .map(d => ({
        domain: d.domain,
        source: 'domain' as const,
        ready: false,
        username: undefined as string | undefined,
        note: 'Domain registered — create a website in hPanel to deploy here',
      })),
  ];

  return { domains: merged, rawDomains: domains, websites };
}

export async function recordDeployment(
  userId: number, portfolioId: string, domain: string, status: DeployStatus,
  opts?: { liveUrl?: string; error?: string },
) {
  const pool = getPool();
  await pool.execute(
    `INSERT INTO hostinger_deployments (user_id, portfolio_id, domain, status, live_url, error_message, deployed_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      userId, portfolioId, domain, status,
      opts?.liveUrl || null, opts?.error || null,
      status === 'live' ? new Date() : null,
    ],
  );
}

export async function getLatestDeployment(userId: number, portfolioId: string) {
  const pool = getPool();
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT domain, status, live_url, error_message, deployed_at, updated_at
     FROM hostinger_deployments WHERE user_id = ? AND portfolio_id = ?
     ORDER BY id DESC LIMIT 1`,
    [userId, portfolioId],
  );
  const row = rows[0];
  if (!row) return null;
  return {
    domain: row.domain as string,
    status: row.status as DeployStatus,
    liveUrl: row.live_url as string | null,
    error: row.error_message as string | null,
    deployedAt: row.deployed_at ? new Date(row.deployed_at).toISOString() : null,
    updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : null,
  };
}

export async function deployPortfolioToHostinger(
  userId: number,
  portfolio: Portfolio,
  domain: string,
): Promise<{ liveUrl: string; domain: string }> {
  const token = await getHostingerApiToken(userId);
  if (!token) throw new HostingerApiError('Connect your Hostinger account first', 401);

  const portfolioId = portfolio.id;
  await recordDeployment(userId, portfolioId, domain, 'uploading');

  try {
    const zip = await buildStaticSiteZip(portfolio);
    await recordDeployment(userId, portfolioId, domain, 'deploying');
    const result = await deployStaticWebsite(token, domain, zip);
    await recordDeployment(userId, portfolioId, domain, 'live', { liveUrl: result.liveUrl });
    return result;
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Deploy failed';
    await recordDeployment(userId, portfolioId, domain, 'failed', { error: msg });
    throw err;
  }
}
