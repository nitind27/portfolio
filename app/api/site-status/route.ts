import { NextResponse } from 'next/server';
import { connection } from 'next/server';
import { getPublicSiteStatus } from '@/lib/site-settings';

export const dynamic = 'force-dynamic';

export async function GET() {
  await connection();
  try {
    const status = await getPublicSiteStatus();
    return NextResponse.json(status, {
      headers: {
        'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=30',
      },
    });
  } catch {
    return NextResponse.json({ maintenanceMode: false });
  }
}
