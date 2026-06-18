import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, adminErrorResponse } from '@/lib/admin-server';
import { createBlogPost, listBlogPostsAdmin } from '@/lib/marketing-blog';

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req);
    const posts = await listBlogPostsAdmin();
    return NextResponse.json({ posts });
  } catch (err) {
    const { status, body } = adminErrorResponse(err);
    return NextResponse.json(body, { status });
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin(req);
    const body = await req.json();
    const post = await createBlogPost(body);
    return NextResponse.json({ post });
  } catch (err) {
    const { status, body } = adminErrorResponse(err);
    return NextResponse.json(body, { status });
  }
}
