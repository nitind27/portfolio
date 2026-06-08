import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-server';
import { loadUserProjects, syncUserProjects, getUserAppConfig, type UserAppConfig } from '@/lib/projects-server';
import type { Portfolio } from '@/lib/types';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const [portfolios, appConfig] = await Promise.all([
      loadUserProjects(user),
      getUserAppConfig(user.id),
    ]);

    return NextResponse.json({ portfolios, appConfig });
  } catch (err) {
    console.error('Projects GET error:', err);
    return NextResponse.json({ error: 'Failed to load projects' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const portfolios = (body.portfolios || []) as Portfolio[];
    const appConfig = body.appConfig as UserAppConfig | undefined;
    const merge = Boolean(body.merge);

    const saved = await syncUserProjects(user, portfolios, appConfig, { merge });

    return NextResponse.json({ ok: true, portfolios: saved, count: saved.length });
  } catch (err) {
    console.error('Projects PUT error:', err);
    return NextResponse.json({ error: 'Failed to save projects' }, { status: 500 });
  }
}
