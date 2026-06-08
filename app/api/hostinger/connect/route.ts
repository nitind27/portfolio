import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-server';
import { saveHostingerConnection } from '@/lib/hostinger-server';
import { HostingerApiError } from '@/lib/hostinger-client';

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const apiToken = String(body.apiToken || '').trim();
    if (!apiToken || apiToken.length < 20) {
      return NextResponse.json({ error: 'Valid Hostinger API token is required' }, { status: 400 });
    }

    const result = await saveHostingerConnection(user.id, apiToken, body.label?.trim());
    return NextResponse.json({ ok: true, domainCount: result.domainCount });
  } catch (err) {
    if (err instanceof HostingerApiError) {
      return NextResponse.json({ error: err.message }, { status: err.status || 400 });
    }
    console.error('Hostinger connect error:', err);
    return NextResponse.json({ error: 'Failed to connect Hostinger. Check your API token.' }, { status: 500 });
  }
}
