import { randomBytes } from 'crypto';
import { getPublicWebsiteUrl } from './brand';

export function isVercelOAuthConfigured(): boolean {
  return Boolean(process.env.VERCEL_CLIENT_ID && process.env.VERCEL_CLIENT_SECRET);
}

export function getVercelRedirectUri(origin?: string): string {
  const base = origin || getPublicWebsiteUrl();
  return `${base.replace(/\/$/, '')}/api/vercel/oauth/callback`;
}

export function buildVercelAuthorizeUrl(state: string, origin?: string): string {
  const clientId = process.env.VERCEL_CLIENT_ID!;
  const redirectUri = encodeURIComponent(getVercelRedirectUri(origin));
  return `https://vercel.com/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&state=${encodeURIComponent(state)}`;
}

export const VERCEL_OAUTH_STATE_COOKIE = 'vercel_oauth_state';
export const VERCEL_OAUTH_RETURN_COOKIE = 'vercel_oauth_return';

export function createVercelOAuthState(): string {
  return randomBytes(24).toString('hex');
}

export async function exchangeVercelCode(code: string, redirectUri: string) {
  const clientId = process.env.VERCEL_CLIENT_ID;
  const clientSecret = process.env.VERCEL_CLIENT_SECRET;
  if (!clientId || !clientSecret) throw new Error('Vercel OAuth is not configured');

  const res = await fetch('https://api.vercel.com/v2/oauth/access_token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: redirectUri,
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.error || data?.message || 'Vercel OAuth token exchange failed');
  }
  return {
    accessToken: String(data.access_token || ''),
    teamId: data.team_id ? String(data.team_id) : undefined,
    userId: data.user_id ? String(data.user_id) : undefined,
  };
}
