import type { Metadata } from 'next';
import { APP_NAME, getPublicWebsiteUrl } from './brand';

export interface MarketingSeoFields {
  title: string;
  description: string;
  keywords: string;
  ogImage: string;
  canonicalUrl: string;
}

export const EMPTY_SEO: MarketingSeoFields = {
  title: '',
  description: '',
  keywords: '',
  ogImage: '',
  canonicalUrl: '',
};

export function normalizeSeo(
  raw: Partial<MarketingSeoFields> | null | undefined,
  fallback: { title: string; description: string; path: string },
): MarketingSeoFields {
  const base = getPublicWebsiteUrl();
  return {
    title: String(raw?.title || fallback.title).slice(0, 120),
    description: String(raw?.description || fallback.description).slice(0, 320),
    keywords: String(raw?.keywords || '').slice(0, 500),
    ogImage: String(raw?.ogImage || '').slice(0, 500),
    canonicalUrl: String(raw?.canonicalUrl || `${base}${fallback.path}`).slice(0, 500),
  };
}

export function buildMarketingMetadata(seo: MarketingSeoFields): Metadata {
  const images = seo.ogImage ? [{ url: seo.ogImage, alt: seo.title }] : undefined;
  return {
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords || undefined,
    alternates: seo.canonicalUrl ? { canonical: seo.canonicalUrl } : undefined,
    openGraph: {
      title: seo.title,
      description: seo.description,
      url: seo.canonicalUrl || undefined,
      siteName: APP_NAME,
      type: 'website',
      images,
    },
    twitter: {
      card: seo.ogImage ? 'summary_large_image' : 'summary',
      title: seo.title,
      description: seo.description,
      images: seo.ogImage ? [seo.ogImage] : undefined,
    },
  };
}

export function buildArticleMetadata(seo: {
  title: string;
  description: string;
  keywords: string;
  ogImage: string;
  canonicalUrl: string;
  publishedAt?: string | null;
}): Metadata {
  const images = seo.ogImage ? [{ url: seo.ogImage, alt: seo.title }] : undefined;
  return {
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords || undefined,
    alternates: seo.canonicalUrl ? { canonical: seo.canonicalUrl } : undefined,
    openGraph: {
      title: seo.title,
      description: seo.description,
      url: seo.canonicalUrl || undefined,
      siteName: APP_NAME,
      type: 'article',
      publishedTime: seo.publishedAt || undefined,
      images,
    },
    twitter: {
      card: seo.ogImage ? 'summary_large_image' : 'summary',
      title: seo.title,
      description: seo.description,
      images: seo.ogImage ? [seo.ogImage] : undefined,
    },
  };
}

export function slugifyMarketing(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120) || 'post';
}
