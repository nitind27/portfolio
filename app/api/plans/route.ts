import { NextResponse } from 'next/server';
import { getAllPlans } from '@/lib/plans-server';
import { getGstRate, getGstTaxLabel, isGstCharged } from '@/lib/gst';
import { getPublicPromoStatus } from '@/lib/promo-campaign';

export async function GET() {
  try {
    const [plans, promo] = await Promise.all([
      getAllPlans(true),
      getPublicPromoStatus(),
    ]);
    return NextResponse.json({
      plans: plans.map(p => ({
        id: p.id,
        slug: p.slug,
        name: p.name,
        description: p.description,
        price: p.price,
        currency: p.currency,
        tier: p.tier,
        features: p.features,
      })),
      tax: {
        rate: getGstRate(),
        label: getGstTaxLabel(),
        enabled: isGstCharged(),
      },
      promo: {
        paidPlanDisabled: promo.paidPlanDisabled,
        freeGrantEnabled: promo.freeGrantEnabled,
        slotsRemaining: promo.slotsRemaining,
        grantsExhausted: promo.grantsExhausted,
        hidePaidPricing: promo.hidePaidPricing,
      },
    });
  } catch (err) {
    console.error('Plans list error:', err);
    return NextResponse.json({ error: 'Could not load plans' }, { status: 500 });
  }
}
