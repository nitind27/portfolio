import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, adminErrorResponse } from '@/lib/admin-server';
import { getAdminUsers, assignUserPlan } from '@/lib/plans-server';
import { getPool } from '@/lib/db';
import type { RowDataPacket } from 'mysql2';
import { fetchUserById, refreshAuthCookie } from '@/lib/auth-server';

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req);
    const users = await getAdminUsers();
    return NextResponse.json({ users });
  } catch (err) {
    const { status, body } = adminErrorResponse(err);
    return NextResponse.json(body, { status });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await requireAdmin(req);
    const body = await req.json();
    const userId = Number(body.userId);
    const action = String(body.action || '');

    if (action === 'set_role') {
      const role = body.role === 'admin' ? 'admin' : 'user';
      const pool = getPool();
      await pool.execute('UPDATE users SET role = ? WHERE id = ?', [role, userId]);
      return NextResponse.json({ ok: true });
    }

    if (action === 'set_plan') {
      const planId = Number(body.planId);
      await assignUserPlan(userId, planId);
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err) {
    const { status, body } = adminErrorResponse(err);
    return NextResponse.json(body, { status });
  }
}
