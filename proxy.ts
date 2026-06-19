import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
  getGoogleVerificationHtmlFile,
  googleVerificationHtmlBody,
  parseGoogleVerificationPath,
} from '@/lib/google-verification';

/** Pass pathname to server components + Google Search Console HTML verification */
export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const googleFile = parseGoogleVerificationPath(pathname);
  if (googleFile) {
    const configured = getGoogleVerificationHtmlFile();
    if (configured && configured !== googleFile) {
      return NextResponse.next();
    }
    return new NextResponse(googleVerificationHtmlBody(googleFile), {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=86400',
      },
    });
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-pathname', pathname);
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
