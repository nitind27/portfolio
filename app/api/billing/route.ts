import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-server';
import { getUserBilling } from '@/lib/billing-server';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Please login first' }, { status: 401 });
    }

    const billing = await getUserBilling(user.id);
    return NextResponse.json({
      user: {
        name: user.name,
        email: user.email,
        planName: billing.planName,
        planSlug: billing.planSlug,
        isPremium: billing.isPremium,
        premiumPurchasedAt: billing.premiumPurchasedAt,
      },
      ...billing,
    });
  } catch (err) {
    console.error('Billing error:', err);
    return NextResponse.json({ error: 'Could not load billing' }, { status: 500 });
  }
}
