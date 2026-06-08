import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-server';
import { getPortfolioAccess } from '@/lib/portfolio-access-server';
import { deployPortfolioToHostinger, getLatestDeployment } from '@/lib/hostinger-server';
import { HostingerApiError } from '@/lib/hostinger-client';
import type { Portfolio } from '@/lib/types';

export const maxDuration = 120;

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const portfolio = body.portfolio as Portfolio | undefined;
    const domain = String(body.domain || '').trim();

    if (!portfolio?.id || !domain) {
      return NextResponse.json({ error: 'Portfolio and domain are required' }, { status: 400 });
    }

    const access = await getPortfolioAccess(user, portfolio.id);
    if (access.status !== 'allowed') {
      return NextResponse.json({ error: 'Premium required to deploy live', code: access.status }, { status: 403 });
    }

    const result = await deployPortfolioToHostinger(user.id, portfolio, domain);
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    if (err instanceof HostingerApiError) {
      return NextResponse.json({ error: err.message }, { status: err.status || 400 });
    }
    console.error('Hostinger deploy error:', err);
    const msg = err instanceof Error ? err.message : 'Deploy failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const portfolioId = req.nextUrl.searchParams.get('portfolioId');
    if (!portfolioId) return NextResponse.json({ error: 'portfolioId required' }, { status: 400 });

    const deployment = await getLatestDeployment(user.id, portfolioId);
    return NextResponse.json({ deployment });
  } catch (err) {
    console.error('Hostinger deploy status error:', err);
    return NextResponse.json({ error: 'Failed to load deployment status' }, { status: 500 });
  }
}
