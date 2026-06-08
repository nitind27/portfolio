/** Admin-configurable plan features */
export interface PlanFeatures {
  exportHtml: boolean;
  exportReact: boolean;
  exportNextjs: boolean;
  shareLink: boolean;
  publishOnline: boolean;
  hostingerDeploy: boolean;
  customCss: boolean;
  analytics: boolean;
  smtp: boolean;
  popupBuilder: boolean;
  sectionBlog: boolean;
  sectionTeam: boolean;
  sectionPricing: boolean;
  sectionFaq: boolean;
  sectionTestimonials: boolean;
  premiumLayouts: boolean;
  unlockedPortfolios: number;
  storageDays: number;
}

export interface SubscriptionPlan {
  id: number;
  slug: string;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  tier: number;
  isActive: boolean;
  isDefault: boolean;
  features: PlanFeatures;
}

export interface TemplateRule {
  templateId: string;
  minPlanId: number | null;
  minPlanName?: string | null;
  minPlanSlug?: string | null;
}

export type PlanFeatureKey = keyof PlanFeatures;

export const PLAN_FEATURE_LABELS: Record<PlanFeatureKey, string> = {
  exportHtml: 'Export HTML',
  exportReact: 'Export React',
  exportNextjs: 'Export Next.js',
  shareLink: 'Share live link',
  publishOnline: 'Publish online',
  hostingerDeploy: 'Hostinger deploy',
  customCss: 'Custom CSS editor',
  analytics: 'Analytics panel',
  smtp: 'SMTP / contact form',
  popupBuilder: 'Popup builder',
  sectionBlog: 'Blog section',
  sectionTeam: 'Team section',
  sectionPricing: 'Pricing section',
  sectionFaq: 'FAQ section',
  sectionTestimonials: 'Testimonials section',
  premiumLayouts: 'Premium layout presets',
  unlockedPortfolios: 'Portfolio unlock slots',
  storageDays: 'Device storage (days)',
};

export const DEFAULT_FREE_FEATURES: PlanFeatures = {
  exportHtml: false,
  exportReact: false,
  exportNextjs: false,
  shareLink: false,
  publishOnline: false,
  hostingerDeploy: false,
  customCss: false,
  analytics: false,
  smtp: false,
  popupBuilder: true,
  sectionBlog: false,
  sectionTeam: false,
  sectionPricing: false,
  sectionFaq: true,
  sectionTestimonials: true,
  premiumLayouts: false,
  unlockedPortfolios: 0,
  storageDays: 7,
};

export function parsePlanFeatures(raw: unknown): PlanFeatures {
  const base = { ...DEFAULT_FREE_FEATURES };
  if (!raw || typeof raw !== 'object') return base;
  const o = raw as Record<string, unknown>;
  for (const key of Object.keys(base) as PlanFeatureKey[]) {
    if (key in o) {
      const v = o[key];
      if (key === 'unlockedPortfolios' || key === 'storageDays') {
        base[key] = Math.max(0, Number(v) || 0);
      } else {
        (base as Record<string, unknown>)[key] = Boolean(v);
      }
    }
  }
  return base;
}

export function canExport(features: PlanFeatures): boolean {
  return features.exportHtml || features.exportReact || features.exportNextjs;
}

export function canUseSection(features: PlanFeatures, section: string): boolean {
  const map: Record<string, PlanFeatureKey> = {
    blog: 'sectionBlog',
    team: 'sectionTeam',
    pricing: 'sectionPricing',
    faq: 'sectionFaq',
    testimonials: 'sectionTestimonials',
  };
  const key = map[section];
  if (!key) return true;
  return features[key] === true;
}
