import type { Portfolio } from './types';

export interface VercelConnectionStatus {
  connected: boolean;
  accountLabel?: string;
  teamId?: string;
  authMethod?: 'oauth' | 'token';
  connectedAt?: string;
  lastVerifiedAt?: string;
  oauthAvailable?: boolean;
}

export interface VercelTeam {
  id: string;
  slug: string;
  name: string;
}

export interface VercelDeploymentRecord {
  projectName: string;
  deploymentId: string | null;
  liveUrl: string | null;
  status: string;
  errorMessage: string | null;
  updatedAt: string | null;
}

export async function fetchVercelStatus(): Promise<{ connection: VercelConnectionStatus }> {
  const res = await fetch('/api/vercel/status', { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to load Vercel status');
  return res.json();
}

export function startVercelOAuth(returnTo?: string) {
  const url = new URL('/api/vercel/oauth/start', window.location.origin);
  if (returnTo) url.searchParams.set('returnTo', returnTo);
  window.location.href = url.toString();
}

export async function connectVercelToken(accessToken: string): Promise<{ ok: boolean; username: string }> {
  const res = await fetch('/api/vercel/connect', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ accessToken }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Connection failed');
  return data;
}

export async function disconnectVercel(): Promise<void> {
  const res = await fetch('/api/vercel/disconnect', { method: 'DELETE', credentials: 'include' });
  if (!res.ok) throw new Error('Failed to disconnect');
}

export async function fetchVercelTeams(): Promise<{ teams: VercelTeam[] }> {
  const res = await fetch('/api/vercel/teams', { credentials: 'include' });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to load teams');
  return data;
}

export async function setVercelTeam(teamId: string | null): Promise<void> {
  const res = await fetch('/api/vercel/teams', {
    method: 'PATCH',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ teamId }),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || 'Failed to set team');
  }
}

export async function deployToVercel(
  portfolio: Portfolio,
  options?: { teamId?: string; format?: 'nextjs' | 'static' },
): Promise<{ liveUrl: string; projectName: string }> {
  const res = await fetch('/api/vercel/deploy', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ portfolio, ...options }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Deploy failed');
  return data;
}

export async function fetchVercelDeploymentStatus(portfolioId: string): Promise<{ deployment: VercelDeploymentRecord | null }> {
  const res = await fetch(`/api/vercel/deploy?portfolioId=${encodeURIComponent(portfolioId)}`, { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to load deployment status');
  return res.json();
}
