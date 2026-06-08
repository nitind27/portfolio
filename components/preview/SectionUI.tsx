'use client';
import { motion } from 'framer-motion';
import { PortfolioSection, ThemeConfig } from '@/lib/types';
import { getMotionVariants, getMotionViewport, getSectionHoverProps } from '@/lib/section-animation';

export function SectionHeader({ title, subtitle, theme, centered, badge, compact }: {
  title: string; subtitle?: string; theme: ThemeConfig; centered?: boolean; badge?: string; compact?: boolean;
}) {
  return (
    <div style={{ marginBottom: compact ? '1.75rem' : '2.75rem', textAlign: centered ? 'center' : 'left' }}>
      {badge && (
        <span style={{
          display: 'inline-block', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.14em',
          textTransform: 'uppercase', color: theme.primaryColor, marginBottom: '0.85rem',
          padding: '0.35rem 0.85rem', borderRadius: 999,
          background: `${theme.primaryColor}14`, border: `1px solid ${theme.primaryColor}28`,
        }}>{badge}</span>
      )}
      <div style={{
        width: 52, height: 4,
        background: `linear-gradient(90deg, ${theme.primaryColor}, ${theme.secondaryColor})`,
        borderRadius: 2, marginBottom: '1rem',
        ...(centered ? { margin: '0 auto 1rem' } : {}),
      }} />
      <h2 style={{ fontSize: compact ? 'clamp(1.35rem, 5vw, 1.85rem)' : 'clamp(1.65rem, 4vw, 2.35rem)', fontWeight: 800, color: theme.primaryColor, lineHeight: 1.15, letterSpacing: '-0.02em', wordBreak: 'break-word' }}>{title}</h2>
      {subtitle && (
        <p style={{
          opacity: 0.58, marginTop: '0.75rem', fontSize: compact ? '0.92rem' : '1.02rem', lineHeight: 1.7,
          maxWidth: centered ? 540 : 620, ...(centered ? { margin: '0.75rem auto 0' } : {}),
        }}>{subtitle}</p>
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
