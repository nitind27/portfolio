import { NextRequest, NextResponse } from 'next/server';
import { generateAiReply } from '@/lib/ai-assistant';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const message = String(body.message || '').trim().slice(0, 500);
    if (!message) {
      return NextResponse.json({ error: 'Message required' }, { status: 400 });
    }

    const { answer, sources } = await generateAiReply(message);
    return NextResponse.json({ answer, sources });
  } catch (err) {
    console.error('AI chat error:', err);
    return NextResponse.json({ error: 'Could not generate reply' }, { status: 500 });
  }
}
