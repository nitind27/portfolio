import { NextResponse } from 'next/server';
import { getPublicPromoStatus } from '@/lib/promo-campaign';

export async function GET() {
  try {
    const status = await getPublicPromoStatus();
    return NextResponse.json(status);
  } catch {
    return NextResponse.json({
      paidPlanDisabled: false,
      freeGrantEnabled: false,
      hidePaidPricing: false,
      modal: null,
    });
  }
}
