import { PortfolioSection, SectionField, PricingPlanBlock } from './types';

export function genPricingPlanId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function createEmptyPricingPlan(): PricingPlanBlock {
  return {
    id: genPricingPlanId(),
    name: '',
    price: '',
    period: '',
    description: '',
    features: [''],
    ctaText: 'Get Started',
    ctaLink: '',
    featured: false,
  };
}

export function parseLegacyPricingPlan(raw: string, index: number, total: number): PricingPlanBlock {
  const parts = raw.split('|').map(p => p.trim());
  const [name, price, ...features] = parts;
  return {
    id: genPricingPlanId(),
    name: name || 'Plan',
    price: price || '',
    period: '',
    description: '',
    features: features.length ? features : [''],
    ctaText: 'Get Started',
    ctaLink: '',
    featured: total >= 3 && index === Math.floor(total / 2),
  };
}

export function getPricingPlansFromSection(section: PortfolioSection): PricingPlanBlock[] {
  const field = section.fields.find(f => f.id === 'pricingplans');
  if (field?.type === 'pricingplans' && Array.isArray(field.value)) {
    return field.value as PricingPlanBlock[];
  }
  const legacy = section.fields.find(f => f.id === 'plans');
  if (legacy && Array.isArray(legacy.value)) {
    const items = legacy.value as string[];
    return items.map((raw, i) => parseLegacyPricingPlan(raw, i, items.length));
  }
  return [];
}

export function migratePricingSection(section: PortfolioSection): PortfolioSection {
  if (section.type !== 'pricing') return section;
  if (section.fields.some(f => f.id === 'pricingplans')) {
    return {
      ...section,
      fields: section.fields.filter(f => f.id !== 'plans'),
    };
  }

  const legacy = section.fields.find(f => f.id === 'plans');
  const legacyItems = legacy && Array.isArray(legacy.value) ? legacy.value as string[] : [];
  const items: PricingPlanBlock[] = legacyItems.length
    ? legacyItems.map((raw, i) => parseLegacyPricingPlan(raw, i, legacyItems.length))
    : [createEmptyPricingPlan()];

  const fieldsWithoutLegacy = section.fields.filter(f => f.id !== 'plans');
  const hasSubtitle = fieldsWithoutLegacy.some(f => f.id === 'subtitle');
  const withSubtitle = hasSubtitle
    ? fieldsWithoutLegacy
    : [...fieldsWithoutLegacy, { id: 'subtitle', label: 'Subtitle', type: 'text' as const, value: 'Simple, transparent pricing' }];

  const pricingField: SectionField = {
    id: 'pricingplans', label: 'Pricing Plans', type: 'pricingplans', value: items,
  };

  return { ...section, fields: [...withSubtitle.filter(f => f.id !== 'pricingplans'), pricingField] };
}
