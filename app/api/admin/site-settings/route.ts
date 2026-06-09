import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, adminErrorResponse } from '@/lib/admin-server';
import { getSiteSettings, saveSiteSettings } from '@/lib/site-settings';

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req);
    const settings = await getSiteSettings();
    return NextResponse.json({ settings });
  } catch (err) {
    const { status, body } = adminErrorResponse(err);
    return NextResponse.json(body, { status });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await requireAdmin(req);
    const body = await req.json();
    const updates: Parameters<typeof saveSiteSettings>[0] = {};

    if (body.maintenanceMode !== undefined) updates.maintenanceMode = Boolean(body.maintenanceMode);
    if (body.maintenanceTitle !== undefined) updates.maintenanceTitle = String(body.maintenanceTitle);
    if (body.maintenanceMessage !== undefined) updates.maintenanceMessage = String(body.maintenanceMessage);
    if (body.maintenanceEta !== undefined) updates.maintenanceEta = String(body.maintenanceEta);
    if (body.allowAdminBypass !== undefined) updates.allowAdminBypass = Boolean(body.allowAdminBypass);

    const settings = await saveSiteSettings(updates);
    return NextResponse.json({ settings });
  } catch (err) {
    const { status, body } = adminErrorResponse(err);
    return NextResponse.json(body, { status });
  }
}
