import {
  Portfolio, PortfolioSection, SectionStyle, SectionType, ThemeConfig,
  NavbarConfig, FooterConfig, WebsitePurpose,
} from './types';

export type LayoutPresetId =
  | 'classic-split'
  | 'banner-impact'
  | 'minimal-clean'
  | 'gallery-first'
  | 'business-corporate'
  | 'shop-showcase'
  | 'saas-modern'
  | 'creative-bold'
  | 'f-shape'
  | 'z-shape'
  | 'holy-grail'
  | 'grid-cards'
  | 'split-screen'
  | 'asymmetrical'
  | 'single-column'
  | 'magazine'
  | 'featured-hero'
  | 'one-page';

export interface LayoutPreset {
  id: LayoutPresetId;
  title: string;
  subtitle: string;
  icon: string;
  preview: string;
  heroLayout: string;
  navbar: Partial<NavbarConfig>;
  footer: Partial<FooterConfig>;
  theme?: Partial<ThemeConfig>;
  sectionFields: Partial<Record<SectionType, Record<string, string>>>;
  sectionStyles: Partial<Record<SectionType, Partial<SectionStyle>>>;
}

export const LAYOUT_PRESETS: Record<LayoutPresetId, LayoutPreset> = {
  'classic-split': {
    id: 'classic-split',
    title: 'Classic Split',
    subtitle: 'Side-by-side hero, profile about, split contact',
    icon: '◧',
    preview: 'hero-split',
    heroLayout: 'image-right',
    navbar: { layout: 'standard', style: 'glass', linkStyle: 'minimal', showTagline: false, scrollBehavior: 'none' },
    footer: { showCta: true },
    sectionFields: {
      about: { aboutLayout: 'split' },
      gallery: { galleryLayout: 'masonry' },
      contact: { contactLayout: 'split' },
      projects: { projectsLayout: 'cards' },
      services: { servicesLayout: 'cards' },
    },
    sectionStyles: {
      hero: { textAlign: 'left' },
      about: { textAlign: 'left' },
      contact: { textAlign: 'left' },
    },
  },
  'banner-impact': {
    id: 'banner-impact',
    title: 'Banner Impact',
    subtitle: 'Full-width hero, centered sections, visual gallery',
    icon: '▬',
    preview: 'hero-banner',
    heroLayout: 'banner',
    navbar: { layout: 'centered', style: 'transparent', linkStyle: 'pill', showTagline: true, scrollBehavior: 'compact-on-scroll' },
    footer: { showCta: true, showLiveBadge: true },
    theme: { spacing: 'relaxed', animation: 'moderate' },
    sectionFields: {
      about: { aboutLayout: 'centered' },
      gallery: { galleryLayout: 'masonry' },
      contact: { contactLayout: 'centered' },
      projects: { projectsLayout: 'cards' },
      services: { servicesLayout: 'cards' },
      testimonials: { testimonialsLayout: 'cards' },
    },
    sectionStyles: {
      hero: { textAlign: 'center', paddingTop: 0, paddingBottom: 0 },
      about: { textAlign: 'center' },
      gallery: { textAlign: 'center' },
      stats: { textAlign: 'center' },
      pricing: { textAlign: 'center' },
      contact: { textAlign: 'center' },
    },
  },
  'minimal-clean': {
    id: 'minimal-clean',
    title: 'Minimal Clean',
    subtitle: 'Typography-first, no hero image, airy spacing',
    icon: '▭',
    preview: 'hero-minimal',
    heroLayout: 'text-only',
    navbar: { layout: 'minimal', style: 'solid', linkStyle: 'underline', showTagline: false, showCta: false, scrollBehavior: 'none' },
    footer: { showCta: false, showLiveBadge: false },
    theme: { spacing: 'relaxed', animation: 'subtle', borderRadius: 'none' },
    sectionFields: {
      about: { aboutLayout: 'centered' },
      gallery: { galleryLayout: 'grid' },
      contact: { contactLayout: 'minimal' },
      projects: { projectsLayout: 'list' },
      services: { servicesLayout: 'list' },
    },
    sectionStyles: {
      hero: { textAlign: 'center', paddingTop: 96, paddingBottom: 64 },
      about: { textAlign: 'center', maxWidth: 720 },
      skills: { textAlign: 'center' },
      experience: { textAlign: 'center' },
      contact: { textAlign: 'center', maxWidth: 640 },
    },
  },
  'gallery-first': {
    id: 'gallery-first',
    title: 'Gallery First',
    subtitle: 'Visual showcase — slideshow hero & carousel gallery',
    icon: '▦',
    preview: 'hero-slideshow',
    heroLayout: 'slideshow',
    navbar: { layout: 'standard', style: 'gradient', linkStyle: 'minimal', scrollBehavior: 'float-on-scroll' },
    footer: { showCta: true },
    theme: { spacing: 'normal', animation: 'expressive', borderRadius: 'sm' },
    sectionFields: {
      about: { aboutLayout: 'wide' },
      gallery: { galleryLayout: 'carousel' },
      contact: { contactLayout: 'split' },
      projects: { projectsLayout: 'cards' },
      services: { servicesLayout: 'cards' },
    },
    sectionStyles: {
      gallery: { textAlign: 'center', paddingTop: 48 },
      about: { textAlign: 'left' },
    },
  },
  'business-corporate': {
    id: 'business-corporate',
    title: 'Business Corporate',
    subtitle: 'Trust-focused split layout for companies',
    icon: '🏢',
    preview: 'hero-split',
    heroLayout: 'split',
    navbar: { layout: 'standard', style: 'solid', linkStyle: 'pill', showTagline: true, showCta: true, scrollBehavior: 'compact-on-scroll' },
    footer: { showCta: true, showNavigation: true, showContact: true },
    theme: { spacing: 'normal', animation: 'subtle', fontSize: 'md' },
    sectionFields: {
      about: { aboutLayout: 'split' },
      gallery: { galleryLayout: 'grid' },
      contact: { contactLayout: 'split' },
      projects: { projectsLayout: 'cards' },
      services: { servicesLayout: 'cards' },
    },
    sectionStyles: {
      hero: { textAlign: 'left' },
      stats: { textAlign: 'center' },
      team: { textAlign: 'center' },
    },
  },
  'shop-showcase': {
    id: 'shop-showcase',
    title: 'Shop Showcase',
    subtitle: 'Product-forward banner hero & uniform product grid',
    icon: '🛍️',
    preview: 'hero-banner',
    heroLayout: 'banner',
    navbar: { layout: 'centered', style: 'glass', linkStyle: 'pill', showCta: true, ctaText: 'Shop Now', scrollBehavior: 'compact-on-scroll' },
    footer: { showCta: true, ctaButtonText: 'Browse Collection' },
    theme: { spacing: 'normal', animation: 'moderate', borderRadius: 'lg' },
    sectionFields: {
      about: { aboutLayout: 'centered' },
      gallery: { galleryLayout: 'grid' },
      contact: { contactLayout: 'centered' },
      pricing: { pricingLayout: 'columns-3' },
      services: { servicesLayout: 'cards' },
    },
    sectionStyles: {
      hero: { textAlign: 'center' },
      gallery: { textAlign: 'center' },
      pricing: { textAlign: 'center' },
    },
  },
  'saas-modern': {
    id: 'saas-modern',
    title: 'SaaS Modern',
    subtitle: 'Split hero, feature grid, 3-column pricing',
    icon: '🚀',
    preview: 'hero-split',
    heroLayout: 'image-left',
    navbar: { layout: 'standard', style: 'glass', linkStyle: 'minimal', showCta: true, ctaText: 'Get Started', scrollBehavior: 'float-on-scroll' },
    footer: { showCta: true, ctaButtonText: 'Start Free Trial' },
    theme: { spacing: 'normal', animation: 'moderate', borderRadius: 'md' },
    sectionFields: {
      about: { aboutLayout: 'wide' },
      gallery: { galleryLayout: 'grid' },
      contact: { contactLayout: 'split' },
      services: { servicesLayout: 'cards' },
      pricing: { pricingLayout: 'columns-3' },
    },
    sectionStyles: {
      hero: { textAlign: 'left' },
      stats: { textAlign: 'center' },
      pricing: { textAlign: 'center' },
      faq: { textAlign: 'left', maxWidth: 900 },
    },
  },
  'creative-bold': {
    id: 'creative-bold',
    title: 'Creative Bold',
    subtitle: 'Full-height split hero, masonry gallery, expressive motion',
    icon: '✦',
    preview: 'hero-split-full',
    heroLayout: 'split',
    navbar: { layout: 'minimal', style: 'transparent', linkStyle: 'underline', scrollBehavior: 'none' },
    footer: { showCta: true },
    theme: { spacing: 'compact', animation: 'expressive', borderRadius: 'none' },
    sectionFields: {
      about: { aboutLayout: 'wide' },
      gallery: { galleryLayout: 'masonry' },
      contact: { contactLayout: 'split' },
      projects: { projectsLayout: 'cards' },
      services: { servicesLayout: 'cards' },
    },
    sectionStyles: {
      hero: { textAlign: 'left', paddingTop: 0, paddingBottom: 0 },
      projects: { textAlign: 'left' },
    },
  },
  'f-shape': {
    id: 'f-shape',
    title: 'F-Shape Layout',
    subtitle: 'Wide hero banner, left-aligned scan path, stats bar below',
    icon: 'F',
    preview: 'hero-f-shape',
    heroLayout: 'banner',
    navbar: { layout: 'standard', style: 'solid', linkStyle: 'minimal', showTagline: true, showCta: true, scrollBehavior: 'compact-on-scroll' },
    footer: { showCta: true, showNavigation: true },
    theme: { spacing: 'normal', animation: 'subtle', fontSize: 'md' },
    sectionFields: {
      about: { aboutLayout: 'wide' },
      gallery: { galleryLayout: 'grid' },
      contact: { contactLayout: 'split' },
      projects: { projectsLayout: 'cards' },
      services: { servicesLayout: 'cards' },
      testimonials: { testimonialsLayout: 'carousel' },
    },
    sectionStyles: {
      hero: { textAlign: 'left', paddingTop: 48, paddingBottom: 48 },
      about: { textAlign: 'left', maxWidth: 960 },
      stats: { textAlign: 'center', paddingTop: 32, paddingBottom: 32 },
      services: { textAlign: 'left' },
      projects: { textAlign: 'left' },
    },
  },
  'z-shape': {
    id: 'z-shape',
    title: 'Z-Shape Layout',
    subtitle: 'Alternating left-right sections for natural eye flow',
    icon: 'Z',
    preview: 'hero-z-shape',
    heroLayout: 'image-left',
    navbar: { layout: 'standard', style: 'glass', linkStyle: 'minimal', scrollBehavior: 'float-on-scroll' },
    footer: { showCta: true },
    theme: { spacing: 'relaxed', animation: 'moderate' },
    sectionFields: {
      about: { aboutLayout: 'split' },
      gallery: { galleryLayout: 'masonry' },
      contact: { contactLayout: 'split' },
      projects: { projectsLayout: 'cards' },
      services: { servicesLayout: 'list' },
      testimonials: { testimonialsLayout: 'carousel' },
    },
    sectionStyles: {
      hero: { textAlign: 'left' },
      about: { textAlign: 'left' },
      services: { textAlign: 'right' },
      projects: { textAlign: 'left' },
      testimonials: { textAlign: 'right' },
      contact: { textAlign: 'left' },
    },
  },
  'holy-grail': {
    id: 'holy-grail',
    title: 'Three-Box / Holy Grail',
    subtitle: 'Header hero, central content, sidebar-style service columns',
    icon: '⊞',
    preview: 'hero-holy-grail',
    heroLayout: 'split',
    navbar: { layout: 'standard', style: 'solid', linkStyle: 'pill', showCta: true, scrollBehavior: 'compact-on-scroll' },
    footer: { showCta: true, showNavigation: true, showContact: true },
    theme: { spacing: 'normal', animation: 'subtle' },
    sectionFields: {
      about: { aboutLayout: 'centered' },
      gallery: { galleryLayout: 'grid' },
      contact: { contactLayout: 'centered' },
      projects: { projectsLayout: 'cards' },
      services: { servicesLayout: 'cards' },
      pricing: { pricingLayout: 'columns-3' },
    },
    sectionStyles: {
      hero: { textAlign: 'center' },
      about: { textAlign: 'center', maxWidth: 800 },
      services: { textAlign: 'center' },
      stats: { textAlign: 'center' },
      team: { textAlign: 'center' },
      pricing: { textAlign: 'center' },
    },
  },
  'grid-cards': {
    id: 'grid-cards',
    title: 'Grid / Card-Based',
    subtitle: 'Uniform card grid for products, projects, and services',
    icon: '▦',
    preview: 'hero-grid-cards',
    heroLayout: 'banner',
    navbar: { layout: 'centered', style: 'glass', linkStyle: 'pill', showCta: true, scrollBehavior: 'compact-on-scroll' },
    footer: { showCta: true },
    theme: { spacing: 'normal', animation: 'moderate', borderRadius: 'lg' },
    sectionFields: {
      about: { aboutLayout: 'centered' },
      gallery: { galleryLayout: 'grid' },
      contact: { contactLayout: 'centered' },
      projects: { projectsLayout: 'cards' },
      services: { servicesLayout: 'cards' },
      pricing: { pricingLayout: 'columns-3' },
      testimonials: { testimonialsLayout: 'cards' },
    },
    sectionStyles: {
      hero: { textAlign: 'center' },
      about: { textAlign: 'center' },
      gallery: { textAlign: 'center' },
      projects: { textAlign: 'center' },
      services: { textAlign: 'center' },
      pricing: { textAlign: 'center' },
      testimonials: { textAlign: 'center' },
    },
  },
  'split-screen': {
    id: 'split-screen',
    title: 'Split Screen Layout',
    subtitle: '50/50 hero split, mirrored section pairs',
    icon: '⚌',
    preview: 'hero-split-full',
    heroLayout: 'split',
    navbar: { layout: 'minimal', style: 'transparent', linkStyle: 'underline', scrollBehavior: 'none' },
    footer: { showCta: true },
    theme: { spacing: 'compact', animation: 'moderate', borderRadius: 'md' },
    sectionFields: {
      about: { aboutLayout: 'split' },
      gallery: { galleryLayout: 'grid' },
      contact: { contactLayout: 'split' },
      projects: { projectsLayout: 'cards' },
      services: { servicesLayout: 'cards' },
    },
    sectionStyles: {
      hero: { textAlign: 'left', paddingTop: 0, paddingBottom: 0 },
      about: { textAlign: 'left' },
      contact: { textAlign: 'left' },
    },
  },
  'asymmetrical': {
    id: 'asymmetrical',
    title: 'Asymmetrical Layout',
    subtitle: 'Off-balance hero, wide blocks, expressive typography',
    icon: '◈',
    preview: 'hero-asymmetrical',
    heroLayout: 'image-right',
    navbar: { layout: 'minimal', style: 'transparent', linkStyle: 'underline', showCta: false, scrollBehavior: 'none' },
    footer: { showCta: false, showLiveBadge: false },
    theme: { spacing: 'compact', animation: 'expressive', borderRadius: 'none' },
    sectionFields: {
      about: { aboutLayout: 'wide' },
      gallery: { galleryLayout: 'masonry' },
      contact: { contactLayout: 'minimal' },
      projects: { projectsLayout: 'list' },
      services: { servicesLayout: 'list' },
    },
    sectionStyles: {
      hero: { textAlign: 'left', paddingTop: 64, paddingBottom: 48 },
      about: { textAlign: 'left', maxWidth: 1100 },
      projects: { textAlign: 'left' },
      gallery: { textAlign: 'left' },
    },
  },
  'single-column': {
    id: 'single-column',
    title: 'Single-Column Layout',
    subtitle: 'Narrow reading column, typography-first flow',
    icon: '▯',
    preview: 'hero-minimal',
    heroLayout: 'text-only',
    navbar: { layout: 'minimal', style: 'solid', linkStyle: 'underline', showTagline: false, showCta: false, scrollBehavior: 'none' },
    footer: { showCta: false, showLiveBadge: false, showNavigation: false },
    theme: { spacing: 'relaxed', animation: 'subtle', borderRadius: 'none', fontSize: 'md' },
    sectionFields: {
      about: { aboutLayout: 'centered' },
      gallery: { galleryLayout: 'grid' },
      contact: { contactLayout: 'minimal' },
      projects: { projectsLayout: 'list' },
      services: { servicesLayout: 'list' },
    },
    sectionStyles: {
      hero: { textAlign: 'center', paddingTop: 120, paddingBottom: 80, maxWidth: 680 },
      about: { textAlign: 'center', maxWidth: 640 },
      skills: { textAlign: 'center', maxWidth: 560 },
      experience: { textAlign: 'center', maxWidth: 640 },
      blog: { textAlign: 'center', maxWidth: 680 },
      contact: { textAlign: 'center', maxWidth: 560 },
    },
  },
  'magazine': {
    id: 'magazine',
    title: 'Magazine / Content Hub',
    subtitle: 'Editorial hero, featured content, blog-forward sections',
    icon: '📰',
    preview: 'hero-magazine',
    heroLayout: 'banner',
    navbar: { layout: 'standard', style: 'solid', linkStyle: 'minimal', showTagline: true, scrollBehavior: 'compact-on-scroll' },
    footer: { showCta: true, showNavigation: true },
    theme: { spacing: 'relaxed', animation: 'subtle', fontFamily: 'Lora' },
    sectionFields: {
      about: { aboutLayout: 'wide' },
      gallery: { galleryLayout: 'grid' },
      contact: { contactLayout: 'centered' },
      projects: { projectsLayout: 'cards' },
      services: { servicesLayout: 'list' },
    },
    sectionStyles: {
      hero: { textAlign: 'left', paddingTop: 56, paddingBottom: 56 },
      about: { textAlign: 'left', maxWidth: 900 },
      blog: { textAlign: 'left', maxWidth: 960 },
      gallery: { textAlign: 'center' },
    },
  },
  'featured-hero': {
    id: 'featured-hero',
    title: 'Featured Image / Hero',
    subtitle: 'Full-bleed visual hero with slideshow or banner impact',
    icon: '🖼',
    preview: 'hero-slideshow',
    heroLayout: 'slideshow',
    navbar: { layout: 'standard', style: 'gradient', linkStyle: 'pill', showCta: true, scrollBehavior: 'float-on-scroll' },
    footer: { showCta: true, showLiveBadge: true },
    theme: { spacing: 'normal', animation: 'expressive', borderRadius: 'sm' },
    sectionFields: {
      about: { aboutLayout: 'centered' },
      gallery: { galleryLayout: 'carousel' },
      contact: { contactLayout: 'centered' },
      projects: { projectsLayout: 'cards' },
      services: { servicesLayout: 'cards' },
      pricing: { pricingLayout: 'featured' },
    },
    sectionStyles: {
      hero: { textAlign: 'center', paddingTop: 0, paddingBottom: 0 },
      gallery: { textAlign: 'center', paddingTop: 32 },
      about: { textAlign: 'center' },
      pricing: { textAlign: 'center' },
    },
  },
  'one-page': {
    id: 'one-page',
    title: 'One-Page / Scroll Layout',
    subtitle: 'Continuous scroll landing — compact nav, stacked sections',
    icon: '∞',
    preview: 'hero-one-page',
    heroLayout: 'banner',
    navbar: { layout: 'centered', style: 'glass', linkStyle: 'pill', showCta: true, ctaText: 'Get Started', scrollBehavior: 'compact-on-scroll' },
    footer: { showCta: true, ctaButtonText: 'Start Now', showLiveBadge: true },
    theme: { spacing: 'compact', animation: 'moderate', borderRadius: 'lg' },
    sectionFields: {
      about: { aboutLayout: 'centered' },
      gallery: { galleryLayout: 'grid' },
      contact: { contactLayout: 'centered' },
      services: { servicesLayout: 'cards' },
      pricing: { pricingLayout: 'columns-3' },
      testimonials: { testimonialsLayout: 'cards' },
    },
    sectionStyles: {
      hero: { textAlign: 'center', paddingTop: 80, paddingBottom: 64 },
      about: { textAlign: 'center' },
      services: { textAlign: 'center' },
      stats: { textAlign: 'center' },
      pricing: { textAlign: 'center' },
      testimonials: { textAlign: 'center' },
      faq: { textAlign: 'center', maxWidth: 800 },
      contact: { textAlign: 'center' },
    },
  },
};

