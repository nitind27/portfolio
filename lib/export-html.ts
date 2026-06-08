import { APP_NAME, DESKTOP_VIEWPORT_CONTENT } from './brand';
import { Portfolio, PortfolioSection, SocialLinks, NavbarConfig, FooterConfig } from './types';
import { escapeHtml } from './export-assets';
import { renderSection } from './export-sections';

const DEFAULT_NAVBAR: NavbarConfig = {
  brandName: '', tagline: '', logoImage: '', style: 'glass', layout: 'standard',
  showLogo: true, showTagline: false, showCta: true, ctaText: 'Contact Me', ctaLink: '#contact',
  showSocial: false, linkStyle: 'minimal', linkGap: 14, linkPaddingX: 10, sticky: true,
  desktopMenu: 'links', desktopMenuStyle: 'drawer-right', mobileMenu: 'drawer-right',
  menuIcon: 'dots', scrollBehavior: 'none', scrollAnimation: 'smooth',
};

const DEFAULT_FOOTER: FooterConfig = {
  enabled: true, showCta: true, ctaTitle: 'Ready to work together?',
  ctaSubtitle: "Let's create something great. Reach out anytime.", ctaButtonText: 'Get In Touch',
  showBrand: true, showDescription: true, customDescription: '', showLiveBadge: true,
  showNavigation: true, navHeading: 'Navigation', showContact: true, contactHeading: 'Contact',
  showSocial: true, socialHeading: 'Follow Me', showCopyright: true, copyrightText: '',
  showBackToTop: true, showBuiltWith: true,
};

const SOCIAL_ICONS: Record<string, string> = {
  github: '🐙', linkedin: '💼', twitter: '𝕏', instagram: '📸',
  youtube: '▶️', dribbble: '🏀', behance: '🎨', website: '🌐',
};

function sectionField(sections: PortfolioSection[], type: string, fieldId: string): string {
  const sec = sections.find(s => s.type === type);
  const f = sec?.fields.find(fl => fl.id === fieldId);
  return typeof f?.value === 'string' ? f.value : '';
}

function renderNavbar(portfolio: Portfolio, sections: PortfolioSection[]): string {
  const navbar = { ...DEFAULT_NAVBAR, ...portfolio.navbar };
  const theme = portfolio.theme;
  const brandName = navbar.brandName || portfolio.name;
  const initial = brandName.charAt(0).toUpperCase();
  const logo = navbar.logoImage;
  const links = sections.map(s =>
    `<li><a href="#${escapeHtml(s.id)}">${escapeHtml(s.title)}</a></li>`
  ).join('');

  return `<nav class="navbar">
    <div class="navbar-inner">
      <div class="container navbar-row">
        <a href="#portfolio-top" class="nav-brand">
          ${navbar.showLogo ? (logo
            ? `<img class="nav-brand-logo" src="${escapeHtml(logo)}" alt="${escapeHtml(brandName)}">`
            : `<div class="nav-brand-initial">${escapeHtml(initial)}</div>`) : ''}
          <div>
            <p class="nav-brand-name">${escapeHtml(brandName)}</p>
            ${navbar.showTagline && navbar.tagline ? `<p class="nav-brand-tag">${escapeHtml(navbar.tagline)}</p>` : ''}
          </div>
        </a>
        <ul class="nav-links">${links}</ul>
        <div class="nav-actions">
          ${navbar.showCta && navbar.ctaText ? `<a class="nav-cta" href="${escapeHtml(navbar.ctaLink || '#contact')}">${escapeHtml(navbar.ctaText)}</a>` : ''}
          <button type="button" class="menu-btn" id="menu-btn" aria-label="Open menu">☰</button>
        </div>
      </div>
    </div>
  </nav>`;
}

