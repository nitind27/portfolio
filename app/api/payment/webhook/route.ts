import { NextRequest, NextResponse } from 'next/server';
import type { RowDataPacket } from 'mysql2';
import { getPool } from '@/lib/db';
import { activatePremiumFromOrder } from '@/lib/payment-server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const orderId = body?.data?.order?.order_id || body?.order_id;
    const status = body?.data?.payment?.payment_status || body?.data?.order?.order_status;

    if (!orderId) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    if (status === 'SUCCESS' || status === 'PAID') {
      await activatePremiumFromOrder(orderId);
    } else if (status === 'FAILED') {
      const pool = getPool();
      const [rows] = await pool.execute<RowDataPacket[]>(
        `SELECT p.user_id, u.email, u.name FROM payments p
         JOIN users u ON u.id = p.user_id
         WHERE p.order_id = ? LIMIT 1`,
        [orderId],
      );
      if (rows[0]) {
        await pool.execute(`UPDATE payments SET status = 'failed' WHERE order_id = ?`, [orderId]);
        // Send failure email (fire-and-forget)
        const row = rows[0] as { user_id: number; email: string; name: string };
        import('@/lib/system-email').then(({ sendPaymentFailedEmail }) => {
          sendPaymentFailedEmail({ to: row.email, name: row.name, orderId }).catch(() => {});
        }).catch(() => {});
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Webhook error:', err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
