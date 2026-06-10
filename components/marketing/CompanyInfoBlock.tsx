'use client';

import { Building2, Mail, Phone, MapPin, Clock, Globe, CreditCard, FileText } from 'lucide-react';
import { company, formatCompanyAddress } from '@/lib/company';
import { brand } from '@/lib/brand';

export default function CompanyInfoBlock({ compact = false }: { compact?: boolean }) {
  const address = formatCompanyAddress();
  const rows = [
    { icon: Building2, label: 'Legal name', value: company.legalName },
    { icon: Globe, label: 'Website', value: company.website, href: company.website },
    { icon: Mail, label: 'Email', value: company.email, href: `mailto:${company.email}` },
    ...(company.phone
      ? [{ icon: Phone, label: 'Phone', value: company.phone, href: `tel:${company.phone.replace(/\s/g, '')}` }]
      : []),
    { icon: MapPin, label: 'Address', value: address },
    { icon: Clock, label: 'Business hours', value: company.businessHours },
    { icon: CreditCard, label: 'Payments', value: `Secure checkout via ${company.paymentPartner}` },
    ...(company.gstin
      ? [{ icon: FileText, label: 'GSTIN', value: company.gstin }]
      : []),
  ];

  return (
    <div
      className={`rounded-2xl border ${compact ? 'p-5' : 'p-6 sm:p-8'}`}
      style={{ borderColor: brand.border, background: brand.surface }}
    >
      <h3 className={`font-bold text-white ${compact ? 'text-sm mb-4' : 'text-lg mb-5'}`}>
        Business information
      </h3>
      <dl className="space-y-4">
        {rows.map(({ icon: Icon, label, value, href }) => (
          <div key={label} className="flex gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: brand.accentMuted }}
            >
              <Icon className="w-4 h-4" style={{ color: brand.accent }} />
            </div>
            <div className="min-w-0">
              <dt className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">{label}</dt>
              <dd className="text-sm text-gray-300 mt-0.5 leading-relaxed break-words">
                {href ? (
                  <a href={href} className="hover:underline" style={{ color: brand.accentLight }}>
                    {value}
                  </a>
                ) : (
                  <span className="whitespace-pre-line">{value}</span>
                )}
              </dd>
            </div>
          </div>
        ))}
      </dl>
    </div>
  );
}