export const PURPOSE_LAYOUT_OPTIONS: Record<WebsitePurpose, LayoutPresetId[]> = {
  'personal-portfolio': ['classic-split', 'creative-bold', 'asymmetrical', 'grid-cards', 'split-screen', 'single-column'],
  'freelancer-services': ['business-corporate', 'z-shape', 'f-shape', 'one-page', 'classic-split', 'minimal-clean'],
  'business-company': ['business-corporate', 'f-shape', 'holy-grail', 'banner-impact', 'z-shape', 'split-screen'],
  'agency-studio': ['creative-bold', 'z-shape', 'asymmetrical', 'banner-impact', 'grid-cards', 'split-screen'],
  'online-store': ['shop-showcase', 'grid-cards', 'featured-hero', 'holy-grail', 'one-page', 'banner-impact'],
  'restaurant-food': ['featured-hero', 'banner-impact', 'gallery-first', 'split-screen', 'f-shape', 'classic-split'],
  'real-estate': ['featured-hero', 'gallery-first', 'split-screen', 'business-corporate', 'grid-cards', 'banner-impact'],
  'saas-startup': ['saas-modern', 'one-page', 'f-shape', 'split-screen', 'banner-impact', 'grid-cards'],
  'event-wedding': ['featured-hero', 'gallery-first', 'banner-impact', 'single-column', 'creative-bold', 'minimal-clean'],
  'nonprofit-charity': ['banner-impact', 'f-shape', 'holy-grail', 'business-corporate', 'one-page', 'minimal-clean'],
  'education-course': ['saas-modern', 'one-page', 'grid-cards', 'business-corporate', 'z-shape', 'classic-split'],
  'healthcare-clinic': ['business-corporate', 'holy-grail', 'classic-split', 'f-shape', 'minimal-clean', 'split-screen'],
  'photography-studio': ['gallery-first', 'featured-hero', 'creative-bold', 'asymmetrical', 'split-screen', 'minimal-clean'],
  'resume-cv': ['minimal-clean', 'single-column', 'classic-split', 'business-corporate', 'f-shape', 'split-screen'],
  'blog-writer': ['magazine', 'single-column', 'minimal-clean', 'asymmetrical', 'banner-impact', 'classic-split'],
  'music-artist': ['creative-bold', 'featured-hero', 'asymmetrical', 'gallery-first', 'banner-impact', 'split-screen'],
  'fitness-coach': ['one-page', 'banner-impact', 'z-shape', 'business-corporate', 'grid-cards', 'shop-showcase'],
  'law-consulting': ['business-corporate', 'f-shape', 'holy-grail', 'minimal-clean', 'classic-split', 'split-screen'],
  'construction-trades': ['gallery-first', 'split-screen', 'grid-cards', 'business-corporate', 'featured-hero', 'classic-split'],
  'travel-hospitality': ['featured-hero', 'gallery-first', 'magazine', 'banner-impact', 'grid-cards', 'shop-showcase'],
};

