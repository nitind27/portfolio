import { NextRequest, NextResponse } from 'next/server';
import { enrichAuthUser, getCurrentUser } from '@/lib/auth-server';
import { getUserBilling } from '@/lib/billing-server';

export async function GET(req: NextRequest) {
  try {
    const raw = await getCurrentUser(req);
    if (!raw) {
      return NextResponse.json({ error: 'Please login first' }, { status: 401 });
    }
    const user = await enrichAuthUser(raw);

    const billing = await getUserBilling(user.id);
    return NextResponse.json({
      user: {
        name: user.name,
        email: user.email,
        planName: user.planName || billing.planName,
        planSlug: user.planSlug || billing.planSlug,
        isPremium: user.isPremium,
        premiumPurchasedAt: billing.premiumPurchasedAt,
      },
      ...billing,
      isPremium: user.isPremium,
      planName: user.planName || billing.planName,
      planSlug: user.planSlug || billing.planSlug,
    });
  } catch (err) {
    console.error('Billing error:', err);
    return NextResponse.json({ error: 'Could not load billing' }, { status: 500 });
  }
}
