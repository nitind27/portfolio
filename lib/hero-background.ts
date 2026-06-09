import type { CSSProperties } from 'react';
import type { HeroBackgroundSettings, HeroLayoutId, HeroTextMode, ThemeConfig } from './types';
import { getHeroContent } from './hero-content';

export const HERO_LAYOUT_OPTIONS: { id: HeroLayoutId; label: string; description: string }[] = [
  { id: 'text-only', label: 'Text Only', description: 'No image — full bg control' },
  { id: 'image-right', label: 'Image Right', description: 'Text left · photo right' },
  { id: 'image-left', label: 'Image Left', description: 'Photo left · text right' },
  { id: 'banner', label: 'Banner', description: 'Full-width image hero' },
  { id: 'slideshow', label: 'Slideshow', description: 'Rotating banner images' },
  { id: 'split', label: 'Split Screen', description: '50/50 text & image' },
];

export const HERO_BG_TYPE_OPTIONS: { id: HeroBackgroundSettings['type']; label: string }[] = [
  { id: 'theme', label: 'Theme' },
  { id: 'solid', label: 'Solid' },
  { id: 'gradient', label: 'Gradient' },
  { id: 'image', label: 'Image' },
];

export const DEFAULT_HERO_BACKGROUND: HeroBackgroundSettings = {
  type: 'theme',
  solidColor: '#6366f1',
  gradientFrom: '#6366f1',
  gradientTo: '#8b5cf6',
  gradientVia: '#a855f7',
  gradientAngle: 135,
  useThreeColor: false,
  imageUrl: '',
  useBannerImage: true,
  overlayOpacity: 45,
  overlayColor: '#000000',
  textMode: 'auto',
};

export function getHeroBackground(section: { style?: { heroContent?: { background?: HeroBackgroundSettings } } }): HeroBackgroundSettings {
  const raw = section.style?.heroContent?.background;
  return { ...DEFAULT_HERO_BACKGROUND, ...raw };
}

function hexToRgba(hex: string, alpha: number): string {
  const c = hex.replace('#', '');
  if (c.length < 6) return `rgba(0,0,0,${alpha})`;
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function hexLuminance(hex: string): number {
  const c = hex.replace('#', '');
  if (c.length < 6) return 0.5;
  const r = parseInt(c.slice(0, 2), 16) / 255;
  const g = parseInt(c.slice(2, 4), 16) / 255;
  const b = parseInt(c.slice(4, 6), 16) / 255;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function resolveHeroTextLight(
  textMode: HeroTextMode | undefined,
  bgType: HeroBackgroundSettings['type'],
  colors: string[],
): boolean {
  if (textMode === 'light') return true;
  if (textMode === 'dark') return false;
  if (bgType === 'image' || bgType === 'gradient') return true;
  if (bgType === 'solid' && colors[0]) return hexLuminance(colors[0]) < 0.45;
  return false;
}

export function buildHeroGradient(bg: HeroBackgroundSettings, theme: ThemeConfig): string {
  const from = bg.gradientFrom || theme.primaryColor;
  const to = bg.gradientTo || theme.secondaryColor;
  const angle = bg.gradientAngle ?? 135;
  if (bg.useThreeColor && bg.gradientVia) {
    return `linear-gradient(${angle}deg, ${from}, ${bg.gradientVia}, ${to})`;
  }
  return `linear-gradient(${angle}deg, ${from}, ${to})`;
}

export interface HeroBackgroundResolved {
  sectionStyle: CSSProperties;
  overlayStyle?: CSSProperties;
  lightText: boolean;
  hasImageBg: boolean;
}

export function resolveHeroBackground(
  section: { style?: { heroContent?: { background?: HeroBackgroundSettings } } },
  theme: ThemeConfig,
  opts?: { bannerImage?: string; avatar?: string; layout?: HeroLayoutId },
): HeroBackgroundResolved {
  const bg = getHeroBackground(section);
  const type = bg.type || 'theme';
  const layout = opts?.layout;

  if (type === 'theme') {
    return {
      sectionStyle: { background: theme.backgroundColor },
      lightText: resolveHeroTextLight(bg.textMode, type, [theme.backgroundColor]),
      hasImageBg: false,
    };
  }

  if (type === 'solid') {
    const color = bg.solidColor || theme.primaryColor;
    return {
      sectionStyle: { background: color },
      lightText: resolveHeroTextLight(bg.textMode, type, [color]),
      hasImageBg: false,
    };
  }

  if (type === 'gradient') {
    const gradient = buildHeroGradient(bg, theme);
    const overlayOpacity = (bg.overlayOpacity ?? 0) / 100;
    const overlayColor = bg.overlayColor || '#000000';
    const rgba = hexToRgba(overlayColor, overlayOpacity);
    return {
      sectionStyle: { background: gradient },
      overlayStyle: overlayOpacity > 0 ? {
        background: `linear-gradient(135deg, ${rgba}, transparent)`,
      } : undefined,
      lightText: resolveHeroTextLight(bg.textMode, type, [bg.gradientFrom || theme.primaryColor]),
      hasImageBg: false,
    };
  }

  // image
  const imageUrl = bg.useBannerImage !== false
    ? (opts?.bannerImage || opts?.avatar || bg.imageUrl)
    : (bg.imageUrl || opts?.bannerImage || opts?.avatar);

  const overlayOpacity = (bg.overlayOpacity ?? 45) / 100;
  const overlayColor = bg.overlayColor || '#000000';
  const rgba = hexToRgba(overlayColor, overlayOpacity);

  if (!imageUrl) {
    const fallback = buildHeroGradient(bg, theme);
    return {
      sectionStyle: { background: fallback },
      lightText: true,
      hasImageBg: false,
    };
  }

  const isBannerLayout = layout === 'banner' || layout === 'slideshow';
  return {
    sectionStyle: isBannerLayout ? {} : {
      backgroundImage: `url(${imageUrl})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    },
    overlayStyle: {
      background: `linear-gradient(135deg, ${rgba}, ${overlayColor}22)`,
    },
    lightText: resolveHeroTextLight(bg.textMode, 'image', []),
    hasImageBg: true,
  };
}

export function heroBackgroundExportStyle(
  section: { style?: { heroContent?: { background?: HeroBackgroundSettings } } },
  theme: ThemeConfig,
): string {
  const resolved = resolveHeroBackground(section, theme);
  const parts: string[] = [];
  const bg = resolved.sectionStyle.background as string | undefined;
  const bgImg = resolved.sectionStyle.backgroundImage as string | undefined;
  if (bg) parts.push(`background:${bg}`);
  if (bgImg) parts.push(`background-image:${bgImg};background-size:cover;background-position:center`);
  return parts.join(';');
}

export function heroBackgroundUsesLightText(section: { style?: { heroContent?: { background?: HeroBackgroundSettings } } }, theme: ThemeConfig): boolean {
  return resolveHeroBackground(section, theme).lightText;
}

export function getHeroBgFromContent(section: Parameters<typeof getHeroContent>[0]) {
  return getHeroBackground(section);
}
