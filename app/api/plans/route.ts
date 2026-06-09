import { NextResponse } from 'next/server';
import { getAllPlans } from '@/lib/plans-server';
import { getGstRate, getGstTaxLabel } from '@/lib/gst';

export async function GET() {
  try {
    const plans = await getAllPlans(true);
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
        enabled: true,
      },
    });
  } catch (err) {
    console.error('Plans list error:', err);
    return NextResponse.json({ error: 'Could not load plans' }, { status: 500 });
  }
}
