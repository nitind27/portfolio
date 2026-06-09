import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-server';
import { isValidEmail } from '@/lib/validators';
import { sendSupportTicket, type SupportTicketType } from '@/lib/system-email';
import { createSupportTicket, markTicketEmailSent } from '@/lib/support-tickets';

const VALID_TYPES = new Set<SupportTicketType>(['complaint', 'feedback', 'bug', 'billing', 'other']);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const type = String(body.type || '').trim() as SupportTicketType;
    const name = String(body.name || '').trim();
    const email = String(body.email || '').trim().toLowerCase();
    const subject = String(body.subject || '').trim();
    const message = String(body.message || '').trim();
    const orderId = String(body.orderId || '').trim();

    if (!VALID_TYPES.has(type)) {
      return NextResponse.json({ error: 'Please select a valid request type' }, { status: 400 });
    }
    if (!name || name.length < 2) {
      return NextResponse.json({ error: 'Name must be at least 2 characters' }, { status: 400 });
    }
    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ error: 'Please enter a valid email address' }, { status: 400 });
    }
    if (!subject || subject.length < 3) {
      return NextResponse.json({ error: 'Subject must be at least 3 characters' }, { status: 400 });
    }
    if (!message || message.length < 10) {
      return NextResponse.json({ error: 'Message must be at least 10 characters' }, { status: 400 });
    }
    if (message.length > 5000) {
      return NextResponse.json({ error: 'Message is too long (max 5000 characters)' }, { status: 400 });
    }

    const user = await getCurrentUser(req);

    const ticket = await createSupportTicket({
      type,
      name,
      email,
      subject,
      message,
      orderId: orderId || undefined,
      userId: user?.id,
      emailSent: false,
    });

    const result = await sendSupportTicket({
      type,
      name,
      email,
      subject: `[${ticket.ticketRef}] ${subject}`,
      message,
      orderId: orderId || undefined,
      userId: user?.id,
    });

    if (result.ok) {
      await markTicketEmailSent(ticket.id);
    } else {
      console.warn('[Support] email failed, ticket saved:', ticket.ticketRef, result.error);
    }

    return NextResponse.json({
      success: true,
      ticketRef: ticket.ticketRef,
      emailSent: result.ok,
    });
  } catch (err) {
    console.error('[Support] error:', err);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
