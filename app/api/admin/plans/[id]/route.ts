import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, adminErrorResponse } from '@/lib/admin-server';
import { upsertPlan, deletePlan, getPlanById } from '@/lib/plans-server';
import { parsePlanFeatures } from '@/lib/plans-types';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(req);
    const { id: idStr } = await params;
    const id = Number(idStr);
    const existing = await getPlanById(id);
    if (!existing) return NextResponse.json({ error: 'Plan not found' }, { status: 404 });

    const body = await req.json();
    await upsertPlan({
      id,
      slug: String(body.slug ?? existing.slug).trim(),
      name: String(body.name ?? existing.name).trim(),
      description: body.description != null ? String(body.description) : existing.description ?? undefined,
      price: body.price != null ? Number(body.price) : existing.price,
      currency: String(body.currency ?? existing.currency),
      tier: body.tier != null ? Number(body.tier) : existing.tier,
      isActive: body.isActive != null ? Boolean(body.isActive) : existing.isActive,
      isDefault: body.isDefault != null ? Boolean(body.isDefault) : existing.isDefault,
      features: body.features ? parsePlanFeatures(body.features) : existing.features,
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    const { status, body } = adminErrorResponse(err);
    return NextResponse.json(body, { status });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(req);
    const { id: idStr } = await params;
    await deletePlan(Number(idStr));
    return NextResponse.json({ ok: true });
  } catch (err) {
    const { status, body } = adminErrorResponse(err);
    return NextResponse.json(body, { status });
  }
}
