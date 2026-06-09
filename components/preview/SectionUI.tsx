'use client';
import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { PortfolioSection, ThemeConfig, HeadingAnimStyle } from '@/lib/types';
import { getMotionVariants, getMotionViewport, getSectionHoverProps } from '@/lib/section-animation';

// ── Typewriter heading ──────────────────────────────────────────────────────
function TypewriterText({ text, color, style }: { text: string; color: string; style?: React.CSSProperties }) {
  const [displayed, setDisplayed] = useState('');
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setStarted(true); obs.disconnect(); }
    }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    let i = 0;
    setDisplayed('');
    const iv = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) clearInterval(iv);
    }, 38);
    return () => clearInterval(iv);
  }, [started, text]);

  return (
    <h2 ref={ref} style={{ ...style, color }}>
      {displayed}
      {displayed.length < text.length && (
        <span style={{ borderRight: `2px solid ${color}`, marginLeft: 1, animation: 'none', opacity: 1 }}>&nbsp;</span>
      )}
    </h2>
  );
}

// ── Word pop heading ─────────────────────────────────────────────────────────
function WordPopText({ text, color, style }: { text: string; color: string; style?: React.CSSProperties }) {
  const words = text.split(' ');
  return (
    <h2 style={{ ...style, display: 'flex', flexWrap: 'wrap', gap: '0.3em' }}>
      {words.map((w, i) => (
        <motion.span key={i} initial={{ opacity: 0, scale: 0.7, y: 8 }} whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true }} transition={{ delay: i * 0.07, type: 'spring', stiffness: 300, damping: 18 }}
          style={{ color, display: 'inline-block' }}>
          {w}
        </motion.span>
      ))}
    </h2>
  );
}

// ── Blur reveal heading ──────────────────────────────────────────────────────
function BlurRevealText({ text, color, style }: { text: string; color: string; style?: React.CSSProperties }) {
  return (
    <motion.h2 initial={{ filter: 'blur(14px)', opacity: 0, y: 10 }} whileInView={{ filter: 'blur(0px)', opacity: 1, y: 0 }}
      viewport={{ once: true }} transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
      style={{ ...style, color }}>
      {text}
    </motion.h2>
  );
}

