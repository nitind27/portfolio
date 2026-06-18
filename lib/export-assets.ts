import { Portfolio } from './types';
import { uploadApiPath } from './upload-paths';

const MIME_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
  'image/webp': 'webp',
  'image/svg+xml': 'svg',
  'image/bmp': 'bmp',
  'image/avif': 'avif',
};

export type UploadBytesLoader = (relativePath: string) => Promise<{ bytes: Uint8Array; ext: string } | null>;

export function escapeHtml(s: string): string {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function parseDataUrl(dataUrl: string): { ext: string; bytes: Uint8Array } | null {
  const match = dataUrl.match(/^data:([^;,]+)?(?:;base64)?,([\s\S]+)$/);
  if (!match) return null;
  const mime = match[1] || 'image/png';
  const ext = MIME_EXT[mime] || mime.split('/')[1] || 'png';
  const raw = match[2];
  if (dataUrl.includes(';base64,')) {
    const bin = atob(raw);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return { ext, bytes };
  }
  const decoded = decodeURIComponent(raw);
  const bytes = new Uint8Array(decoded.length);
  for (let i = 0; i < decoded.length; i++) bytes[i] = decoded.charCodeAt(i);
  return { ext, bytes };
}

/** Relative path under uploads/ from stored portfolio URLs. */
export function extractUploadRelativePath(url: string): string | null {
  const trimmed = url.trim();
  let path = trimmed;
  if (path.startsWith('http://') || path.startsWith('https://')) {
    try {
      path = new URL(path).pathname;
    } catch {
      return null;
    }
  }
  if (path.startsWith('/api/uploads/')) return path.slice('/api/uploads/'.length);
  if (path.startsWith('/uploads/')) return path.slice('/uploads/'.length);
  if (path.startsWith('uploads/')) return path.slice('uploads/'.length);
  return null;
}

function shouldBundle(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  if (url.startsWith('data:image') || url.startsWith('blob:')) return true;
  return extractUploadRelativePath(url) !== null;
}

export async function loadUploadBytesFromApi(relativePath: string): Promise<{ bytes: Uint8Array; ext: string } | null> {
  try {
    const res = await fetch(uploadApiPath(relativePath), { credentials: 'include' });
    if (!res.ok) return null;
    const blob = await res.blob();
    const ext = MIME_EXT[blob.type] || blob.type.split('/')[1] || 'png';
    return { bytes: new Uint8Array(await blob.arrayBuffer()), ext };
  } catch {
    return null;
  }
}

export class AssetBundler {
  private counter = 0;
  private cache = new Map<string, string>();
  readonly files = new Map<string, Uint8Array>();
  private readonly loadUploadBytes: UploadBytesLoader;

  constructor(loadUploadBytes: UploadBytesLoader = loadUploadBytesFromApi) {
    this.loadUploadBytes = loadUploadBytes;
  }

  async resolve(url: string): Promise<string> {
    if (!url) return '';
    if (!shouldBundle(url)) return url;
    const cached = this.cache.get(url);
    if (cached) return cached;

    let bytes: Uint8Array;
    let ext = 'png';

    const uploadRel = extractUploadRelativePath(url);
    if (uploadRel) {
      const loaded = await this.loadUploadBytes(uploadRel);
      if (!loaded) return url;
      bytes = loaded.bytes;
      ext = loaded.ext;
    } else if (url.startsWith('data:')) {
      const parsed = parseDataUrl(url);
      if (!parsed) return url;
      bytes = parsed.bytes;
      ext = parsed.ext;
    } else {
      try {
        const res = await fetch(url);
        const blob = await res.blob();
        ext = MIME_EXT[blob.type] || blob.type.split('/')[1] || 'png';
        bytes = new Uint8Array(await blob.arrayBuffer());
      } catch {
        return url;
      }
    }

    const path = `assets/image-${++this.counter}.${ext}`;
    this.files.set(path, bytes);
    this.cache.set(url, path);
    return path;
  }

  private async walk(value: unknown): Promise<unknown> {
    if (typeof value === 'string') {
      return shouldBundle(value) ? this.resolve(value) : value;
    }
    if (Array.isArray(value)) {
      return Promise.all(value.map(v => this.walk(v)));
    }
    if (value && typeof value === 'object') {
      const out: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(value)) {
        out[k] = await this.walk(v);
      }
      return out;
    }
    return value;
  }

  async processPortfolio(portfolio: Portfolio): Promise<Portfolio> {
    return (await this.walk(portfolio)) as Portfolio;
  }
}
