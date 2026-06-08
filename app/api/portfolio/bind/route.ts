import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, refreshAuthCookie, fetchUserById } from '@/lib/auth-server';
import { bindPortfolioToUser } from '@/lib/portfolio-access-server';
import { canExport } from '@/lib/plans-types';
import { getUserFeatures } from '@/lib/plans-server';

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const features = await getUserFeatures(user);
    const hasAccess = canExport(features) || features.shareLink || user.isPremium;
    if (!hasAccess) {
      return NextResponse.json({ error: 'Upgrade required' }, { status: 403 });
    }

    const body = await req.json();
    const portfolioId = String(body.portfolioId || '').trim();
    if (!portfolioId) {
      return NextResponse.json({ error: 'portfolioId required' }, { status: 400 });
    }

    try {
      await bindPortfolioToUser(user.id, portfolioId);
    } catch (e) {
      const msg = e instanceof Error ? e.message : '';
      if (msg === 'SLOT_USED') {
        return NextResponse.json({
          error: 'Your plan slot is already used on another portfolio. Upgrade to unlock more.',
          code: 'SLOT_USED',
        }, { status: 403 });
      }
      throw e;
    }

    const updated = await fetchUserById(user.id);
    if (updated) await refreshAuthCookie(updated);

    return NextResponse.json({
      ok: true,
      premiumPortfolioId: portfolioId,
      user: updated,
    });
  } catch (err) {
    console.error('Portfolio bind error:', err);
    return NextResponse.json({ error: 'Bind failed' }, { status: 500 });
  }
}
