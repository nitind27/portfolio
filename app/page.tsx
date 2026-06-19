import type { Metadata } from 'next';
import { buildHomeJsonLd, buildHomeMetadata } from '@/lib/site-seo';
import { TEMPLATES } from '@/lib/templates';
import JsonLd from '@/components/seo/JsonLd';
import HomePageClient from './HomePageClient';

export const metadata: Metadata = buildHomeMetadata();

export default function HomePage() {
  return (
    <>
      <JsonLd data={buildHomeJsonLd(TEMPLATES.length)} />
      <HomePageClient />
    </>
  );
}
