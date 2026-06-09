import { NextRequest, NextResponse } from 'next/server';
import type { RowDataPacket } from 'mysql2';
import { requireAdmin, adminErrorResponse } from '@/lib/admin-server';
import { getPool } from '@/lib/db';
import {
  isSmtpConfigured,
  ensureEmailTrackingSchema,
  sendPaymentConfirmationIfNeeded,
  sendWelcomeEmailIfNeeded,
} from '@/lib/system-email';

export async function POST(req: NextRequest) {
  try {
    await requireAdmin(req);
    const body = await req.json().catch(() => ({}));
    const type = String(body.type || 'payment');

    await ensureEmailTrackingSchema();

    if (!(await isSmtpConfigured())) {
      return NextResponse.json(
        { error: 'System SMTP is not configured. Save SMTP settings in Email tab first.' },
        { status: 400 },
      );
    }

    const pool = getPool();
    const results: { id: string; ok: boolean; error?: string; skipped?: string }[] = [];

    if (type === 'payment' || type === 'all') {
      const [orders] = await pool.execute<RowDataPacket[]>(
        `SELECT order_id FROM payments
         WHERE status = 'paid' AND confirmation_email_sent_at IS NULL
         ORDER BY paid_at DESC LIMIT 50`,
      );
      for (const row of orders) {
        const orderId = String(row.order_id);
        const r = await sendPaymentConfirmationIfNeeded(orderId);
        results.push({ id: orderId, ...r });
      }
    }

    if (type === 'welcome' || type === 'all') {
      const [users] = await pool.execute<RowDataPacket[]>(
        `SELECT id FROM users
         WHERE welcome_email_sent_at IS NULL
         ORDER BY created_at DESC LIMIT 50`,
      );
      for (const row of users) {
        const userId = Number(row.id);
        const r = await sendWelcomeEmailIfNeeded(userId);
        results.push({ id: `user:${userId}`, ...r });
      }
    }

    const sent = results.filter(r => r.ok && !r.skipped).length;
    const failed = results.filter(r => !r.ok && !r.skipped).length;
    const skipped = results.filter(r => r.skipped).length;

    return NextResponse.json({ ok: true, sent, failed, skipped, results });
  } catch (err) {
    const { status, body } = adminErrorResponse(err);
    return NextResponse.json(body, { status });
  }
}
