import type { Metadata } from 'next';
import ContactPageClient from '@/components/marketing/ContactPageClient';
import { buildPageMetadata } from '@/lib/site-seo';
import { company } from '@/lib/company';

export const metadata: Metadata = buildPageMetadata({
  title: 'Contact site99 — Online Website Builder Support',
  description: `Contact the site99 team. Email ${company.email} or send a message — help with your no-code website builder account.`,
  path: '/contact',
});

export default function ContactPage() {
  return <ContactPageClient />;
}
