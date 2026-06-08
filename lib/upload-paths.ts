/** Client-safe upload URL helper (no Node fs). */

export function uploadApiPath(relativePath: string) {
  const clean = relativePath.replace(/^\/+/, '').replace(/^uploads\//, '');
  return `/api/uploads/${clean}`;
}
