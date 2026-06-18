import { NextRequest, NextResponse } from 'next/server';
import { enrichAuthUser, getCurrentUser } from '@/lib/auth-server';

export async function GET(req: NextRequest) {
  try {
    const raw = await getCurrentUser(req);
    if (!raw) {
      return NextResponse.json({ user: null }, { status: 401 });
    }
    const user = await enrichAuthUser(raw);
    return NextResponse.json({ user });
  } catch (err) {
    console.error('Me error:', err);
    return NextResponse.json({ error: 'Session check failed' }, { status: 500 });
  }
}
