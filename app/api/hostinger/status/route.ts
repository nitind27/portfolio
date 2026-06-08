import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-server';
import { getHostingerConnection } from '@/lib/hostinger-server';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const connection = await getHostingerConnection(user.id);
    return NextResponse.json({ connection });
  } catch (err) {
    console.error('Hostinger status error:', err);
    return NextResponse.json({ error: 'Failed to load Hostinger status' }, { status: 500 });
  }
}
