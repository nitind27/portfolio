import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-server';
import { getSystemSmtp, saveSystemSmtp, sendTestEmail, type SystemSmtpConfig } from '@/lib/system-email';

async function requireAdmin(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (user.role !== 'admin') return NextResponse.json({ error: 'Admin only' }, { status: 403 });
  return null;
}

// GET — fetch current system SMTP config
export async function GET(req: NextRequest) {
  const err = await requireAdmin(req);
  if (err) return err;

  const cfg = await getSystemSmtp();
  // Never return the password in the GET response
  if (cfg) {
    const { password: _pw, ...safe } = cfg;
    return NextResponse.json({ smtp: { ...safe, hasPassword: Boolean(_pw) } });
  }
  return NextResponse.json({ smtp: null });
}

// POST — save system SMTP config
export async function POST(req: NextRequest) {
  const err = await requireAdmin(req);
  if (err) return err;

  try {
    const body = await req.json();
    const cfg: SystemSmtpConfig = {
      host: String(body.host || '').trim(),
      port: Number(body.port) || 587,
      secure: Boolean(body.secure),
      user: String(body.user || '').trim(),
      password: String(body.password || ''),
      fromName: String(body.fromName || '').trim(),
      fromEmail: String(body.fromEmail || body.user || '').trim(),
      provider: String(body.provider || 'custom'),
      enabled: body.enabled !== false,
      welcomeMessage: String(body.welcomeMessage || '').trim(),
      paymentMessage: String(body.paymentMessage || '').trim(),
    };

    // If password is empty, keep existing password
    if (!cfg.password) {
      const existing = await getSystemSmtp();
      cfg.password = existing?.password || '';
    }

    await saveSystemSmtp(cfg);
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PUT — send test email
export async function PUT(req: NextRequest) {
  const err = await requireAdmin(req);
  if (err) return err;

  try {
    const body = await req.json();
    const to = String(body.to || '').trim();
    if (!to) return NextResponse.json({ error: 'Recipient email required' }, { status: 400 });

    const result = await sendTestEmail({ to });
    if (result.ok) return NextResponse.json({ ok: true });
    return NextResponse.json({ error: result.error || 'Failed to send' }, { status: 500 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
