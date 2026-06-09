import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-server';
import { APP_NAME } from '@/lib/brand';
import {
  welcomeEmailHtml, paymentSuccessEmailHtml,
  paymentFailedEmailHtml, testEmailHtml,
  type EmailTemplateData,
} from '@/lib/email-templates';

const SAMPLE: EmailTemplateData = {
  userName: 'Rahul Sharma',
  userEmail: 'rahul@example.com',
  planName: 'Pro Plan',
  amount: '₹999.00 INR',
  orderId: 'order_demo1234567890',
  loginUrl: '#',
  dashboardUrl: '#',
  supportEmail: 'support@yourapp.com',
  customMessage: 'We are thrilled to have you on board! Feel free to reach out anytime.',
  appName: APP_NAME,
};

export async function GET(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user || user.role !== 'admin') {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const type = req.nextUrl.searchParams.get('type') || 'welcome';

  let html = '';
  switch (type) {
    case 'payment': html = paymentSuccessEmailHtml(SAMPLE); break;
    case 'failed':  html = paymentFailedEmailHtml(SAMPLE); break;
    case 'test':    html = testEmailHtml(SAMPLE); break;
    default:        html = welcomeEmailHtml(SAMPLE); break;
  }

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}
