'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { Portfolio, PortfolioSection, SectionField, ThemeConfig, PopupConfig, NavbarConfig, SocialLinks, SMTPConfig } from '@/lib/types';
import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronLeft, ChevronRight, MoreVertical, Menu } from 'lucide-react';
import { NavbarMenuStyle, NavbarMenuIcon, NavbarScrollBehavior, NavbarScrollAnimation } from '@/lib/types';
import { useBuilderStore } from '@/lib/store';
import PopupCard from '../shared/PopupCard';
import { SectionHeader, SectionShell } from './SectionUI';
import {
  SkillsSection, ExperienceSection, ProjectsSection, ServicesSection, BlogSection,
  GallerySection, VideosSection, SocialSection, TestimonialsSection, StatsSection,
  TeamSection, PricingSection, FAQSection, CustomSection,
} from './AdvancedSections';
import { HeroSection } from './HeroSection';
import { DynamicFieldsGrid } from './DynamicFields';
import { getSectionPad, isNarrowDeviceView, isMobileDeviceView } from '@/lib/responsive';
import { getMotionVariants, getSectionHoverProps, resolveTriggerLoad, getSectionHeadingAnim } from '@/lib/section-animation';
import { PreviewScrollRootProvider, useInViewViewport } from './preview-motion';
import { APP_NAME } from '@/lib/brand';
import { getAboutLayoutPreview, normalizeAboutLayout } from '@/lib/about-layouts';
import { getFooterNavItems } from '@/lib/footer-nav';
import type { FooterConfig, FooterNavLayout } from '@/lib/types';

interface Props {
  portfolio: Portfolio;
  deviceView?: 'desktop' | 'tablet' | 'mobile';
  activeSectionId?: string | null;
  onSectionSelect?: (sectionId: string) => void;
}

function getThemeStyles(theme: ThemeConfig): React.CSSProperties {
  const radii: Record<string, string> = { none: '0', sm: '4px', md: '8px', lg: '16px', full: '9999px' };
  const spacing: Record<string, string> = { compact: '3rem', normal: '5rem', relaxed: '8rem' };
  return {
    '--primary': theme.primaryColor,
    '--secondary': theme.secondaryColor,
    '--accent': theme.accentColor,
    '--bg': theme.backgroundColor,
    '--text': theme.textColor,
    '--radius': radii[theme.borderRadius],
    '--spacing': spacing[theme.spacing],
    fontFamily: `'${theme.fontFamily}', sans-serif`,
    background: theme.backgroundColor,
    color: theme.textColor,
  } as React.CSSProperties;
}

// ── Social bar ───────────────────────────────────────────────────────────────
const SOCIAL_LABELS: Record<string, string> = {
  github: 'GH', linkedin: 'in', twitter: 'X', instagram: 'IG',
  youtube: 'YT', dribbble: 'Dr', behance: 'Be', website: '🌐',
};

function SocialBar({ social, color, compact }: { social: SocialLinks; color: string; compact?: boolean }) {
  const links = Object.entries(social).filter(([, v]) => v);
  if (!links.length) return null;
  return (
    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: compact ? 0 : '1.5rem' }}>
      {links.map(([key, url]) => (
        <a key={key} href={url as string} target="_blank" rel="noopener noreferrer"
          style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: 8, border: `1px solid ${color}55`, color, fontSize: '0.7rem', fontWeight: 700, textDecoration: 'none', transition: 'all 0.2s', background: 'transparent' }}
          onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = color; el.style.color = '#fff'; el.style.borderColor = color; }}
          onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'transparent'; el.style.color = color; el.style.borderColor = `${color}55`; }}>
          {SOCIAL_LABELS[key] || key.slice(0, 2).toUpperCase()}
        </a>
      ))}
    </div>
  );
}

