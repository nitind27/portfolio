import { NextRequest, NextResponse } from 'next/server';
import type { RowDataPacket } from 'mysql2';
import { getCurrentUser, verifyPassword, refreshAuthCookie } from '@/lib/auth-server';
import { fetchUserProfile } from '@/lib/profile-server';
import { getPool } from '@/lib/db';
import { isValidEmail, isValidPhone, normalizePhone } from '@/lib/validators';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Please login first' }, { status: 401 });
    }
    const profile = await fetchUserProfile(user.id);
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }
    return NextResponse.json({ profile });
  } catch (err) {
    console.error('Profile GET error:', err);
    return NextResponse.json({ error: 'Could not load profile' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Please login first' }, { status: 401 });
    }

    const body = await req.json();
    const name = String(body.name || '').trim();
    const phoneRaw = body.phone != null ? normalizePhone(String(body.phone)) : user.phone;
    const emailRaw = body.email != null ? String(body.email).trim().toLowerCase() : user.email;
    const currentPassword = String(body.currentPassword || '');

    if (!name || name.length < 2) {
      return NextResponse.json({ error: 'Name must be at least 2 characters' }, { status: 400 });
    }
    if (phoneRaw && !isValidPhone(phoneRaw)) {
      return NextResponse.json({ error: 'Enter a valid 10-digit Indian mobile number' }, { status: 400 });
    }

    const emailChanging = emailRaw !== user.email.toLowerCase();
    const isAdmin = user.role === 'admin';

    if (emailChanging) {
      if (!isAdmin) {
        return NextResponse.json({ error: 'Email cannot be changed here' }, { status: 400 });
      }
      if (!isValidEmail(emailRaw)) {
        return NextResponse.json({ error: 'Enter a valid email address' }, { status: 400 });
      }

      const pool = getPool();
      const [pwRows] = await pool.execute<RowDataPacket[]>(
        'SELECT password_hash FROM users WHERE id = ? LIMIT 1',
        [user.id],
      );
      const hasPassword = Boolean((pwRows[0] as { password_hash: string | null } | undefined)?.password_hash);
      if (hasPassword) {
        if (!currentPassword) {
          return NextResponse.json({ error: 'Current password is required to change email' }, { status: 400 });
        }
        const valid = await verifyPassword(
          currentPassword,
          (pwRows[0] as { password_hash: string }).password_hash,
        );
        if (!valid) {
          return NextResponse.json({ error: 'Current password is incorrect' }, { status: 401 });
        }
      }

      const [existing] = await pool.execute<RowDataPacket[]>(
        'SELECT id FROM users WHERE email = ? AND id != ? LIMIT 1',
        [emailRaw, user.id],
      );
      if (existing[0]) {
        return NextResponse.json({ error: 'This email is already in use' }, { status: 409 });
      }
    }

    const pool = getPool();
    if (isAdmin && emailChanging) {
      await pool.execute(
        'UPDATE users SET name = ?, phone = ?, email = ? WHERE id = ?',
        [name, phoneRaw || null, emailRaw, user.id],
      );
    } else {
      await pool.execute(
        'UPDATE users SET name = ?, phone = ? WHERE id = ?',
        [name, phoneRaw || null, user.id],
      );
    }

    const profile = await fetchUserProfile(user.id);
    if (profile) await refreshAuthCookie(profile);

    return NextResponse.json({
      profile,
      message: emailChanging ? 'Profile and login email updated' : 'Profile updated',
    });
  } catch (err) {
    console.error('Profile PATCH error:', err);
    return NextResponse.json({ error: 'Could not update profile' }, { status: 500 });
  }
}
