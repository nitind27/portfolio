import { NextResponse } from 'next/server';
import { getPublishedBlogPostBySlug } from '@/lib/marketing-blog';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const post = await getPublishedBlogPostBySlug(slug);
  if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ post });
}
