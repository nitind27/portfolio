import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, adminErrorResponse } from '@/lib/admin-server';
import { getAllPlans, upsertPlan, deletePlan } from '@/lib/plans-server';
import { parsePlanFeatures } from '@/lib/plans-types';

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req);
    const plans = await getAllPlans(false);
    return NextResponse.json({ plans });
  } catch (err) {
    const { status, body } = adminErrorResponse(err);
    return NextResponse.json(body, { status });
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin(req);
    const body = await req.json();
    const id = await upsertPlan({
      slug: String(body.slug || '').trim(),
      name: String(body.name || '').trim(),
      description: body.description ? String(body.description) : undefined,
      price: Number(body.price) || 0,
      currency: String(body.currency || 'INR'),
      tier: Number(body.tier) || 0,
      isActive: body.isActive !== false,
      isDefault: Boolean(body.isDefault),
      features: parsePlanFeatures(body.features),
    });
    return NextResponse.json({ id, ok: true });
  } catch (err) {
    const { status, body } = adminErrorResponse(err);
    return NextResponse.json(body, { status });
  }
}
