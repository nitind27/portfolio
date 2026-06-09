import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, adminErrorResponse } from '@/lib/admin-server';
import { getSupportTickets, getSupportTicketStats } from '@/lib/support-tickets';

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req);
    const { searchParams } = req.nextUrl;
    const status = searchParams.get('status') || 'all';
    const type = searchParams.get('type') || 'all';
    const search = searchParams.get('search') || '';
    const limit = Number(searchParams.get('limit') || 200);

    const [tickets, stats] = await Promise.all([
      getSupportTickets({ status, type, search, limit }),
      getSupportTicketStats(),
    ]);

    return NextResponse.json({ tickets, stats });
  } catch (err) {
    const { status, body } = adminErrorResponse(err);
    return NextResponse.json(body, { status });
  }
}
