import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, adminErrorResponse } from '@/lib/admin-server';
import { savePromoCampaignSettings } from '@/lib/promo-campaign';
import { getPrimaryUploadRoot } from '@/lib/upload-paths-server';
import { uploadApiPath } from '@/lib/upload-paths';

const MAX_BYTES = 5 * 1024 * 1024;

const TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
};

export async function POST(req: NextRequest) {
  try {
    await requireAdmin(req);
    const form = await req.formData();
    const file = form.get('file');
    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Choose an image file' }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: 'Image must be under 5 MB' }, { status: 400 });
    }
    const ext = TYPES[file.type];
    if (!ext) {
      return NextResponse.json({ error: 'Use JPG, PNG, WEBP, or GIF' }, { status: 400 });
    }

    const filename = `popup-${Date.now()}.${ext}`;
    const dir = join(getPrimaryUploadRoot(), 'promo');
    await mkdir(dir, { recursive: true });
    await writeFile(join(dir, filename), Buffer.from(await file.arrayBuffer()));

    const url = uploadApiPath(`promo/${filename}`);
    const settings = await savePromoCampaignSettings({ modalImageUrl: url, modalEnabled: true });
    return NextResponse.json({ url, settings });
  } catch (err) {
    const { status, body } = adminErrorResponse(err);
    return NextResponse.json(body, { status });
  }
}
