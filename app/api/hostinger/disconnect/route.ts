import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-server';
import { removeHostingerConnection } from '@/lib/hostinger-server';

export async function DELETE() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await removeHostingerConnection(user.id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Hostinger disconnect error:', err);
    return NextResponse.json({ error: 'Failed to disconnect' }, { status: 500 });
  }
}
