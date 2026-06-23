import type { Metadata } from 'next';
import { buildHomeJsonLd, buildHomeMetadata } from '@/lib/site-seo';
import { TEMPLATES } from '@/lib/templates';
import JsonLd from '@/components/seo/JsonLd';
import HomePageClient from './HomePageClient';

export const metadata: Metadata = buildHomeMetadata();

/** Cache homepage shell; metadata & JSON-LD are static */
export const revalidate = 3600;

export default function HomePage() {
  return (
    <>
      <JsonLd data={buildHomeJsonLd(TEMPLATES.length)} />
      <HomePageClient />
    </>
  );
}