// ── Popup — rendered via portal so fixed positioning always works ─────────────
function LandingPopup({ popup, theme }: { popup: PopupConfig; theme: ThemeConfig }) {
  const popupPreviewNonce = useBuilderStore(s => s.popupPreviewNonce);
  const [visible, setVisible] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!popupPreviewNonce) return;
    setPreviewMode(true);
    setVisible(true);
  }, [popupPreviewNonce]);

  useEffect(() => {
    if (previewMode) return;
    if (!popup.enabled) return;
    const storageKey = `popup_${popup.title}`;
    if (popup.showOnce) {
      try { if (sessionStorage.getItem(storageKey)) return; } catch {}
    }
    const t = setTimeout(() => setVisible(true), Math.max(0, (popup.delay ?? 2)) * 1000);
    return () => clearTimeout(t);
  }, [popup.enabled, popup.delay, popup.showOnce, popup.title, previewMode]);

  const dismiss = () => {
    setVisible(false);
    setPreviewMode(false);
    if (!previewMode && popup.showOnce) {
      try { sessionStorage.setItem(`popup_${popup.title}`, '1'); } catch {}
    }
  };

  if (!mounted || !visible) return null;

  const modal = (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="popup-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
          onClick={e => { if (e.target === e.currentTarget) dismiss(); }}
        >
          <motion.div
            key={`popup-card-${popupPreviewNonce || 'live'}`}
            initial={{ scale: 0.88, opacity: 0, y: 24 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.88, opacity: 0, y: 24 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            style={{ maxWidth: 460, width: '100%' }}
          >
            <PopupCard popup={popup} theme={theme} onDismiss={dismiss} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return createPortal(modal, document.body);
}

// ── Slideshow ────────────────────────────────────────────────────────────────
function Slideshow({ images, height = 480, theme }: { images: string[]; height?: number; theme: ThemeConfig }) {
  const [idx, setIdx] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (images.length <= 1) return;
    timer.current = setInterval(() => setIdx(i => (i + 1) % images.length), 4500);
    return () => { if (timer.current) clearInterval(timer.current); };
  }, [images.length]);

  if (!images.length) return (
    <div style={{ height, background: `${theme.primaryColor}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.primaryColor, opacity: 0.5, fontSize: '0.9rem' }}>
      No images — add some in the Hero section editor
    </div>
  );

  return (
    <div style={{ position: 'relative', height, overflow: 'hidden' }}>
      <AnimatePresence mode="wait">
        <motion.img key={idx} src={images[idx]} alt=""
          initial={{ opacity: 0, scale: 1.05 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.7 }}
          style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} />
      </AnimatePresence>
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 30%, rgba(0,0,0,0.65))' }} />
      {images.length > 1 && (
        <>
          {[{ dir: -1, side: 'left', Icon: ChevronLeft }, { dir: 1, side: 'right', Icon: ChevronRight }].map(({ dir, side, Icon }) => (
            <button key={side} onClick={() => setIdx(i => (i + dir + images.length) % images.length)}
              style={{ position: 'absolute', [side]: 14, top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.55)', border: 'none', borderRadius: '50%', width: 40, height: 40, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', zIndex: 2 }}>
              <Icon size={20} />
            </button>
          ))}
          <div style={{ position: 'absolute', bottom: 14, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 7, zIndex: 2 }}>
            {images.map((_, i) => (
              <button key={i} onClick={() => setIdx(i)}
                style={{ width: i === idx ? 22 : 8, height: 8, borderRadius: 4, background: i === idx ? theme.primaryColor : 'rgba(255,255,255,0.45)', border: 'none', cursor: 'pointer', transition: 'all 0.35s', padding: 0 }} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

const NAVBAR_SCROLL_OFFSET = 80;

function getPreviewScrollRoot(): HTMLElement | null {
  return document.querySelector('[data-preview-scroll-root]') as HTMLElement | null;
}

function getNavbarScrollTarget(): HTMLElement | Window {
  const previewRoot = getPreviewScrollRoot();
  if (previewRoot) return previewRoot;
  const top = document.getElementById('portfolio-top');
  if (!top) return window;
  let el: HTMLElement | null = top.parentElement;
  while (el) {
    const s = getComputedStyle(el);
    if (/auto|scroll/.test(s.overflowY) && el.scrollHeight > el.clientHeight + 2) return el;
    el = el.parentElement;
  }
  return window;
}

function scrollToPreviewSection(sectionId: string, offset = NAVBAR_SCROLL_OFFSET) {
  const id = sectionId.replace(/^#/, '');
  const target = document.getElementById(id);
  if (!target) return;
  const root = getPreviewScrollRoot();
  if (root) {
    const rootRect = root.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    root.scrollTo({
      top: Math.max(0, root.scrollTop + (targetRect.top - rootRect.top) - offset),
      behavior: 'smooth',
    });
    return;
  }
  const y = target.getBoundingClientRect().top + window.scrollY - offset;
  window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
}

function resolveSectionId(href: string, sections: PortfolioSection[]): string {
  const id = href.replace(/^#/, '');
  if (sections.some(s => s.id === id)) return id;
  if (id === 'contact') {
    const contact = sections.find(s => s.type === 'contact');
    if (contact) return contact.id;
  }
  return id;
}

function goToPreviewSection(sectionId: string, onSectionSelect?: (id: string) => void) {
  scrollToPreviewSection(sectionId);
  onSectionSelect?.(sectionId);
}

// ── Navbar scroll hook ───────────────────────────────────────────────────────
function useNavbarScroll(threshold = 40) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const scrollTarget = getNavbarScrollTarget();
    const onScroll = () => {
      const y = scrollTarget instanceof Window ? window.scrollY : scrollTarget.scrollTop;
      setScrolled(y > threshold);
    };
    onScroll();
    scrollTarget.addEventListener('scroll', onScroll, { passive: true });
    return () => scrollTarget.removeEventListener('scroll', onScroll);
  }, [threshold]);
  return scrolled;
}

function getNavbarScrollTransition(animation: NavbarScrollAnimation) {
  switch (animation) {
    case 'fade': return { duration: 0.35, ease: 'easeOut' as const };
    case 'slide': return { duration: 0.42, ease: [0.22, 1, 0.36, 1] as const };
    case 'scale': return { duration: 0.38, ease: 'easeOut' as const };
    case 'spring': return { type: 'spring' as const, stiffness: 300, damping: 30 };
    default: return { duration: 0.35, ease: 'easeInOut' as const };
  }
}

function getNavbarMotionState(
  animation: NavbarScrollAnimation,
  isFloating: boolean,
  scrolled: boolean,
  hasScrollEffect: boolean,
) {
  const base = {
    marginTop: isFloating ? 10 : 0,
    width: isFloating ? 'calc(100% - 2rem)' : '100%',
    maxWidth: isFloating ? 1180 : '100%',
    marginLeft: isFloating ? 'auto' : 0,
    marginRight: isFloating ? 'auto' : 0,
  };
  if (!hasScrollEffect) return { ...base, opacity: 1, scale: 1 };
  switch (animation) {
    case 'fade':
      return { ...base, opacity: scrolled ? 1 : 0.94, scale: 1 };
    case 'slide':
      return { ...base, opacity: 1, marginTop: isFloating ? 12 : 0, scale: 1 };
    case 'scale':
      return { ...base, opacity: 1, scale: isFloating ? 1 : 0.97 };
    case 'spring':
      return { ...base, opacity: 1, marginTop: isFloating ? 14 : 0, scale: isFloating ? 1 : 0.98 };
    default:
      return { ...base, opacity: 1, scale: 1 };
  }
}

function handleHashNavClick(
  e: React.MouseEvent<HTMLAnchorElement>,
  href: string,
  sections?: PortfolioSection[],
  onSectionSelect?: (id: string) => void,
) {
  if (!href.startsWith('#')) return;
  e.preventDefault();
  const raw = href.slice(1);
  if (raw === 'portfolio-top') {
    scrollPreviewToTop();
    return;
  }
  const id = sections ? resolveSectionId(href, sections) : raw;
  goToPreviewSection(id, onSectionSelect);
}

function getNavBg(navbar: NavbarConfig, theme: ThemeConfig, scrolled: boolean): React.CSSProperties {
  // Custom bg color override takes priority
  if (navbar.bgColor) return { background: navbar.bgColor, backdropFilter: 'blur(16px)' };
  switch (navbar.style) {
    case 'solid':
      return { background: theme.backgroundColor };
    case 'gradient':
      return { background: `linear-gradient(135deg, ${theme.backgroundColor}f5, ${theme.primaryColor}18)` };
    case 'transparent':
      return { background: scrolled ? `${theme.backgroundColor}e8` : 'transparent', backdropFilter: scrolled ? 'blur(16px)' : 'none' };
    default:
      return { background: `${theme.backgroundColor}${scrolled ? 'ee' : 'cc'}`, backdropFilter: 'blur(16px)' };
  }
}

// ── CTA button with custom styles ─────────────────────────────────────────────
function NavCtaButton({ navbar, theme, radius, sections, onSectionSelect }: {
  navbar: NavbarConfig; theme: ThemeConfig; radius: string;
  sections: PortfolioSection[]; onSectionSelect?: (id: string) => void;
}) {
  const ctaStyle = navbar.ctaStyle ?? 'filled';
  const bg = navbar.ctaBgColor || theme.primaryColor;
  const txt = navbar.ctaTextColor || '#fff';
  const br = navbar.ctaBorderRadius != null ? `${navbar.ctaBorderRadius}px` : radius;

  const styleMap: Record<string, React.CSSProperties> = {
    filled: {
      background: `linear-gradient(135deg, ${bg}, ${theme.secondaryColor})`,
      color: txt, border: 'none',
      boxShadow: `0 4px 16px ${bg}35`,
    },
    outline: {
      background: 'transparent', color: bg,
      border: `2px solid ${bg}`,
    },
    ghost: {
      background: `${bg}15`, color: bg, border: 'none',
    },
    pill: {
      background: `linear-gradient(135deg, ${bg}, ${theme.secondaryColor})`,
      color: txt, border: 'none', borderRadius: '9999px',
      boxShadow: `0 4px 16px ${bg}35`,
    },
  };

  return (
    <a href={navbar.ctaLink || '#contact'}
      onClick={e => handleHashNavClick(e, navbar.ctaLink || '#contact', sections, onSectionSelect)}
      style={{
        padding: '0.5rem 1.15rem', borderRadius: ctaStyle === 'pill' ? '9999px' : br,
        fontSize: '0.82rem', fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap',
        transition: 'transform 0.15s, opacity 0.15s', display: 'inline-block',
        ...styleMap[ctaStyle],
      }}
      onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-1px)')}
      onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}>
      {navbar.ctaText}
    </a>
  );
}

function NavBrand({ name, tagline, logo, showLogo, showTagline, theme, radius, compact, truncate, logoSize, logoBlend }: {
  name: string; tagline: string; logo: string; showLogo: boolean; showTagline: boolean;
  theme: ThemeConfig; radius: string; compact?: boolean; truncate?: boolean; logoSize?: number;
  logoBlend?: 'normal' | 'multiply' | 'screen' | 'lighten' | 'darken';
}) {
  const initial = name.charAt(0).toUpperCase();
  const size = logoSize ?? (compact ? 32 : 38);
  const blend = (logoBlend ?? 'multiply') as React.CSSProperties['mixBlendMode'];
  return (
    <a href="#portfolio-top" onClick={e => { e.preventDefault(); scrollPreviewToTop(); }}
      style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', textDecoration: 'none', color: 'inherit', flexShrink: truncate ? 1 : 0, minWidth: truncate ? 0 : undefined, overflow: truncate ? 'hidden' : undefined }}>
      {showLogo && (
        logo ? (
          <img src={logo} alt={name} style={{
            width: size, height: size,
            objectFit: 'contain',
            background: 'transparent',
            display: 'block',
            flexShrink: 0,
            mixBlendMode: blend,
          }} />
        ) : (
          <div style={{
            width: size, height: size, borderRadius: radius, flexShrink: 0,
            background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, fontSize: compact ? '0.9rem' : '1rem', color: '#fff',
            boxShadow: `0 4px 14px ${theme.primaryColor}40`,
          }}>{initial}</div>
        )
      )}
      <div style={{ minWidth: 0, overflow: truncate ? 'hidden' : undefined }}>
        <p style={{
          fontWeight: 800, fontSize: compact ? '0.95rem' : '1.05rem', color: theme.primaryColor, lineHeight: 1.2,
          whiteSpace: 'nowrap', overflow: truncate ? 'hidden' : undefined, textOverflow: truncate ? 'ellipsis' : undefined,
        }}>{name}</p>
        {showTagline && tagline && !truncate && <p style={{ opacity: 0.5, fontSize: '0.68rem', marginTop: 2, whiteSpace: 'nowrap' }}>{tagline}</p>}
      </div>
    </a>
  );
}

function getNavLinkStyle(
  linkStyle: NavbarConfig['linkStyle'], theme: ThemeConfig, hover: boolean, paddingX: number,
): React.CSSProperties {
  const padY = linkStyle === 'pill' ? 8 : 9;
  const shared: React.CSSProperties = {
    textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500,
    transition: 'all 0.2s ease', whiteSpace: 'nowrap', display: 'inline-flex',
    alignItems: 'center', justifyContent: 'center', lineHeight: 1.3,
    padding: `${padY}px ${paddingX}px`,
  };
  if (linkStyle === 'pill') {
    return {
      ...shared,
      borderRadius: '8px',
      background: hover ? `${theme.primaryColor}22` : `${theme.primaryColor}08`,
      color: hover ? theme.primaryColor : theme.textColor,
      border: `1px solid ${hover ? theme.primaryColor + '44' : theme.primaryColor + '18'}`,
    };
  }
  if (linkStyle === 'underline') {
    return {
      ...shared,
      color: hover ? theme.primaryColor : theme.textColor,
      borderBottom: `2px solid ${hover ? theme.primaryColor : 'transparent'}`,
      opacity: hover ? 1 : 0.8,
    };
  }
  return {
    ...shared,
    color: hover ? theme.primaryColor : theme.textColor,
    opacity: hover ? 1 : 0.78,
    letterSpacing: '0.02em',
  };
}

function NavLinks({ sections, navbar, theme, linkStyle, linkGap, linkPaddingX, horizontal, onSectionSelect }: {
  sections: PortfolioSection[]; navbar: NavbarConfig; theme: ThemeConfig; linkStyle: NavbarConfig['linkStyle'];
  linkGap: number; linkPaddingX: number; horizontal?: boolean;
  onSectionSelect?: (id: string) => void;
}) {
  const [hovered, setHovered] = useState<string | null>(null);
  const gap = linkGap ?? 14;
  const hidden = new Set(navbar.hiddenSections ?? []);
  const labels = navbar.customLabels ?? {};
  const fontSize = navbar.linkFontSize;
  const fontWeight = navbar.linkFontWeight;
  const textColor = navbar.textColor;

  const visibleSections = sections.filter(s => !hidden.has(s.id));

  return (
    <nav aria-label="Section navigation" style={{
      display: 'flex', flexDirection: horizontal ? 'row' : 'column',
      gap: horizontal ? `${gap}px` : `${Math.max(6, Math.round(gap * 0.4))}px`,
      alignItems: horizontal ? 'center' : 'stretch',
      flexWrap: horizontal ? 'wrap' : 'nowrap',
      justifyContent: horizontal ? 'center' : 'flex-start',
      rowGap: horizontal ? '0.5rem' : undefined,
    }}>
      {visibleSections.map(s => {
        const baseStyle = getNavLinkStyle(linkStyle, theme, hovered === s.id, linkPaddingX ?? 10);
        return (
          <a key={s.id} href={`#${s.id}`}
            style={{
              ...baseStyle,
              ...(fontSize ? { fontSize: `${fontSize}px` } : {}),
              ...(fontWeight ? { fontWeight } : {}),
              ...(textColor && hovered !== s.id ? { color: textColor } : {}),
            }}
            onClick={e => { e.preventDefault(); goToPreviewSection(s.id, onSectionSelect); }}
            onMouseEnter={() => setHovered(s.id)}
            onMouseLeave={() => setHovered(null)}>
            {labels[s.id] || s.title}
          </a>
        );
      })}
    </nav>
  );
}

