import { Portfolio, PortfolioMeta, SectionType } from './types';
import { getPurposeConfig } from './website-purposes';

function setField(portfolio: Portfolio, sectionType: SectionType, fieldId: string, value: string) {
  const sec = portfolio.sections.find(s => s.type === sectionType);
  const field = sec?.fields.find(f => f.id === fieldId);
  if (field && typeof field.value === 'string') field.value = value;
}

export function applyPortfolioMeta(portfolio: Portfolio, meta: PortfolioMeta): Portfolio {
  const p = { ...portfolio, meta };
  const name = meta.businessName?.trim() || portfolio.name;
  const tagline = meta.tagline?.trim() || '';
  const purpose = getPurposeConfig(meta.purpose);

  p.name = name;
  p.seo = { ...p.seo, title: name, description: tagline || p.seo.description };
  p.navbar = { ...p.navbar, brandName: name, tagline: tagline || p.navbar.tagline };

  setField(p, 'hero', 'headline', tagline ? `Welcome to ${name}` : name);
  setField(p, 'hero', 'subheadline', tagline || purpose.subtitle);
  setField(p, 'about', 'title', `About ${name}`);
  setField(p, 'about', 'subtitle', tagline);
  setField(p, 'about', 'role', meta.industry || purpose.title);
  setField(p, 'contact', 'title', 'Get In Touch');
  setField(p, 'contact', 'subtitle', `Reach out to ${name} — we'd love to hear from you.`);

  if (meta.purpose === 'online-store') {
    setField(p, 'hero', 'ctaText', 'Shop Now');
    setField(p, 'hero', 'ctaSecondaryText', 'View Collection');
  } else if (meta.purpose === 'restaurant-food') {
    setField(p, 'hero', 'ctaText', 'View Menu');
    setField(p, 'hero', 'ctaSecondaryText', 'Book a Table');
  } else if (meta.purpose === 'saas-startup') {
    setField(p, 'hero', 'ctaText', 'Start Free Trial');
    setField(p, 'hero', 'ctaSecondaryText', 'See Features');
  } else if (meta.purpose === 'resume-cv') {
    setField(p, 'hero', 'headline', name);
    setField(p, 'hero', 'ctaText', 'Download CV');
    setField(p, 'hero', 'ctaSecondaryText', 'Contact Me');
  }

  p.footer = {
    ...p.footer,
    ctaTitle: `Work with ${name}?`,
    ctaSubtitle: tagline || purpose.subtitle,
  };

  return p;
}
