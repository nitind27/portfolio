import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, adminErrorResponse } from '@/lib/admin-server';
import { getExtendedAdminStats } from '@/lib/admin-data';

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req);
    const stats = await getExtendedAdminStats();
    return NextResponse.json(stats);
  } catch (err) {
    const { status, body } = adminErrorResponse(err);
    return NextResponse.json(body, { status });
  }
}
