import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-server';
import { activatePremiumFromOrder, refreshSessionIfPremium } from '@/lib/payment-server';

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const orderId = String(body.orderId || '').trim();
    if (!orderId) {
      return NextResponse.json({ error: 'orderId is required' }, { status: 400 });
    }

    const updatedUser = await activatePremiumFromOrder(orderId);
    if (!updatedUser || !updatedUser.isPremium) {
      return NextResponse.json({ success: false, status: 'pending' });
    }

    await refreshSessionIfPremium(updatedUser);
    return NextResponse.json({ success: true, user: updatedUser });
  } catch (err) {
    console.error('Verify payment error:', err);
    return NextResponse.json({ error: 'Payment verification failed' }, { status: 500 });
  }
}
