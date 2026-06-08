import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  buildGoogleAuthUrl,
  createOAuthState,
  isGoogleAuthConfigured,
} from '@/lib/google-auth';

const STATE_COOKIE = 'google_oauth_state';

export async function GET() {
  if (!isGoogleAuthConfigured()) {
    return NextResponse.json({ error: 'Google sign-in is not configured on this server.' }, { status: 503 });
  }

  const state = createOAuthState();
  const jar = await cookies();
  jar.set(STATE_COOKIE, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 10,
  });

  return NextResponse.redirect(buildGoogleAuthUrl(state));
}
