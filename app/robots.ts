import type { MetadataRoute } from 'next';
import { getPublicWebsiteUrl } from '@/lib/brand';

export default function robots(): MetadataRoute.Robots {
  const base = getPublicWebsiteUrl();
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/api/', '/dashboard', '/builder'],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
