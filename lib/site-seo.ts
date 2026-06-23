import type { Metadata } from 'next';
import {
  APP_NAME,
  APP_DESCRIPTION,
  APP_DOMAIN,
  APP_TAGLINE,
  LOGO_SRC,
  SUPPORT_EMAIL,
  STORAGE_POLICY_DAYS,
  getPublicWebsiteUrl,
} from './brand';
import { getGoogleVerificationMetaToken } from './google-verification';
export const SITE_KEYWORDS = [
  'site99',
  'site99 online',
  'site99 website builder',
  'site99.online',
  'online website builder',
  'website builder without code',
  'no code website builder',
  'without code website builder',
  'free website builder',
  'free online website builder',
  'create website online',
  'website maker',
  'portfolio website builder',
  'drag and drop website builder',
  'build website without coding',
  'professional website builder',
  'landing page builder',
  'business website builder',
  'website builder India',
  'no coding website maker',
] as const;

export const HOME_TITLE =
  'site99 — Free Online Website Builder & No-Code Site Maker for India';

export const HOME_DESCRIPTION =
  'site99 is a free online website builder for portfolios, business sites & landing pages — no code needed. 70+ templates, drag-and-drop editor, live preview. Start free.';

export const HOME_FAQS = [
  {
    q: 'What is site99?',
    a: 'site99 is a free online website builder that lets you create portfolios, business websites, landing pages, and online stores without writing code. Choose a template, customize visually, preview on any device, and publish or export your site.',
  },
  {
    q: 'Is site99 a no-code website builder?',
    a: 'Yes. site99 is a without-code website builder — drag sections, edit text and images, change colors and fonts, and launch your site without HTML, CSS, or JavaScript knowledge.',
  },
  {
    q: 'Can I use site99 as an online website builder for free?',
    a: 'Yes. site99 offers a free plan with cloud storage, live preview, and access to templates. Premium unlocks export, long-term hosting options, and advanced features.',
  },
  {
    q: 'Do I need coding skills?',
    a: 'No. Everything is visual — drag sections, edit content, pick colors, and preview instantly.',
  },
  {
    q: 'How long are projects stored?',
    a: `Projects stay in your account for ${STORAGE_POLICY_DAYS} days on the free plan. Export or go premium to keep them permanently.`,
  },
  {
    q: 'Can I use my own domain?',
    a: 'Yes. Connect your hosting provider and deploy to your chosen domain with a guided setup flow.',
  },
  {
    q: 'What does premium include?',
    a: 'Export ZIP (HTML, React, Next.js), long-term share links, and live deploy slots for your portfolio.',
  },
  {
    q: 'What is the refund policy?',
    a: 'All premium sales are final. We do not offer refunds once payment is confirmed. See Privacy Policy and Terms for details.',
  },
] as const;

function absoluteUrl(path = ''): string {
  const base = getPublicWebsiteUrl();
  if (!path) return base;
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}

function logoUrl(): string {
  return absoluteUrl(LOGO_SRC.split('?')[0]);
}

export function buildSiteMetadataBase(): Pick<Metadata, 'metadataBase' | 'applicationName' | 'authors' | 'creator' | 'publisher' | 'formatDetection'> {
  return {
    metadataBase: new URL(getPublicWebsiteUrl()),
    applicationName: APP_NAME,
    authors: [{ name: APP_NAME, url: getPublicWebsiteUrl() }],
    creator: APP_NAME,
    publisher: APP_NAME,
    formatDetection: { email: false, address: false, telephone: false },
  };
}

