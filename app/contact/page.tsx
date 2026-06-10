import type { Metadata } from 'next';
import ContactPageClient from '@/components/marketing/ContactPageClient';
import { APP_NAME } from '@/lib/brand';
import { company } from '@/lib/company';

export const metadata: Metadata = {
  title: `Contact Us — ${APP_NAME}`,
  description: `Contact the ${APP_NAME} team. Email ${company.email} or send a message through our contact form.`,
};

export default function ContactPage() {
  return <ContactPageClient />;
}