function renderMobileMenu(portfolio: Portfolio, sections: PortfolioSection[]): string {
  const navbar = { ...DEFAULT_NAVBAR, ...portfolio.navbar };
  const brandName = navbar.brandName || portfolio.name;
  const initial = brandName.charAt(0).toUpperCase();
  const icons: Record<string, string> = {
    hero: '🏠', about: '👤', skills: '⚡', experience: '💼', projects: '🚀',
    gallery: '🖼️', testimonials: '💬', contact: '📧', videos: '🎬',
    services: '🛠️', team: '👥', stats: '📊', social: '🔗',
    pricing: '💰', faq: '❓', blog: '📝', custom: '✏️',
  };
  const links = sections.map(s =>
    `<a href="#${escapeHtml(s.id)}"><span>${icons[s.type] || '📄'}</span> ${escapeHtml(s.title)}</a>`
  ).join('');
  return `<div class="mobile-menu-overlay" id="mobile-menu">
    <div class="mobile-menu-panel">
      <div class="mobile-menu-header">
        <div style="display:flex;align-items:center;gap:0.65rem">
          <div style="width:36px;height:36px;border-radius:var(--radius);background:rgba(255,255,255,0.22);display:flex;align-items:center;justify-content:center;font-weight:800">${escapeHtml(initial)}</div>
          <div><p style="font-weight:800;font-size:0.92rem">${escapeHtml(brandName)}</p><p style="font-size:0.65rem;opacity:0.85;text-transform:uppercase;letter-spacing:0.08em">Menu</p></div>
        </div>
        <button type="button" class="mobile-menu-close" id="menu-close" aria-label="Close menu">✕</button>
      </div>
      <div class="mobile-menu-links">${links}</div>
      ${navbar.showCta && navbar.ctaText ? `<div style="padding:0.75rem 0.65rem 0.9rem;border-top:1px solid color-mix(in srgb,var(--primary) 9%,transparent)"><a class="nav-cta" style="display:block;text-align:center" href="${escapeHtml(navbar.ctaLink || '#contact')}">${escapeHtml(navbar.ctaText)}</a></div>` : ''}
    </div>
  </div>`;
}

function renderFooter(portfolio: Portfolio, sections: PortfolioSection[], social: SocialLinks): string {
  const footer = { ...DEFAULT_FOOTER, ...portfolio.footer };
  if (!footer.enabled) return '';

  const theme = portfolio.theme;
  const email = sectionField(sections, 'contact', 'email');
  const phone = sectionField(sections, 'contact', 'phone');
  const location = sectionField(sections, 'contact', 'location');
  const contactSection = sections.find(s => s.type === 'contact');
  const contactId = contactSection?.id;
  const description = footer.customDescription || portfolio.seo?.description || 'A professional portfolio showcasing creative work, skills, and expertise.';
  const socialLinks = Object.entries(social).filter(([, v]) => v);
  const initial = portfolio.name.charAt(0).toUpperCase();

  const navLinks = footer.showNavigation ? sections.map(s =>
    `<a href="#${escapeHtml(s.id)}" style="display:block;opacity:0.65;text-decoration:none;font-size:0.88rem;margin-bottom:0.5rem;transition:opacity 0.2s">${escapeHtml(s.title)}</a>`
  ).join('') : '';

  const socialGrid = footer.showSocial && socialLinks.length ? socialLinks.map(([key, url]) =>
    `<a href="${escapeHtml(url as string)}" target="_blank" rel="noopener noreferrer" title="${escapeHtml(key)}" style="display:flex;flex-direction:column;align-items:center;gap:0.3rem;padding:0.55rem 0.5rem;border-radius:var(--radius);border:1px solid color-mix(in srgb,var(--primary) 20%,transparent);background:color-mix(in srgb,var(--primary) 6%,transparent);text-decoration:none;font-size:0.72rem;font-weight:600">
      <span style="font-size:0.95rem">${SOCIAL_ICONS[key] || key.slice(0, 2).toUpperCase()}</span>
      <span style="font-size:0.62rem;opacity:0.75">${escapeHtml(key)}</span></a>`
  ).join('') : '';

  return `<footer class="site-footer">
    <div class="footer-accent"></div>
    <div class="footer-inner">
      ${footer.showCta ? `<div class="footer-cta">
        <div><p style="font-weight:700;font-size:1.05rem;margin-bottom:0.3rem">${escapeHtml(footer.ctaTitle)}</p>
        <p style="opacity:0.55;font-size:0.88rem">${escapeHtml(footer.ctaSubtitle)}</p></div>
        ${contactId ? `<a class="btn-primary" href="#${escapeHtml(contactId)}">${escapeHtml(footer.ctaButtonText)}</a>` : ''}
      </div>` : ''}
      <div class="footer-grid" style="grid-template-columns:repeat(auto-fit,minmax(200px,1fr))">
        ${footer.showBrand ? `<div>
          <div style="display:flex;align-items:center;gap:0.7rem;margin-bottom:1rem">
            <div class="nav-brand-initial" style="width:42px;height:42px;font-size:0.95rem">${escapeHtml(initial)}</div>
            <p style="font-weight:800;font-size:1.1rem;color:var(--primary)">${escapeHtml(portfolio.name)}</p>
          </div>
          ${footer.showDescription ? `<p style="opacity:0.55;font-size:0.88rem;line-height:1.7;max-width:280px">${escapeHtml(description)}</p>` : ''}
        </div>` : ''}
        ${footer.showNavigation ? `<div><p class="footer-heading">${escapeHtml(footer.navHeading)}</p>${navLinks}</div>` : ''}
        ${footer.showContact ? `<div><p class="footer-heading">${escapeHtml(footer.contactHeading)}</p>
          ${email ? `<p style="opacity:0.65;font-size:0.88rem;margin-bottom:0.4rem">📧 <a href="mailto:${escapeHtml(email)}" style="color:inherit;text-decoration:none">${escapeHtml(email)}</a></p>` : ''}
          ${phone ? `<p style="opacity:0.65;font-size:0.88rem;margin-bottom:0.4rem">📞 ${escapeHtml(phone)}</p>` : ''}
          ${location ? `<p style="opacity:0.65;font-size:0.88rem">📍 ${escapeHtml(location)}</p>` : ''}
        </div>` : ''}
        ${footer.showSocial && socialLinks.length ? `<div><p class="footer-heading">${escapeHtml(footer.socialHeading)}</p><div style="display:grid;grid-template-columns:repeat(2,1fr);gap:0.55rem">${socialGrid}</div></div>` : ''}
      </div>
      <div class="footer-bottom">
        ${footer.showCopyright ? `<p>${footer.copyrightText ? escapeHtml(footer.copyrightText) : `© ${new Date().getFullYear()} <span style="font-weight:600;opacity:1">${escapeHtml(portfolio.name)}</span>. All rights reserved.`}</p>` : '<div></div>'}
        <div style="display:flex;align-items:center;gap:1.25rem;flex-wrap:wrap">
          ${footer.showBuiltWith ? `<p style="opacity:0.28;font-size:0.78rem">Built with ${APP_NAME}</p>` : ''}
          ${footer.showBackToTop ? '<button type="button" class="back-to-top" id="back-to-top">Back to top ↑</button>' : ''}
        </div>
      </div>
    </div>
  </footer>`;
}