// ── Animated SectionHeader ───────────────────────────────────────────────────
export function SectionHeader({ title, subtitle, theme, centered, badge, compact, headingAnim }: {
  title: string; subtitle?: string; theme: ThemeConfig; centered?: boolean; badge?: string; compact?: boolean;
  headingAnim?: HeadingAnimStyle;
}) {
  const h2Style: React.CSSProperties = {
    fontSize: compact ? 'clamp(1.35rem, 5vw, 1.85rem)' : 'clamp(1.65rem, 4vw, 2.35rem)',
    fontWeight: 800, lineHeight: 1.15, letterSpacing: '-0.02em', wordBreak: 'break-word',
  };

  const renderHeading = () => {
    switch (headingAnim) {
      case 'typewriter':
        return <TypewriterText text={title} color={theme.primaryColor} style={h2Style} />;
      case 'gradient-slide':
        return (
          <h2 className="heading-gradient-anim" style={{ ...h2Style, fontSize: h2Style.fontSize }}>
            {title}
          </h2>
        );
      case 'word-pop':
        return <WordPopText text={title} color={theme.primaryColor} style={h2Style} />;
      case 'blur-reveal':
        return <BlurRevealText text={title} color={theme.primaryColor} style={h2Style} />;
      case 'underline-draw':
        return (
          <h2 style={{ ...h2Style, color: theme.primaryColor, position: 'relative', display: 'inline-block' }}>
            {title}
            <motion.span
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              style={{
                position: 'absolute', bottom: -4, left: 0, height: 3, width: '100%', transformOrigin: 'left',
                background: `linear-gradient(90deg, ${theme.primaryColor}, ${theme.secondaryColor})`,
                borderRadius: 2, display: 'block',
              }}
            />
          </h2>
        );
      default:
        return <h2 style={{ ...h2Style, color: theme.primaryColor }}>{title}</h2>;
    }
  };

  return (
    <div style={{ marginBottom: compact ? '1.75rem' : '2.75rem', textAlign: centered ? 'center' : 'left' }}>
      {badge && (
        <motion.span
          initial={{ opacity: 0, y: -8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          style={{
            display: 'inline-block', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.14em',
            textTransform: 'uppercase', color: theme.primaryColor, marginBottom: '0.85rem',
            padding: '0.35rem 0.85rem', borderRadius: 999,
            background: `${theme.primaryColor}14`, border: `1px solid ${theme.primaryColor}28`,
          }}>{badge}</motion.span>
      )}
      <motion.div
        initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        style={{
          width: 52, height: 4, transformOrigin: centered ? 'center' : 'left',
          background: `linear-gradient(90deg, ${theme.primaryColor}, ${theme.secondaryColor})`,
          borderRadius: 2, marginBottom: '1rem',
          ...(centered ? { margin: '0 auto 1rem' } : {}),
        }}
      />
      {renderHeading()}
      {subtitle && (
        <motion.p
          initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          style={{
            opacity: 0.58, marginTop: '0.75rem', fontSize: compact ? '0.92rem' : '1.02rem', lineHeight: 1.7,
            maxWidth: centered ? 540 : 620, ...(centered ? { margin: '0.75rem auto 0' } : {}),
          }}>{subtitle}</motion.p>
      )}
    </div>
  );
}

export function SectionShell({ id, pad, altBg, section, theme, variants, children, style }: {
  id: string; pad: string; altBg: string;
  section?: PortfolioSection; theme?: ThemeConfig;
  variants?: any; children: React.ReactNode; style?: React.CSSProperties;
}) {
  const resolvedVariants = section && theme ? getMotionVariants(section, theme) : variants;
  const viewport = section && theme ? getMotionViewport(section, theme) : { once: true, margin: '-40px' as const };
  const whileHover = section ? getSectionHoverProps(section) : undefined;
  const anim = section?.style?.animation;
  const triggerLoad = anim?.custom && anim.trigger === 'load';

  return (
    <motion.section
      id={id}
      initial="hidden"
      animate={triggerLoad ? 'visible' : undefined}
      whileInView={triggerLoad ? undefined : 'visible'}
      viewport={viewport}
      variants={resolvedVariants}
      whileHover={whileHover}
      style={{
        padding: `${pad} clamp(0.85rem, 4vw, 2.5rem)`,
        background: altBg, width: '100%', maxWidth: '100%', boxSizing: 'border-box',
        overflow: 'hidden', transformOrigin: 'center center', ...style,
      }}
    >
      <div style={{
        maxWidth: section?.style?.maxWidth || 1200, margin: '0 auto', width: '100%', minWidth: 0,
        textAlign: section?.style?.textAlign,
      }}>{children}</div>
    </motion.section>
  );
}

export function GlassCard({ theme, radius, children, style, hover }: {
  theme: ThemeConfig; radius: string; children: React.ReactNode; style?: React.CSSProperties; hover?: boolean;
}) {
  return (
    <div
      style={{
        padding: 'clamp(1rem, 3vw, 1.5rem)', borderRadius: radius,
        background: `linear-gradient(135deg, ${theme.primaryColor}10, ${theme.secondaryColor}06)`,
        border: `1px solid ${theme.primaryColor}22`,
        backdropFilter: 'blur(8px)', transition: hover ? 'transform 0.25s, border-color 0.25s, box-shadow 0.25s' : undefined,
        ...style,
      }}
      onMouseEnter={hover ? e => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.borderColor = `${theme.primaryColor}44`;
        e.currentTarget.style.boxShadow = `0 16px 40px ${theme.primaryColor}18`;
      } : undefined}
      onMouseLeave={hover ? e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.borderColor = `${theme.primaryColor}22`;
        e.currentTarget.style.boxShadow = 'none';
      } : undefined}
    >
      {children}
    </div>
  );
}

export function parseSplit(item: string, sep: string): [string, string] {
  const idx = item.indexOf(sep);
  if (idx === -1) return [item.trim(), ''];
  return [item.slice(0, idx).trim(), item.slice(idx + sep.length).trim()];
}
