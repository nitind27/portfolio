import type { Metadata } from 'next';
import DocsPageClient from '@/components/docs/DocsPageClient';
import { buildPageMetadata } from '@/lib/site-seo';

export const metadata: Metadata = buildPageMetadata({
  title: 'Documentation — site99 Website Builder',
  description: 'Learn how to use site99 — the free online no-code website builder. Templates, sections, export, deploy, billing & more.',
  path: '/docs',
  keywords: ['site99 docs', 'website builder tutorial', 'no code builder guide'],
});

export default function DocsPage() {
  return <DocsPageClient />;
}
