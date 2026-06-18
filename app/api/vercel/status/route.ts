import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-server';
import { getVercelConnection } from '@/lib/vercel-server';
import { isVercelOAuthConfigured } from '@/lib/vercel-oauth';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const connection = await getVercelConnection(user.id);
    return NextResponse.json({
      connection: { ...connection, oauthAvailable: isVercelOAuthConfigured() },
    });
  } catch (err) {
    console.error('Vercel status error:', err);
    return NextResponse.json({ error: 'Failed to load status' }, { status: 500 });
  }
}
