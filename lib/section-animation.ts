import { PortfolioSection, SectionAnimation, SectionEntranceType, SectionAnimEasing, ThemeConfig } from './types';

export const DEFAULT_SECTION_ANIMATION: SectionAnimation = {
  custom: false,
  entrance: 'inherit',
  trigger: 'scroll',
  duration: 0.55,
  delay: 0,
  distance: 40,
  scaleFrom: 0.92,
  opacityFrom: 0,
  easing: 'smooth',
  staggerChildren: false,
  staggerDelay: 0.08,
  hoverEnabled: false,
  hoverScale: 1.02,
  hoverLift: 6,
};

export const ENTRANCE_PRESETS: { id: SectionEntranceType; label: string; icon: string; desc: string }[] = [
  { id: 'inherit', label: 'Theme Default', icon: '🎨', desc: 'Use global theme animation' },
  { id: 'none', label: 'None', icon: '⏹', desc: 'No entrance animation' },
  { id: 'fade', label: 'Fade', icon: '✨', desc: 'Smooth opacity reveal' },
  { id: 'slide-up', label: 'Slide Up', icon: '⬆', desc: 'Rise from below' },
  { id: 'slide-down', label: 'Slide Down', icon: '⬇', desc: 'Drop from above' },
  { id: 'slide-left', label: 'Slide Left', icon: '⬅', desc: 'Enter from right' },
  { id: 'slide-right', label: 'Slide Right', icon: '➡', desc: 'Enter from left' },
  { id: 'scale', label: 'Scale', icon: '◆', desc: 'Grow into view' },
  { id: 'zoom-in', label: 'Zoom In', icon: '🔍', desc: 'Bold zoom entrance' },
  { id: 'zoom-out', label: 'Zoom Out', icon: '🔎', desc: 'Shrink into place' },
  { id: 'flip', label: 'Flip', icon: '🔄', desc: '3D flip reveal' },
  { id: 'blur', label: 'Blur In', icon: '💫', desc: 'Focus from blur' },
  { id: 'rotate', label: 'Rotate', icon: '🌀', desc: 'Spin into view' },
];

function getEasingTransition(easing: SectionAnimEasing, duration: number) {
  switch (easing) {
    case 'snappy': return { duration, ease: 'easeOut' as const };
    case 'bounce': return { duration: duration * 1.1, ease: [0.34, 1.56, 0.64, 1] as const };
    case 'spring': return { type: 'spring' as const, stiffness: 280, damping: 24, delay: 0 };
    case 'linear': return { duration, ease: 'linear' as const };
    default: return { duration, ease: [0.22, 1, 0.36, 1] as const };
  }
}

function themeToEntrance(themeAnim: ThemeConfig['animation']): SectionEntranceType {
  switch (themeAnim) {
    case 'none': return 'none';
    case 'subtle': return 'fade';
    case 'expressive': return 'zoom-in';
    default: return 'slide-up';
  }
}

function themeDefaults(themeAnim: ThemeConfig['animation']): Partial<SectionAnimation> {
  switch (themeAnim) {
    case 'none': return { duration: 0, distance: 0, opacityFrom: 1, scaleFrom: 1 };
    case 'subtle': return { duration: 0.4, distance: 8, opacityFrom: 0, scaleFrom: 1 };
    case 'expressive': return { duration: 0.7, distance: 48, opacityFrom: 0, scaleFrom: 0.96 };
    default: return { duration: 0.55, distance: 24, opacityFrom: 0, scaleFrom: 1 };
  }
}

export function getSectionAnimation(section: PortfolioSection): SectionAnimation {
  return { ...DEFAULT_SECTION_ANIMATION, ...section.style?.animation };
}

export function resolveEntranceType(section: PortfolioSection, theme: ThemeConfig): SectionEntranceType {
  const anim = getSectionAnimation(section);
  if (!anim.custom || anim.entrance === 'inherit') return themeToEntrance(theme.animation);
  return anim.entrance || 'slide-up';
}

export function resolveSectionAnimation(section: PortfolioSection, theme: ThemeConfig): SectionAnimation & { resolvedEntrance: SectionEntranceType } {
  const anim = getSectionAnimation(section);
  const resolvedEntrance = resolveEntranceType(section, theme);
  const defaults = anim.custom ? {} : themeDefaults(theme.animation);
  return {
    ...DEFAULT_SECTION_ANIMATION,
    ...defaults,
    ...anim,
    resolvedEntrance,
    duration: anim.custom && anim.duration != null ? anim.duration : (defaults.duration ?? anim.duration ?? 0.55),
    distance: anim.custom && anim.distance != null ? anim.distance : (defaults.distance ?? anim.distance ?? 40),
    scaleFrom: anim.custom && anim.scaleFrom != null ? anim.scaleFrom : (defaults.scaleFrom ?? anim.scaleFrom ?? 0.92),
    opacityFrom: anim.custom && anim.opacityFrom != null ? anim.opacityFrom : (defaults.opacityFrom ?? anim.opacityFrom ?? 0),
  };
}

