import type { Metadata } from 'next';
import TermsPageClient from '@/components/marketing/TermsPageClient';
import { APP_NAME } from '@/lib/brand';

export const metadata: Metadata = {
  title: `Terms of Service — ${APP_NAME}`,
  description: `Terms and conditions for using ${APP_NAME} website builder and premium services.`,
};

export default function TermsPage() {
  return <TermsPageClient />;
}
