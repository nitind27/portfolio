import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, adminErrorResponse } from '@/lib/admin-server';
import {
  getPromoCampaignSettings,
  savePromoCampaignSettings,
  getPromoGrantCount,
  type PromoCampaignSettings,
} from '@/lib/promo-campaign';

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req);
    const [settings, grantCount] = await Promise.all([
      getPromoCampaignSettings(),
      getPromoGrantCount(),
    ]);
    return NextResponse.json({
      settings,
      freeGrantCount: grantCount,
      slotsRemaining: Math.max(0, settings.freeGrantLimit - grantCount),
    });
  } catch (err) {
    const { status, body } = adminErrorResponse(err);
    return NextResponse.json(body, { status });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await requireAdmin(req);
    const body = await req.json();
    const updates: Partial<PromoCampaignSettings> = {};

    if (body.paidPlanDisabled !== undefined) updates.paidPlanDisabled = Boolean(body.paidPlanDisabled);
    if (body.freeGrantEnabled !== undefined) updates.freeGrantEnabled = Boolean(body.freeGrantEnabled);
    if (body.freeGrantLimit !== undefined) updates.freeGrantLimit = Number(body.freeGrantLimit);
    if (body.autoGrantOnRegister !== undefined) updates.autoGrantOnRegister = Boolean(body.autoGrantOnRegister);
    if (body.modalEnabled !== undefined) updates.modalEnabled = Boolean(body.modalEnabled);
    if (body.modalTitle !== undefined) updates.modalTitle = String(body.modalTitle);
    if (body.modalMessage !== undefined) updates.modalMessage = String(body.modalMessage);
    if (body.modalBadge !== undefined) updates.modalBadge = String(body.modalBadge);
    if (body.modalCtaText !== undefined) updates.modalCtaText = String(body.modalCtaText);
    if (body.modalCtaAction !== undefined) {
      updates.modalCtaAction = body.modalCtaAction === 'dashboard' ? 'dashboard' : 'register';
    }
    if (body.showSlotsRemaining !== undefined) updates.showSlotsRemaining = Boolean(body.showSlotsRemaining);
    if (body.showToLoggedIn !== undefined) updates.showToLoggedIn = Boolean(body.showToLoggedIn);

    const settings = await savePromoCampaignSettings(updates);
    const grantCount = await getPromoGrantCount();
    return NextResponse.json({
      settings,
      freeGrantCount: grantCount,
      slotsRemaining: Math.max(0, settings.freeGrantLimit - grantCount),
    });
  } catch (err) {
    const { status, body } = adminErrorResponse(err);
    return NextResponse.json(body, { status });
  }
}
