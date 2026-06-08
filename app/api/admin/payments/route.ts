import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, adminErrorResponse } from '@/lib/admin-server';
import { getAdminPayments } from '@/lib/admin-data';

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req);
    const limit = Number(req.nextUrl.searchParams.get('limit') || 100);
    const payments = await getAdminPayments(Math.min(limit, 500));
    return NextResponse.json({ payments });
  } catch (err) {
    const { status, body } = adminErrorResponse(err);
    return NextResponse.json(body, { status });
  }
}
