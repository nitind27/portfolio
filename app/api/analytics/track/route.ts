import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-server';
import { trackSiteEvent, type AnalyticsEventType } from '@/lib/site-analytics';

const ALLOWED: AnalyticsEventType[] = [
  'page_view', 'search', 'modal_view', 'modal_cta', 'registration', 'promo_claim',
];

function getClientIp(req: NextRequest): string | null {
  const xff = req.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0]?.trim() || null;
  const xr = req.headers.get('x-real-ip');
  if (xr) return xr.trim();
  const cf = req.headers.get('cf-connecting-ip');
  if (cf) return cf.trim();
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const eventType = String(body.eventType || '') as AnalyticsEventType;
    if (!ALLOWED.includes(eventType)) {
      return NextResponse.json({ error: 'Invalid event type' }, { status: 400 });
    }

    const user = await getCurrentUser(req).catch(() => null);

    await trackSiteEvent({
      eventType,
      sessionId: body.sessionId ? String(body.sessionId) : undefined,
      userId: user?.id ?? (body.userId ? Number(body.userId) : null),
      ipAddress: getClientIp(req),
      userAgent: req.headers.get('user-agent'),
      path: body.path ? String(body.path) : undefined,
      query: body.query ? String(body.query) : undefined,
      referrer: body.referrer ? String(body.referrer) : req.headers.get('referer') || undefined,
      metadata: body.metadata && typeof body.metadata === 'object' ? body.metadata : undefined,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true });
  }
}
