import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, adminErrorResponse } from '@/lib/admin-server';
import { deleteBlogPost, getBlogPostById, updateBlogPost } from '@/lib/marketing-blog';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin(req);
    const { id } = await params;
    const post = await getBlogPostById(Number(id));
    if (!post) return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    return NextResponse.json({ post });
  } catch (err) {
    const { status, body } = adminErrorResponse(err);
    return NextResponse.json(body, { status });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin(req);
    const { id } = await params;
    const body = await req.json();
    const post = await updateBlogPost(Number(id), body);
    return NextResponse.json({ post });
  } catch (err) {
    const { status, body } = adminErrorResponse(err);
    return NextResponse.json(body, { status });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin(req);
    const { id } = await params;
    await deleteBlogPost(Number(id));
    return NextResponse.json({ ok: true });
  } catch (err) {
    const { status, body } = adminErrorResponse(err);
    return NextResponse.json(body, { status });
  }
}
