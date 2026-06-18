export type ThemeMode = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'site99-theme';

export interface BrandPalette {
  bg: string;
  surface: string;
  surfaceHover: string;
  border: string;
  accent: string;
  accentHover: string;
  accentLight: string;
  accentMuted: string;
  accentGlow: string;
  navy: string;
  navySoft: string;
  steel: string;
  steelLight: string;
  onAccent: string;
  warm: string;
  text: string;
  textMuted: string;
  textDim: string;
  danger: string;
  success: string;
}

export const brandDark: BrandPalette = {
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
};

export const brandLight: BrandPalette = {
  bg: '#f1f5f9',
  surface: '#ffffff',
  surfaceHover: '#f8fafc',
  border: 'rgba(15, 23, 42, 0.1)',
  accent: '#e07d10',
  accentHover: '#c96a08',
  accentLight: '#f28c28',
  accentMuted: 'rgba(224, 125, 16, 0.1)',
  accentGlow: 'rgba(224, 125, 16, 0.18)',
  navy: '#ffffff',
  navySoft: '#f8fafc',
  steel: '#cbd5e1',
  steelLight: '#94a3b8',
  onAccent: '#ffffff',
  warm: '#f28c28',
  text: '#0f172a',
  textMuted: '#475569',
  textDim: '#64748b',
  danger: '#dc2626',
  success: '#16a34a',
};

export function getBrandPalette(theme: ThemeMode): BrandPalette {
  return theme === 'light' ? brandLight : brandDark;
}

export function applyThemeToDocument(theme: ThemeMode) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.setAttribute('data-theme', theme);
  const p = getBrandPalette(theme);
  root.style.setProperty('--background', p.bg);
  root.style.setProperty('--foreground', p.text);
  root.style.setProperty('--brand-bg', p.bg);
  root.style.setProperty('--brand-surface', p.surface);
  root.style.setProperty('--brand-surface-hover', p.surfaceHover);
  root.style.setProperty('--brand-border', p.border);
  root.style.setProperty('--brand-text', p.text);
  root.style.setProperty('--brand-text-muted', p.textMuted);
  root.style.setProperty('--brand-text-dim', p.textDim);
  root.style.colorScheme = theme;
}

export function readStoredTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'dark';
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
  } catch { /* ignore */ }
  return 'dark';
}

/** Inline script — runs before React hydrates; sets data-theme + CSS vars from localStorage. */
export function getThemeInitScript(): string {
  const dark = brandDark;
  const light = brandLight;
  return `(function(){
    try {
      var t = localStorage.getItem('${THEME_STORAGE_KEY}');
      var m = t === 'light' || t === 'dark' ? t : 'dark';
      var d = ${JSON.stringify(dark)};
      var l = ${JSON.stringify(light)};
      var p = m === 'light' ? l : d;
      var r = document.documentElement;
      r.setAttribute('data-theme', m);
      r.style.colorScheme = m;
      r.style.setProperty('--background', p.bg);
      r.style.setProperty('--foreground', p.text);
      r.style.setProperty('--brand-bg', p.bg);
      r.style.setProperty('--brand-surface', p.surface);
      r.style.setProperty('--brand-surface-hover', p.surfaceHover);
      r.style.setProperty('--brand-border', p.border);
      r.style.setProperty('--brand-text', p.text);
      r.style.setProperty('--brand-text-muted', p.textMuted);
      r.style.setProperty('--brand-text-dim', p.textDim);
    } catch (e) {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  })();`;
}
