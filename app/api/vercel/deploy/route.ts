import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-server';
import { getPortfolioAccess } from '@/lib/portfolio-access-server';
import { deployPortfolioToVercel, getLatestVercelDeployment } from '@/lib/vercel-server';
import { VercelApiError } from '@/lib/vercel-client';
import type { Portfolio } from '@/lib/types';

export const maxDuration = 300;

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const portfolio = body.portfolio as Portfolio | undefined;
    const teamId = body.teamId ? String(body.teamId) : undefined;
    const format = body.format === 'static' ? 'static' : 'nextjs';

    if (!portfolio?.id) {
      return NextResponse.json({ error: 'Portfolio is required' }, { status: 400 });
    }

    const access = await getPortfolioAccess(user, portfolio.id, 'deploy');
    if (access.status !== 'allowed') {
      return NextResponse.json({ error: 'Premium required to deploy', code: access.status }, { status: 403 });
    }

    const result = await deployPortfolioToVercel(user.id, portfolio, { teamId, format });
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    if (err instanceof VercelApiError) {
      return NextResponse.json({ error: err.message }, { status: err.status || 400 });
    }
    console.error('Vercel deploy error:', err);
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Deploy failed' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const portfolioId = req.nextUrl.searchParams.get('portfolioId');
    if (!portfolioId) return NextResponse.json({ error: 'portfolioId required' }, { status: 400 });
    const deployment = await getLatestVercelDeployment(user.id, portfolioId);
    return NextResponse.json({ deployment });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to load deployment' }, { status: 500 });
  }
}
