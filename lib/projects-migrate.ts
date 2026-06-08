import type { Portfolio, PortfolioSection } from './types';
import { SECTION_DEFAULTS } from './templates';
import { migrateBlogSection } from './blog-utils';
import { migrateTestimonialsSection } from './testimonial-utils';
import { migrateTeamSection } from './team-utils';
import { migratePricingSection } from './pricing-utils';
import { migrateFAQSection } from './faq-utils';
import { purgeExpiredPortfolios } from './project-expiry';

const defaultSMTP = {
  host: '', port: 587, secure: false, user: '', password: '', fromName: '', toEmail: '', provider: 'custom' as const,
};

const defaultNavbar = {
  brandName: '', tagline: '', logoImage: '', style: 'glass' as const, layout: 'standard' as const,
  showLogo: true, showTagline: false, showCta: true, ctaText: 'Contact Me', ctaLink: '#contact',
  showSocial: false, linkStyle: 'minimal' as const, linkGap: 14, linkPaddingX: 10, sticky: true,
  desktopMenu: 'links' as const, desktopMenuStyle: 'drawer-right' as const, mobileMenu: 'drawer-right' as const,
  menuIcon: 'dots' as const, scrollBehavior: 'none' as const, scrollAnimation: 'smooth' as const,
};

const defaultFooter = {
  enabled: true, showCta: true, ctaTitle: 'Ready to work together?',
  ctaSubtitle: "Let's create something great. Reach out anytime.", ctaButtonText: 'Get In Touch',
  showBrand: true, showDescription: true, customDescription: '', showLiveBadge: true, showNavigation: true,
  navHeading: 'Navigation', showContact: true, contactHeading: 'Contact', showSocial: true,
  socialHeading: 'Follow Me', showCopyright: true, copyrightText: '', showBackToTop: true, showBuiltWith: true,
};

function migratePortfolioSections(sections: PortfolioSection[]): PortfolioSection[] {
  return sections.map(section => {
    if (section.type === 'hero') {
      const def = SECTION_DEFAULTS['hero'];
      const repairedFields = section.fields.map(field => {
        const match = def.fields.find(d => d.label === field.label && d.id !== field.id);
        if (match) return { ...field, id: match.id };
        return field;
      });
      return { ...section, fields: repairedFields };
    }
    if (section.type === 'about' || section.type === 'contact') {
      const def = SECTION_DEFAULTS[section.type];
      const existingIds = new Set(section.fields.map(f => f.id));
      const missing = def.fields.filter(f => !existingIds.has(f.id));
      if (missing.length) return { ...section, fields: [...section.fields, ...missing.map(f => ({ ...f }))] };
    }
    if (section.type === 'blog') return migrateBlogSection(section);
    if (section.type === 'testimonials') return migrateTestimonialsSection(section);
    if (section.type === 'team') return migrateTeamSection(section);
    if (section.type === 'pricing') return migratePricingSection(section);
    if (section.type === 'faq') return migrateFAQSection(section);
    return section;
  });
}

export function migratePortfolios(portfolios: Portfolio[]): Portfolio[] {
  const purged = purgeExpiredPortfolios(portfolios);
  return purged.map(portfolio => ({
    ...portfolio,
    smtp: portfolio.smtp ? { ...defaultSMTP, ...portfolio.smtp } : { ...defaultSMTP },
    navbar: portfolio.navbar
      ? {
          ...defaultNavbar,
          ...portfolio.navbar,
          desktopMenu: portfolio.navbar.desktopMenu ?? defaultNavbar.desktopMenu,
          desktopMenuStyle: portfolio.navbar.desktopMenuStyle ?? defaultNavbar.desktopMenuStyle,
          mobileMenu: portfolio.navbar.mobileMenu ?? defaultNavbar.mobileMenu,
          menuIcon: portfolio.navbar.menuIcon ?? defaultNavbar.menuIcon,
          scrollBehavior: portfolio.navbar.scrollBehavior ?? defaultNavbar.scrollBehavior,
          scrollAnimation: portfolio.navbar.scrollAnimation ?? defaultNavbar.scrollAnimation,
        }
      : { ...defaultNavbar },
    footer: portfolio.footer ? { ...defaultFooter, ...portfolio.footer } : { ...defaultFooter },
    sections: migratePortfolioSections(portfolio.sections),
  }));
}
