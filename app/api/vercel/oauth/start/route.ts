import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getCurrentUser } from '@/lib/auth-server';
import {
  buildVercelAuthorizeUrl, createVercelOAuthState, getVercelRedirectUri, isVercelOAuthConfigured,
  VERCEL_OAUTH_STATE_COOKIE, VERCEL_OAUTH_RETURN_COOKIE,
} from '@/lib/vercel-oauth';
import { resolveRequestOrigin } from '@/lib/google-auth';

const STATE_COOKIE = 'vercel_oauth_state';
const RETURN_COOKIE = 'vercel_oauth_return';

export async function GET(req: NextRequest) {
  if (!isVercelOAuthConfigured()) {
    return NextResponse.json({ error: 'Vercel OAuth is not configured on this server' }, { status: 503 });
  }

  const user = await getCurrentUser(req);
  if (!user) {
    const login = new URL('/', resolveRequestOrigin(req));
    login.searchParams.set('login', '1');
    return NextResponse.redirect(login.toString());
  }

  const returnTo = req.nextUrl.searchParams.get('returnTo') || '/';
  const state = createVercelOAuthState();
  const jar = await cookies();
  jar.set(VERCEL_OAUTH_STATE_COOKIE, state, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 600, path: '/' });
  jar.set(VERCEL_OAUTH_RETURN_COOKIE, returnTo, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 600, path: '/' });

  const url = buildVercelAuthorizeUrl(state, resolveRequestOrigin(req));
  return NextResponse.redirect(url);
}
