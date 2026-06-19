import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
  getGoogleVerificationHtmlFile,
  googleVerificationHtmlBody,
  isGoogleVerificationPath,
} from '@/lib/google-verification';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (isGoogleVerificationPath(pathname)) {
    const file = getGoogleVerificationHtmlFile()!;
    return new NextResponse(googleVerificationHtmlBody(file), {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=86400',
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Google verification files live at the site root, e.g. /googleabc123.html
     * Match only root-level .html files (not nested paths).
     */
    '/:file((?!api|_next|uploads|logo|p)[^/]+\\.html)',
  ],
};
