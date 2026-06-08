import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-server';
import { fetchUserDomains } from '@/lib/hostinger-server';
import { HostingerApiError } from '@/lib/hostinger-client';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const data = await fetchUserDomains(user.id);
    return NextResponse.json(data);
  } catch (err) {
    if (err instanceof HostingerApiError) {
      return NextResponse.json({ error: err.message }, { status: err.status || 400 });
    }
    console.error('Hostinger domains error:', err);
    return NextResponse.json({ error: 'Failed to load domains' }, { status: 500 });
  }
}
