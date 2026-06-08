import { NextRequest, NextResponse } from 'next/server';
import type { RowDataPacket } from 'mysql2';
import { getCurrentUser, hashPassword, verifyPassword, refreshAuthCookie } from '@/lib/auth-server';
import { fetchUserProfile } from '@/lib/profile-server';
import { getPool } from '@/lib/db';
import { isValidPassword } from '@/lib/validators';

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Please login first' }, { status: 401 });
    }

    const body = await req.json();
    const currentPassword = String(body.currentPassword || '');
    const newPassword = String(body.newPassword || '');
    const confirmPassword = String(body.confirmPassword || '');

    if (!isValidPassword(newPassword)) {
      return NextResponse.json({ error: 'New password must be at least 6 characters' }, { status: 400 });
    }
    if (newPassword !== confirmPassword) {
      return NextResponse.json({ error: 'Passwords do not match' }, { status: 400 });
    }

    const pool = getPool();
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT password_hash FROM users WHERE id = ? LIMIT 1',
      [user.id],
    );
    const row = rows[0] as { password_hash: string | null } | undefined;
    if (!row) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const hasPassword = Boolean(row.password_hash);

    if (hasPassword) {
      if (!currentPassword) {
        return NextResponse.json({ error: 'Current password is required' }, { status: 400 });
      }
      const valid = await verifyPassword(currentPassword, row.password_hash!);
      if (!valid) {
        return NextResponse.json({ error: 'Current password is incorrect' }, { status: 401 });
      }
    }

    const passwordHash = await hashPassword(newPassword);
    await pool.execute(
      'UPDATE users SET password_hash = ?, auth_provider = IF(auth_provider = \'google\' AND google_id IS NOT NULL, auth_provider, \'local\') WHERE id = ?',
      [passwordHash, user.id],
    );

    const profile = await fetchUserProfile(user.id);
    if (profile) await refreshAuthCookie(profile);

    return NextResponse.json({
      profile,
      message: hasPassword ? 'Password changed successfully' : 'Password set successfully',
    });
  } catch (err) {
    console.error('Profile password error:', err);
    return NextResponse.json({ error: 'Could not update password' }, { status: 500 });
  }
}
