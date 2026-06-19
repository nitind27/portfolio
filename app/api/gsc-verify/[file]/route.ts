import { NextResponse } from 'next/server';

/** Serves Google Search Console HTML verification at /googleXXXX.html via rewrite fallback */
export async function GET(
  _req: Request,
  ctx: { params: Promise<{ file: string }> },
) {
  const { file } = await ctx.params;
  if (!/^google[a-z0-9]+\.html$/i.test(file)) {
    return new NextResponse('Not found', { status: 404 });
  }
  return new NextResponse(`google-site-verification: ${file}`, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
