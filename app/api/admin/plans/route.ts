import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, adminErrorResponse } from '@/lib/admin-server';
import { getAllPlans } from '@/lib/plans-server';
import { CANONICAL_PLAN_SLUGS } from '@/lib/default-plans';

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req);
    const plans = await getAllPlans(false);
    const canonical = plans.filter(p => CANONICAL_PLAN_SLUGS.includes(p.slug as typeof CANONICAL_PLAN_SLUGS[number]));
    return NextResponse.json({ plans: canonical });
  } catch (err) {
    const { status, body } = adminErrorResponse(err);
    return NextResponse.json(body, { status });
  }
}

export async function POST() {
  return NextResponse.json(
    { error: 'New plans cannot be created. Edit Free or Premium only.' },
    { status: 400 },
  );
}
