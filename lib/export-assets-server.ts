import 'server-only';
import { readFile } from 'fs/promises';
import { extname } from 'path';
import { AssetBundler, type UploadBytesLoader } from './export-assets';
import { findUploadFile } from './upload-paths-server';

const loadUploadBytesFromDisk: UploadBytesLoader = async (relativePath) => {
  const full = await findUploadFile(relativePath);
  if (!full) return null;
  const buf = await readFile(full);
  const ext = extname(full).slice(1).toLowerCase() || 'png';
  return { bytes: new Uint8Array(buf), ext };
};

/** Server-side bundler — reads uploaded files from disk (Vercel deploy API). */
export function createServerAssetBundler(): AssetBundler {
  return new AssetBundler(loadUploadBytesFromDisk);
}
