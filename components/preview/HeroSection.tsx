'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { PortfolioSection, SocialLinks, ThemeConfig } from '@/lib/types';
import {
  getHeroContent,
  getHeroAlignStyles,
  getHeroOuterAlignStyles,
  getHeroBlockMotionConfig,
  isHeroBlockVisible,
  HeroBlockId,
} from '@/lib/hero-content';
import { getElementMotionVariants, getMotionVariants, getMotionViewport, getSectionHoverProps } from '@/lib/section-animation';

const SOCIAL_LABELS: Record<string, string> = {
  github: 'GH', linkedin: 'in', twitter: 'X', instagram: 'IG',
  youtube: 'YT', dribbble: 'Dr', behance: 'Be', website: '🌐',
};

function SocialBar({ social, color, alignH = 'left' }: { social: SocialLinks; color: string; alignH?: 'left' | 'center' | 'right' }) {
  const links = Object.entries(social).filter(([, v]) => v);
  if (!links.length) return null;
  return (
    <div style={{
      display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '1.5rem',
      justifyContent: alignH === 'center' ? 'center' : alignH === 'right' ? 'flex-end' : 'flex-start',
    }}>
      {links.map(([key, url]) => (
        <a key={key} href={url as string} target="_blank" rel="noopener noreferrer"
          style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: 8, border: `1px solid ${color}55`, color, fontSize: '0.7rem', fontWeight: 700, textDecoration: 'none' }}>
          {SOCIAL_LABELS[key] || key.slice(0, 2).toUpperCase()}
        </a>
      ))}
    </div>
  );
}

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
          {[{ dir: -1, side: 'left' as const, Icon: ChevronLeft }, { dir: 1, side: 'right' as const, Icon: ChevronRight }].map(({ dir, side, Icon }) => (
            <button key={side} type="button" onClick={() => setIdx(i => (i + dir + images.length) % images.length)}
              style={{ position: 'absolute', [side]: 14, top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.55)', border: 'none', borderRadius: '50%', width: 40, height: 40, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', zIndex: 2 }}>
              <Icon size={20} />
            </button>
          ))}
        </>
      )}
    </div>
  );
}

interface HeroSectionProps {
  section: PortfolioSection;
  theme: ThemeConfig;
  pad: string;
  radius: string;
  isMobile: boolean;
  social: SocialLinks;
  sectionVariants: ReturnType<typeof getMotionVariants>;
  sectionViewport: ReturnType<typeof getMotionViewport>;
  sectionHover: ReturnType<typeof getSectionHoverProps>;
  triggerLoad: boolean;
  fv: (id: string) => string;
  fa: (id: string) => string[];
}

function HeroAnimatedBlock({
  blockId, blockIndex, hero, section, theme, triggerLoad, viewport, children,
}: {
  blockId: HeroBlockId;
  blockIndex: number;
  hero: ReturnType<typeof getHeroContent>;
  section: PortfolioSection;
  theme: ThemeConfig;
  triggerLoad: boolean;
  viewport: HeroSectionProps['sectionViewport'];
  children: React.ReactNode;
}) {
  if (!isHeroBlockVisible(hero, blockId)) return null;
  const cfg = getHeroBlockMotionConfig(blockId, hero, section, theme, blockIndex);
  const variants = getElementMotionVariants(cfg.entrance, cfg);
  return (
    <motion.div
      initial="hidden"
      animate={triggerLoad ? 'visible' : undefined}
      whileInView={triggerLoad ? undefined : 'visible'}
      viewport={viewport}
      variants={variants}
    >
      {children}
    </motion.div>
  );
}