function renderPopup(portfolio: Portfolio): string {
  const popup = portfolio.popup;
  if (!popup?.enabled) return '';
  return `<div class="popup-overlay" id="landing-popup">
    <div class="popup-card" style="background:${escapeHtml(popup.bgColor || portfolio.theme.backgroundColor)};color:${escapeHtml(popup.textColor || portfolio.theme.textColor)}">
      <h3 style="font-weight:800;font-size:1.25rem;margin-bottom:0.75rem">${escapeHtml(popup.title)}</h3>
      <p style="opacity:0.85;line-height:1.7;margin-bottom:1.5rem">${escapeHtml(popup.message)}</p>
      <button type="button" id="popup-dismiss" class="btn-primary" style="border:none;cursor:pointer;width:100%">${escapeHtml(popup.buttonText || 'Got it')}</button>
    </div>
  </div>`;
}

export function generateExportHTML(portfolio: Portfolio): string {
  const { theme, seo } = portfolio;
  const social = portfolio.social || {};
  const visibleSections = portfolio.sections.filter(s => s.visible).sort((a, b) => a.order - b.order);
  const fontParam = theme.fontFamily.replace(/\s+/g, '+');
  const sectionsHtml = visibleSections.map((s, i) => renderSection(s, i, portfolio)).join('\n');

  return `<!DOCTYPE html>
<html lang="${escapeHtml(portfolio.language || 'en')}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="${DESKTOP_VIEWPORT_CONTENT}">
  <title>${escapeHtml(seo.title || portfolio.name)}</title>
  <meta name="description" content="${escapeHtml(seo.description || '')}">
  <meta name="keywords" content="${escapeHtml(seo.keywords || '')}">
  <meta property="og:title" content="${escapeHtml(seo.title || portfolio.name)}">
  <meta property="og:description" content="${escapeHtml(seo.description || '')}">
  ${seo.ogImage ? `<meta property="og:image" content="${escapeHtml(seo.ogImage)}">` : ''}
  ${seo.favicon ? `<link rel="icon" href="${escapeHtml(seo.favicon)}">` : ''}
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=${fontParam}:wght@400;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="styles.css">
</head>
<body id="portfolio-top">
  ${renderNavbar(portfolio, visibleSections)}
  <main>${sectionsHtml}</main>
  ${renderFooter(portfolio, visibleSections, social)}
  ${renderMobileMenu(portfolio, visibleSections)}
  ${renderPopup(portfolio)}
  <div class="modal-overlay" id="blog-modal">
    <div class="modal-card">
      <button type="button" class="modal-close" id="blog-modal-close" aria-label="Close">✕</button>
      <h3 id="blog-modal-title" style="font-weight:800;font-size:1.35rem;margin-bottom:1rem;color:var(--primary)"></h3>
      <div id="blog-modal-body" style="opacity:0.85;line-height:1.85;white-space:pre-wrap"></div>
    </div>
  </div>
  <script src="script.js"></script>
</body>
</html>`;
}
