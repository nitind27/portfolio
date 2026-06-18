import { NextResponse } from 'next/server';
import { listPublishedBlogPosts } from '@/lib/marketing-blog';

export async function GET() {
  const posts = await listPublishedBlogPosts();
  return NextResponse.json({ posts });
}
