import type { Portfolio } from './types';
import { uploadApiPath } from './upload-paths';

/** Normalize stored asset paths for production (Hostinger / Node). */
export function resolveAssetUrl(src: string | undefined | null): string {
  if (!src || typeof src !== 'string') return '';
  if (src.startsWith('data:') || src.startsWith('blob:')) return src;

  let path = src.trim();
  if (path.startsWith('http://localhost') || path.startsWith('https://localhost')) {
    try {
      path = new URL(path).pathname;
    } catch {
      /* keep as-is */
    }
  }

  if (path.startsWith('/api/uploads/')) return path;
  if (path.startsWith('/uploads/')) return uploadApiPath(path.slice('/uploads/'.length));
  if (path.startsWith('uploads/')) return uploadApiPath(path);

  return path;
}

function rewriteValue(val: unknown): unknown {
  if (typeof val === 'string') {
    if (val.startsWith('/uploads/') || val.startsWith('uploads/') || val.includes('localhost') && val.includes('/uploads/')) {
      return resolveAssetUrl(val);
    }
    return val;
  }
  if (Array.isArray(val)) return val.map(rewriteValue);
  if (val && typeof val === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, nested] of Object.entries(val as Record<string, unknown>)) {
      out[k] = rewriteValue(nested);
    }
    return out;
  }
  return val;
}

export function rewritePortfolioAssetUrls(portfolio: Portfolio): Portfolio {
  return rewriteValue(portfolio) as Portfolio;
}
