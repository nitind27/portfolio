import type { ThemeConfig } from '@/lib/types';

function parseColor(color: string): { r: number; g: number; b: number } | null {
  const c = color.trim();
  if (c.startsWith('#')) {
    let h = c.slice(1);
    if (h.length === 3) h = h.split('').map(ch => ch + ch).join('');
    if (h.length === 6) {
      return {
        r: parseInt(h.slice(0, 2), 16),
        g: parseInt(h.slice(2, 4), 16),
        b: parseInt(h.slice(4, 6), 16),
      };
    }
  }
  const rgba = c.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
  if (rgba) return { r: +rgba[1], g: +rgba[2], b: +rgba[3] };
  return null;
}

function relativeLuminance(rgb: { r: number; g: number; b: number }): number {
  const [rs, gs, bs] = [rgb.r, rgb.g, rgb.b].map(v => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

export function isLightBackground(color: string): boolean {
  const rgb = parseColor(color);
  if (!rgb) return false;
  return relativeLuminance(rgb) > 0.55;
}

/** Pick readable text on the given background. */
export function contrastingText(backgroundColor: string, preferred?: string): string {
  const bgLight = isLightBackground(backgroundColor);
  const dark = '#0f172a';
  const light = '#f1f5f9';
  if (!preferred) return bgLight ? dark : light;
  const prefRgb = parseColor(preferred);
  if (!prefRgb) return bgLight ? dark : light;
  const prefLight = relativeLuminance(prefRgb) > 0.55;
  if (bgLight && prefLight) return dark;
  if (!bgLight && !prefLight) return light;
  return preferred;
}

/** Ensure portfolio theme text contrasts with its background. */
export function resolvePortfolioTheme(theme: ThemeConfig): ThemeConfig {
  const textColor = contrastingText(theme.backgroundColor, theme.textColor);
  if (textColor === theme.textColor) return theme;
  return { ...theme, textColor };
}
