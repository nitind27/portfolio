import { getCurrentUser, type AuthUser } from './auth-server';
import type { NextRequest } from 'next/server';

export async function requireAdmin(req?: NextRequest): Promise<AuthUser> {
  const user = await getCurrentUser(req);
  if (!user) throw new Error('UNAUTHORIZED');
  if (user.role !== 'admin') throw new Error('FORBIDDEN');
  return user;
}

export function adminErrorResponse(err: unknown) {
  const msg = err instanceof Error ? err.message : 'Request failed';
  if (msg === 'UNAUTHORIZED') return { status: 401, body: { error: 'Login required' } };
  if (msg === 'FORBIDDEN') return { status: 403, body: { error: 'Admin access required' } };
  return { status: 400, body: { error: msg } };
}