export function HeroSection({
  section, theme, pad, radius, isMobile, social,
  sectionVariants, sectionViewport, sectionHover, triggerLoad,
  fv, fa,
}: HeroSectionProps) {
  const hero = getHeroContent(section);
  const layout = fv('heroLayout') || 'image-right';
  const headline = fv('headline') || 'Hello World';
  const sub = fv('subheadline') || '';
  const desc = fv('description') || '';
  const ctaText = fv('ctaText') || 'View Work';
  const ctaLink = fv('ctaLink') || '#';
  const ctaSecText = fv('ctaSecondaryText') || '';
  const ctaSecLink = fv('ctaSecondaryLink') || '#';
  const avatar = fv('avatar') || '';
  const bannerImgs = fa('bannerImages');
  const alignH = hero.alignH || 'left';
  const btnJustify = alignH === 'center' ? 'center' : alignH === 'right' ? 'flex-end' : 'flex-start';
  const contentStyle = getHeroAlignStyles(hero, isMobile);
  const outerStyle = getHeroOuterAlignStyles(hero, isMobile);
  const order = hero.blockOrder || ['badge', 'headline', 'subheadline', 'description', 'cta', 'social'];

  const renderContent = (lightText = false) => {
    let blockIndex = 0;
    const blocks: Record<HeroBlockId, React.ReactNode | null> = {
      badge: (
        <p style={{ color: theme.primaryColor, fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.8rem', letterSpacing: '0.14em', textTransform: 'uppercase' }}>
          {hero.badgeText || 'Welcome'}
        </p>
      ),
      headline: (
        <h1 style={{
          fontSize: lightText ? 'clamp(2rem, 5vw, 4rem)' : 'clamp(1.8rem, 4vw, 3.2rem)',
          fontWeight: 800, lineHeight: 1.1, marginBottom: '1rem',
          color: lightText ? '#fff' : undefined,
        }}>{headline}</h1>
      ),
      subheadline: sub ? (
        <p style={{ fontSize: lightText ? '1.2rem' : '1.15rem', opacity: lightText ? 0.85 : 0.7, marginBottom: '0.75rem' }}>{sub}</p>
      ) : null,
      description: desc ? (
        <p style={{ opacity: lightText ? 0.7 : 0.6, marginBottom: lightText ? '2rem' : '1.75rem', lineHeight: 1.75 }}>{desc}</p>
      ) : null,
      cta: (
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: btnJustify }}>
          <a href={ctaLink} style={{
            display: 'inline-block', background: theme.primaryColor, color: '#fff',
            padding: '0.75rem 2rem', borderRadius: radius, fontWeight: 600, textDecoration: 'none', fontSize: '0.95rem',
          }}>{ctaText}</a>
          {ctaSecText && (
            <a href={ctaSecLink} style={{
              display: 'inline-block',
              border: lightText ? '2px solid rgba(255,255,255,0.6)' : `2px solid ${theme.primaryColor}`,
              color: lightText ? '#fff' : theme.primaryColor,
              padding: '0.75rem 2rem', borderRadius: radius, fontWeight: 600, textDecoration: 'none', fontSize: '0.95rem',
            }}>{ctaSecText}</a>
          )}
        </div>
      ),
      social: <SocialBar social={social} color={theme.primaryColor} alignH={alignH} />,
    };

    return (
      <div style={contentStyle}>
        {order.map(id => {
          if (!isHeroBlockVisible(hero, id)) return null;
          if (id === 'subheadline' && !sub) return null;
          if (id === 'description' && !desc) return null;
          if (id === 'social' && !Object.values(social).some(Boolean)) return null;
          const node = blocks[id];
          if (!node) return null;
          const idx = blockIndex++;
          return (
            <HeroAnimatedBlock key={id} blockId={id} blockIndex={idx} hero={hero} section={section} theme={theme} triggerLoad={triggerLoad} viewport={sectionViewport}>
              {node}
            </HeroAnimatedBlock>
          );
        })}
      </div>
    );
  };

  const imageBlock = avatar ? (
    <div style={{ flex: '0 0 auto', width: isMobile ? '100%' : 'clamp(180px, 32%, 360px)', maxWidth: isMobile ? 320 : undefined, margin: isMobile ? '0 auto' : undefined }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={avatar} alt="hero" style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: layout === 'split' ? 0 : radius, boxShadow: `0 24px 64px ${theme.primaryColor}30` }} />
    </div>
  ) : null;

  if (layout === 'banner') {
    const bgImg = bannerImgs[0] || avatar;
    return (
      <motion.section id={section.id} initial="hidden" animate={triggerLoad ? 'visible' : undefined} whileInView={triggerLoad ? undefined : 'visible'} viewport={sectionViewport} variants={sectionVariants} whileHover={sectionHover}
        style={{ position: 'relative', minHeight: isMobile ? '58vh' : '72vh', display: 'flex', overflow: 'hidden', transformOrigin: 'center center', ...outerStyle }}>
        {bgImg && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={bgImg} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.28) 100%)' }} />
        <div style={{ position: 'relative', zIndex: 1, padding: `${pad} ${isMobile ? '1rem' : '1.5rem'}`, maxWidth: 1200, margin: '0 auto', width: '100%', color: '#fff', flex: 1, ...outerStyle }}>
          {renderContent(true)}
        </div>
      </motion.section>
    );
  }

  if (layout === 'slideshow') {
    return (
      <motion.section id={section.id} initial="hidden" animate={triggerLoad ? 'visible' : undefined} whileInView={triggerLoad ? undefined : 'visible'} viewport={sectionViewport} variants={sectionVariants} whileHover={sectionHover} style={{ position: 'relative', transformOrigin: 'center center' }}>
        <Slideshow images={bannerImgs.length ? bannerImgs : (avatar ? [avatar] : [])} height={isMobile ? 360 : 520} theme={theme} />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', zIndex: 3, padding: isMobile ? '0 1rem' : '0 1.5rem', pointerEvents: 'none', ...outerStyle }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', width: '100%', pointerEvents: 'auto' }}>
            {renderContent(true)}
          </div>
        </div>
      </motion.section>
    );
  }

  if (layout === 'split') {
    return (
      <motion.section id={section.id} initial="hidden" animate={triggerLoad ? 'visible' : undefined} whileInView={triggerLoad ? undefined : 'visible'} viewport={sectionViewport} variants={sectionVariants} whileHover={sectionHover}
        style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', minHeight: isMobile ? 'auto' : '72vh', transformOrigin: 'center center' }}>
        <div style={{ padding: isMobile ? `${pad} 1.25rem` : `${pad} 3rem`, display: 'flex', background: theme.backgroundColor, ...outerStyle }}>
          {renderContent()}
        </div>
        <div style={{ overflow: 'hidden', minHeight: isMobile ? 260 : undefined }}>
          {avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatar} alt="" style={{ width: '100%', height: isMobile ? 260 : '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: '100%', height: isMobile ? 260 : '100%', background: `${theme.primaryColor}22` }} />
          )}
        </div>
      </motion.section>
    );
  }

  return (
    <motion.section id={section.id} initial="hidden" animate={triggerLoad ? 'visible' : undefined} whileInView={triggerLoad ? undefined : 'visible'} viewport={sectionViewport} variants={sectionVariants} whileHover={sectionHover}
      style={{ padding: `${pad} ${isMobile ? '1rem' : '1.5rem'}`, minHeight: isMobile ? 'auto' : '62vh', display: 'flex', transformOrigin: 'center center', ...outerStyle }}>
      <div style={{
        maxWidth: 1200, margin: '0 auto', width: '100%', display: 'flex',
        gap: isMobile ? '2rem' : '3rem',
        flexDirection: isMobile ? 'column' : (layout === 'image-left' ? 'row-reverse' : 'row'),
        flexWrap: 'wrap',
        alignItems: 'center',
      }}>
        <div style={{ flex: 1, minWidth: 0, ...outerStyle }}>
          {renderContent()}
        </div>
        {layout !== 'text-only' && imageBlock}
      </div>
    </motion.section>
  );
}
