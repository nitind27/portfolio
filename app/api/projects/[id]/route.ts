import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-server';
import { loadUserProjects } from '@/lib/projects-server';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getCurrentUser(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const portfolios = await loadUserProjects(user);
    const portfolio = portfolios.find(p => p.id === id);
    if (!portfolio) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json({ portfolio });
  } catch (err) {
    console.error('Project GET error:', err);
    return NextResponse.json({ error: 'Failed to load project' }, { status: 500 });
  }
}
