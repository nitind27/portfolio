import type { Metadata } from 'next';
import AboutPageClient from '@/components/marketing/AboutPageClient';
import { getMarketingAbout } from '@/lib/marketing-about';
import { buildMarketingMetadata } from '@/lib/marketing-seo';

export async function generateMetadata(): Promise<Metadata> {
  const content = await getMarketingAbout();
  return buildMarketingMetadata(content.seo);
}

export default async function AboutPage() {
  const content = await getMarketingAbout();
  return <AboutPageClient content={content} />;
}
