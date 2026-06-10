import { APP_NAME, APP_DESCRIPTION, APP_TAGLINE, SUPPORT_EMAIL, getPublicWebsiteUrl } from './brand';

/** Business details — set via env for payment gateway / legal compliance */
export const company = {
  legalName: process.env.NEXT_PUBLIC_COMPANY_LEGAL_NAME || APP_NAME,
  tradeName: APP_NAME,
  tagline: APP_TAGLINE,
  description: APP_DESCRIPTION,
  website: getPublicWebsiteUrl(),
  email: process.env.NEXT_PUBLIC_COMPANY_EMAIL || SUPPORT_EMAIL,
  phone: process.env.NEXT_PUBLIC_COMPANY_PHONE || '',
  /** Only set when GST-registered; leave empty otherwise */
  gstin: process.env.NEXT_PUBLIC_COMPANY_GSTIN || '',
  addressLine1: process.env.NEXT_PUBLIC_COMPANY_ADDRESS_LINE1 || '',
  addressLine2: process.env.NEXT_PUBLIC_COMPANY_ADDRESS_LINE2 || '',
  city: process.env.NEXT_PUBLIC_COMPANY_CITY || '',
  state: process.env.NEXT_PUBLIC_COMPANY_STATE || '',
  pincode: process.env.NEXT_PUBLIC_COMPANY_PINCODE || '',
  country: process.env.NEXT_PUBLIC_COMPANY_COUNTRY || 'India',
  businessHours: process.env.NEXT_PUBLIC_COMPANY_HOURS || 'Monday – Saturday, 10:00 AM – 6:00 PM IST',
  foundedYear: process.env.NEXT_PUBLIC_COMPANY_FOUNDED || '2024',
  serviceCategory: 'Software as a Service (SaaS) — Website & Portfolio Builder',
  paymentPartner: 'Cashfree Payments',
  responseTime: '24–48 business hours',
} as const;

export function formatCompanyAddress(): string {
  const parts = [
    company.addressLine1,
    company.addressLine2,
    [company.city, company.state, company.pincode].filter(Boolean).join(', '),
    company.country,
  ].filter(Boolean);
  return parts.length > 0 ? parts.join('\n') : company.country;
}

export function formatCompanyAddressInline(): string {
  return formatCompanyAddress().replace(/\n/g, ', ');
}
