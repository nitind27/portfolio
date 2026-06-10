import type { Metadata } from 'next';
import AboutPageClient from '@/components/marketing/AboutPageClient';
import { APP_NAME } from '@/lib/brand';
import { company } from '@/lib/company';

export const metadata: Metadata = {
  title: `About Us — ${APP_NAME}`,
  description: `${company.description} Learn about ${company.legalName} and our mission.`,
};

export default function AboutPage() {
  return <AboutPageClient />;
}
