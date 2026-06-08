import type { PlanFeatures } from './plans-types';

export const PRO_PLAN_FEATURES: PlanFeatures = {
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

export const BUSINESS_PLAN_FEATURES: PlanFeatures = {
  ...PRO_PLAN_FEATURES,
  unlockedPortfolios: 3,
};

export function defaultProPrice() {
  return Number(process.env.PREMIUM_PRICE || process.env.NEXT_PUBLIC_PREMIUM_PRICE || 99);
}

export function defaultBusinessPrice() {
  return Number(process.env.BUSINESS_PRICE || 299);
}