function NavSocialMini({ social, theme }: { social: SocialLinks; theme: ThemeConfig }) {
  const links = Object.entries(social).filter(([, v]) => v);
  if (!links.length) return null;
  return (
    <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
      {links.slice(0, 4).map(([key, url]) => (
        <a key={key} href={url as string} target="_blank" rel="noopener noreferrer"
          style={{
            width: 30, height: 30, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: `1px solid ${theme.primaryColor}33`, color: theme.primaryColor, fontSize: '0.62rem', fontWeight: 800,
            textDecoration: 'none', transition: 'all 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = theme.primaryColor; e.currentTarget.style.color = '#fff'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = theme.primaryColor; }}>
          {SOCIAL_LABELS[key] || key.slice(0, 2).toUpperCase()}
        </a>
      ))}
    </div>
  );
}

function PortfolioNavbar({ portfolio, sections, theme, social, navbar, isMobile, isNarrow, onSectionSelect }: {
  portfolio: Portfolio; sections: PortfolioSection[]; theme: ThemeConfig;
  social: SocialLinks; navbar: NavbarConfig; isMobile: boolean; isNarrow: boolean;
  onSectionSelect?: (id: string) => void;
}) {
  const scrollBehavior = navbar.scrollBehavior ?? 'none';
  const scrollAnimation = navbar.scrollAnimation ?? 'smooth';
  const hasScrollEffect = !isMobile && scrollBehavior !== 'none';
  const scrolled = useNavbarScroll(hasScrollEffect ? 40 : 10);
  const radii: Record<string, string> = { none: '0', sm: '4px', md: '8px', lg: '16px', full: '9999px' };
  const radius = radii[theme.borderRadius] || '8px';
  const brandName = navbar.brandName || portfolio.name;
  const isCentered = navbar.layout === 'centered';
  const isMinimal = navbar.layout === 'minimal';
  const baseNavHeight = isMinimal ? 52 : isCentered ? 72 : 64;
  const desktopMenu = navbar.desktopMenu ?? 'links';
  const alwaysFloating = !isMobile && desktopMenu === 'floating';
  const scrollFloating = hasScrollEffect && scrollBehavior === 'float-on-scroll' && scrolled;
  const isFloating = alwaysFloating || scrollFloating;
  const isCompact = hasScrollEffect && scrollBehavior === 'compact-on-scroll' && scrolled;
  const useDesktopMenuBtn = !isMobile && desktopMenu === 'menu';
  const showInlineLinks = !isMobile && (desktopMenu === 'links' || desktopMenu === 'floating');
  const navHeight = isCompact ? Math.max(46, baseNavHeight - 14) : baseNavHeight;
  const motionState = getNavbarMotionState(scrollAnimation, isFloating, scrolled, hasScrollEffect);

  const borderCol = navbar.borderColor || theme.primaryColor;
  const navInnerStyle: React.CSSProperties = {
    ...getNavBg(navbar, theme, scrolled || isFloating),
    borderBottom: isFloating ? 'none' : scrolled ? `1px solid ${borderCol}28` : `1px solid ${borderCol}15`,
    borderRadius: isFloating ? radius : 0,
    border: isFloating ? `1px solid ${borderCol}28` : undefined,
    boxShadow: isFloating
      ? `0 10px 40px ${borderCol}18`
      : scrolled ? `0 4px 24px ${borderCol}12` : 'none',
    ...(navbar.textColor ? { color: navbar.textColor } : {}),
  };

  return (
    <nav style={{
      position: navbar.sticky ? 'sticky' : 'relative',
      top: 0,
      zIndex: 50,
      width: '100%',
    }}>
      <motion.div
        animate={motionState}
        transition={getNavbarScrollTransition(scrollAnimation)}
        style={navInnerStyle}
      >
      <div style={{
        maxWidth: isFloating ? '100%' : 1200, margin: '0 auto', padding: isNarrow ? '0 1rem' : '0 1.5rem',
        display: 'flex', flexDirection: isCentered && !isMobile ? 'column' : 'row',
        alignItems: 'center', justifyContent: 'space-between',
        minHeight: navHeight,
        transition: 'min-height 0.35s ease',
        gap: isCentered && !isMobile ? '0.65rem' : !isMobile ? `${Math.max(8, Math.round((navbar.linkGap ?? 14) * 0.6))}px` : '0.65rem',
        position: 'relative',
        width: '100%',
      }}>
        {/* Brand */}
        <div style={{
          display: 'flex', alignItems: 'center',
          flex: isMobile ? 1 : undefined,
          flexShrink: isMobile ? 1 : 0,
          minWidth: isMobile ? 0 : undefined,
          width: isCentered && !isMobile ? '100%' : 'auto',
          justifyContent: isCentered && !isMobile ? 'center' : 'flex-start',
          marginRight: !isMobile && !isCentered ? '0.5rem' : 0,
          overflow: isMobile ? 'hidden' : undefined,
        }}>
          <NavBrand name={brandName} tagline={navbar.tagline} logo={navbar.logoImage}
            showLogo={navbar.showLogo} showTagline={navbar.showTagline && !isMinimal && !isNarrow && !isCompact} theme={theme} radius={radius}
            compact={isMinimal || isNarrow || isCompact} truncate={isNarrow} logoSize={navbar.logoSize} logoBlend={navbar.logoBlend} />
        </div>

        {/* Desktop links + actions */}
        {showInlineLinks && (
          <>
            {!isCentered && (
              <div style={{ flex: 1, display: 'flex', justifyContent: 'center', padding: '0 1.5rem', minWidth: 0 }}>
                <NavLinks sections={sections} navbar={navbar} theme={theme} linkStyle={navbar.linkStyle}
                  linkGap={navbar.linkGap ?? 14} linkPaddingX={navbar.linkPaddingX ?? 10} horizontal onSectionSelect={onSectionSelect} />
              </div>
            )}
            {isCentered && (
              <div style={{ width: '100%', display: 'flex', justifyContent: 'center', padding: '0.25rem 1rem 0.5rem' }}>
                <NavLinks sections={sections} navbar={navbar} theme={theme} linkStyle={navbar.linkStyle}
                  linkGap={navbar.linkGap ?? 14} linkPaddingX={navbar.linkPaddingX ?? 10} horizontal onSectionSelect={onSectionSelect} />
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexShrink: 0, marginLeft: !isCentered ? '0.5rem' : 0,
              ...(isCentered ? { position: 'absolute', right: '1.5rem', top: '50%', transform: 'translateY(-50%)' } : {}) }}>
              {navbar.showSocial && <NavSocialMini social={social} theme={theme} />}
              {navbar.showCta && navbar.ctaText && (
                <NavCtaButton navbar={navbar} theme={theme} radius={radius} sections={sections} onSectionSelect={onSectionSelect} />
              )}
            </div>
          </>
        )}

        {useDesktopMenuBtn && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.65rem', flexShrink: 0,
            ...(isCentered ? { position: 'absolute', right: '1.5rem', top: '50%', transform: 'translateY(-50%)', zIndex: 2 } : {}),
          }}>
            {navbar.showSocial && <NavSocialMini social={social} theme={theme} />}
            {navbar.showCta && navbar.ctaText && (
              <NavCtaButton navbar={navbar} theme={theme} radius={radius} sections={sections} onSectionSelect={onSectionSelect} />
            )}
            <SiteNavMenu sections={sections} name={brandName} theme={theme} navbar={navbar} social={social} radius={radius}
              menuStyle={navbar.desktopMenuStyle ?? 'drawer-right'} menuIcon={navbar.menuIcon ?? 'dots'} onSectionSelect={onSectionSelect} />
          </div>
        )}

        {isMobile && (
          <SiteNavMenu sections={sections} name={brandName} theme={theme} navbar={navbar} social={social} radius={radius}
            menuStyle={navbar.mobileMenu ?? 'drawer-right'} menuIcon={navbar.menuIcon ?? 'dots'} onSectionSelect={onSectionSelect} />
        )}
      </div>
      </motion.div>
    </nav>
  );
}

const SECTION_MENU_ICONS: Record<string, string> = {
  hero: '🏠', about: '👤', skills: '⚡', experience: '💼', projects: '🚀',
  gallery: '🖼️', testimonials: '💬', contact: '📧', videos: '🎬',
  services: '🛠️', team: '👥', stats: '📊', social: '🔗',
  pricing: '💰', faq: '❓', blog: '📝', custom: '✏️',
};

type MenuClipRect = { top: number; left: number; width: number; height: number };

function getMenuClipRect(): MenuClipRect {
  const previewScroll = document.querySelector('[data-preview-scroll-root]') as HTMLElement | null;
  if (previewScroll) {
    const r = previewScroll.getBoundingClientRect();
    return { top: r.top, left: r.left, width: r.width, height: r.height };
  }
  return { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight };
}

function setScrollLock(locked: boolean) {
  const previewScroll = document.querySelector('[data-preview-scroll-root]') as HTMLElement | null;
  const portfolioTop = document.getElementById('portfolio-top');
  const embedded = Boolean(previewScroll);
  const targets = embedded
    ? [previewScroll, portfolioTop].filter(Boolean) as HTMLElement[]
    : [portfolioTop, document.body, document.documentElement].filter(Boolean) as HTMLElement[];

  targets.forEach(el => {
    if (locked) {
      if (!el.dataset.prevOverflow) el.dataset.prevOverflow = el.style.overflow;
      el.style.overflow = 'hidden';
    } else {
      el.style.overflow = el.dataset.prevOverflow || '';
      delete el.dataset.prevOverflow;
    }
  });
}

function getMenuPanelMotion(menuStyle: NavbarMenuStyle) {
  switch (menuStyle) {
    case 'drawer-left':
      return { initial: { x: '-100%' }, animate: { x: 0 }, exit: { x: '-100%' } };
    case 'fullscreen':
      return { initial: { opacity: 0, scale: 0.96 }, animate: { opacity: 1, scale: 1 }, exit: { opacity: 0, scale: 0.96 } };
    case 'bottom-popup':
      return { initial: { y: '100%' }, animate: { y: 0 }, exit: { y: '100%' } };
    default:
      return { initial: { x: '100%' }, animate: { x: 0 }, exit: { x: '100%' } };
  }
}

function getMenuPanelStyle(menuStyle: NavbarMenuStyle, clip: MenuClipRect, bgColor: string): React.CSSProperties {
  const drawerWidth = Math.min(clip.width * 0.82, 280);
  const base: React.CSSProperties = {
    position: 'absolute',
    display: 'flex',
    flexDirection: 'column',
    background: bgColor,
    overflow: 'hidden',
  };
  switch (menuStyle) {
    case 'drawer-left':
      return { ...base, top: 0, left: 0, height: '100%', width: drawerWidth, boxShadow: '12px 0 40px rgba(0,0,0,0.35)' };
    case 'fullscreen':
      return { ...base, inset: 0, boxShadow: 'none' };
    case 'bottom-popup':
      return {
        ...base, bottom: 0, left: 0, right: 0, width: '100%',
        maxHeight: '88%', borderTopLeftRadius: 16, borderTopRightRadius: 16,
        boxShadow: '0 -12px 40px rgba(0,0,0,0.35)',
      };
    default:
      return { ...base, top: 0, right: 0, height: '100%', width: drawerWidth, boxShadow: '-12px 0 40px rgba(0,0,0,0.35)' };
  }
}

