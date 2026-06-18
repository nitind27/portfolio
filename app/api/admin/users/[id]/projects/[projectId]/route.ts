import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, adminErrorResponse } from '@/lib/admin-server';
import {
  getUserProjectAdmin, saveUserProjectAdmin, deleteUserProjectAdmin,
} from '@/lib/admin-projects-server';
import type { Portfolio } from '@/lib/types';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; projectId: string }> },
) {
  try {
    await requireAdmin(req);
    const { id, projectId } = await params;
    const portfolio = await getUserProjectAdmin(Number(id), projectId);
    if (!portfolio) return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    return NextResponse.json({ portfolio });
  } catch (err) {
    const { status, body } = adminErrorResponse(err);
    return NextResponse.json(body, { status });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; projectId: string }> },
) {
  try {
    await requireAdmin(req);
    const { id, projectId } = await params;
    const body = await req.json();
    const portfolio = body.portfolio as Portfolio | undefined;
    if (!portfolio?.id || portfolio.id !== projectId) {
      return NextResponse.json({ error: 'Invalid portfolio' }, { status: 400 });
    }
    const saved = await saveUserProjectAdmin(Number(id), portfolio);
    return NextResponse.json({ portfolio: saved });
  } catch (err) {
    const { status, body } = adminErrorResponse(err);
    return NextResponse.json(body, { status });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; projectId: string }> },
) {
  try {
    await requireAdmin(req);
    const { id, projectId } = await params;
    await deleteUserProjectAdmin(Number(id), projectId);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const { status, body } = adminErrorResponse(err);
    return NextResponse.json(body, { status });
  }
}
