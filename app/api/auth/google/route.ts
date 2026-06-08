import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  buildGoogleAuthUrl,
  createOAuthState,
  getGoogleRedirectUri,
  isGoogleAuthConfigured,
  resolveRequestOrigin,
} from '@/lib/google-auth';

const STATE_COOKIE = 'google_oauth_state';
const REDIRECT_COOKIE = 'google_oauth_redirect';

export async function GET(req: NextRequest) {
  if (!isGoogleAuthConfigured()) {
    return NextResponse.json({ error: 'Google sign-in is not configured on this server.' }, { status: 503 });
  }

  const origin = resolveRequestOrigin(req);
  const redirectUri = getGoogleRedirectUri(origin);
  const state = createOAuthState();
  const jar = await cookies();

  const cookieOpts = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 60 * 10,
  };

  jar.set(STATE_COOKIE, state, cookieOpts);
  jar.set(REDIRECT_COOKIE, redirectUri, cookieOpts);

  return NextResponse.redirect(buildGoogleAuthUrl(state, redirectUri));
}
