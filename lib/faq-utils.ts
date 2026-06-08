import { PortfolioSection, SectionField, FAQItemBlock } from './types';

export function genFAQItemId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function createEmptyFAQItem(): FAQItemBlock {
  return { id: genFAQItemId(), question: '', answer: '' };
}

export function parseLegacyFAQItem(raw: string): FAQItemBlock {
  const pipeIdx = raw.indexOf('|');
  if (pipeIdx === -1) {
    return { id: genFAQItemId(), question: raw.trim(), answer: '' };
  }
  return {
    id: genFAQItemId(),
    question: raw.slice(0, pipeIdx).trim(),
    answer: raw.slice(pipeIdx + 1).trim(),
  };
}

export function getFAQItemsFromSection(section: PortfolioSection): FAQItemBlock[] {
  const field = section.fields.find(f => f.id === 'faqitems');
  if (field?.type === 'faqitems' && Array.isArray(field.value)) {
    return field.value as FAQItemBlock[];
  }
  const legacy = section.fields.find(f => f.id === 'faqs' || f.id === 'FAQ');
  if (legacy && Array.isArray(legacy.value)) {
    return (legacy.value as string[]).map(parseLegacyFAQItem);
  }
  return [];
}

export function migrateFAQSection(section: PortfolioSection): PortfolioSection {
  if (section.type !== 'faq') return section;
  if (section.fields.some(f => f.id === 'faqitems')) {
    return {
      ...section,
      fields: section.fields.filter(f => f.id !== 'faqs' && f.id !== 'FAQ'),
    };
  }

  const legacy = section.fields.find(f => f.id === 'faqs' || f.id === 'FAQ');
  const items: FAQItemBlock[] = legacy && Array.isArray(legacy.value)
    ? (legacy.value as string[]).map(parseLegacyFAQItem)
    : [createEmptyFAQItem()];

  const fieldsWithoutLegacy = section.fields.filter(f => f.id !== 'faqs' && f.id !== 'FAQ');
  const hasSubtitle = fieldsWithoutLegacy.some(f => f.id === 'subtitle');
  const withSubtitle = hasSubtitle
    ? fieldsWithoutLegacy
    : [...fieldsWithoutLegacy, { id: 'subtitle', label: 'Subtitle', type: 'text' as const, value: 'Common questions answered' }];

  const faqField: SectionField = {
    id: 'faqitems', label: 'Questions & Answers', type: 'faqitems', value: items,
  };

  return { ...section, fields: [...withSubtitle.filter(f => f.id !== 'faqitems'), faqField] };
}
