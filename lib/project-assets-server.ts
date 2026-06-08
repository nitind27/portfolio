import { createHash } from 'crypto';
import { mkdir, writeFile, access } from 'fs/promises';
import { join } from 'path';
import type { Portfolio } from './types';
import { getPrimaryUploadRoot, uploadApiPath } from './upload-paths';

const UPLOAD_ROOT = join(getPrimaryUploadRoot(), 'projects');

function parseDataImageUrl(dataUrl: string): { mime: string; buffer: Buffer } | null {
  const match = dataUrl.match(/^data:(image\/[^;,]+);base64,([\s\S]+)$/);
  if (!match) return null;
  try {
    return { mime: match[1], buffer: Buffer.from(match[2], 'base64') };
  } catch {
    return null;
  }
}

function extFromMime(mime: string): string {
  if (mime.includes('png')) return 'png';
  if (mime.includes('webp')) return 'webp';
  if (mime.includes('gif')) return 'gif';
  if (mime.includes('svg')) return 'svg';
  return 'jpg';
}

async function fileExists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function saveDataUrl(userId: number, projectId: string, dataUrl: string): Promise<string> {
  const parsed = parseDataImageUrl(dataUrl);
  if (!parsed) return dataUrl;

  const hash = createHash('sha256').update(parsed.buffer).digest('hex').slice(0, 20);
  const ext = extFromMime(parsed.mime);
  const dir = join(UPLOAD_ROOT, String(userId), projectId);
  const filename = `${hash}.${ext}`;
  const filepath = join(dir, filename);
  const publicUrl = uploadApiPath(`projects/${userId}/${projectId}/${filename}`);

  if (!(await fileExists(filepath))) {
    await mkdir(dir, { recursive: true });
    await writeFile(filepath, parsed.buffer);
  }

  return publicUrl;
}

async function externalizeValue(val: unknown, userId: number, projectId: string): Promise<unknown> {
  if (typeof val === 'string') {
    if (val.startsWith('data:image/')) return saveDataUrl(userId, projectId, val);
    return val;
  }
  if (Array.isArray(val)) {
    return Promise.all(val.map(item => externalizeValue(item, userId, projectId)));
  }
  if (val && typeof val === 'object') {
    const out: Record<string, unknown> = {};
    for (const [key, nested] of Object.entries(val as Record<string, unknown>)) {
      out[key] = await externalizeValue(nested, userId, projectId);
    }
    return out;
  }
  return val;
}

/** Replace embedded base64 images with file URLs before DB storage. */
export async function externalizePortfolioAssets(userId: number, portfolio: Portfolio): Promise<Portfolio> {
  return externalizeValue(portfolio, userId, portfolio.id) as Promise<Portfolio>;
}
