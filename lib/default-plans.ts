import type { PlanFeatures } from './plans-types';
import { DEFAULT_FREE_FEATURES } from './plans-types';

/** Canonical slugs — only Free + Premium (pro) are supported. */
export const CANONICAL_PLAN_SLUGS = ['free', 'pro'] as const;
export type CanonicalPlanSlug = (typeof CANONICAL_PLAN_SLUGS)[number];

export const FREE_PLAN_FEATURES: PlanFeatures = { ...DEFAULT_FREE_FEATURES };

/** Premium plan (slug: pro) — full export, deploy, and builder features. */
export const PREMIUM_PLAN_FEATURES: PlanFeatures = {
  exportHtml: true,
  exportReact: true,
  exportNextjs: true,
  shareLink: true,
  publishOnline: true,
  hostingerDeploy: true,
  customCss: true,
  analytics: true,
  smtp: true,
  popupBuilder: true,
  sectionBlog: true,
  sectionTeam: true,
  sectionPricing: true,
  sectionFaq: true,
  sectionTestimonials: true,
  premiumLayouts: true,
  unlockedPortfolios: 1,
  storageDays: 365,
};

/** @deprecated Use PREMIUM_PLAN_FEATURES */
export const PRO_PLAN_FEATURES = PREMIUM_PLAN_FEATURES;

export function defaultPremiumPrice() {
  return Number(process.env.PREMIUM_PRICE || process.env.NEXT_PUBLIC_PREMIUM_PRICE || 99);
}

/** @deprecated Use defaultPremiumPrice */
export const defaultProPrice = defaultPremiumPrice;
