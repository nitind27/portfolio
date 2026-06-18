import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import BlogPostClient from '@/components/marketing/BlogPostClient';
import { getPublishedBlogPostBySlug, listPublishedBlogPosts, getBlogSeo } from '@/lib/marketing-blog';
import { buildArticleMetadata } from '@/lib/marketing-seo';

export async function generateStaticParams() {
  try {
    const posts = await listPublishedBlogPosts(200);
    return posts.map(post => ({ slug: post.slug }));
  } catch {
    return [];
  }
}

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedBlogPostBySlug(slug);
  if (!post) return { title: 'Post not found' };
  return buildArticleMetadata(getBlogSeo(post));
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPublishedBlogPostBySlug(slug);
  if (!post) notFound();
  return <BlogPostClient post={post} />;
}
