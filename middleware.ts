import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const BYPASS_PREFIXES = ['/admin', '/api', '/_next', '/maintenance', '/support'];

function shouldBypass(pathname: string) {
  if (BYPASS_PREFIXES.some(p => pathname.startsWith(p))) return true;
  if (pathname.startsWith('/logo') || pathname.startsWith('/uploads')) return true;
  if (/\.[a-z0-9]+$/i.test(pathname)) return true;
  return false;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-pathname', pathname);

  if (shouldBypass(pathname)) {
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  try {
    const statusUrl = new URL('/api/site-status', request.url);
    const res = await fetch(statusUrl, {
      headers: { 'x-middleware': '1' },
      cache: 'no-store',
    });
    if (!res.ok) {
      return NextResponse.next({ request: { headers: requestHeaders } });
    }

    const data = await res.json() as { maintenanceMode?: boolean; allowAdminBypass?: boolean };
    if (!data.maintenanceMode) {
      return NextResponse.next({ request: { headers: requestHeaders } });
    }

    if (data.allowAdminBypass !== false) {
      const meUrl = new URL('/api/auth/me', request.url);
      const meRes = await fetch(meUrl, {
        headers: { cookie: request.headers.get('cookie') || '' },
        cache: 'no-store',
      });
      if (meRes.ok) {
        const me = await meRes.json() as { user?: { role?: string } };
        if (me.user?.role === 'admin') {
          return NextResponse.next({ request: { headers: requestHeaders } });
        }
      }
    }

    const rewriteUrl = request.nextUrl.clone();
    rewriteUrl.pathname = '/maintenance';
    return NextResponse.rewrite(rewriteUrl, { request: { headers: requestHeaders } });
  } catch {
    return NextResponse.next({ request: { headers: requestHeaders } });
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