// ── Site nav menu (mobile + desktop menu button) ─────────────────────────────
function SiteNavMenu({ sections, name, theme, navbar, social, radius, menuStyle, menuIcon, onSectionSelect }: {
  sections: PortfolioSection[]; name: string; theme: ThemeConfig;
  navbar: NavbarConfig; social: SocialLinks; radius: string;
  menuStyle: NavbarMenuStyle; menuIcon: NavbarMenuIcon;
  onSectionSelect?: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [clip, setClip] = useState<MenuClipRect | null>(null);
  const initial = name.charAt(0).toUpperCase();
  const panelMotion = getMenuPanelMotion(menuStyle);

  const toggleMenu = () => {
    setOpen(v => {
      const next = !v;
      setClip(next ? getMenuClipRect() : null);
      return next;
    });
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    if (open) window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    setScrollLock(true);
    return () => setScrollLock(false);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const update = () => setClip(getMenuClipRect());
    update();
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    const previewScroll = document.querySelector('[data-preview-scroll-root]');
    previewScroll?.addEventListener('scroll', update);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
      previewScroll?.removeEventListener('scroll', update);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const blockScroll = (e: TouchEvent) => {
      const layer = document.getElementById('site-nav-layer');
      const drawer = document.getElementById('site-nav-drawer-scroll');
      if (layer?.contains(e.target as Node) && drawer?.contains(e.target as Node)) return;
      if (layer?.contains(e.target as Node)) e.preventDefault();
    };
    document.addEventListener('touchmove', blockScroll, { passive: false });
    return () => document.removeEventListener('touchmove', blockScroll);
  }, [open]);

  const close = () => setOpen(false);
  const MenuIcon = menuIcon === 'hamburger' ? Menu : MoreVertical;

  const menuOverlay = clip && open ? createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          key="site-nav-layer"
          id="site-nav-layer"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          style={{
            position: 'fixed',
            top: clip.top,
            left: clip.left,
            width: clip.width,
            height: clip.height,
            zIndex: 9998,
            overflow: 'hidden',
            touchAction: 'none',
          }}
        >
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={close}
            style={{
              position: 'absolute', inset: 0,
              background: menuStyle === 'fullscreen' ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.55)',
              backdropFilter: 'blur(5px)',
            }}
          />
          <motion.div
            key="site-nav-drawer"
            id="site-nav-drawer"
            initial={panelMotion.initial}
            animate={panelMotion.animate}
            exit={panelMotion.exit}
            transition={menuStyle === 'fullscreen' ? { duration: 0.22 } : { type: 'spring', stiffness: 320, damping: 32 }}
            style={getMenuPanelStyle(menuStyle, clip, theme.backgroundColor)}
          >
            <div style={{
              position: 'relative', padding: '1rem 0.9rem',
              background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor})`,
              color: '#fff', flexShrink: 0,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', minWidth: 0, flex: 1 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: radius, flexShrink: 0,
                    background: 'rgba(255,255,255,0.22)', border: '1.5px solid rgba(255,255,255,0.35)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 800, fontSize: '0.95rem',
                  }}>{initial}</div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontWeight: 800, fontSize: '0.92rem', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</p>
                    <p style={{ fontSize: '0.65rem', opacity: 0.85, marginTop: 2, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Menu</p>
                  </div>
                </div>
                <button type="button" onClick={close} aria-label="Close menu"
                  style={{
                    width: 32, height: 32, borderRadius: '50%', flexShrink: 0, marginLeft: 6,
                    background: 'rgba(255,255,255,0.2)', border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
                  }}>
                  <X size={15} />
                </button>
              </div>
            </div>

            <div
              id="site-nav-drawer-scroll"
              style={{
                flex: 1, minHeight: 0, overflowY: 'auto', overflowX: 'hidden',
                padding: '0.75rem 0.65rem', overscrollBehavior: 'contain',
                WebkitOverflowScrolling: 'touch', touchAction: 'pan-y',
              }}
            >
              {sections.filter(s => !(navbar.hiddenSections ?? []).includes(s.id)).map((s, i) => {
                const icon = SECTION_MENU_ICONS[s.type] || '📄';
                const label = (navbar.customLabels ?? {})[s.id] || s.title;
                return (
                  <motion.a
                    key={s.id}
                    href={`#${s.id}`}
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 + 0.04 }}
                    onClick={e => { e.preventDefault(); close(); goToPreviewSection(s.id, onSectionSelect); }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.65rem',
                      padding: '0.7rem 0.75rem', borderRadius: 10, marginBottom: 6,
                      textDecoration: 'none', color: theme.textColor,
                      background: `${theme.primaryColor}08`,
                      border: `1px solid ${theme.primaryColor}18`,
                    }}
                  >
                    <span style={{
                      width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                      background: `${theme.primaryColor}18`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem',
                    }}>{icon}</span>
                    <span style={{ flex: 1, fontWeight: 600, fontSize: '0.82rem', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>
                    <span style={{ color: theme.primaryColor, opacity: 0.6, fontSize: '0.75rem' }}>›</span>
                  </motion.a>
                );
              })}
            </div>

            {navbar.showCta && navbar.ctaText && (
              <div style={{ flexShrink: 0, padding: '0.75rem 0.65rem 0.9rem', borderTop: `1px solid ${theme.primaryColor}15` }}>
                <a href={navbar.ctaLink || '#contact'} onClick={e => { handleHashNavClick(e, navbar.ctaLink || '#contact', sections, onSectionSelect); close(); }}
                  style={{
                    display: 'block', textAlign: 'center', padding: '0.75rem', borderRadius: radius,
                    background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor})`,
                    color: '#fff', textDecoration: 'none', fontWeight: 700, fontSize: '0.82rem',
                  }}>
                  {navbar.ctaText}
                </a>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  ) : null;

  return (
    <>
      <button
        type="button"
        onClick={toggleMenu}
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
        style={{
          flexShrink: 0,
          width: 40,
          height: 40,
          borderRadius: 11,
          border: `1px solid ${open ? theme.primaryColor : `${theme.primaryColor}40`}`,
          background: open
            ? `linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor})`
            : `linear-gradient(135deg, ${theme.primaryColor}18, ${theme.secondaryColor}10)`,
          color: open ? '#fff' : theme.textColor,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s ease',
          boxShadow: open ? `0 4px 16px ${theme.primaryColor}45` : `0 2px 8px ${theme.primaryColor}15`,
          position: 'relative',
          zIndex: open ? 9999 : 51,
        }}
      >
        {open ? <X size={18} strokeWidth={2.5} /> : <MenuIcon size={20} strokeWidth={2.5} />}
      </button>
      {menuOverlay}
    </>
  );
}

// ── Main export ──────────────────────────────────────────────────────────────
export default function PortfolioPreview({ portfolio, deviceView = 'desktop', activeSectionId, onSectionSelect }: Props) {
  const { sections, theme, popup } = portfolio;
  const social = portfolio.social || {};
  const visibleSections = sections.filter(s => s.visible).sort((a, b) => a.order - b.order);

  const isNarrow = isNarrowDeviceView(deviceView);
  const isMobileNav = isMobileDeviceView(deviceView);

  const selectSection = (id: string) => {
    onSectionSelect?.(id);
  };

  return (
    <PreviewScrollRootProvider>
    <div id="portfolio-top" style={{ ...getThemeStyles(theme), overflowX: 'clip', width: '100%', maxWidth: '100%', position: 'relative' }} className="min-h-screen">
      <style>{`#portfolio-top section[id] { scroll-margin-top: ${NAVBAR_SCROLL_OFFSET}px; }`}</style>
      {theme.customCSS && <style dangerouslySetInnerHTML={{ __html: theme.customCSS }} />}
      {popup && <LandingPopup popup={popup} theme={theme} />}

      <PortfolioNavbar
        portfolio={portfolio}
        sections={visibleSections}
        theme={theme}
        social={social}
        navbar={portfolio.navbar || { brandName: '', tagline: '', logoImage: '', style: 'glass', layout: 'standard', showLogo: true, showTagline: false, showCta: true, ctaText: 'Contact Me', ctaLink: '#contact', showSocial: false, linkStyle: 'minimal', linkGap: 14, linkPaddingX: 10, sticky: true, desktopMenu: 'links', desktopMenuStyle: 'drawer-right', mobileMenu: 'drawer-right', menuIcon: 'dots', scrollBehavior: 'none', scrollAnimation: 'smooth' }}
        isMobile={isMobileNav}
        isNarrow={isNarrow}
        onSectionSelect={onSectionSelect ? selectSection : undefined}
      />

      {visibleSections.map((section, i) => (
        <div
          key={section.id}
          className={onSectionSelect ? 'relative cursor-pointer' : 'relative'}
          onClick={onSectionSelect ? (e) => {
            if ((e.target as HTMLElement).closest('a, button, input, textarea, select, label')) return;
            goToPreviewSection(section.id, onSectionSelect);
          } : undefined}
        >
          <SectionRenderer section={section} theme={theme} index={i} social={social} smtp={portfolio.smtp || { host: '', port: 587, secure: false, user: '', password: '', fromName: '', toEmail: '', provider: 'custom' }} isMobile={isNarrow} />
        </div>
      ))}

      <SiteFooter portfolio={portfolio} sections={visibleSections} theme={theme} social={social} isMobile={isNarrow} navbar={portfolio.navbar} />
    </div>
    </PreviewScrollRootProvider>
  );
}

const SOCIAL_NAMES: Record<string, string> = {
  github: 'GitHub', linkedin: 'LinkedIn', twitter: 'Twitter', instagram: 'Instagram',
  youtube: 'YouTube', dribbble: 'Dribbble', behance: 'Behance', website: 'Website',
};

const SOCIAL_ICONS: Record<string, string> = {
  github: '🐙', linkedin: '💼', twitter: '𝕏', instagram: '📸',
  youtube: '▶️', dribbble: '🏀', behance: '🎨', website: '🌐',
};

function scrollPreviewToTop() {
  const root = getPreviewScrollRoot();
  if (root) {
    root.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function sectionField(sections: PortfolioSection[], type: string, fieldId: string): string {
  const sec = sections.find(s => s.type === type);
  const f = sec?.fields.find(fl => fl.id === fieldId);
  return typeof f?.value === 'string' ? f.value : '';
}

function FooterHeading({ children, centered }: { children: React.ReactNode; centered?: boolean }) {
  return (
    <p style={{
      fontWeight: 700, fontSize: '0.75rem', letterSpacing: '0.12em', textTransform: 'uppercase',
      opacity: 0.4, marginBottom: '1.1rem', textAlign: centered ? 'center' : 'left',
    }}>
      {children}
    </p>
  );
}

function FooterSocial({ social, theme, radius, isMobile, fullWidth }: {
  social: SocialLinks; theme: ThemeConfig; radius: string; isMobile?: boolean; fullWidth?: boolean;
}) {
  const links = Object.entries(social).filter(([, v]) => v);
  if (!links.length) return null;

  const many = links.length >= 5;
  const cols = fullWidth
    ? (isMobile ? 4 : Math.min(8, links.length))
    : (isMobile ? 4 : many ? 4 : Math.min(2, links.length));

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
      gap: many ? '0.5rem' : '0.55rem',
      width: '100%',
      maxWidth: fullWidth ? (isMobile ? '100%' : 520) : '100%',
    }}>
      {links.map(([key, url]) => (
        <a
          key={key}
          href={url as string}
          target="_blank"
          rel="noopener noreferrer"
          title={SOCIAL_NAMES[key] || key}
          style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            gap: many ? 0 : '0.3rem', minWidth: 0, textAlign: 'center',
            padding: many ? '0.65rem 0.35rem' : '0.55rem 0.5rem',
            borderRadius: radius,
            border: `1px solid ${theme.primaryColor}33`,
            background: `${theme.primaryColor}10`,
            color: theme.textColor, textDecoration: 'none',
            fontSize: '0.72rem', fontWeight: 600, transition: 'all 0.2s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = theme.primaryColor;
            e.currentTarget.style.color = '#fff';
            e.currentTarget.style.borderColor = theme.primaryColor;
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = `${theme.primaryColor}10`;
            e.currentTarget.style.color = theme.textColor;
            e.currentTarget.style.borderColor = `${theme.primaryColor}33`;
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <span style={{ fontSize: many ? '1.05rem' : '0.95rem', lineHeight: 1 }}>
            {SOCIAL_ICONS[key] || SOCIAL_LABELS[key] || key.slice(0, 2).toUpperCase()}
          </span>
          {!many && (
            <span style={{
              fontSize: '0.62rem', opacity: 0.75, lineHeight: 1.2,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%',
            }}>
              {SOCIAL_NAMES[key] || key}
            </span>
          )}
        </a>
      ))}
    </div>
  );
}

function FooterContactRow({ icon, label, value, href, theme }: { icon: string; label: string; value: string; href?: string; theme: ThemeConfig }) {
  const inner = (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.7rem' }}>
      <span style={{ fontSize: '1rem', lineHeight: 1.4, flexShrink: 0 }}>{icon}</span>
      <div>
        <p style={{ fontSize: '0.68rem', opacity: 0.4, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>{label}</p>
        <p style={{ fontSize: '0.88rem', opacity: 0.82, lineHeight: 1.5, wordBreak: 'break-word' }}>{value}</p>
      </div>
    </div>
  );
  if (href) {
    return (
      <a href={href} style={{ color: 'inherit', textDecoration: 'none', display: 'block', transition: 'opacity 0.2s' }}
        onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
        onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
        {inner}
      </a>
    );
  }
  return inner;
}

const DEFAULT_FOOTER: FooterConfig = {
  enabled: true, layout: 'standard', style: 'gradient', showAccentBar: true, columnGap: 'normal',
  showCta: true, ctaTitle: 'Ready to work together?',
  ctaSubtitle: "Let's create something great. Reach out anytime.", ctaButtonText: 'Get In Touch',
  showBrand: true, showDescription: true, customDescription: '', showLiveBadge: true,
  showNavigation: true, navHeading: 'Navigation', navLayout: 'list', navMaxItems: 0,
  syncNavWithNavbar: true, hiddenNavSections: [], customNavLabels: {},
  showContact: true, contactHeading: 'Contact',
  showSocial: true, socialHeading: 'Follow Me', showCopyright: true, copyrightText: '',
  showBackToTop: true, showBuiltWith: true,
};

function footerBackground(footer: FooterConfig, theme: ThemeConfig): string {
  if (footer.bgColor) return footer.bgColor;
  const style = footer.style ?? 'gradient';
  if (style === 'solid') return theme.backgroundColor;
  if (style === 'minimal') return 'transparent';
  if (style === 'accent') return `${theme.primaryColor}14`;
  return `linear-gradient(180deg, ${theme.primaryColor}06 0%, ${theme.backgroundColor} 40%)`;
}

function FooterNavLinks({ items, theme, layout, textColor }: {
  items: { id: string; title: string; href: string }[];
  theme: ThemeConfig;
  layout: FooterNavLayout;
  textColor: string;
}) {
  const linkBase: React.CSSProperties = {
    color: textColor, textDecoration: 'none', fontSize: '0.88rem', transition: 'all 0.2s',
  };

  if (layout === 'inline') {
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
        {items.map(s => (
          <a key={s.id} href={s.href}
            style={{
              ...linkBase, opacity: 0.75, padding: '0.35rem 0.75rem', borderRadius: 999,
              border: `1px solid ${theme.primaryColor}28`, background: `${theme.primaryColor}08`,
            }}
            onMouseEnter={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.borderColor = theme.primaryColor; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = '0.75'; e.currentTarget.style.borderColor = `${theme.primaryColor}28`; }}>
            {s.title}
          </a>
        ))}
      </div>
    );
  }

  if (layout === 'columns') {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.45rem 1rem' }}>
        {items.map(s => (
          <a key={s.id} href={s.href}
            style={{ ...linkBase, opacity: 0.65, display: 'block' }}
            onMouseEnter={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.color = theme.primaryColor; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = '0.65'; e.currentTarget.style.color = textColor; }}>
            {s.title}
          </a>
        ))}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
      {items.map(s => (
        <a key={s.id} href={s.href}
          style={{ ...linkBase, display: 'inline-flex', alignItems: 'center', gap: '0.5rem', opacity: 0.65, width: 'fit-content' }}
          onMouseEnter={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.color = theme.primaryColor; e.currentTarget.style.paddingLeft = '4px'; }}
          onMouseLeave={e => { e.currentTarget.style.opacity = '0.65'; e.currentTarget.style.color = textColor; e.currentTarget.style.paddingLeft = '0'; }}>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: theme.primaryColor, opacity: 0.5, flexShrink: 0 }} />
          {s.title}
        </a>
      ))}
    </div>
  );
}

