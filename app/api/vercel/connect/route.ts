import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-server';
import { saveVercelConnection } from '@/lib/vercel-server';
import { VercelApiError } from '@/lib/vercel-client';

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const accessToken = String(body.accessToken || '').trim();
    if (!accessToken) {
      return NextResponse.json({ error: 'Vercel access token is required' }, { status: 400 });
    }

    const result = await saveVercelConnection(user.id, accessToken, { authMethod: 'token' });
    return NextResponse.json({ ok: true, username: result.username });
  } catch (err) {
    if (err instanceof VercelApiError) {
      return NextResponse.json({ error: err.message }, { status: err.status || 400 });
    }
    console.error('Vercel connect error:', err);
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Connection failed' }, { status: 500 });
  }
}
