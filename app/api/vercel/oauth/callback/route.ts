import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getCurrentUser } from '@/lib/auth-server';
import { exchangeVercelCode, getVercelRedirectUri, VERCEL_OAUTH_STATE_COOKIE, VERCEL_OAUTH_RETURN_COOKIE } from '@/lib/vercel-oauth';
import { saveVercelConnection } from '@/lib/vercel-server';
import { resolveRequestOrigin } from '@/lib/google-auth';

export async function GET(req: NextRequest) {
  const origin = resolveRequestOrigin(req);
  const fail = (msg: string) => {
    const url = new URL('/', origin);
    url.searchParams.set('vercel', 'error');
    url.searchParams.set('message', msg);
    return NextResponse.redirect(url.toString());
  };

  const user = await getCurrentUser(req);
  if (!user) return fail('Please sign in first');

  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const jar = await cookies();
  const savedState = jar.get(VERCEL_OAUTH_STATE_COOKIE)?.value;
  const returnTo = jar.get(VERCEL_OAUTH_RETURN_COOKIE)?.value || '/';
  jar.delete(VERCEL_OAUTH_STATE_COOKIE);
  jar.delete(VERCEL_OAUTH_RETURN_COOKIE);

  if (!code || !state || !savedState || state !== savedState) {
    return fail('Invalid Vercel login session');
  }

  try {
    const redirectUri = getVercelRedirectUri(origin);
    const tokens = await exchangeVercelCode(code, redirectUri);
    if (!tokens.accessToken) return fail('No access token from Vercel');

    await saveVercelConnection(user.id, tokens.accessToken, {
      authMethod: 'oauth',
      teamId: tokens.teamId,
      label: tokens.teamId ? 'Vercel (team)' : undefined,
    });

    const url = new URL(returnTo.startsWith('http') ? returnTo : `${origin}${returnTo}`);
    url.searchParams.set('vercel', 'connected');
    return NextResponse.redirect(url.toString());
  } catch (err) {
    console.error('Vercel OAuth callback error:', err);
    return fail(err instanceof Error ? err.message : 'Vercel login failed');
  }
}