function SiteFooter({ portfolio, sections, theme, social, isMobile, navbar }: {
  portfolio: Portfolio; sections: PortfolioSection[]; theme: ThemeConfig; social: SocialLinks; isMobile: boolean;
  navbar?: NavbarConfig;
}) {
  const animVp = useInViewViewport();
  const footer = { ...DEFAULT_FOOTER, ...portfolio.footer };
  if (!footer.enabled) return null;

  const radii: Record<string, string> = { none: '0', sm: '4px', md: '8px', lg: '16px', full: '9999px' };
  const radius = radii[theme.borderRadius] || '8px';
  const layout = footer.layout ?? 'standard';
  const textColor = footer.textColor || theme.textColor;
  const borderColor = footer.borderColor || `${theme.primaryColor}20`;
  const gapMap = { compact: '1.5rem', normal: '2.5rem', wide: '3.5rem' };
  const columnGap = gapMap[footer.columnGap ?? 'normal'];
  const isMinimal = layout === 'minimal';
  const isCentered = layout === 'centered';

  const email = sectionField(sections, 'contact', 'email');
  const phone = sectionField(sections, 'contact', 'phone');
  const location = sectionField(sections, 'contact', 'location');
  const tagline = sectionField(sections, 'about', 'subtitle') || sectionField(sections, 'contact', 'subtitle');
  const contactSection = sections.find(s => s.type === 'contact');
  const contactId = contactSection?.id;
  const initial = portfolio.name.charAt(0).toUpperCase();
  const socialLinks = Object.entries(social).filter(([, v]) => v);
  const hasSocial = footer.showSocial && socialLinks.length > 0;
  const manySocial = hasSocial && socialLinks.length >= 5;
  const showSocialInGrid = hasSocial && !manySocial;
  const navItems = getFooterNavItems(sections, footer, navbar);
  const showNav = footer.showNavigation && navItems.length > 0;
  const description = footer.customDescription || portfolio.seo?.description || 'A professional portfolio showcasing creative work, skills, and expertise.';
  const hasContactInfo = Boolean(email || phone || location);
  const showBottomBar = footer.showCopyright || footer.showBackToTop || footer.showBuiltWith;

  const gridCols = (() => {
    const count = [footer.showBrand, showNav, footer.showContact, showSocialInGrid].filter(Boolean).length;
    if (isMobile || isMinimal || count <= 1) return '1fr';
    if (count === 2) return isCentered ? '1fr 1fr' : '1.5fr 1fr';
    if (count === 3) return isCentered ? '1fr 1fr 1fr' : '1.5fr 1fr 1fr';
    return isCentered ? '1fr 1fr 1fr 1fr' : '1.5fr 1fr 1fr 1.15fr';
  })();

  return (
    <footer style={{
      position: 'relative', marginTop: isMinimal ? '1rem' : '2rem', overflow: 'hidden',
      background: footerBackground(footer, theme),
      borderTop: isMinimal ? `1px solid ${borderColor}` : `1px solid ${borderColor}`,
      color: textColor,
    }}>
      {footer.showAccentBar !== false && !isMinimal && (
      <div style={{
        height: 3, background: `linear-gradient(90deg, ${theme.primaryColor}, ${theme.secondaryColor}, ${theme.accentColor}, ${theme.primaryColor})`,
        backgroundSize: '200% 100%',
      }} />
      )}

      {/* Subtle glow */}
      <div style={{
        position: 'absolute', top: -120, left: '50%', transform: 'translateX(-50%)',
        width: 500, height: 240, borderRadius: '50%',
        background: `radial-gradient(ellipse, ${theme.primaryColor}18 0%, transparent 70%)`,
        pointerEvents: 'none',
      }} />

      <div style={{
        maxWidth: 1200, margin: '0 auto', position: 'relative',
        padding: isMobile
          ? (isMinimal ? '1.5rem 1rem 0' : '2.5rem 1rem 0')
          : (isMinimal ? '2rem clamp(1rem, 5vw, 2rem) 0' : '4rem clamp(1rem, 5vw, 2.5rem) 0'),
        textAlign: isCentered ? 'center' : 'left',
      }}>
        {/* CTA strip */}
        {footer.showCta && !isMinimal && (
          <motion.div
            initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={animVp}
            style={{
              display: 'flex', flexDirection: isMobile ? 'column' : 'row',
              alignItems: isMobile ? 'flex-start' : 'center', justifyContent: 'space-between',
              gap: '1.25rem', padding: '1.5rem 1.75rem', borderRadius: radius, marginBottom: '3rem',
              background: `linear-gradient(135deg, ${theme.primaryColor}18, ${theme.secondaryColor}12)`,
              border: `1px solid ${theme.primaryColor}28`,
            }}
          >
            <div>
              <p style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: '0.3rem' }}>{footer.ctaTitle}</p>
              <p style={{ opacity: 0.55, fontSize: '0.88rem' }}>{footer.ctaSubtitle}</p>
            </div>
            {contactId && (
              <a href={`#${contactId}`}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0,
                  padding: '0.75rem 1.5rem', borderRadius: radius, background: theme.primaryColor, color: '#fff',
                  textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem',
                  boxShadow: `0 8px 24px ${theme.primaryColor}40`, transition: 'transform 0.15s, opacity 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
                onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}>
                {footer.ctaButtonText} →
              </a>
            )}
          </motion.div>
        )}

        {/* Main grid */}
        {(footer.showBrand || showNav || footer.showContact || showSocialInGrid) && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: gridCols,
            gap: isMobile ? columnGap : columnGap,
            marginBottom: manySocial ? '2rem' : (isMinimal ? '1.5rem' : '3rem'),
            justifyItems: isCentered ? 'center' : 'stretch',
          }}>
          {footer.showBrand && (
          <div style={{ maxWidth: isCentered ? 420 : undefined }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1rem', justifyContent: isCentered ? 'center' : 'flex-start' }}>
              <div style={{
                width: 46, height: 46, borderRadius: radius, flexShrink: 0,
                background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 800, fontSize: '1.2rem', color: '#fff',
                boxShadow: `0 6px 20px ${theme.primaryColor}35`,
              }}>{initial}</div>
              <div>
                <p style={{ fontWeight: 800, fontSize: '1.15rem', color: theme.primaryColor, lineHeight: 1.2 }}>{portfolio.name}</p>
                {tagline && <p style={{ opacity: 0.5, fontSize: '0.78rem', marginTop: 3, lineHeight: 1.4 }}>{tagline}</p>}
              </div>
            </div>
            {footer.showDescription && (
              <p style={{ opacity: 0.5, lineHeight: 1.75, fontSize: '0.88rem', maxWidth: 300 }}>{description}</p>
            )}
            {footer.showLiveBadge && portfolio.published && (
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginTop: '1.1rem',
                padding: '0.35rem 0.75rem', borderRadius: 999, fontSize: '0.72rem', fontWeight: 600,
                background: '#22c55e18', color: '#4ade80', border: '1px solid #22c55e33',
              }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80' }} />
                Portfolio Live
              </div>
            )}
          </div>
          )}

          {showNav && (
          <div style={{ width: isCentered ? '100%' : undefined, maxWidth: isCentered ? 320 : undefined }}>
            <FooterHeading centered={isCentered}>{footer.navHeading}</FooterHeading>
            <FooterNavLinks items={navItems} theme={theme} layout={footer.navLayout ?? 'list'} textColor={textColor} />
          </div>
          )}

          {footer.showContact && (
          <div style={{ maxWidth: isCentered ? 320 : undefined }}>
            <FooterHeading centered={isCentered}>{footer.contactHeading}</FooterHeading>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {email && <FooterContactRow icon="📧" label="Email" value={email} href={`mailto:${email}`} theme={theme} />}
              {phone && <FooterContactRow icon="📞" label="Phone" value={phone} href={`tel:${phone.replace(/\s/g, '')}`} theme={theme} />}
              {location && <FooterContactRow icon="📍" label="Location" value={location} theme={theme} />}
              {!hasContactInfo && (
                <p style={{ opacity: 0.4, fontSize: '0.85rem', lineHeight: 1.6 }}>Add contact details in the Contact section editor.</p>
              )}
            </div>
          </div>
          )}

          {showSocialInGrid && (
            <div style={{ minWidth: 0, maxWidth: isCentered ? 320 : undefined }}>
              <FooterHeading centered={isCentered}>{footer.socialHeading}</FooterHeading>
              <FooterSocial social={social} theme={theme} radius={radius} isMobile={isMobile} />
            </div>
          )}
        </div>
        )}

        {/* Social — full-width row when many links */}
        {manySocial && (
          <div style={{
            marginBottom: '3rem', padding: '1.25rem 1.5rem', borderRadius: radius,
            background: `${theme.primaryColor}08`, border: `1px solid ${theme.primaryColor}18`,
          }}>
            <FooterHeading>{footer.socialHeading}</FooterHeading>
            <FooterSocial social={social} theme={theme} radius={radius} isMobile={isMobile} fullWidth />
          </div>
        )}

        {/* Bottom bar */}
        {showBottomBar && (
          <div style={{
            borderTop: `1px solid ${theme.primaryColor}18`,
            padding: '1.5rem 0 2rem',
            display: 'flex', flexDirection: isMobile ? 'column' : 'row',
            alignItems: isMobile ? 'flex-start' : 'center',
            justifyContent: 'space-between', gap: '1rem',
          }}>
            {footer.showCopyright ? (
              <p style={{ opacity: 0.38, fontSize: '0.82rem' }}>
                {footer.copyrightText || (
                  <>© {new Date().getFullYear()} <span style={{ fontWeight: 600, opacity: 1 }}>{portfolio.name}</span>. All rights reserved.</>
                )}
              </p>
            ) : <div />}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
              {footer.showBuiltWith && <p style={{ opacity: 0.28, fontSize: '0.78rem' }}>Built with {APP_NAME}</p>}
              {footer.showBackToTop && (
                <button type="button" onClick={scrollPreviewToTop}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                    color: theme.primaryColor, background: 'none', border: 'none', cursor: 'pointer',
                    fontSize: '0.78rem', fontWeight: 600, opacity: 0.7, padding: 0,
                    transition: 'opacity 0.2s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                  onMouseLeave={e => (e.currentTarget.style.opacity = '0.7')}>
                  Back to top ↑
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </footer>
  );
}

// ── Section renderer ─────────────────────────────────────────────────────────
function SectionRenderer({ section, theme, index, social, smtp, isMobile }: {
  section: PortfolioSection; theme: ThemeConfig; index: number; social: SocialLinks; smtp: SMTPConfig; isMobile: boolean;
}) {
  const sectionVariants = getMotionVariants(section, theme);
  const sectionHover = getSectionHoverProps(section);
  const triggerLoad = resolveTriggerLoad(section);
  const pad = getSectionPad(theme.spacing, isMobile);
  const radii: Record<string, string> = { none: '0', sm: '4px', md: '8px', lg: '16px', full: '9999px' };
  const radius = radii[theme.borderRadius] || '8px';
  const altBg = index % 2 !== 0 ? `${theme.primaryColor}07` : 'transparent';

  const fv = (id: string): string => {
    const f = section.fields.find(f => f.id === id)
           ?? section.fields.find(f => f.label.toLowerCase().includes(id.toLowerCase()));
    const v = f?.value;
    return typeof v === 'string' ? v : '';
  };
  const fa = (id: string): string[] => {
    const f = section.fields.find(f => f.id === id)
           ?? section.fields.find(f => f.label.toLowerCase().includes(id.toLowerCase()));
    return Array.isArray(f?.value) ? f!.value as string[] : [];
  };

  const sectionTitle = fv('title') || section.title;
  const sp = { section, sectionTitle, theme, pad, altBg, variants: sectionVariants, radius, isMobile, fv, fa };

  // ── HERO ──
  if (section.type === 'hero') {
    return (
      <HeroSection
        section={section}
        theme={theme}
        pad={pad}
        radius={radius}
        isMobile={isMobile}
        social={social}
        sectionVariants={sectionVariants}
        sectionHover={sectionHover}
        triggerLoad={!!triggerLoad}
        fv={fv}
        fa={fa}
      />
    );
  }

  // ── ABOUT ──
  if (section.type === 'about') {
    return (
      <AboutSection
        section={section}
        sectionTitle={sectionTitle}
        theme={theme}
        pad={pad}
        altBg={altBg}
        radius={radius}
        isMobile={isMobile}
        fv={fv}
        fa={fa}
      />
    );
  }

  if (section.type === 'skills') return <SkillsSection {...sp} />;
  if (section.type === 'experience') return <ExperienceSection {...sp} />;
  if (section.type === 'projects') return <ProjectsSection {...sp} />;
  if (section.type === 'services') return <ServicesSection {...sp} />;
  if (section.type === 'blog') return <BlogSection {...sp} />;
  if (section.type === 'gallery') return <GallerySection {...sp} />;
  if (section.type === 'videos') return <VideosSection {...sp} />;
  if (section.type === 'social') return <SocialSection {...sp} />;
  if (section.type === 'testimonials') return <TestimonialsSection {...sp} />;
  if (section.type === 'stats') return <StatsSection {...sp} />;
  if (section.type === 'team') return <TeamSection {...sp} />;
  if (section.type === 'pricing') return <PricingSection {...sp} />;
  if (section.type === 'faq') return <FAQSection {...sp} />;
  if (section.type === 'custom') return <CustomSection {...sp} />;

  // ── CONTACT ──
  if (section.type === 'contact') {
    return (
      <ContactSection
        section={section}
        sectionTitle={sectionTitle}
        theme={theme}
        pad={pad}
        altBg={altBg}
        radius={radius}
        isMobile={isMobile}
        social={social}
        smtp={smtp}
        fv={fv}
      />
    );
  }

  // ── GENERIC (fallback for any section type) ──
  const genericFields = section.fields.filter(f => f.id !== 'title' && f.type !== 'select');
  return (
    <SectionShell id={section.id} pad={pad} altBg={altBg} section={section} theme={theme}>
      <SectionHeader title={sectionTitle} subtitle={fv('subtitle')} theme={theme} compact={isMobile} />
      <DynamicFieldsGrid fields={genericFields} theme={theme} radius={radius} isMobile={isMobile} />
    </SectionShell>
  );
}

// ── About section ────────────────────────────────────────────────────────────
const ABOUT_KNOWN_IDS = new Set(['aboutLayout', 'imageStyle', 'title', 'subtitle', 'role', 'bio', 'image', 'highlights', 'location', 'email', 'phone', 'website', 'availability']);

const ABOUT_ICONS: Record<string, string> = {
  location: '📍', email: '📧', phone: '📞', website: '🌐', availability: '💼',
};

function AboutInfoCard({ icon, label, value, href, theme, radius }: {
  icon: string; label: string; value: string; href?: string; theme: ThemeConfig; radius: string;
}) {
  const inner = (
    <>
      <div style={{
        width: 40, height: 40, borderRadius: radius, background: `${theme.primaryColor}18`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0,
      }}>{icon}</div>
      <div style={{ minWidth: 0 }}>
        <p style={{ fontSize: '0.72rem', opacity: 0.45, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>{label}</p>
        <p style={{ fontSize: '0.9rem', opacity: 0.9, fontWeight: 500, wordBreak: 'break-word' }}>{value}</p>
      </div>
    </>
  );
  const cardStyle: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: '0.85rem', padding: '1rem 1.15rem',
    borderRadius: radius, background: `${theme.primaryColor}08`, border: `1px solid ${theme.primaryColor}18`,
    transition: 'border-color 0.2s, background 0.2s', textDecoration: 'none', color: 'inherit',
  };
  if (href) {
    return (
      <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" style={cardStyle}
        onMouseEnter={e => { e.currentTarget.style.borderColor = `${theme.primaryColor}44`; e.currentTarget.style.background = `${theme.primaryColor}14`; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = `${theme.primaryColor}18`; e.currentTarget.style.background = `${theme.primaryColor}08`; }}>
        {inner}
      </a>
    );
  }
  return <div style={cardStyle}>{inner}</div>;
}

function AboutCustomField({ field, theme, radius, isMobile }: { field: SectionField; theme: ThemeConfig; radius: string; isMobile: boolean }) {
  const val = field.value;
  if (!val || (typeof val === 'string' && !val.trim()) || (Array.isArray(val) && !val.some(v => typeof v === 'string' && v.trim()))) return null;

  return (
    <div style={{ marginTop: '0.5rem' }}>
      <p style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', opacity: 0.4, marginBottom: '0.75rem' }}>{field.label}</p>
      {field.type === 'image' && typeof val === 'string' && (
        <img src={val} alt={field.label} style={{ maxWidth: '100%', width: 280, borderRadius: radius, display: 'block' }} />
      )}
      {(field.type === 'richtext' || field.type === 'textarea' || field.type === 'text') && typeof val === 'string' && (
        <p style={{ opacity: 0.8, lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{val}</p>
      )}
      {field.type === 'url' && typeof val === 'string' && (
        <a href={val} target="_blank" rel="noopener noreferrer" style={{ color: theme.primaryColor, textDecoration: 'none', fontWeight: 500 }}>{val}</a>
      )}
      {field.type === 'email' && typeof val === 'string' && (
        <a href={`mailto:${val}`} style={{ color: theme.primaryColor, textDecoration: 'none', fontWeight: 500 }}>{val}</a>
      )}
      {field.type === 'list' && Array.isArray(val) && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {(val as string[]).filter(Boolean).map((item, i) => (
            <span key={i} style={{ padding: '0.45rem 1rem', borderRadius: radius, background: `${theme.primaryColor}12`, border: `1px solid ${theme.primaryColor}25`, fontSize: '0.85rem' }}>{item}</span>
          ))}
        </div>
      )}
      {field.type === 'images' && Array.isArray(val) && (
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2,1fr)' : 'repeat(auto-fill, minmax(120px,1fr))', gap: '0.75rem' }}>
          {(val as string[]).map((src, i) => (
            <img key={i} src={src} alt="" style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: radius }} />
          ))}
        </div>
      )}
    </div>
  );
}

function AboutSection({ section, sectionTitle, theme, pad, altBg, radius, isMobile, fv, fa }: {
  section: PortfolioSection; sectionTitle: string; theme: ThemeConfig; pad: string; altBg: string;
  radius: string; isMobile: boolean;
  fv: (id: string) => string; fa: (id: string) => string[];
}) {
  const animVp = useInViewViewport();
  const subtitle = fv('subtitle');
  const role = fv('role');
  const bio = fv('bio');
  const image = fv('image');
  const highlights = fa('highlights');
  const location = fv('location');
  const email = fv('email');
  const phone = fv('phone');
  const website = fv('website');
  const availability = fv('availability');
  const imageStyle = fv('imageStyle') || 'default';
  // imageAnim from Animation → Elements tab overrides the motion behaviour
  const imageAnimFromPanel = section.style?.animation?.imageAnim;

  // Resolve effective states (panel overrides content field for motion)
  const effectiveIsCircle = imageStyle === 'circle-glow' || imageAnimFromPanel === 'circle-glow';
  const effectiveIsFloating = imageStyle === 'floating' || imageAnimFromPanel === 'float';
  const effectiveIsRotate = imageStyle === 'rotate' || imageAnimFromPanel === 'rotate-idle';
  const effectiveIsRotateHover = imageStyle === 'rotate-hover' || imageAnimFromPanel === 'rotate-hover';
  const effectiveIsMorphBorder = imageStyle === 'morph-border' || imageAnimFromPanel === 'morph-border';
  const effectiveIsTilt3d = imageStyle === 'tilt-3d' || imageAnimFromPanel === 'tilt-3d';
  const effectiveIsPulseGlow = imageAnimFromPanel === 'pulse-glow';
  const effectiveIsSpinSlow = imageAnimFromPanel === 'spin-slow';

  const infoItems = [
    location && { icon: ABOUT_ICONS.location, label: section.fields.find(f => f.id === 'location')?.label || 'Location', value: location },
    email && { icon: ABOUT_ICONS.email, label: section.fields.find(f => f.id === 'email')?.label || 'Email', value: email, href: `mailto:${email}` },
    phone && { icon: ABOUT_ICONS.phone, label: section.fields.find(f => f.id === 'phone')?.label || 'Phone', value: phone, href: `tel:${phone.replace(/\s/g, '')}` },
    website && { icon: ABOUT_ICONS.website, label: section.fields.find(f => f.id === 'website')?.label || 'Website', value: website.replace(/^https?:\/\//, ''), href: website.startsWith('http') ? website : `https://${website}` },
    availability && { icon: ABOUT_ICONS.availability, label: section.fields.find(f => f.id === 'availability')?.label || 'Availability', value: availability },
  ].filter(Boolean) as { icon: string; label: string; value: string; href?: string }[];

  const customFields = section.fields.filter(f => !ABOUT_KNOWN_IDS.has(f.id));
  const aboutLayout = normalizeAboutLayout(fv('aboutLayout'));
  const layout = getAboutLayoutPreview(aboutLayout, isMobile);
  const isCentered = layout.centered;
  const isWide = aboutLayout === 'wide';

  // ── Image style helpers ──
  const isCircle = effectiveIsCircle;
  const isFloating = effectiveIsFloating;
  const isRotate = effectiveIsRotate;
  const isRotateHover = effectiveIsRotateHover;
  const isMorphBorder = effectiveIsMorphBorder;
  const isTilt3d = effectiveIsTilt3d;

  const bgDecorStyle: React.CSSProperties = {
    position: 'absolute',
    inset: layout.minimal ? -4 : isMobile ? -8 : -12,
    borderRadius: isCircle || layout.minimal ? '50%' : isMorphBorder ? '60% 40% 30% 70% / 60% 30% 70% 40%' : `calc(${radius} + 8px)`,
    background: `linear-gradient(135deg, ${theme.primaryColor}55, ${theme.secondaryColor}44)`,
    transform: (isCentered || isCircle || isMorphBorder || layout.minimal) ? 'none' : isRotate ? 'rotate(6deg)' : 'rotate(-3deg)',
    zIndex: 0,
    ...(isMorphBorder ? { animation: 'morphBorder 8s ease-in-out infinite' } : {}),
  };

  const imgWrapStyle: React.CSSProperties = {
    position: 'relative', zIndex: 1,
    borderRadius: isCircle ? '50%' : radius,
    overflow: 'hidden',
    aspectRatio: isCircle ? '1' : layout.imageAspect,
    maxHeight: isCircle ? 320 : layout.imageMaxHeight,
    width: layout.minimal ? 96 : layout.imageFullWidth ? '100%' : undefined,
    height: layout.minimal ? 96 : undefined,
    boxShadow: isCircle
      ? `0 0 0 4px ${theme.primaryColor}33, 0 0 40px ${theme.primaryColor}44, 0 24px 64px ${theme.primaryColor}30`
      : effectiveIsPulseGlow
        ? `0 0 0 4px ${theme.primaryColor}44, 0 0 40px 8px ${theme.primaryColor}55, 0 24px 64px ${theme.primaryColor}30`
        : `0 24px 64px ${theme.primaryColor}30`,
    background: `${theme.primaryColor}12`,
    ...(isFloating ? { animation: 'aboutFloat 4s ease-in-out infinite' } : {}),
    ...(effectiveIsSpinSlow ? { animation: 'spinSlow 12s linear infinite' } : {}),
  };

  const imgEl = image ? (
    <img src={image} alt={role || sectionTitle}
      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.5s ease' }}
      onMouseEnter={e => {
        if (isRotateHover) e.currentTarget.style.transform = 'scale(1.06) rotate(3deg)';
        else if (isTilt3d) e.currentTarget.style.transform = 'scale(1.05)';
      }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'none'; }}
    />
  ) : (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', opacity: 0.35 }}>
      <span style={{ fontSize: '4rem' }}>👤</span>
      <span style={{ fontSize: '0.8rem' }}>Add profile photo</span>
    </div>
  );

  // Outer wrapper gets the 3d tilt or rotate animation
  const outerWrapMotion = isTilt3d ? {
    whileHover: { rotateY: 8, rotateX: -6, scale: 1.02 },
    transition: { duration: 0.4, ease: 'easeOut' as const },
    style: { perspective: 800, transformStyle: 'preserve-3d' as const },
  } : isRotate ? {
    animate: { rotate: [0, 2, -2, 1, 0] },
    transition: { duration: 6, repeat: Infinity, ease: 'easeInOut' as const },
  } : {};

  const imageBlock = (
    <motion.div
      initial={{ opacity: 0, x: isCentered ? 0 : -24, y: isCentered ? 20 : 0 }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={animVp}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
      {...(isTilt3d ? { whileHover: { rotateY: 8, rotateX: -6, scale: 1.02 }, style: { perspective: 800 } } : {})}
      style={{
        position: 'relative',
        maxWidth: layout.imageMaxWidth,
        margin: isCentered || layout.imageFullWidth ? '0 auto' : undefined,
        width: isCentered || layout.imageFullWidth ? '100%' : layout.minimal ? 96 : undefined,
        ...(isTilt3d ? { perspective: 800 } : {}),
      }}
    >
      <div style={bgDecorStyle} />
      {/* Pulse ring for circle-glow */}
      {isCircle && (
        <motion.div
          animate={{ scale: [1, 1.12, 1], opacity: [0.5, 0.2, 0.5] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute', inset: -20, borderRadius: '50%',
            background: `radial-gradient(circle, ${theme.primaryColor}22, transparent 70%)`,
            zIndex: 0,
          }}
        />
      )}
      <motion.div
        style={imgWrapStyle}
        {...(isTilt3d ? { whileHover: { rotateY: 8, rotateX: -6 } } : {})}
        {...(isRotate ? { animate: { rotate: [-1.5, 1.5, -1.5] }, transition: { duration: 5, repeat: Infinity, ease: 'easeInOut' as const } } : {})}
      >
        {imgEl}
      </motion.div>
      {role && !layout.hideRoleBadge && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={animVp}
          transition={{ delay: 0.4 }}
          style={{
            position: 'absolute', bottom: isMobile ? -14 : -18, left: '50%', transform: 'translateX(-50%)',
            background: theme.primaryColor, color: '#fff', padding: '0.5rem 1.25rem', borderRadius: radius,
            fontSize: '0.78rem', fontWeight: 700, whiteSpace: 'nowrap', zIndex: 2,
            boxShadow: `0 8px 24px ${theme.primaryColor}50`,
          }}
        >{role}</motion.div>
      )}
    </motion.div>
  );

  // Element animation based on section animation settings
  const animCfg = section.style?.animation;
  const cardAnim = animCfg?.cardAnim || 'stagger-up';
  const headingAnim = animCfg?.headingAnim || 'none';

  const contentBlock = (
    <div style={{
      paddingTop: isMobile ? 0 : layout.overlap ? '3rem' : '0.5rem',
      textAlign: isCentered ? 'center' : 'left',
      ...(layout.overlap && !isMobile ? {
        marginLeft: '-3rem',
        position: 'relative',
        zIndex: 2,
        background: theme.backgroundColor,
        padding: '1.5rem',
        borderRadius: radius,
        boxShadow: `0 16px 48px ${theme.primaryColor}18`,
        border: `1px solid ${theme.primaryColor}14`,
      } : {}),
    }}>
      {role && layout.hideRoleBadge && (
        <p style={{
          fontSize: '0.82rem', fontWeight: 700, color: theme.primaryColor,
          marginBottom: '0.75rem', letterSpacing: '0.04em', textTransform: 'uppercase',
        }}>{role}</p>
      )}
      {bio && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={animVp}
          transition={{ duration: 0.55, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          style={{
            padding: '1.5rem', borderRadius: radius, background: `${theme.primaryColor}06`,
            border: `1px solid ${theme.primaryColor}14`, marginBottom: '2rem',
            maxWidth: isCentered ? 640 : undefined, marginInline: isCentered ? 'auto' : undefined,
          }}
        >
          <p style={{ opacity: 0.85, lineHeight: 1.9, fontSize: '1.02rem', whiteSpace: 'pre-wrap' }}>{bio}</p>
        </motion.div>
      )}
      {highlights.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : `repeat(${Math.min(highlights.length, 3)}, 1fr)`,
          gap: '0.85rem', marginBottom: '2rem',
        }}>
          {highlights.filter(Boolean).map((item, i) => {
            const [num, ...rest] = item.split(' ');
            const isStat = /^\d/.test(num);
            const cardInitial = cardAnim === 'stagger-left' ? { opacity: 0, x: -20 }
              : cardAnim === 'stagger-scale' ? { opacity: 0, scale: 0.82 }
              : cardAnim === 'flip-in' ? { opacity: 0, rotateY: 40 }
              : { opacity: 0, y: 14 };
            const cardAnimate = cardAnim === 'stagger-left' ? { opacity: 1, x: 0 }
              : cardAnim === 'stagger-scale' ? { opacity: 1, scale: 1 }
              : cardAnim === 'flip-in' ? { opacity: 1, rotateY: 0 }
              : { opacity: 1, y: 0 };
            return (
              <motion.div key={i}
                initial={cardInitial}
                whileInView={cardAnimate}
                viewport={animVp}
                transition={{ delay: i * 0.08, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -3, scale: 1.02, transition: { duration: 0.2 } }}
                style={{
                  padding: '1.1rem 1.25rem', borderRadius: radius, textAlign: 'center',
                  background: `linear-gradient(135deg, ${theme.primaryColor}14, ${theme.secondaryColor}10)`,
                  border: `1px solid ${theme.primaryColor}22`, cursor: 'default',
                  transition: 'border-color 0.2s',
                }}>
                {isStat ? (
                  <>
                    <p style={{ fontSize: '1.5rem', fontWeight: 800, color: theme.primaryColor, lineHeight: 1 }}>{num}</p>
                    <p style={{ fontSize: '0.78rem', opacity: 0.6, marginTop: '0.35rem' }}>{rest.join(' ')}</p>
                  </>
                ) : (
                  <p style={{ fontSize: '0.88rem', fontWeight: 600, opacity: 0.85 }}>{item}</p>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
      {infoItems.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : (isCentered ? '1fr' : 'repeat(2, 1fr)'),
          gap: '0.75rem', maxWidth: isCentered ? 480 : undefined, marginInline: isCentered ? 'auto' : undefined,
        }}>
          {infoItems.map((item, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={animVp} transition={{ delay: i * 0.05 }}>
              <AboutInfoCard icon={item.icon} label={item.label} value={item.value} href={item.href} theme={theme} radius={radius} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );

  const mainContent = layout.contentFirst && !isMobile
    ? <>{contentBlock}{imageBlock}</>
    : <>{imageBlock}{contentBlock}</>;

  return (
    <SectionShell id={section.id} pad={pad} altBg={altBg} section={section} theme={theme}>
      <SectionHeader title={sectionTitle} subtitle={subtitle} theme={theme} compact={isMobile} centered={isCentered} headingAnim={headingAnim} />
      {layout.card ? (
        <div style={{
          borderRadius: radius,
          overflow: 'hidden',
          border: `1px solid ${theme.primaryColor}18`,
          background: `${theme.primaryColor}04`,
          boxShadow: `0 20px 56px ${theme.primaryColor}12`,
        }}>
          {imageBlock}
          <div style={{ padding: isMobile ? '1.25rem' : '1.75rem' }}>{contentBlock}</div>
        </div>
      ) : (
        <div style={{
          display: 'grid', gridTemplateColumns: layout.gridCols,
          gap: isMobile ? '2.5rem' : layout.minimal ? '2rem' : '4rem',
          alignItems: layout.minimal ? 'center' : 'start',
          maxWidth: isCentered ? 720 : undefined,
          marginInline: isCentered ? 'auto' : undefined,
        }}>
          {mainContent}
        </div>
      )}

      {/* Custom / user-added fields */}
      {customFields.length > 0 && (
        <div style={{
          marginTop: '3rem', padding: '1.75rem', borderRadius: radius,
          background: `${theme.primaryColor}05`, border: `1px solid ${theme.primaryColor}12`,
          display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem',
        }}>
          {customFields.map(field => (
            <AboutCustomField key={field.id} field={field} theme={theme} radius={radius} isMobile={isMobile} />
          ))}
        </div>
      )}
    </SectionShell>
  );
}

// ── Contact section ────────────────────────────────────────────────────────────
const CONTACT_KNOWN_IDS = new Set(['contactLayout', 'title', 'subtitle', 'message', 'email', 'phone', 'location', 'address', 'hours', 'responseTime']);

const CONTACT_ICONS: Record<string, string> = {
  email: '📧', phone: '📞', location: '📍', address: '🏢', hours: '🕐', responseTime: '⚡',
};

function ContactInput({ label, theme, radius, children }: { label: string; theme: ThemeConfig; radius: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, opacity: 0.55, marginBottom: '0.45rem', letterSpacing: '0.03em' }}>{label}</label>
      {children}
    </div>
  );
}

function ContactSection({ section, sectionTitle, theme, pad, altBg, radius, isMobile, social, smtp, fv }: {
  section: PortfolioSection; sectionTitle: string; theme: ThemeConfig; pad: string; altBg: string;
  radius: string; isMobile: boolean; social: SocialLinks; smtp: SMTPConfig;
  fv: (id: string) => string;
}) {
  const headingAnim = getSectionHeadingAnim(section);
  const subtitle = fv('subtitle');
  const intro = fv('message');
  const email = fv('email');
  const phone = fv('phone');
  const location = fv('location');
  const address = fv('address');
  const hours = fv('hours');
  const responseTime = fv('responseTime');

  const fieldLabel = (id: string, fallback: string) => section.fields.find(f => f.id === id)?.label || fallback;

  const infoItems = [
    email && { id: 'email', icon: CONTACT_ICONS.email, label: fieldLabel('email', 'Email'), value: email, href: `mailto:${email}` },
    phone && { id: 'phone', icon: CONTACT_ICONS.phone, label: fieldLabel('phone', 'Phone'), value: phone, href: `tel:${phone.replace(/\s/g, '')}` },
    location && { id: 'location', icon: CONTACT_ICONS.location, label: fieldLabel('location', 'Location'), value: location },
    address && { id: 'address', icon: CONTACT_ICONS.address, label: fieldLabel('address', 'Address'), value: address },
    hours && { id: 'hours', icon: CONTACT_ICONS.hours, label: fieldLabel('hours', 'Hours'), value: hours },
  ].filter(Boolean) as { id: string; icon: string; label: string; value: string; href?: string }[];

  const customFields = section.fields.filter(f => !CONTACT_KNOWN_IDS.has(f.id));
  const hasSocial = Object.values(social).some(Boolean);
  const contactLayout = fv('contactLayout') || 'split';
  const isCentered = contactLayout === 'centered';
  const isMinimal = contactLayout === 'minimal';

  const infoColumn = (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', alignItems: isCentered || isMinimal ? 'center' : 'stretch', textAlign: isCentered || isMinimal ? 'center' : 'left' }}>
          {intro && (
            <div style={{
              padding: '1.35rem 1.5rem', borderRadius: radius,
              background: `${theme.primaryColor}08`, border: `1px solid ${theme.primaryColor}18`,
              borderLeft: `4px solid ${theme.primaryColor}`,
            }}>
              <p style={{ opacity: 0.82, lineHeight: 1.85, fontSize: '0.98rem', whiteSpace: 'pre-wrap' }}>{intro}</p>
            </div>
          )}

          {responseTime && (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.6rem', alignSelf: 'flex-start',
              padding: '0.55rem 1.1rem', borderRadius: 999, background: `${theme.primaryColor}18`,
              border: `1px solid ${theme.primaryColor}33`, fontSize: '0.82rem', fontWeight: 600, color: theme.primaryColor,
            }}>
              <span>{CONTACT_ICONS.responseTime}</span>
              <span>{responseTime}</span>
            </div>
          )}

          {infoItems.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {infoItems.map(item => (
                <AboutInfoCard key={item.id} icon={item.icon} label={item.label} value={item.value} href={item.href} theme={theme} radius={radius} />
              ))}
            </div>
          )}

          {hasSocial && !isMinimal && (
            <div style={{ padding: '1.25rem', borderRadius: radius, background: `${theme.primaryColor}06`, border: `1px solid ${theme.primaryColor}14`, width: isCentered ? '100%' : undefined, maxWidth: isCentered ? 480 : undefined }}>
              <p style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', opacity: 0.4, marginBottom: '0.85rem' }}>Connect on social</p>
              <SocialBar social={social} color={theme.primaryColor} compact />
            </div>
          )}
        </div>
  );

  return (
    <SectionShell id={section.id} pad={pad} altBg={altBg} section={section} theme={theme}
      style={{ background: `linear-gradient(180deg, ${theme.primaryColor}0a 0%, ${altBg} 55%)` }}>
      <SectionHeader title={sectionTitle} subtitle={subtitle} theme={theme} centered compact={isMobile} headingAnim={headingAnim} />

      {isMinimal && infoItems.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center', marginBottom: '1.5rem' }}>
          {infoItems.map(item => (
            <span key={item.id} style={{ fontSize: '0.78rem', padding: '0.4rem 0.85rem', borderRadius: 999, background: `${theme.primaryColor}12`, border: `1px solid ${theme.primaryColor}22` }}>
              {item.icon} {item.value}
            </span>
          ))}
        </div>
      )}

      <div style={{
        display: 'grid',
        gridTemplateColumns: isMinimal || isMobile ? '1fr' : (isCentered ? '1fr' : '1fr 1.15fr'),
        gap: isMobile ? '2rem' : '2.5rem',
        alignItems: 'start',
        maxWidth: isMinimal ? 560 : 1040,
        margin: '0 auto',
        width: '100%',
        minWidth: 0,
      }}>
        {!isMinimal && infoColumn}
        <ContactFormCard theme={theme} radius={radius} isMobile={isMobile} smtp={smtp} />
      </div>

      {customFields.length > 0 && (
        <div style={{
          marginTop: '2.5rem', padding: '1.75rem', borderRadius: radius,
          background: `${theme.primaryColor}05`, border: `1px solid ${theme.primaryColor}12`,
          display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem',
          maxWidth: 1040, margin: '2.5rem auto 0',
        }}>
          {customFields.map(field => (
            <AboutCustomField key={field.id} field={field} theme={theme} radius={radius} isMobile={isMobile} />
          ))}
        </div>
      )}
    </SectionShell>
  );
}

function isSMTPReady(smtp: SMTPConfig) {
  return Boolean(smtp?.host?.trim() && smtp?.user?.trim() && smtp?.password?.trim());
}

function ContactFormCard({ theme, radius, isMobile, smtp }: { theme: ThemeConfig; radius: string; isMobile: boolean; smtp: SMTPConfig }) {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [focused, setFocused] = useState<string | null>(null);
  const smtpReady = isSMTPReady(smtp);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!smtpReady) {
      setStatus('error');
      setErrorMsg('SMTP is not configured. Open SMTP settings and add host, username, and password.');
      return;
    }
    setStatus('sending');
    setErrorMsg('');
    const fullMessage = form.subject ? `Subject: ${form.subject}\n\n${form.message}` : form.message;
    try {
      const res = await fetch('/api/contact', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, email: form.email, message: fullMessage, smtp }),
      });
      if (res.ok) {
        setStatus('sent');
      } else {
        const data = await res.json().catch(() => ({}));
        setErrorMsg(data.error || 'Failed to send message. Check SMTP settings.');
        setStatus('error');
      }
    } catch {
      setErrorMsg('Network error. Please try again.');
      setStatus('error');
    }
  };

  const inputStyle = (field: string): React.CSSProperties => ({
    width: '100%', padding: '0.85rem 1rem', borderRadius: radius,
    border: `1.5px solid ${focused === field ? theme.primaryColor : `${theme.primaryColor}28`}`,
    background: focused === field ? `${theme.primaryColor}10` : `${theme.primaryColor}06`,
    color: theme.textColor, fontSize: '0.92rem', outline: 'none', boxSizing: 'border-box',
    transition: 'border-color 0.2s, background 0.2s',
  });

  return (
    <div style={{ position: 'relative' }}>
      <div style={{
        position: 'absolute', inset: -1, borderRadius: `calc(${radius} + 4px)`,
        background: `linear-gradient(135deg, ${theme.primaryColor}44, ${theme.secondaryColor}33)`,
        zIndex: 0,
      }} />
      <div style={{
        position: 'relative', zIndex: 1, padding: isMobile ? '1.5rem' : '2rem',
        borderRadius: radius, background: theme.backgroundColor,
        boxShadow: `0 20px 60px ${theme.primaryColor}15`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1.75rem' }}>
          <div style={{
            width: 44, height: 44, borderRadius: radius, background: `${theme.primaryColor}18`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem',
          }}>✉️</div>
          <div>
            <p style={{ fontWeight: 700, fontSize: '1.1rem' }}>Send a Message</p>
            <p style={{ opacity: 0.5, fontSize: '0.82rem', marginTop: 2 }}>Fill in the form below</p>
          </div>
        </div>

        {status === 'sent' ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            style={{ padding: '2.5rem 1.5rem', textAlign: 'center', borderRadius: radius, background: `${theme.primaryColor}10` }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🎉</div>
            <p style={{ color: theme.primaryColor, fontWeight: 700, fontSize: '1.15rem' }}>Message Sent!</p>
            <p style={{ opacity: 0.6, marginTop: '0.5rem', fontSize: '0.9rem', lineHeight: 1.6 }}>Thank you for reaching out. I'll get back to you soon.</p>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '1rem' }}>
              <ContactInput label="Your Name" theme={theme} radius={radius}>
                <input style={inputStyle('name')} placeholder="John Doe" value={form.name}
                  onFocus={() => setFocused('name')} onBlur={() => setFocused(null)}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
              </ContactInput>
              <ContactInput label="Your Email" theme={theme} radius={radius}>
                <input style={inputStyle('email')} type="email" placeholder="you@email.com" value={form.email}
                  onFocus={() => setFocused('email')} onBlur={() => setFocused(null)}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
              </ContactInput>
            </div>
            <ContactInput label="Subject (optional)" theme={theme} radius={radius}>
              <input style={inputStyle('subject')} placeholder="Project inquiry, collaboration…" value={form.subject}
                onFocus={() => setFocused('subject')} onBlur={() => setFocused(null)}
                onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} />
            </ContactInput>
            <ContactInput label="Your Message" theme={theme} radius={radius}>
              <textarea style={{ ...inputStyle('message'), resize: 'vertical', minHeight: 130 }} rows={5}
                placeholder="Tell me about your project…" value={form.message}
                onFocus={() => setFocused('message')} onBlur={() => setFocused(null)}
                onChange={e => setForm(f => ({ ...f, message: e.target.value }))} required />
            </ContactInput>
            <button type="submit" disabled={status === 'sending'}
              style={{
                background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor})`,
                color: '#fff', padding: '1rem 2rem', borderRadius: radius, fontWeight: 700, border: 'none',
                cursor: status === 'sending' ? 'wait' : 'pointer', fontSize: '0.95rem',
                opacity: status === 'sending' ? 0.75 : 1, width: '100%',
                boxShadow: `0 8px 24px ${theme.primaryColor}40`, transition: 'opacity 0.2s, transform 0.15s',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              }}
              onMouseEnter={e => { if (status !== 'sending') e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}>
              {status === 'sending' ? 'Sending…' : 'Send Message →'}
            </button>
            {!smtpReady && status !== 'error' && (
              <p style={{ color: '#f59e0b', fontSize: '0.82rem', textAlign: 'center', padding: '0.5rem', background: '#f59e0b15', borderRadius: radius }}>
                Configure SMTP in builder settings to enable form delivery.
              </p>
            )}
            {status === 'error' && (
              <p style={{ color: '#ef4444', fontSize: '0.85rem', textAlign: 'center', padding: '0.5rem', background: '#ef444415', borderRadius: radius }}>
                {errorMsg || 'Failed to send. Configure SMTP in builder settings.'}
              </p>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
