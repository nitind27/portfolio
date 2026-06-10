'use client';

import Link from 'next/link';
import MarketingShell from './MarketingShell';
import { APP_NAME, APP_DOMAIN, STORAGE_POLICY_DAYS, brand } from '@/lib/brand';
import { company } from '@/lib/company';

const SECTIONS = [
  {
    title: '1. Information we collect',
    body: `When you register, we collect your name, email address, and phone number. When you use the builder, we store your project content (text, images, configuration) in our database and file storage. When you pay for premium, payment is processed by Cashfree — we store order IDs, amounts, and status but not your full card or UPI details.`,
  },
  {
    title: '2. How we use your data',
    body: `We use your information to provide the ${APP_NAME} service, save your projects, process payments, send transactional communications, improve the platform, and prevent abuse. We do not sell your personal information to third parties.`,
  },
  {
    title: '3. Project storage & public sharing',
    body: `Free accounts store projects for ${STORAGE_POLICY_DAYS} days. When you publish a portfolio, anyone with the link can view it until expiry or unpublish. Do not publish confidential information. Uploaded images are served from our servers.`,
  },
  {
    title: '4. Cookies & sessions',
    body: `We use HTTP-only authentication cookies to keep you logged in. Optional "Remember me" extends session duration. We may use essential cookies for security and session management.`,
  },
  {
    title: '5. Third-party services',
    body: `We integrate with Cashfree (payments), Hostinger (optional deploy), and may use analytics on our marketing pages. Each third party has its own privacy policy governing data they process.`,
  },
  {
    title: '6. Data security',
    body: `We use industry-standard measures including password hashing, encrypted connections (HTTPS), and restricted database access. No system is 100% secure — use a strong unique password.`,
  },
  {
    title: '7. Your rights',
    body: `You may request access to or deletion of your account data via our Support page or by emailing ${company.email}. Deleting your account removes projects and personal data subject to legal retention requirements for payment records.`,
  },
  {
    title: '8. Payment & refund policy',
    body: `${APP_NAME} does NOT offer refunds on premium purchases. All digital product sales are final once payment is confirmed and plan features are activated. See our refund policy in the documentation for full details.`,
  },
  {
    title: '9. Children',
    body: `The service is not intended for users under 13. We do not knowingly collect data from children.`,
  },
  {
    title: '10. Changes',
    body: `We may update this policy. Continued use after changes constitutes acceptance. Last updated: ${new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}.`,
  },
];

export default function PrivacyPageClient() {
  return (
    <MarketingShell
      title="Privacy Policy"
      subtitle={`How ${APP_NAME} (${APP_DOMAIN}) collects, uses, and protects your data.`}
      narrow
    >
      <div className="max-w-3xl mx-auto px-5 sm:px-8 py-12">
        <div
          className="mb-8 p-4 rounded-xl border text-sm"
          style={{ borderColor: `${brand.accent}44`, background: brand.accentMuted, color: brand.accentLight }}
        >
          <strong>No refunds:</strong> Premium payments are non-refundable. See{' '}
          <Link href="/docs#refund-policy" className="underline">Refund Policy</Link>.
        </div>

        <div className="space-y-10">
          {SECTIONS.map(s => (
            <section key={s.title}>
              <h2 className="text-base font-bold text-white mb-3">{s.title}</h2>
              <p className="text-sm text-gray-400 leading-relaxed">{s.body}</p>
            </section>
          ))}
        </div>

        <p className="mt-10 text-sm text-gray-500">
          Questions? <Link href="/contact" className="text-orange-400 hover:underline">Contact us</Link> or read our{' '}
          <Link href="/terms" className="text-orange-400 hover:underline">Terms of Service</Link>.
        </p>
      </div>
    </MarketingShell>
  );
}
