import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, adminErrorResponse } from '@/lib/admin-server';
import { getAdminUserProfile } from '@/lib/admin-projects-server';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin(req);
    const { id } = await params;
    const profile = await getAdminUserProfile(Number(id));
    if (!profile) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    return NextResponse.json({ profile });
  } catch (err) {
    const { status, body } = adminErrorResponse(err);
    return NextResponse.json(body, { status });
  }
}
