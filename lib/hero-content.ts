export type { HeroBlockId } from './types';
import type { CSSProperties } from 'react';
import type {
  HeroAlignH,
  HeroAlignV,
  HeroBlockId,
  HeroBlockSettings,
  HeroContentSettings,
  PortfolioSection,
  SectionEntranceType,
  ThemeConfig,
} from './types';
import { resolveEntranceType, resolveSectionAnimation } from './section-animation';

export const HERO_BLOCK_LABELS: Record<HeroBlockId, string> = {
  badge: 'Badge / Welcome',
  headline: 'Headline',
  subheadline: 'Subheadline',
  description: 'Description',
  cta: 'Buttons (CTA)',
  social: 'Social links',
};

export const DEFAULT_HERO_BLOCK_ORDER: HeroBlockId[] = [
  'badge',
  'headline',
  'subheadline',
  'description',
  'cta',
  'social',
];

export const DEFAULT_HERO_CONTENT: HeroContentSettings = {
  alignH: 'left',
  alignV: 'center',
  maxWidth: 640,
  badgeText: 'Welcome',
  showBadge: true,
  staggerBlocks: true,
  blockOrder: [...DEFAULT_HERO_BLOCK_ORDER],
  blocks: {
    badge: { visible: true, entrance: 'inherit', delay: 0 },
    headline: { visible: true, entrance: 'inherit', delay: 0.05 },
    subheadline: { visible: true, entrance: 'inherit', delay: 0.1 },
    description: { visible: true, entrance: 'inherit', delay: 0.15 },
    cta: { visible: true, entrance: 'inherit', delay: 0.22 },
    social: { visible: true, entrance: 'inherit', delay: 0.3 },
  },
};

export function getHeroContent(section: PortfolioSection): HeroContentSettings {
  const raw = section.style?.heroContent || {};
  const blocks = { ...DEFAULT_HERO_CONTENT.blocks, ...raw.blocks };
  return {
    ...DEFAULT_HERO_CONTENT,
    ...raw,
    blockOrder: raw.blockOrder?.length ? raw.blockOrder : DEFAULT_HERO_BLOCK_ORDER,
    blocks,
  };
}

export function isHeroBlockVisible(hero: HeroContentSettings, id: HeroBlockId): boolean {
  if (id === 'badge' && hero.showBadge === false) return false;
  return hero.blocks?.[id]?.visible !== false;
}

export function getHeroAlignStyles(hero: HeroContentSettings, isMobile: boolean): CSSProperties {
  const alignH = hero.alignH || 'left';
  const alignV = hero.alignV || 'center';

  const textAlign = alignH;
  const alignItems =
    alignH === 'center' ? 'center' : alignH === 'right' ? 'flex-end' : 'flex-start';

  const justifyContent =
    alignV === 'top' ? 'flex-start' : alignV === 'bottom' ? 'flex-end' : 'center';

  return {
    display: 'flex',
    flexDirection: 'column',
    alignItems: isMobile && alignH !== 'center' ? 'flex-start' : alignItems,
    justifyContent,
    textAlign,
    width: '100%',
    maxWidth: hero.maxWidth ? `${hero.maxWidth}px` : undefined,
    marginLeft: alignH === 'center' ? 'auto' : undefined,
    marginRight: alignH === 'center' ? 'auto' : alignH === 'right' ? 0 : undefined,
    marginInlineStart: alignH === 'right' && !isMobile ? 'auto' : undefined,
  };
}

export function getHeroOuterAlignStyles(hero: HeroContentSettings, isMobile: boolean): CSSProperties {
  const alignV = hero.alignV || 'center';
  const alignH = hero.alignH || 'left';

  return {
    display: 'flex',
    alignItems: alignV === 'top' ? 'flex-start' : alignV === 'bottom' ? 'flex-end' : 'center',
    justifyContent: alignH === 'center' ? 'center' : alignH === 'right' ? 'flex-end' : 'flex-start',
    width: '100%',
    minHeight: isMobile ? undefined : 'inherit',
  };
}

export function resolveBlockEntrance(
  block: HeroBlockSettings | undefined,
  section: PortfolioSection,
  theme: ThemeConfig,
): SectionEntranceType {
  const e = block?.entrance;
  if (e && e !== 'inherit') return e;
  return resolveEntranceType(section, theme);
}

export function getHeroBlockMotionConfig(
  blockId: HeroBlockId,
  hero: HeroContentSettings,
  section: PortfolioSection,
  theme: ThemeConfig,
  blockIndex: number,
) {
  const block = hero.blocks?.[blockId];
  const sectionAnim = resolveSectionAnimation(section, theme);
  const entrance = resolveBlockEntrance(block, section, theme);
  const baseDelay = block?.delay ?? 0;
  const stagger = hero.staggerBlocks ? blockIndex * (sectionAnim.staggerDelay ?? 0.08) : 0;
  const delay = baseDelay + stagger;
  const duration = block?.duration ?? sectionAnim.duration ?? 0.55;

  return {
    entrance,
    delay,
    duration,
    distance: sectionAnim.distance ?? 40,
    scaleFrom: sectionAnim.scaleFrom ?? 0.92,
    opacityFrom: sectionAnim.opacityFrom ?? 0,
    easing: sectionAnim.easing ?? 'smooth' as const,
  };
}

export function heroContentClass(hero: HeroContentSettings): string {
  return `hero-align-${hero.alignH || 'left'}-${hero.alignV || 'center'}`;
}

export const HERO_ALIGN_OPTIONS: { h: HeroAlignH; v: HeroAlignV; label: string }[] = [
  { h: 'left', v: 'top', label: 'Top left' },
  { h: 'center', v: 'top', label: 'Top center' },
  { h: 'right', v: 'top', label: 'Top right' },
  { h: 'left', v: 'center', label: 'Center left' },
  { h: 'center', v: 'center', label: 'Center' },
  { h: 'right', v: 'center', label: 'Center right' },
  { h: 'left', v: 'bottom', label: 'Bottom left' },
  { h: 'center', v: 'bottom', label: 'Bottom center' },
  { h: 'right', v: 'bottom', label: 'Bottom right' },
];
