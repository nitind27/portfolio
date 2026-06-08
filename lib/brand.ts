/** Webquro — app branding (matches public/logo/logo.png) */
export const APP_NAME = 'Webquro';
export const LOGO_SRC = '/logo/logo.png';
export const APP_TAGLINE = 'Build. Launch. Own your web presence.';
export const APP_DESCRIPTION = 'Create professional websites, portfolios, and online stores — no code required.';
export const STORAGE_POLICY_DAYS = 7;
export const STORAGE_POLICY_TEXT = `Projects are stored on this device for ${STORAGE_POLICY_DAYS} days only. After that they are removed automatically. Upgrade to premium to export and deploy permanently.`;

/** Fixed layout width — mobile browsers scale the full desktop site to fit */
export const DESKTOP_VIEWPORT_WIDTH = 1280;
export const DESKTOP_VIEWPORT_CONTENT = `width=${DESKTOP_VIEWPORT_WIDTH}`;

/** Colors extracted from Webquro logo — navy "Web" + vibrant blue "quro" / WQ mark */
export const brand = {
  bg: '#0a1628',
  surface: '#111827',
  surfaceHover: '#1e293b',
  border: 'rgba(148,163,184,0.12)',
  /** Logo primary blue */
  accent: '#2563eb',
  accentHover: '#1d4ed8',
  accentLight: '#3b82f6',
  accentMuted: 'rgba(37,99,235,0.14)',
  accentGlow: 'rgba(37,99,235,0.25)',
  /** Logo dark navy / "Web" text */
  navy: '#0f172a',
  navySoft: '#1e3a5f',
  onAccent: '#ffffff',
  warm: '#f59e0b',
  text: '#f1f5f9',
  textMuted: '#94a3b8',
  textDim: '#64748b',
  danger: '#ef4444',
  success: '#22c55e',
} as const;
