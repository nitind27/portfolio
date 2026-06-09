/** Bump when logo.png is replaced so browsers fetch the new file */
export const LOGO_VERSION = '2';

/** site99 — app branding (matches public/logo/logo.png) */
export const APP_NAME = 'site99';
export const APP_SLUG = 'site99';
export const APP_DOMAIN = 'site99.com';
export const LOGO_SRC = `/logo/logo.png?v=${LOGO_VERSION}`;
export const APP_TAGLINE = 'Building the future online.';
export const SUPPORT_EMAIL = 'support.site99@gmail.com';
export const APP_DESCRIPTION = 'Create professional websites, portfolios, and online stores — no code required.';
export const STORAGE_POLICY_DAYS = 7;
export const STORAGE_POLICY_TEXT = `Projects stay in your account for ${STORAGE_POLICY_DAYS} days on the free plan. You can publish and share a live link during that time — anyone with the link can view it. Upgrade to export, deploy, and keep projects longer.`;

/** Fixed layout width — mobile browsers scale the full desktop site to fit */
export const DESKTOP_VIEWPORT_WIDTH = 1280;
export const DESKTOP_VIEWPORT_CONTENT = `width=${DESKTOP_VIEWPORT_WIDTH}`;

export function previewSiteUrl(slug: string) {
  return `${slug}.${APP_DOMAIN}`;
}

/**
 * Logo palette — navy SITE99 wordmark + orange/gold icon + steel-blue tones
 */
export const brand = {
  bg: '#0a1d37',
  surface: '#102a43',
  surfaceHover: '#1a3554',
  border: 'rgba(148, 163, 184, 0.12)',
  accent: '#f28c28',
  accentHover: '#e07d10',
  accentLight: '#ffb347',
  accentMuted: 'rgba(242, 140, 40, 0.14)',
  accentGlow: 'rgba(242, 140, 40, 0.22)',
  navy: '#0a1d37',
  navySoft: '#102a43',
  steel: '#2d5a7b',
  steelLight: '#4a7c9b',
  onAccent: '#ffffff',
  warm: '#ffb347',
  text: '#f1f5f9',
  textMuted: '#94a3b8',
  textDim: '#64748b',
  danger: '#ef4444',
  success: '#22c55e',
} as const;

export const defaultBrandTheme = {
  primaryColor: brand.navySoft,
  secondaryColor: brand.steel,
  accentColor: brand.accent,
  backgroundColor: brand.bg,
  textColor: brand.text,
} as const;
