import type { MetadataRoute } from 'next';
import { getPublicWebsiteUrl } from '@/lib/brand';
import { listPublishedBlogPosts } from '@/lib/marketing-blog';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getPublicWebsiteUrl();
  const posts = await listPublishedBlogPosts(500);

  const staticPages: MetadataRoute.Sitemap = [
    { url: base, changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/about`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/blog`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${base}/contact`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/docs`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${base}/privacy`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${base}/terms`, changeFrequency: 'yearly', priority: 0.3 },
  ];

  const blogPages: MetadataRoute.Sitemap = posts.map(post => ({
    url: `${base}/blog/${post.slug}`,
    lastModified: post.updatedAt ? new Date(post.updatedAt) : undefined,
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  return [...staticPages, ...blogPages];
}
