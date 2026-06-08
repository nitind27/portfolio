import { NextRequest, NextResponse } from 'next/server';
import { getPublicPortfolioBySlug } from '@/lib/public-portfolio-server';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    const result = await getPublicPortfolioBySlug(slug);
    if (!result.ok) {
      const status = result.reason === 'draft' ? 403 : result.reason === 'expired' ? 410 : 404;
      return NextResponse.json({ error: result.reason }, { status });
    }
    return NextResponse.json({
      portfolio: result.portfolio,
      daysRemaining: result.daysRemaining,
      ownerPlan: result.ownerPlan,
    });
  } catch (err) {
    console.error('Public portfolio error:', err);
    return NextResponse.json({ error: 'Could not load portfolio' }, { status: 500 });
  }
}
