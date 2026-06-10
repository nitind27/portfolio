'use client';

import Link from 'next/link';
import MarketingShell from './MarketingShell';
import CompanyInfoBlock from './CompanyInfoBlock';
import { APP_NAME, STORAGE_POLICY_DAYS, brand } from '@/lib/brand';
import { company } from '@/lib/company';

const SECTIONS = [
  {
    title: '1. Acceptance of terms',
    body: `By accessing or using ${APP_NAME} (${company.website}), you agree to these Terms of Service. If you do not agree, do not use the service. ${company.legalName} ("we", "us") operates this platform from ${company.country}.`,
  },
  {
    title: '2. Service description',
    body: `${APP_NAME} is a ${company.serviceCategory}. We provide tools to create, edit, preview, share, and export websites. Features vary by plan (free vs premium). We may update or discontinue features with reasonable notice.`,
  },
  {
    title: '3. Account registration',
    body: `You must provide accurate name, email, and contact information. You are responsible for keeping your password secure and for all activity under your account. You must be at least 13 years old to use the service.`,
  },
  {
    title: '4. Acceptable use',
    body: `You may not use ${APP_NAME} to host illegal content, malware, phishing, hate speech, or material that infringes others' rights. We may suspend or terminate accounts that violate these terms without refund.`,
  },
  {
    title: '5. User content',
    body: `You retain ownership of content you upload. You grant us a licence to store, display, and process your content solely to operate the service (e.g. hosting previews, exports). You are responsible for ensuring you have rights to all uploaded material.`,
  },
  {
    title: '6. Free plan & storage',
    body: `Free accounts may store projects for ${STORAGE_POLICY_DAYS} days. Published share links remain accessible during that period. After expiry, projects may be removed. Premium plans offer extended storage and export features.`,
  },
  {
    title: '7. Payments & billing',
    body: `Premium purchases are processed by ${company.paymentPartner}. Prices are shown in INR as all-inclusive amounts (no GST charged — business is not GST-registered). Payment is one-time for digital unlock features unless otherwise stated. All sales are final — see our Refund Policy.`,
  },
  {
    title: '8. Refund policy',
    body: `${APP_NAME} does NOT offer refunds on premium purchases once payment is confirmed and features are activated. Digital products are non-refundable. Contact support only for duplicate charges or technical payment errors.`,
  },
  {
    title: '9. Intellectual property',
    body: `The ${APP_NAME} platform, branding, templates, and software are owned by ${company.legalName}. Exported code from your projects is yours to use subject to any third-party assets you included.`,
  },
  {
    title: '10. Disclaimer',
    body: `The service is provided "as is" without warranties of uninterrupted availability or fitness for a particular purpose. We are not liable for indirect, incidental, or consequential damages arising from use of the platform.`,
  },
  {
    title: '11. Limitation of liability',
    body: `Our total liability for any claim related to the service shall not exceed the amount you paid us in the twelve months before the claim, or ₹1,000, whichever is greater.`,
  },
  {
    title: '12. Governing law',
    body: `These terms are governed by the laws of ${company.country}. Disputes shall be subject to the courts of ${company.state || company.country}.`,
  },
  {
    title: '13. Contact',
    body: `Questions about these terms? Email ${company.email} or visit our Contact page. Business hours: ${company.businessHours}.`,
  },
  {
    title: '14. Changes',
    body: `We may update these terms. Continued use after changes constitutes acceptance. Last updated: ${new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}.`,
  },
];

export default function TermsPageClient() {
  return (
    <MarketingShell
      title="Terms of Service"
      subtitle={`Terms governing your use of ${APP_NAME} and our digital services.`}
      narrow
    >
      <div className="max-w-3xl mx-auto px-5 sm:px-8 py-12">
        <div
          className="mb-8 p-4 rounded-xl border text-sm"
          style={{ borderColor: `${brand.accent}44`, background: brand.accentMuted, color: brand.accentLight }}
        >
          <strong>No refunds:</strong> Premium payments are non-refundable. See{' '}
          <Link href="/docs#refund-policy" className="underline">Refund Policy</Link> and{' '}
          <Link href="/privacy" className="underline">Privacy Policy</Link>.
        </div>

        <div className="space-y-10 mb-12">
          {SECTIONS.map(s => (
            <section key={s.title}>
              <h2 className="text-base font-bold text-white mb-3">{s.title}</h2>
              <p className="text-sm text-gray-400 leading-relaxed">{s.body}</p>
            </section>
          ))}
        </div>

        <CompanyInfoBlock compact />
      </div>
    </MarketingShell>
  );
}
