const API_BASE = 'https://api.vercel.com';

export class VercelApiError extends Error {
  constructor(message: string, public status = 400) {
    super(message);
    this.name = 'VercelApiError';
  }
}

async function vercelFetch(path: string, token: string, init?: RequestInit) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data?.error?.message || data?.message || data?.error || `Vercel API error (${res.status})`;
    throw new VercelApiError(String(msg), res.status);
  }
  return data;
}

export async function verifyVercelToken(token: string) {
  const user = await vercelFetch('/v2/user', token);
  const username = user?.user?.username || user?.user?.email || 'Vercel user';
  return { username: String(username), userId: String(user?.user?.id || '') };
}

export async function listVercelTeams(token: string) {
  const data = await vercelFetch('/v2/teams', token);
  const teams = (data?.teams || []).map((t: { id: string; slug: string; name: string }) => ({
    id: t.id,
    slug: t.slug,
    name: t.name,
  }));
  return teams;
}

export interface VercelDeployFileInput {
  file: string;
  data: string;
  encoding?: 'utf-8' | 'base64';
}

export async function createVercelDeployment(
  token: string,
  projectName: string,
  files: VercelDeployFileInput[],
  options?: { teamId?: string; framework?: string | null },
) {
  const qs = options?.teamId ? `?teamId=${encodeURIComponent(options.teamId)}` : '';
  const body = {
    name: projectName,
    files,
    projectSettings: {
      framework: options?.framework ?? 'nextjs',
    },
    target: 'production',
  };
  return vercelFetch(`/v13/deployments${qs}`, token, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function getVercelDeployment(token: string, deploymentId: string, teamId?: string) {
  const qs = teamId ? `?teamId=${encodeURIComponent(teamId)}` : '';
  return vercelFetch(`/v13/deployments/${deploymentId}${qs}`, token);
}

export async function waitForVercelDeployment(
  token: string,
  deploymentId: string,
  teamId?: string,
  maxWaitMs = 180_000,
) {
  const start = Date.now();
  while (Date.now() - start < maxWaitMs) {
    const dep = await getVercelDeployment(token, deploymentId, teamId);
    const state = dep?.readyState || dep?.status;
    if (state === 'READY') return dep;
    if (state === 'ERROR' || state === 'CANCELED') {
      throw new VercelApiError(dep?.errorMessage || `Deployment ${state}`, 500);
    }
    await new Promise(r => setTimeout(r, 3000));
  }
  throw new VercelApiError('Deployment timed out — check your Vercel dashboard', 504);
}

export function deploymentUrl(dep: { url?: string; alias?: string[] }): string {
  if (dep.alias?.[0]) return `https://${dep.alias[0]}`;
  if (dep.url) return dep.url.startsWith('http') ? dep.url : `https://${dep.url}`;
  return '';
}
