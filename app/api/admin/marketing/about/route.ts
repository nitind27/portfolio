import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, adminErrorResponse } from '@/lib/admin-server';
import { getMarketingAbout, saveMarketingAbout } from '@/lib/marketing-about';

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req);
    const content = await getMarketingAbout();
    return NextResponse.json({ content });
  } catch (err) {
    const { status, body } = adminErrorResponse(err);
    return NextResponse.json(body, { status });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await requireAdmin(req);
    const body = await req.json();
    const content = await saveMarketingAbout(body);
    return NextResponse.json({ content });
  } catch (err) {
    const { status, body } = adminErrorResponse(err);
    return NextResponse.json(body, { status });
  }
}
