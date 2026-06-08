import type { Portfolio } from './types';

export interface HostingerDeployTarget {
  domain: string;
  source: 'website' | 'domain' | 'custom';
  ready: boolean;
  username?: string;
  note?: string;
}

export interface HostingerConnectionStatus {
  connected: boolean;
  accountLabel?: string;
  connectedAt?: string;
  lastVerifiedAt?: string;
}

export interface HostingerDeploymentRecord {
  domain: string;
  status: 'pending' | 'uploading' | 'deploying' | 'live' | 'failed';
  liveUrl: string | null;
  error: string | null;
  deployedAt: string | null;
  updatedAt: string | null;
}

export async function fetchHostingerStatus(): Promise<{ connection: HostingerConnectionStatus }> {
  const res = await fetch('/api/hostinger/status', { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to load Hostinger status');
  return res.json();
}

export async function connectHostinger(apiToken: string): Promise<{ ok: boolean; domainCount: number }> {
  const res = await fetch('/api/hostinger/connect', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ apiToken }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Connection failed');
  return data;
}

export async function disconnectHostinger(): Promise<void> {
  const res = await fetch('/api/hostinger/disconnect', { method: 'DELETE', credentials: 'include' });
  if (!res.ok) throw new Error('Failed to disconnect');
}

export async function fetchHostingerDomains(): Promise<{ domains: HostingerDeployTarget[] }> {
  const res = await fetch('/api/hostinger/domains', { credentials: 'include' });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to load domains');
  return data;
}

export async function deployToHostinger(portfolio: Portfolio, domain: string): Promise<{ liveUrl: string; domain: string }> {
  const res = await fetch('/api/hostinger/deploy', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ portfolio, domain }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Deploy failed');
  return data;
}

export async function fetchDeploymentStatus(portfolioId: string): Promise<{ deployment: HostingerDeploymentRecord | null }> {
  const res = await fetch(`/api/hostinger/deploy?portfolioId=${encodeURIComponent(portfolioId)}`, { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to load deployment status');
  return res.json();
}
