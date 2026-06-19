import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, adminErrorResponse } from '@/lib/admin-server';
import {
  getOutreachUsers,
  getOutreachStats,
  getUserOutreachHistory,
  logOutreachEmail,
  type OutreachFilter,
} from '@/lib/outreach-server';
import { isSmtpConfigured, sendOutreachEmail } from '@/lib/system-email';
import { getPool } from '@/lib/db';
import type { RowDataPacket } from 'mysql2';

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req);
    const { searchParams } = req.nextUrl;
    const filter = (searchParams.get('filter') || 'all_users') as OutreachFilter;
    const search = searchParams.get('search') || '';
    const userId = searchParams.get('userId');

    if (userId) {
      const history = await getUserOutreachHistory(Number(userId));
      return NextResponse.json({ history });
    }

    const [users, stats, smtpOk] = await Promise.all([
      getOutreachUsers({ filter, search, limit: 500 }),
      getOutreachStats(),
      isSmtpConfigured(),
    ]);

    return NextResponse.json({ users, stats, smtpConfigured: smtpOk });
  } catch (err) {
    const { status, body } = adminErrorResponse(err);
    return NextResponse.json(body, { status });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin(req);
    const body = await req.json().catch(() => ({}));

    const userIds: number[] = Array.isArray(body.userIds)
      ? body.userIds.map((id: unknown) => Number(id)).filter((id: number) => id > 0)
      : body.userId
        ? [Number(body.userId)]
        : [];

    const subject = String(body.subject || '').trim();
    const message = String(body.message || '').trim();
    const templateId = body.templateId ? String(body.templateId) : null;

    if (!userIds.length) {
      return NextResponse.json({ error: 'Select at least one user' }, { status: 400 });
    }
    if (!subject) {
      return NextResponse.json({ error: 'Subject is required' }, { status: 400 });
    }
    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    if (!(await isSmtpConfigured())) {
      return NextResponse.json(
        { error: 'SMTP not configured. Set up email in Email & SMTP tab first.' },
        { status: 400 },
      );
    }

    const pool = getPool();
    const results: { userId: number; email: string; ok: boolean; error?: string }[] = [];

    for (const userId of userIds) {
      const [rows] = await pool.execute<RowDataPacket[]>(
        `SELECT u.id, u.name, u.email,
          (SELECT up.name FROM user_projects up WHERE up.user_id = u.id ORDER BY up.updated_at DESC LIMIT 1) AS latest_project,
          (SELECT up.published FROM user_projects up WHERE up.user_id = u.id ORDER BY up.updated_at DESC LIMIT 1) AS latest_published,
          (SELECT COUNT(*) FROM user_projects up WHERE up.user_id = u.id) AS project_count
         FROM users u WHERE u.id = ? AND u.role = 'user' LIMIT 1`,
        [userId],
      );
      const row = rows[0];
      if (!row) {
        results.push({ userId, email: '', ok: false, error: 'User not found' });
        continue;
      }

      const email = String(row.email);
      const name = String(row.name);
      const projectCount = Number(row.project_count || 0);
      const latestProject = row.latest_project ? String(row.latest_project) : undefined;
      const latestPublished = row.latest_published != null ? Boolean(row.latest_published) : false;

      let projectName: string | undefined;
      let projectStatus: string | undefined;
      if (projectCount > 0 && latestProject) {
        projectName = latestProject;
        projectStatus = latestPublished ? 'Live / Published' : 'Draft — not published';
      }

      const result = await sendOutreachEmail({
        to: email,
        name,
        subject,
        message,
        projectName,
        projectStatus,
      });

      if (result.ok) {
        await logOutreachEmail({
          userId,
          adminId: admin.id,
          subject,
          message,
          templateId,
        });
      }

      results.push({ userId, email, ...result });
    }

    const sent = results.filter(r => r.ok).length;
    const failed = results.filter(r => !r.ok).length;

    return NextResponse.json({ ok: true, sent, failed, results });
  } catch (err) {
    const { status, body } = adminErrorResponse(err);
    return NextResponse.json(body, { status });
  }
}
