import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-server';
import { removeVercelConnection } from '@/lib/vercel-server';

export async function DELETE() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await removeVercelConnection(user.id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Vercel disconnect error:', err);
    return NextResponse.json({ error: 'Failed to disconnect' }, { status: 500 });
  }
}
