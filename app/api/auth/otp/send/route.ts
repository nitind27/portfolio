import { NextRequest, NextResponse } from 'next/server';
import { sendRegistrationOtp } from '@/lib/email-otp';
import { isValidEmail } from '@/lib/validators';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = String(body.email || '').trim().toLowerCase();

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    const result = await sendRegistrationOtp(email);
    if (!result.ok) {
      return NextResponse.json(
        { error: result.error, cooldown: result.cooldown },
        { status: result.cooldown ? 429 : 400 },
      );
    }

    return NextResponse.json({
      ok: true,
      message: 'Verification code sent to your email',
      expiresIn: result.expiresIn,
    });
  } catch (err) {
    console.error('Send OTP error:', err);
    return NextResponse.json({ error: 'Could not send verification code' }, { status: 500 });
  }
}
