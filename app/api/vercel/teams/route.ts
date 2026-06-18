import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-server';
import { fetchUserVercelTeams, setVercelTeam } from '@/lib/vercel-server';
import { VercelApiError } from '@/lib/vercel-client';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const teams = await fetchUserVercelTeams(user.id);
    return NextResponse.json({ teams });
  } catch (err) {
    if (err instanceof VercelApiError) {
      return NextResponse.json({ error: err.message }, { status: err.status || 400 });
    }
    return NextResponse.json({ error: 'Failed to load teams' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await req.json();
    const teamId = body.teamId === null || body.teamId === '' ? null : String(body.teamId);
    await setVercelTeam(user.id, teamId);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to update team' }, { status: 500 });
  }
}