export function getLayoutPresetsForPurpose(purpose: WebsitePurpose): LayoutPreset[] {
  return (PURPOSE_LAYOUT_OPTIONS[purpose] || ['classic-split', 'banner-impact', 'minimal-clean'])
    .map(id => LAYOUT_PRESETS[id]);
}

export function getDefaultLayoutPresetId(purpose: WebsitePurpose): LayoutPresetId {
  return PURPOSE_LAYOUT_OPTIONS[purpose]?.[0] || 'classic-split';
}

function setField(portfolio: Portfolio, sectionType: SectionType, fieldId: string, value: string) {
  const sec = portfolio.sections.find(s => s.type === sectionType);
  const field = sec?.fields.find(f => f.id === fieldId);
  if (field && typeof field.value === 'string') field.value = value;
}

function applySectionStyle(section: PortfolioSection, style: Partial<SectionStyle>) {
  section.style = { ...section.style, ...style };
}

export function applyLayoutPreset(portfolio: Portfolio, presetId: LayoutPresetId): Portfolio {
  const preset = LAYOUT_PRESETS[presetId];
  if (!preset) return portfolio;

  const p: Portfolio = {
    ...portfolio,
    navbar: { ...portfolio.navbar, ...preset.navbar },
    footer: { ...portfolio.footer, ...preset.footer },
    theme: { ...portfolio.theme, ...preset.theme },
    meta: portfolio.meta ? { ...portfolio.meta, layoutPreset: presetId } : portfolio.meta,
  };

  setField(p, 'hero', 'heroLayout', preset.heroLayout);

  for (const [type, fields] of Object.entries(preset.sectionFields) as [SectionType, Record<string, string>][]) {
    for (const [fieldId, value] of Object.entries(fields)) {
      setField(p, type, fieldId, value);
    }
  }

  for (const [type, style] of Object.entries(preset.sectionStyles) as [SectionType, Partial<SectionStyle>][]) {
    const sec = p.sections.find(s => s.type === type);
    if (sec) applySectionStyle(sec, style);
  }

  return p;
}
