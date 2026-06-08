import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-server';
import { getPortfolioAccess } from '@/lib/portfolio-access-server';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    const portfolioId = req.nextUrl.searchParams.get('portfolioId') || '';
    if (!portfolioId) {
      return NextResponse.json({ error: 'portfolioId required' }, { status: 400 });
    }
    const access = await getPortfolioAccess(user, portfolioId);
    return NextResponse.json(access);
  } catch (err) {
    console.error('Portfolio access error:', err);
    return NextResponse.json({ error: 'Access check failed' }, { status: 500 });
  }
}