export function buildDefaultSiteMetadata(): Metadata {
  const url = getPublicWebsiteUrl();
  const ogImage = logoUrl();

  return {
    ...buildSiteMetadataBase(),
    title: {
      default: HOME_TITLE,
      template: `%s | ${APP_NAME}`,
    },
    description: HOME_DESCRIPTION,
    keywords: [...SITE_KEYWORDS],
    alternates: {
      canonical: url,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      type: 'website',
      locale: 'en_IN',
      url,
      siteName: APP_NAME,
      title: HOME_TITLE,
      description: HOME_DESCRIPTION,
      images: [{ url: ogImage, width: 512, height: 512, alt: `${APP_NAME} — online website builder` }],
    },
    twitter: {
      card: 'summary_large_image',
      title: HOME_TITLE,
      description: HOME_DESCRIPTION,
      images: [ogImage],
    },
    category: 'technology',
    icons: {
      icon: LOGO_SRC,
      apple: LOGO_SRC,
    },
    ...(getGoogleVerificationMetaToken()
      ? { verification: { google: getGoogleVerificationMetaToken()! } }
      : {}),
    other: {
      'geo.region': 'IN',
      'apple-mobile-web-app-title': APP_NAME,
    },
  };
}

export function buildHomeMetadata(): Metadata {
  return {
    ...buildDefaultSiteMetadata(),
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    alternates: { canonical: getPublicWebsiteUrl() },
  };
}

export function buildHomeJsonLd(templateCount?: number) {
  const url = getPublicWebsiteUrl();
  const templates = templateCount ? `${templateCount}+` : '70+';

  return [
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      '@id': `${url}/#website`,
      name: APP_NAME,
      alternateName: [
        'site99 online',
        'site99 website builder',
        APP_DOMAIN,
        'site99 online website builder',
      ],
      url,
      description: HOME_DESCRIPTION,
      inLanguage: 'en-IN',
      publisher: { '@id': `${url}/#organization` },
      potentialAction: {
        '@type': 'RegisterAction',
        target: `${url}/?register=1`,
        name: 'Create free account on site99',
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      '@id': `${url}/#organization`,
      name: APP_NAME,
      url,
      logo: { '@type': 'ImageObject', url: logoUrl() },
      email: SUPPORT_EMAIL,
      description: APP_DESCRIPTION,
      sameAs: [url],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      '@id': `${url}/#app`,
      name: `${APP_NAME} Website Builder`,
      applicationCategory: 'WebApplication',
      operatingSystem: 'Web browser',
      url,
      description: `Free online website builder without code. ${templates} templates for portfolios, business sites, and landing pages.`,
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'INR',
        availability: 'https://schema.org/InStock',
      },
      featureList: [
        'No code website builder',
        'Drag and drop editor',
        'Portfolio templates',
        'Business website templates',
        'Mobile responsive preview',
        'Export HTML and Next.js',
      ],
      publisher: { '@id': `${url}/#organization` },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      '@id': `${url}/#faq`,
      mainEntity: HOME_FAQS.map(item => ({
        '@type': 'Question',
        name: item.q,
        acceptedAnswer: { '@type': 'Answer', text: item.a },
      })),
    },
  ];
}

export function buildBreadcrumbJsonLd(items: { name: string; path: string }[]) {
  const base = getPublicWebsiteUrl();
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: `${base}${item.path.startsWith('/') ? item.path : `/${item.path}`}`,
    })),
  };
}

/** Enhanced metadata for inner marketing pages */
export function buildPageMetadata(opts: {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
}): Metadata {
  const canonical = absoluteUrl(opts.path);
  const ogImage = logoUrl();
  const keywords = opts.keywords?.length
    ? [...opts.keywords, ...SITE_KEYWORDS.slice(0, 8)]
    : [...SITE_KEYWORDS.slice(0, 12)];

  return {
    title: opts.title,
    description: opts.description,
    keywords,
    alternates: { canonical },
    openGraph: {
      title: opts.title,
      description: opts.description,
      url: canonical,
      siteName: APP_NAME,
      type: 'website',
      images: [{ url: ogImage, alt: opts.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: opts.title,
      description: opts.description,
      images: [ogImage],
    },
  };
}

export const SEO_TAGLINE = `${APP_NAME} — ${APP_TAGLINE}`;
