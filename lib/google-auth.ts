import { randomBytes } from 'crypto';
import type { NextRequest } from 'next/server';

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_USERINFO_URL = 'https://www.googleapis.com/oauth2/v2/userinfo';

export interface GoogleProfile {
  id: string;
  email: string;
  name: string;
  picture?: string;
  verified_email?: boolean;
}

export function isGoogleAuthConfigured() {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

export function getAppBaseUrl() {
  return (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/$/, '');
}

/** Use actual request host so redirect_uri matches the URL user opened (fixes mismatch). */
export function resolveRequestOrigin(req: NextRequest): string {
  const forwardedHost = req.headers.get('x-forwarded-host');
  const forwardedProto = req.headers.get('x-forwarded-proto');
  if (forwardedHost) {
    const host = forwardedHost.split(',')[0].trim();
    const proto = (forwardedProto?.split(',')[0].trim() || 'https');
    return `${proto}://${host}`;
  }
  return req.nextUrl.origin;
}

export function getGoogleRedirectUri(origin?: string) {
  const base = (origin || getAppBaseUrl()).replace(/\/$/, '');
  return `${base}/api/auth/google/callback`;
}

export function createOAuthState() {
  return randomBytes(24).toString('hex');
}

export function buildGoogleAuthUrl(state: string, redirectUri: string) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) throw new Error('GOOGLE_CLIENT_ID is not configured');

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    state,
    access_type: 'online',
    prompt: 'select_account',
  });

  return `${GOOGLE_AUTH_URL}?${params.toString()}`;
}

export async function exchangeGoogleCode(code: string, redirectUri: string) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) throw new Error('Google OAuth is not configured');

  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error_description || data.error || 'Google token exchange failed');
  }
  return data as { access_token: string };
}

export async function fetchGoogleProfile(accessToken: string): Promise<GoogleProfile> {
  const res = await fetch(GOOGLE_USERINFO_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error?.message || 'Could not load Google profile');
  }
  if (!data.email) throw new Error('Google account has no email');
  return {
    id: String(data.id),
    email: String(data.email).trim().toLowerCase(),
    name: String(data.name || data.email).trim(),
    picture: data.picture ? String(data.picture) : undefined,
    verified_email: Boolean(data.verified_email),
  };
}
