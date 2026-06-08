import { access } from 'fs/promises';
import { join } from 'path';

/** Writable upload dirs — check legacy public/uploads first, then project-root uploads */
export const UPLOAD_STORAGE_ROOTS = [
  join(process.cwd(), 'public', 'uploads'),
  join(process.cwd(), 'uploads'),
];

export function uploadApiPath(relativePath: string) {
  const clean = relativePath.replace(/^\/+/, '').replace(/^uploads\//, '');
  return `/api/uploads/${clean}`;
}

export async function findUploadFile(relativePath: string): Promise<string | null> {
  const clean = relativePath.replace(/^\/+/, '').replace(/^uploads\//, '');
  for (const root of UPLOAD_STORAGE_ROOTS) {
    const full = join(root, clean);
    try {
      await access(full);
      return full;
    } catch {
      /* try next root */
    }
  }
  return null;
}

export function getPrimaryUploadRoot() {
  return join(process.cwd(), 'uploads');
}
