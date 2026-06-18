import { NextResponse } from 'next/server';
import { getMarketingAbout } from '@/lib/marketing-about';

export async function GET() {
  const content = await getMarketingAbout();
  return NextResponse.json({ content });
}
