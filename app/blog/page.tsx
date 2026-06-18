import type { Metadata } from 'next';
import BlogIndexClient from '@/components/marketing/BlogIndexClient';
import { listPublishedBlogPosts, getBlogIndexSeo } from '@/lib/marketing-blog';
import { buildMarketingMetadata } from '@/lib/marketing-seo';

export async function generateMetadata(): Promise<Metadata> {
  return buildMarketingMetadata(getBlogIndexSeo());
}

export default async function BlogPage() {
  const posts = await listPublishedBlogPosts();
  return <BlogIndexClient posts={posts} />;
}
