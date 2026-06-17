import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, adminErrorResponse } from '@/lib/admin-server';
import { getAnalyticsSummary } from '@/lib/site-analytics';
import { getPromoGrantCount, getPromoCampaignSettings } from '@/lib/promo-campaign';

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req);
    const [summary, promoSettings, grantCount] = await Promise.all([
      getAnalyticsSummary(),
      getPromoCampaignSettings(),
      getPromoGrantCount(),
    ]);
    return NextResponse.json({
      ...summary,
      promo: {
        ...promoSettings,
        freeGrantCount: grantCount,
        slotsRemaining: Math.max(0, promoSettings.freeGrantLimit - grantCount),
      },
    });
  } catch (err) {
    const { status, body } = adminErrorResponse(err);
    return NextResponse.json(body, { status });
  }
}
