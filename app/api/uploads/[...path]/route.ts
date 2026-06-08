import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { findUploadFile } from '@/lib/upload-paths-server';

const MIME: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  webp: 'image/webp',
  svg: 'image/svg+xml',
};

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  try {
    const { path } = await params;
    const relative = path.join('/');
    const filepath = await findUploadFile(relative);
    if (!filepath) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const buffer = await readFile(filepath);
    const ext = relative.split('.').pop()?.toLowerCase() || 'jpg';
    const contentType = MIME[ext] || 'application/octet-stream';

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (err) {
    console.error('Upload serve error:', err);
    return NextResponse.json({ error: 'Failed to load file' }, { status: 500 });
  }
}
