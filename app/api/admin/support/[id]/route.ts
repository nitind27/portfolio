import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, adminErrorResponse } from '@/lib/admin-server';
import {
  getSupportTicketById,
  updateSupportTicket,
  type SupportTicketPriority,
  type SupportTicketStatus,
} from '@/lib/support-tickets';

const VALID_STATUS = new Set<SupportTicketStatus>(['open', 'in_progress', 'resolved', 'closed']);
const VALID_PRIORITY = new Set<SupportTicketPriority>(['low', 'normal', 'high']);

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin(req);
    const { id } = await params;
    const ticket = await getSupportTicketById(Number(id));
    if (!ticket) return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    return NextResponse.json({ ticket });
  } catch (err) {
    const { status, body } = adminErrorResponse(err);
    return NextResponse.json(body, { status });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin(req);
    const { id } = await params;
    const body = await req.json();

    const updates: Parameters<typeof updateSupportTicket>[1] = {};
    if (body.status != null) {
      const status = String(body.status) as SupportTicketStatus;
      if (!VALID_STATUS.has(status)) {
        return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
      }
      updates.status = status;
    }
    if (body.priority != null) {
      const priority = String(body.priority) as SupportTicketPriority;
      if (!VALID_PRIORITY.has(priority)) {
        return NextResponse.json({ error: 'Invalid priority' }, { status: 400 });
      }
      updates.priority = priority;
    }
    if (body.adminNotes !== undefined) {
      updates.adminNotes = String(body.adminNotes);
    }

    const ticket = await updateSupportTicket(Number(id), updates);
    if (!ticket) return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    return NextResponse.json({ ticket });
  } catch (err) {
    const { status, body } = adminErrorResponse(err);
    return NextResponse.json(body, { status });
  }
}