function buildHiddenState(entrance: SectionEntranceType, anim: SectionAnimation) {
  const base: Record<string, number> = {};
  if (entrance === 'none') return {};
  const opacity = anim.opacityFrom ?? 0;
  const dist = anim.distance ?? 40;
  const scale = anim.scaleFrom ?? 0.92;

  switch (entrance) {
    case 'fade': return { opacity };
    case 'slide-up': return { opacity, y: dist };
    case 'slide-down': return { opacity, y: -dist };
    case 'slide-left': return { opacity, x: dist };
    case 'slide-right': return { opacity, x: -dist };
    case 'scale': return { opacity, scale };
    case 'zoom-in': return { opacity, scale: scale < 1 ? scale : 0.85 };
    case 'zoom-out': return { opacity, scale: scale > 1 ? scale : 1.12 };
    case 'flip': return { opacity, rotateX: 18, y: dist * 0.4 };
    case 'blur': return { opacity, filter: 'blur(12px)' };
    case 'rotate': return { opacity, rotate: -6, scale: scale };
    default: return { opacity, y: dist * 0.6 };
  }
}

function buildVisibleState(entrance: SectionEntranceType) {
  const base: Record<string, number | string> = { opacity: 1, x: 0, y: 0, scale: 1, rotate: 0, rotateX: 0 };
  if (entrance === 'blur') base.filter = 'blur(0px)';
  return base;
}

export function getMotionVariants(section: PortfolioSection, theme: ThemeConfig) {
  const anim = resolveSectionAnimation(section, theme);
  const entrance = anim.resolvedEntrance;
  if (entrance === 'none') return { hidden: {}, visible: {} };

  const transition = {
    ...getEasingTransition(anim.easing || 'smooth', anim.duration || 0.55),
    delay: anim.delay || 0,
  };

  if (anim.staggerChildren) {
    return {
      hidden: {},
      visible: {
        transition: {
          staggerChildren: anim.staggerDelay || 0.08,
          delayChildren: anim.delay || 0,
        },
      },
    };
  }

  return {
    hidden: buildHiddenState(entrance, anim),
    visible: {
      ...buildVisibleState(entrance),
      transition,
    },
  };
}

export function getChildMotionVariants(section: PortfolioSection, theme: ThemeConfig) {
  const anim = resolveSectionAnimation(section, theme);
  const entrance = anim.resolvedEntrance;
  if (!anim.staggerChildren || entrance === 'none') return null;

  const transition = getEasingTransition(anim.easing || 'smooth', (anim.duration || 0.55) * 0.85);
  return {
    hidden: buildHiddenState(entrance, { ...anim, distance: (anim.distance || 40) * 0.6 }),
    visible: { ...buildVisibleState(entrance), transition },
  };
}

export function getMotionViewport(section: PortfolioSection, theme: ThemeConfig) {
  const anim = resolveSectionAnimation(section, theme);
  if (anim.trigger === 'load' || anim.resolvedEntrance === 'none') {
    return { once: true, amount: 0.1 as const };
  }
  return { once: true, margin: '-40px' as const, amount: 0.15 as const };
}

export function getSectionHoverProps(section: PortfolioSection) {
  const anim = getSectionAnimation(section);
  if (!anim.custom || !anim.hoverEnabled) return undefined;
  return {
    scale: anim.hoverScale ?? 1.02,
    y: -(anim.hoverLift ?? 6),
    transition: { duration: 0.25, ease: 'easeOut' as const },
  };
}

export function sectionAnimDataAttrs(section: PortfolioSection, theme: ThemeConfig): Record<string, string> {
  const anim = resolveSectionAnimation(section, theme);
  if (anim.resolvedEntrance === 'none') return { 'data-anim': 'none' };
  return {
    'data-anim': anim.resolvedEntrance,
    'data-anim-trigger': anim.trigger || 'scroll',
    'data-anim-duration': String(anim.duration ?? 0.55),
    'data-anim-delay': String(anim.delay ?? 0),
    'data-anim-distance': String(anim.distance ?? 40),
    'data-anim-scale': String(anim.scaleFrom ?? 0.92),
    'data-anim-opacity': String(anim.opacityFrom ?? 0),
    'data-anim-easing': anim.easing || 'smooth',
    ...(anim.hoverEnabled ? {
      'data-hover-scale': String(anim.hoverScale ?? 1.02),
      'data-hover-lift': String(anim.hoverLift ?? 6),
    } : {}),
  };
}

export function sectionAnimClassName(section: PortfolioSection, theme: ThemeConfig): string {
  const anim = resolveSectionAnimation(section, theme);
  if (anim.resolvedEntrance === 'none') return '';
  return `sec-anim sec-anim-${anim.resolvedEntrance}${anim.hoverEnabled ? ' sec-anim-hover' : ''}`;
}
