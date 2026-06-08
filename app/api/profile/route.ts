import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-server';
import { fetchUserProfile } from '@/lib/profile-server';
import { getPool } from '@/lib/db';
import { isValidPhone, normalizePhone } from '@/lib/validators';

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

    if (!name || name.length < 2) {
      return NextResponse.json({ error: 'Name must be at least 2 characters' }, { status: 400 });
    }
    if (phoneRaw && !isValidPhone(phoneRaw)) {
      return NextResponse.json({ error: 'Enter a valid 10-digit Indian mobile number' }, { status: 400 });
    }

    const pool = getPool();
    await pool.execute(
      'UPDATE users SET name = ?, phone = ? WHERE id = ?',
      [name, phoneRaw || null, user.id],
    );

    const profile = await fetchUserProfile(user.id);
    return NextResponse.json({ profile, message: 'Profile updated' });
  } catch (err) {
    console.error('Profile PATCH error:', err);
    return NextResponse.json({ error: 'Could not update profile' }, { status: 500 });
  }
}
