import { PortfolioSection, SectionField, TestimonialBlock } from './types';

export function genTestimonialId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function createEmptyTestimonial(): TestimonialBlock {
  return { id: genTestimonialId(), quote: '', author: '', role: '', company: '', rating: 5, image: '' };
}

export function parseLegacyTestimonial(raw: string): TestimonialBlock {
  const quoteMatch = raw.match(/^["'](.+)["']\s*[-–—]\s*(.+)$/);
  const quote = quoteMatch ? quoteMatch[1] : raw.replace(/^["']|["']$/g, '');
  const authorPart = quoteMatch ? quoteMatch[2] : '';
  const [author, role] = authorPart.includes(',')
    ? authorPart.split(',').map(s => s.trim())
    : [authorPart || 'Client', ''];
  return {
    id: genTestimonialId(),
    quote,
    author: author || 'Client',
    role: role || '',
    company: '',
    rating: 5,
    image: '',
  };
}

export function getTestimonialsFromSection(section: PortfolioSection): TestimonialBlock[] {
  const field = section.fields.find(f => f.id === 'testimonialitems');
  if (field?.type === 'testimonialitems' && Array.isArray(field.value)) {
    return field.value as TestimonialBlock[];
  }
  const legacy = section.fields.find(f => f.id === 'testimonials');
  if (legacy && Array.isArray(legacy.value)) {
    return (legacy.value as string[]).map(parseLegacyTestimonial);
  }
  return [];
}

export function migrateTestimonialsSection(section: PortfolioSection): PortfolioSection {
  if (section.type !== 'testimonials') return section;
  if (section.fields.some(f => f.id === 'testimonialitems')) {
    return {
      ...section,
      fields: section.fields.filter(f => f.id !== 'testimonials'),
    };
  }

  const legacy = section.fields.find(f => f.id === 'testimonials');
  const items: TestimonialBlock[] = legacy && Array.isArray(legacy.value)
    ? (legacy.value as string[]).map(parseLegacyTestimonial)
    : [createEmptyTestimonial()];

  const fieldsWithoutLegacy = section.fields.filter(f => f.id !== 'testimonials');
  const hasSubtitle = fieldsWithoutLegacy.some(f => f.id === 'subtitle');
  const withSubtitle = hasSubtitle
    ? fieldsWithoutLegacy
    : [...fieldsWithoutLegacy, { id: 'subtitle', label: 'Subtitle', type: 'text' as const, value: 'What clients and colleagues say about working with me' }];

  const testimonialField: SectionField = {
    id: 'testimonialitems', label: 'Testimonials', type: 'testimonialitems', value: items,
  };

  return { ...section, fields: [...withSubtitle.filter(f => f.id !== 'testimonialitems'), testimonialField] };
}
