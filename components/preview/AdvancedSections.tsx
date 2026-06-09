'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PortfolioSection, ThemeConfig, SocialLinks } from '@/lib/types';
import { SectionHeader, SectionShell, GlassCard, parseSplit } from './SectionUI';
import BlogReadModal from './BlogReadModal';
import { getBlogPostsFromSection } from '@/lib/blog-utils';
import { getTestimonialsFromSection } from '@/lib/testimonial-utils';
import { getTeamMembersFromSection } from '@/lib/team-utils';
import { getPricingPlansFromSection } from '@/lib/pricing-utils';
import { getFAQItemsFromSection } from '@/lib/faq-utils';
import { BlogPostBlock, TestimonialBlock, TeamMemberBlock, PricingPlanBlock, FAQItemBlock } from '@/lib/types';
import { getCustomFields, DynamicFieldsGrid } from './DynamicFields';
import { getMotionVariants, getMotionViewport, getSectionHoverProps } from '@/lib/section-animation';

const CUSTOM_KNOWN_IDS = new Set(['title', 'content', 'subtitle']);

const SERVICE_ICONS = ['🎨', '💻', '📱', '⚡', '🚀', '🛡️', '📊', '🎯'];
const PROJECT_GRADIENTS = (p: string, s: string) => [
  `linear-gradient(135deg, ${p}, ${s})`,
  `linear-gradient(135deg, ${s}88, ${p}66)`,
  `linear-gradient(160deg, ${p}cc, ${s}99)`,
];

const SOCIAL_META: Record<string, { name: string; icon: string; color: string }> = {
  github: { name: 'GitHub', icon: '🐙', color: '#333' },
  linkedin: { name: 'LinkedIn', icon: '💼', color: '#0A66C2' },
  twitter: { name: 'Twitter / X', icon: '𝕏', color: '#000' },
  instagram: { name: 'Instagram', icon: '📸', color: '#E4405F' },
  youtube: { name: 'YouTube', icon: '▶️', color: '#FF0000' },
  dribbble: { name: 'Dribbble', icon: '🏀', color: '#EA4C89' },
  behance: { name: 'Behance', icon: '🎨', color: '#1769FF' },
  website: { name: 'Website', icon: '🌐', color: '#6366f1' },
};

type BaseProps = {
  section: PortfolioSection; sectionTitle: string; theme: ThemeConfig;
  pad: string; altBg: string; variants: any; radius: string; isMobile: boolean;
  fv: (id: string) => string; fa: (id: string) => string[];
};

// ── Card animation helpers ────────────────────────────────────────────────────
import { CardAnimStyle, HeadingAnimStyle } from '@/lib/types';

function getCardVariants(style: CardAnimStyle, i: number) {
  const delay = i * 0.07;
  switch (style) {
    case 'stagger-left':
      return { initial: { opacity: 0, x: 32 }, animate: { opacity: 1, x: 0 }, transition: { delay, duration: 0.45, ease: [0.22, 1, 0.36, 1] as const } };
    case 'stagger-scale':
      return { initial: { opacity: 0, scale: 0.78 }, animate: { opacity: 1, scale: 1 }, transition: { delay, duration: 0.4, type: 'spring' as const, stiffness: 280, damping: 20 } };
    case 'flip-in':
      return { initial: { opacity: 0, rotateY: 35 }, animate: { opacity: 1, rotateY: 0 }, transition: { delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } };
    case 'rubber-band':
      return { initial: { opacity: 0, scale: 0.6 }, animate: { opacity: 1, scale: 1 }, transition: { delay, type: 'spring' as const, stiffness: 400, damping: 14 } };
    case 'none':
      return { initial: { opacity: 1 }, animate: { opacity: 1 }, transition: {} };
    default: // stagger-up
      return { initial: { opacity: 0, y: 18 }, animate: { opacity: 1, y: 0 }, transition: { delay, duration: 0.45, ease: [0.22, 1, 0.36, 1] as const } };
  }
}

function getSectionCardAnim(section: PortfolioSection): CardAnimStyle {
  return (section.style?.animation?.cardAnim as CardAnimStyle) || 'stagger-up';
}

function getSectionHeadingAnim(section: PortfolioSection): HeadingAnimStyle {
  return (section.style?.animation?.headingAnim as HeadingAnimStyle) || 'none';
}

// ── SKILLS ───────────────────────────────────────────────────────────────────
const SKILL_ICONS = ['⚛️', '🔷', '🟢', '🐍', '☁️', '🐳', '🎨', '📱', '🔥', '💡', '🛠️', '🚀', '📊', '🔐', '🌐', '⚡'];

function SkillBar({ name, pct, i, barStyle, barHeight, showPct, theme, radius }: {
  name: string; pct: number; i: number; barStyle: string; barHeight: number;
  showPct: boolean; theme: ThemeConfig; radius: string;
}) {
  const trackH = Math.max(4, barHeight);
  const isSharp = barStyle === 'sharp';
  const br = isSharp ? 0 : 99;

  const fillStyle: React.CSSProperties = barStyle === 'gradient'
    ? { background: `linear-gradient(90deg, ${theme.primaryColor}, ${theme.secondaryColor})` }
    : barStyle === 'glow'
    ? { background: theme.primaryColor, boxShadow: `0 0 10px 2px ${theme.primaryColor}88` }
    : barStyle === 'striped'
    ? {
        background: `repeating-linear-gradient(45deg, ${theme.primaryColor}, ${theme.primaryColor} 6px, ${theme.secondaryColor} 6px, ${theme.secondaryColor} 12px)`,
      }
    : { background: theme.primaryColor };

  return (
    <GlassCard theme={theme} radius={radius} hover>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
        <span style={{ fontWeight: 700, fontSize: '0.92rem' }}>{name}</span>
        {showPct && <span style={{ fontSize: '0.72rem', fontWeight: 700, color: theme.primaryColor, opacity: 0.9 }}>{pct}%</span>}
      </div>
      <div style={{ height: trackH, borderRadius: br, background: `${theme.primaryColor}18`, overflow: 'hidden', position: 'relative' }}>
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${pct}%` }}
          viewport={{ once: true }}
          transition={{ duration: 0.85, delay: i * 0.05, ease: 'easeOut' }}
          style={{ height: '100%', borderRadius: br, ...fillStyle }}
        />
      </div>
    </GlassCard>
  );
}

function SkillPill({ name, pct, i, theme, radius }: { name: string; pct: number; i: number; theme: ThemeConfig; radius: string }) {
  const opacity = 0.4 + (pct / 100) * 0.6;
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay: i * 0.04, type: 'spring', stiffness: 300, damping: 18 }}
      whileHover={{ scale: 1.06, y: -2 }}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '0.45rem',
        padding: '0.45rem 1rem', borderRadius: 999,
        background: `${theme.primaryColor}${Math.round(opacity * 22).toString(16).padStart(2, '0')}`,
        border: `1.5px solid ${theme.primaryColor}${Math.round(opacity * 55).toString(16).padStart(2, '0')}`,
        fontSize: '0.85rem', fontWeight: 600, cursor: 'default',
      }}
    >
      {name}
      <span style={{ fontSize: '0.68rem', color: theme.primaryColor, fontWeight: 700, opacity: 0.8 }}>{pct}%</span>
    </motion.div>
  );
}

function SkillCardIcon({ name, pct, i, theme, radius }: { name: string; pct: number; i: number; theme: ThemeConfig; radius: string }) {
  const icon = SKILL_ICONS[i % SKILL_ICONS.length];
  return (
    <GlassCard theme={theme} radius={radius} hover style={{ textAlign: 'center', padding: '1.5rem 1rem' }}>
      <motion.div
        initial={{ scale: 0, rotate: -15 }}
        whileInView={{ scale: 1, rotate: 0 }}
        viewport={{ once: true }}
        transition={{ delay: i * 0.06, type: 'spring', stiffness: 280, damping: 18 }}
        style={{
          width: 52, height: 52, borderRadius: radius, margin: '0 auto 0.85rem',
          background: `linear-gradient(135deg, ${theme.primaryColor}28, ${theme.secondaryColor}18)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem',
        }}>{icon}</motion.div>
      <p style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.5rem' }}>{name}</p>
      <div style={{ height: 4, borderRadius: 99, background: `${theme.primaryColor}20`, overflow: 'hidden' }}>
        <motion.div initial={{ width: 0 }} whileInView={{ width: `${pct}%` }} viewport={{ once: true }}
          transition={{ duration: 0.7, delay: i * 0.06 + 0.2, ease: 'easeOut' }}
          style={{ height: '100%', borderRadius: 99, background: `linear-gradient(90deg, ${theme.primaryColor}, ${theme.secondaryColor})` }} />
      </div>
      <p style={{ fontSize: '0.7rem', color: theme.primaryColor, fontWeight: 700, marginTop: '0.35rem', opacity: 0.8 }}>{pct}%</p>
    </GlassCard>
  );
}

function SkillRadial({ name, pct, i, theme }: { name: string; pct: number; i: number; theme: ThemeConfig }) {
  const r = 28;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: i * 0.06 }}
      style={{ textAlign: 'center', padding: '1rem 0.5rem' }}
    >
      <div style={{ position: 'relative', width: 72, height: 72, margin: '0 auto 0.6rem' }}>
        <svg width="72" height="72" viewBox="0 0 72 72" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="36" cy="36" r={r} fill="none" stroke={`${theme.primaryColor}18`} strokeWidth="6" />
          <motion.circle
            cx="36" cy="36" r={r} fill="none"
            stroke={theme.primaryColor} strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circ}
            initial={{ strokeDashoffset: circ }}
            whileInView={{ strokeDashoffset: circ - dash }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, delay: i * 0.06, ease: 'easeOut' }}
          />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: theme.primaryColor }}>{pct}%</span>
        </div>
      </div>
      <p style={{ fontWeight: 600, fontSize: '0.8rem', opacity: 0.9 }}>{name}</p>
    </motion.div>
  );
}

function SkillMinimalList({ name, pct, i, theme }: { name: string; pct: number; i: number; theme: ThemeConfig }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay: i * 0.04 }}
      style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.65rem 0', borderBottom: `1px solid ${theme.primaryColor}12` }}
    >
      <div style={{ width: 8, height: 8, borderRadius: '50%', background: theme.primaryColor, flexShrink: 0, opacity: 0.8 }} />
      <span style={{ flex: 1, fontWeight: 600, fontSize: '0.92rem' }}>{name}</span>
      <div style={{ width: 120, height: 4, borderRadius: 99, background: `${theme.primaryColor}15`, overflow: 'hidden', flexShrink: 0 }}>
        <motion.div initial={{ width: 0 }} whileInView={{ width: `${pct}%` }} viewport={{ once: true }}
          transition={{ duration: 0.7, delay: i * 0.04 + 0.1, ease: 'easeOut' }}
          style={{ height: '100%', borderRadius: 99, background: `linear-gradient(90deg, ${theme.primaryColor}, ${theme.secondaryColor})` }} />
      </div>
      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: theme.primaryColor, width: 32, textAlign: 'right', flexShrink: 0 }}>{pct}%</span>
    </motion.div>
  );
}

export function SkillsSection({ section, sectionTitle, theme, pad, altBg, variants, radius, isMobile, fv, fa }: BaseProps) {
  const items = fa('skills') || fa('Skills');
  const subtitle = fv('subtitle');
  const cardAnim = getSectionCardAnim(section);
  const headingAnim = getSectionHeadingAnim(section);
  const layout = fv('skillsLayout') || 'bars';
  const barStyle = fv('skillsBarStyle') || 'gradient';
  const barHeight = parseInt(fv('skillsBarHeight') || '6') || 6;
  const showPct = (fv('skillsShowPercent') || 'yes') !== 'no';

  const parsed = items.map((skill, i) => {
    const [name, levelStr] = parseSplit(skill, ':');
    const pct = levelStr ? Math.min(100, parseInt(levelStr) || 85) : 78 + (i % 5) * 4;
    return { name, pct };
  });

  const renderSkill = (name: string, pct: number, i: number) => {
    const cv = getCardVariants(cardAnim, i);
    switch (layout) {
      case 'pills':
        return <SkillPill key={i} name={name} pct={pct} i={i} theme={theme} radius={radius} />;
      case 'cards-icon':
        return (
          <motion.div key={i} initial={cv.initial} whileInView={cv.animate} viewport={{ once: true }} transition={cv.transition}>
            <SkillCardIcon name={name} pct={pct} i={i} theme={theme} radius={radius} />
          </motion.div>
        );
      case 'radial':
        return <SkillRadial key={i} name={name} pct={pct} i={i} theme={theme} />;
      case 'minimal-list':
        return <SkillMinimalList key={i} name={name} pct={pct} i={i} theme={theme} />;
      case 'tags':
        return (
          <motion.span key={i}
            initial={{ opacity: 0, scale: 0.85 }} whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }} transition={{ delay: i * 0.03, type: 'spring', stiffness: 260, damping: 18 }}
            whileHover={{ scale: 1.08, y: -2 }}
            style={{
              display: 'inline-block', padding: '0.4rem 1rem', borderRadius: 999,
              background: `${theme.primaryColor}12`, border: `1px solid ${theme.primaryColor}28`,
              fontSize: '0.85rem', fontWeight: 600, cursor: 'default',
            }}>
            {name}
          </motion.span>
        );
      default: // bars
        return (
          <motion.div key={i} initial={cv.initial} whileInView={cv.animate} viewport={{ once: true }} transition={cv.transition}>
            <SkillBar name={name} pct={pct} i={i} barStyle={barStyle} barHeight={barHeight} showPct={showPct} theme={theme} radius={radius} />
          </motion.div>
        );
    }
  };

  const isPills = layout === 'pills' || layout === 'tags';
  const isRadial = layout === 'radial';
  const isMinimalList = layout === 'minimal-list';

  const containerStyle: React.CSSProperties = isPills
    ? { display: 'flex', flexWrap: 'wrap', gap: '0.65rem' }
    : isRadial
    ? { display: 'grid', gridTemplateColumns: isMobile ? 'repeat(3, 1fr)' : 'repeat(auto-fill, minmax(96px, 1fr))', gap: '0.5rem' }
    : isMinimalList
    ? { display: 'flex', flexDirection: 'column', maxWidth: 640, margin: '0 auto' }
    : { display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' };

  return (
    <SectionShell id={section.id} pad={pad} altBg={`${theme.primaryColor}08`} section={section} theme={theme}>
      <SectionHeader title={sectionTitle} subtitle={subtitle || 'Technologies and tools I work with daily'} compact={isMobile} theme={theme} badge="Expertise" headingAnim={headingAnim} />
      <div style={containerStyle}>
        {parsed.map(({ name, pct }, i) => renderSkill(name, pct, i))}
      </div>
    </SectionShell>
  );
}

// ── EXPERIENCE ───────────────────────────────────────────────────────────────
export function ExperienceSection({ section, sectionTitle, theme, pad, altBg, variants, radius, isMobile, fv, fa }: BaseProps) {
  const jobs = fa('jobs');
  const subtitle = fv('subtitle');
  const cardAnim = getSectionCardAnim(section);
  const headingAnim = getSectionHeadingAnim(section);
  return (
    <SectionShell id={section.id} pad={pad} altBg={altBg} section={section} theme={theme}>
      <SectionHeader title={sectionTitle} subtitle={subtitle || 'My professional journey'} compact={isMobile} theme={theme} badge="Career" headingAnim={headingAnim} />
      <div style={{ position: 'relative', maxWidth: 800, margin: '0 auto' }}>
        <div style={{ position: 'absolute', left: isMobile ? 15 : 23, top: 8, bottom: 8, width: 2, background: `linear-gradient(180deg, ${theme.primaryColor}, ${theme.secondaryColor}44)` }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {jobs.map((job, i) => {
            const roleMatch = job.match(/^(.+?)\s*@\s*(.+?)\s*\((.+)\)$/);
            const [role, company, period] = roleMatch ? [roleMatch[1], roleMatch[2], roleMatch[3]] : [job, '', ''];
            const cv = getCardVariants(cardAnim, i);
            return (
              <motion.div key={i} initial={cv.initial} whileInView={cv.animate} viewport={{ once: true }} transition={cv.transition}
                style={{ display: 'flex', gap: '1.25rem', paddingLeft: isMobile ? '2.5rem' : '3.5rem', position: 'relative' }}>
                <div style={{
                  position: 'absolute', left: isMobile ? 8 : 16, top: 20, width: 16, height: 16, borderRadius: '50%',
                  background: theme.primaryColor, border: `3px solid ${theme.backgroundColor}`,
                  boxShadow: `0 0 0 3px ${theme.primaryColor}44`,
                }} />
                <GlassCard theme={theme} radius={radius} hover style={{ flex: 1 }}>
                  {period && <span style={{ fontSize: '0.72rem', fontWeight: 700, color: theme.primaryColor, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{period}</span>}
                  <p style={{ fontWeight: 800, fontSize: '1.05rem', marginTop: period ? '0.35rem' : 0, lineHeight: 1.3 }}>{role || job}</p>
                  {company && <p style={{ opacity: 0.55, fontSize: '0.88rem', marginTop: '0.3rem' }}>{company}</p>}
                </GlassCard>
              </motion.div>
            );
          })}
        </div>
      </div>
    </SectionShell>
  );
}

// ── PROJECTS ─────────────────────────────────────────────────────────────────
export function ProjectsSection({ section, sectionTitle, theme, pad, altBg, variants, radius, isMobile, fv, fa }: BaseProps) {
  const projects = fa('projects');
  const subtitle = fv('subtitle');
  const layout = fv('projectsLayout') || 'cards';
  const gradients = PROJECT_GRADIENTS(theme.primaryColor, theme.secondaryColor);
  const cardAnim = getSectionCardAnim(section);
  const headingAnim = getSectionHeadingAnim(section);
  return (
    <SectionShell id={section.id} pad={pad} altBg={altBg} section={section} theme={theme}>
      <SectionHeader title={sectionTitle} subtitle={subtitle || 'Selected work and case studies'} compact={isMobile} theme={theme} centered badge="Portfolio" headingAnim={headingAnim} />
      <div style={{
        display: layout === 'list' ? 'flex' : 'grid',
        flexDirection: layout === 'list' ? 'column' : undefined,
        gridTemplateColumns: layout === 'list' ? undefined : (isMobile ? '1fr' : 'repeat(auto-fill, minmax(300px, 1fr))'),
        gap: '1.5rem',
      }}>
        {projects.map((proj, i) => {
          const [name, ...desc] = proj.split(' - ');
          const isFeatured = layout === 'cards' && i === 0 && projects.length > 2 && !isMobile;
          const cv = getCardVariants(cardAnim, i);
          return (
            <motion.div key={i} initial={cv.initial} whileInView={cv.animate} viewport={{ once: true }} transition={cv.transition}
              style={{ gridColumn: isFeatured ? 'span 2' : undefined }}>
              <div style={{
                borderRadius: radius, overflow: 'hidden', border: `1px solid ${theme.primaryColor}22`,
                background: `${theme.primaryColor}06`, transition: 'transform 0.25s, box-shadow 0.25s',
                display: layout === 'list' ? 'flex' : 'block', flexDirection: layout === 'list' ? (isMobile ? 'column' : 'row') : undefined,
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = `0 20px 50px ${theme.primaryColor}22`; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
                <div style={{
                  height: layout === 'list' ? (isMobile ? 120 : 'auto') : (isFeatured ? 160 : 120),
                  minWidth: layout === 'list' && !isMobile ? 200 : undefined,
                  flex: layout === 'list' && !isMobile ? '0 0 200px' : undefined,
                  background: gradients[i % gradients.length], display: 'flex', alignItems: 'flex-end', padding: '1.25rem', position: 'relative',
                }}>
                  <span style={{ fontSize: '3rem', fontWeight: 900, opacity: 0.15, position: 'absolute', right: 16, top: 8 }}>{String(i + 1).padStart(2, '0')}</span>
                  <span style={{ fontSize: '1.75rem' }}>🚀</span>
                </div>
                <div style={{ padding: '1.5rem', flex: layout === 'list' ? 1 : undefined }}>
                  <p style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: '0.5rem' }}>{name || proj}</p>
                  {desc.length > 0 && <p style={{ opacity: 0.62, lineHeight: 1.7, fontSize: '0.9rem' }}>{desc.join(' - ')}</p>}
                  <div style={{ marginTop: '1rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: theme.primaryColor, fontSize: '0.82rem', fontWeight: 600 }}>
                    View Project →
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </SectionShell>
  );
}

// ── SERVICES ─────────────────────────────────────────────────────────────────
export function ServicesSection({ section, sectionTitle, theme, pad, altBg, variants, radius, isMobile, fv, fa }: BaseProps) {
  const services = fa('services');
  const subtitle = fv('subtitle');
  const layout = fv('servicesLayout') || 'cards';
  const cardAnim = getSectionCardAnim(section);
  const headingAnim = getSectionHeadingAnim(section);
  return (
    <SectionShell id={section.id} pad={pad} altBg={altBg} section={section} theme={theme}>
      <SectionHeader title={sectionTitle} subtitle={subtitle || 'What I can do for you'} compact={isMobile} theme={theme} centered badge="Services" headingAnim={headingAnim} />
      <div style={{
        display: layout === 'list' ? 'flex' : 'grid',
        flexDirection: layout === 'list' ? 'column' : undefined,
        gridTemplateColumns: layout === 'list' ? undefined : (isMobile ? '1fr' : 'repeat(auto-fill, minmax(240px, 1fr))'),
        gap: '1.25rem',
      }}>
        {services.map((svc, i) => {
          const [title, desc] = parseSplit(svc, ' - ');
          const cv = getCardVariants(cardAnim, i);
          const iconEl = (
            <div style={{
              width: 56, height: 56, borderRadius: radius, margin: layout === 'list' ? 0 : '0 auto 1.1rem',
              background: `linear-gradient(135deg, ${theme.primaryColor}28, ${theme.secondaryColor}18)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem', flexShrink: 0,
            }}>{SERVICE_ICONS[i % SERVICE_ICONS.length]}</div>
          );
          return (
            <motion.div key={i} initial={cv.initial} whileInView={cv.animate} viewport={{ once: true }} transition={cv.transition}>
              <GlassCard theme={theme} radius={radius} hover style={{
                textAlign: layout === 'list' ? 'left' : 'center',
                padding: layout === 'list' ? '1.25rem 1.5rem' : '2rem 1.5rem',
                height: '100%', display: layout === 'list' ? 'flex' : 'block', alignItems: 'center', gap: '1.25rem',
              }}>
                {iconEl}
                <div style={{ flex: layout === 'list' ? 1 : undefined }}>
                  <p style={{ fontWeight: 800, fontSize: '1rem', marginBottom: desc ? '0.5rem' : 0 }}>{title || svc}</p>
                  {desc && <p style={{ opacity: 0.58, fontSize: '0.86rem', lineHeight: 1.65 }}>{desc}</p>}
                </div>
              </GlassCard>
            </motion.div>
          );
        })}
      </div>
    </SectionShell>
  );
}

// ── BLOG ─────────────────────────────────────────────────────────────────────
function BlogPostCard({ post, theme, radius, isMobile, onRead }: {
  post: BlogPostBlock; theme: ThemeConfig; radius: string; isMobile: boolean; onRead: () => void;
}) {
  const tags = post.list.filter(t => t.trim()).slice(0, 3);
  return (
    <GlassCard theme={theme} radius={radius} hover style={{ overflow: 'hidden', padding: 0 }}>
      <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row' }}>
        {post.image ? (
          <div style={{ flexShrink: 0, width: isMobile ? '100%' : 200, height: isMobile ? 160 : 'auto', minHeight: isMobile ? undefined : 160 }}>
            <img src={post.image} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          </div>
        ) : (
          <div style={{
            flexShrink: 0, width: isMobile ? '100%' : 120, height: isMobile ? 80 : 'auto', minHeight: isMobile ? undefined : 160,
            background: `linear-gradient(135deg, ${theme.primaryColor}28, ${theme.secondaryColor}18)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem',
          }}>📝</div>
        )}
        <div style={{ flex: 1, padding: '1.25rem 1.35rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
            {post.date && (
              <span style={{ fontSize: '0.68rem', fontWeight: 700, color: theme.primaryColor, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{post.date}</span>
            )}
            {tags.map((tag, i) => (
              <span key={i} style={{
                fontSize: '0.62rem', fontWeight: 600, padding: '0.15rem 0.5rem', borderRadius: 999,
                background: `${theme.primaryColor}12`, color: theme.primaryColor, border: `1px solid ${theme.primaryColor}22`,
              }}>{tag}</span>
            ))}
          </div>
          <p style={{ fontWeight: 800, fontSize: '1.08rem', lineHeight: 1.3 }}>{post.title || 'Untitled'}</p>
          {post.summary && (
            <p style={{
              opacity: 0.58, lineHeight: 1.6, fontSize: '0.88rem', flex: 1,
              display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
            }}>{post.summary}</p>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.35rem', flexWrap: 'wrap' }}>
            <button type="button" onClick={onRead}
              style={{
                color: theme.primaryColor, fontWeight: 700, fontSize: '0.82rem',
                background: `${theme.primaryColor}14`, border: `1px solid ${theme.primaryColor}33`,
                padding: '0.45rem 0.9rem', borderRadius: radius, cursor: 'pointer',
              }}>Read article →</button>
            {post.link && (
              <a href={post.link} target="_blank" rel="noopener noreferrer"
                style={{ fontSize: '0.78rem', color: theme.textColor, opacity: 0.55, textDecoration: 'none', fontWeight: 600 }}>
                {post.linkLabel || 'External link'} ↗
              </a>
            )}
          </div>
        </div>
      </div>
    </GlassCard>
  );
}

export function BlogSection({ section, sectionTitle, theme, pad, altBg, variants, radius, isMobile, fv }: BaseProps) {
  const posts = getBlogPostsFromSection(section);
  const subtitle = fv('subtitle');
  const [activePost, setActivePost] = useState<BlogPostBlock | null>(null);
  const cardAnim = getSectionCardAnim(section);
  const headingAnim = getSectionHeadingAnim(section);

  return (
    <SectionShell id={section.id} pad={pad} altBg={altBg} section={section} theme={theme}>
      <SectionHeader title={sectionTitle} subtitle={subtitle || 'Thoughts, tutorials, and updates'} compact={isMobile} theme={theme} badge="Blog" headingAnim={headingAnim} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {posts.map((post, i) => {
          const cv = getCardVariants(cardAnim, i);
          return (
            <motion.div key={post.id} initial={cv.initial} whileInView={cv.animate} viewport={{ once: true }} transition={cv.transition}>
              <BlogPostCard post={post} theme={theme} radius={radius} isMobile={isMobile} onRead={() => setActivePost(post)} />
            </motion.div>
          );
        })}
      </div>
      <BlogReadModal post={activePost} theme={theme} radius={radius} isMobile={isMobile} onClose={() => setActivePost(null)} />
    </SectionShell>
  );
}

// ── GALLERY ──────────────────────────────────────────────────────────────────
export function GallerySection({ section, sectionTitle, theme, pad, altBg, variants, radius, isMobile, fv, fa }: BaseProps) {
  const images = fa('images');
  const subtitle = fv('subtitle');
  const layout = fv('galleryLayout') || 'masonry';
  if (!images.length) {
    return (
      <SectionShell id={section.id} pad={pad} altBg={altBg} section={section} theme={theme}>
        <SectionHeader title={sectionTitle} compact={isMobile} theme={theme} centered badge="Gallery" />
        <div style={{ padding: '4rem 2rem', textAlign: 'center', border: `2px dashed ${theme.primaryColor}33`, borderRadius: radius, opacity: 0.5 }}>
          <p style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🖼️</p>
          <p>Upload images in the Gallery section editor</p>
        </div>
      </SectionShell>
    );
  }
  if (layout === 'carousel') {
    return (
      <SectionShell id={section.id} pad={pad} altBg={altBg} section={section} theme={theme}>
        <SectionHeader title={sectionTitle} subtitle={subtitle || 'A curated collection of my best work'} compact={isMobile} theme={theme} centered badge="Gallery" />
        <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '0.5rem', scrollSnapType: 'x mandatory' }}>
          {images.map((src, i) => (
            <motion.div key={i} initial={{ opacity: 0, scale: 0.94 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.04 }}
              style={{ flex: '0 0 auto', width: isMobile ? '75vw' : 320, scrollSnapAlign: 'start', borderRadius: radius, overflow: 'hidden', aspectRatio: '4/3' }}>
              <img src={src} alt={`Gallery ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            </motion.div>
          ))}
        </div>
      </SectionShell>
    );
  }

  const isGrid = layout === 'grid';
  return (
    <SectionShell id={section.id} pad={pad} altBg={altBg} section={section} theme={theme}>
      <SectionHeader title={sectionTitle} subtitle={subtitle || 'A curated collection of my best work'} compact={isMobile} theme={theme} centered badge="Gallery" />
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : (isGrid ? 'repeat(3, 1fr)' : 'repeat(4, 1fr)'),
        gridAutoRows: isGrid ? (isMobile ? '160px' : '200px') : (isMobile ? '140px' : '180px'),
        gap: '0.85rem',
      }}>
        {images.map((src, i) => {
          const isHero = !isGrid && i === 0 && images.length >= 3;
          return (
            <motion.div key={i} initial={{ opacity: 0, scale: 0.94 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.04 }}
              style={{
                borderRadius: radius, overflow: 'hidden', position: 'relative', background: `${theme.primaryColor}12`,
                gridColumn: isHero && !isMobile ? 'span 2' : undefined,
                gridRow: isHero && !isMobile ? 'span 2' : undefined,
              }}>
              <img src={src} alt={`Gallery ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.45s' }}
                onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.08)')}
                onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 50%, rgba(0,0,0,0.45) 100%)', opacity: 0, transition: 'opacity 0.3s' }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '0')} />
            </motion.div>
          );
        })}
      </div>
    </SectionShell>
  );
}

// ── VIDEOS ───────────────────────────────────────────────────────────────────
function videoEmbed(url: string) {
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}?rel=0`;
  const vm = url.match(/vimeo\.com\/(\d+)/);
  if (vm) return `https://player.vimeo.com/video/${vm[1]}`;
  return url;
}

export function VideosSection({ section, sectionTitle, theme, pad, altBg, variants, radius, isMobile, fv, fa }: BaseProps) {
  const items = fa('videos') || fa('Video');
  const subtitle = fv('subtitle');
  if (!items.length) {
    return (
      <SectionShell id={section.id} pad={pad} altBg={altBg} section={section} theme={theme}>
        <SectionHeader title={sectionTitle} compact={isMobile} theme={theme} centered badge="Videos" />
        <div style={{ padding: '4rem 2rem', textAlign: 'center', border: `2px dashed ${theme.primaryColor}33`, borderRadius: radius, opacity: 0.5 }}>
          <p style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🎬</p>
          <p>Add YouTube or Vimeo URLs in the Videos section editor</p>
        </div>
      </SectionShell>
    );
  }
  const [featured, ...rest] = items;
  return (
    <SectionShell id={section.id} pad={pad} altBg={altBg} section={section} theme={theme}>
      <SectionHeader title={sectionTitle} subtitle={subtitle || 'Watch my latest work and creative projects'} compact={isMobile} theme={theme} centered badge="Videos" />
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : rest.length ? '1.6fr 1fr' : '1fr', gap: '1.25rem' }}>
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          style={{ borderRadius: radius, overflow: 'hidden', background: '#000', boxShadow: `0 16px 48px ${theme.primaryColor}22` }}>
          <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
            <iframe src={videoEmbed(featured)} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }} allowFullScreen title="featured-video" />
          </div>
        </motion.div>
        {rest.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {rest.map((url, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: 12 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}
                style={{ borderRadius: radius, overflow: 'hidden', flex: 1, background: '#000', border: `1px solid ${theme.primaryColor}22` }}>
                <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
                  <iframe src={videoEmbed(url)} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }} allowFullScreen title={`video-${i}`} />
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </SectionShell>
  );
}

// ── SOCIAL ───────────────────────────────────────────────────────────────────
export function SocialSection({ section, sectionTitle, theme, pad, altBg, variants, radius, isMobile, fv }: BaseProps) {
  const subtitle = fv('subtitle');
  const links = section.fields
    .filter(f => f.type === 'url' && f.value)
    .map(f => ({ key: f.id, url: f.value as string, label: f.label }));
  return (
    <SectionShell id={section.id} pad={pad} altBg={`${theme.primaryColor}08`} section={section} theme={theme}>
      <SectionHeader title={sectionTitle} subtitle={subtitle || 'Connect with me across platforms'} compact={isMobile} theme={theme} centered badge="Social" />
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : `repeat(${Math.min(4, links.length || 1)}, 1fr)`, gap: '1rem', maxWidth: 720, margin: '0 auto' }}>
        {links.map(({ key, url, label }, i) => {
          const meta = SOCIAL_META[key] || { name: label, icon: '🔗', color: theme.primaryColor };
          return (
            <motion.a key={key} href={url} target="_blank" rel="noopener noreferrer"
              initial={{ opacity: 0, scale: 0.92 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.65rem',
                padding: '1.5rem 1rem', borderRadius: radius, textDecoration: 'none', color: 'inherit',
                background: `linear-gradient(135deg, ${theme.primaryColor}12, ${theme.secondaryColor}08)`,
                border: `1px solid ${theme.primaryColor}28`, transition: 'transform 0.2s, border-color 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = theme.primaryColor; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = `${theme.primaryColor}28`; }}>
              <span style={{ fontSize: '1.75rem' }}>{meta.icon}</span>
              <span style={{ fontWeight: 700, fontSize: '0.88rem' }}>{meta.name}</span>
              <span style={{ fontSize: '0.72rem', color: theme.primaryColor, fontWeight: 600 }}>Follow →</span>
            </motion.a>
          );
        })}
      </div>
    </SectionShell>
  );
}

// ── TESTIMONIALS ─────────────────────────────────────────────────────────────
function TestimonialCard({ item, theme, radius }: { item: TestimonialBlock; theme: ThemeConfig; radius: string }) {
  const stars = Math.min(5, Math.max(0, item.rating || 0));
  const showStars = stars > 0;
  const roleLine = [item.role, item.company].filter(Boolean).join(' · ');
  const initial = (item.author || '?').charAt(0).toUpperCase();

  return (
    <GlassCard theme={theme} radius={radius} hover style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {showStars && (
        <div style={{ color: theme.primaryColor, fontSize: '0.95rem', marginBottom: '0.75rem', letterSpacing: 1 }}>
          {'★'.repeat(stars)}{'☆'.repeat(5 - stars)}
        </div>
      )}
      {item.quote && (
        <p style={{ opacity: 0.82, lineHeight: 1.8, fontStyle: 'italic', fontSize: '0.95rem', flex: 1 }}>
          "{item.quote}"
        </p>
      )}
      {(item.author || item.image) && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '1.25rem',
          paddingTop: '1.1rem', borderTop: `1px solid ${theme.primaryColor}18`,
        }}>
          {item.image ? (
            <img src={item.image} alt={item.author} style={{ width: 42, height: 42, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
          ) : item.author ? (
            <div style={{
              width: 42, height: 42, borderRadius: '50%', flexShrink: 0,
              background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#fff', fontSize: '0.9rem',
            }}>{initial}</div>
          ) : null}
          {(item.author || roleLine) && (
            <div>
              {item.author && <p style={{ fontWeight: 700, fontSize: '0.9rem' }}>{item.author}</p>}
              {roleLine && <p style={{ opacity: 0.5, fontSize: '0.78rem', marginTop: item.author ? 2 : 0 }}>{roleLine}</p>}
            </div>
          )}
        </div>
      )}
    </GlassCard>
  );
}

export function TestimonialsSection({ section, sectionTitle, theme, pad, altBg, variants, radius, isMobile, fv }: BaseProps) {
  const items = getTestimonialsFromSection(section).filter(t => t.quote?.trim() || t.author?.trim());
  const subtitle = fv('subtitle');
  const cardAnim = getSectionCardAnim(section);
  const headingAnim = getSectionHeadingAnim(section);
  return (
    <SectionShell id={section.id} pad={pad} altBg={altBg} section={section} theme={theme}>
      <SectionHeader title={sectionTitle} subtitle={subtitle || undefined} compact={isMobile} theme={theme} centered badge="Reviews" headingAnim={headingAnim} />
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
        {items.map((item, i) => {
          const cv = getCardVariants(cardAnim, i);
          return (
            <motion.div key={item.id} initial={cv.initial} whileInView={cv.animate} viewport={{ once: true }} transition={cv.transition}>
              <TestimonialCard item={item} theme={theme} radius={radius} />
            </motion.div>
          );
        })}
      </div>
    </SectionShell>
  );
}

// ── STATS ────────────────────────────────────────────────────────────────────
export function StatsSection({ section, sectionTitle, theme, pad, fv, fa, isMobile }: BaseProps) {
  const items = fa('stats') || fa('Stats');
  const subtitle = fv('subtitle');
  const cols = Math.min(items.length, isMobile ? 2 : 4);
  const variants = getMotionVariants(section, theme);
  const viewport = getMotionViewport(section, theme);
  const whileHover = getSectionHoverProps(section);
  const triggerLoad = section.style?.animation?.custom && section.style.animation.trigger === 'load';
  const cardAnim = getSectionCardAnim(section);
  const headingAnim = getSectionHeadingAnim(section);
  return (
    <motion.section id={section.id} initial="hidden" animate={triggerLoad ? 'visible' : undefined} whileInView={triggerLoad ? undefined : 'visible'} viewport={viewport} variants={variants} whileHover={whileHover}
      style={{
        padding: `${pad} clamp(1rem, 5vw, 2.5rem)`,
        background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor})`,
        position: 'relative', overflow: 'hidden',
      }}>
      <div style={{ position: 'absolute', inset: 0, opacity: 0.08, backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
      <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative' }}>
        <SectionHeader title={sectionTitle} subtitle={subtitle} compact={isMobile} theme={{ ...theme, primaryColor: '#fff', textColor: '#fff' }} centered badge="Impact" headingAnim={headingAnim} />
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: '1.25rem' }}>
          {items.map((stat, i) => {
            const [num, ...rest] = stat.split(' ');
            const cv = getCardVariants(cardAnim, i);
            return (
              <motion.div key={i} initial={cv.initial} whileInView={cv.animate} viewport={{ once: true }} transition={cv.transition}
                style={{
                  textAlign: 'center', padding: '1.75rem 1rem', borderRadius: 16,
                  background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)',
                  backdropFilter: 'blur(8px)',
                }}>
                <div style={{ fontSize: 'clamp(2rem, 5vw, 2.75rem)', fontWeight: 900, color: '#fff', lineHeight: 1 }}>{num}</div>
                <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.88rem', marginTop: '0.5rem', fontWeight: 500 }}>{rest.join(' ')}</div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.section>
  );
}

// ── TEAM ─────────────────────────────────────────────────────────────────────
const MEMBER_SOCIAL_META: { key: keyof Pick<TeamMemberBlock, 'linkedin' | 'twitter' | 'email'>; icon: string; label: string }[] = [
  { key: 'linkedin', icon: '💼', label: 'LinkedIn' },
  { key: 'twitter', icon: '𝕏', label: 'Twitter' },
  { key: 'email', icon: '✉️', label: 'Email' },
];

function TeamMemberCard({ member, theme, radius, isMobile }: { member: TeamMemberBlock; theme: ThemeConfig; radius: string; isMobile: boolean }) {
  const initial = (member.name || '?').charAt(0).toUpperCase();
  const socials = MEMBER_SOCIAL_META.filter(s => member[s.key]?.trim());

  return (
    <GlassCard theme={theme} radius={radius} hover style={{ textAlign: 'center', padding: isMobile ? '1.5rem 1rem' : '2rem 1.5rem', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {member.image ? (
        <img src={member.image} alt={member.name}
          style={{
            width: isMobile ? 80 : 96, height: isMobile ? 80 : 96, borderRadius: '50%', objectFit: 'cover', marginBottom: '1.1rem',
            border: `3px solid ${theme.primaryColor}44`, boxShadow: `0 8px 28px ${theme.primaryColor}35`,
          }} />
      ) : (
        <div style={{
          width: isMobile ? 80 : 96, height: isMobile ? 80 : 96, borderRadius: '50%', marginBottom: '1.1rem',
          background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor})`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 900, fontSize: isMobile ? '1.65rem' : '2rem', color: '#fff',
          boxShadow: `0 8px 28px ${theme.primaryColor}40`,
        }}>{initial}</div>
      )}
      {member.name && <p style={{ fontWeight: 800, fontSize: isMobile ? '0.98rem' : '1.05rem', wordBreak: 'break-word' }}>{member.name}</p>}
      {member.role && (
        <p style={{ opacity: 0.55, fontSize: '0.86rem', marginTop: '0.35rem', color: theme.primaryColor, fontWeight: 600 }}>{member.role}</p>
      )}
      {member.bio && (
        <p style={{ opacity: 0.65, fontSize: '0.82rem', marginTop: '0.75rem', lineHeight: 1.65, flex: 1 }}>{member.bio}</p>
      )}
      {socials.length > 0 && (
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          {socials.map(s => {
            const href = s.key === 'email' ? `mailto:${member.email}` : member[s.key];
            return (
              <a key={s.key} href={href} target={s.key === 'email' ? undefined : '_blank'} rel="noopener noreferrer"
                title={s.label}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  fontSize: '0.72rem', padding: '0.35rem 0.65rem', borderRadius: 999,
                  background: `${theme.primaryColor}12`, color: theme.primaryColor,
                  textDecoration: 'none', fontWeight: 600,
                }}>
                <span>{s.icon}</span> {s.label}
              </a>
            );
          })}
        </div>
      )}
    </GlassCard>
  );
}

export function TeamSection({ section, sectionTitle, theme, pad, altBg, variants, radius, isMobile, fv }: BaseProps) {
  const members = getTeamMembersFromSection(section).filter(m => m.name?.trim());
  const subtitle = fv('subtitle');
  const cardAnim = getSectionCardAnim(section);
  const headingAnim = getSectionHeadingAnim(section);
  return (
    <SectionShell id={section.id} pad={pad} altBg={altBg} section={section} theme={theme}>
      <SectionHeader title={sectionTitle} subtitle={subtitle || 'The people behind the work'} compact={isMobile} theme={theme} centered badge="Team" headingAnim={headingAnim} />
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.25rem' }}>
        {members.map((member, i) => {
          const cv = getCardVariants(cardAnim, i);
          return (
            <motion.div key={member.id} initial={cv.initial} whileInView={cv.animate} viewport={{ once: true }} transition={cv.transition}>
              <TeamMemberCard member={member} theme={theme} radius={radius} isMobile={isMobile} />
            </motion.div>
          );
        })}
      </div>
    </SectionShell>
  );
}

// ── PRICING ──────────────────────────────────────────────────────────────────
function PricingPlanCard({ plan, theme, radius, isMobile }: { plan: PricingPlanBlock; theme: ThemeConfig; radius: string; isMobile: boolean }) {
  const features = (plan.features || []).filter(f => f?.trim());
  const showCta = plan.ctaText?.trim();
  const ctaStyle: React.CSSProperties = {
    width: '100%', padding: '0.85rem', borderRadius: radius, cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem',
    display: 'block', textAlign: 'center', textDecoration: 'none',
    background: plan.featured ? theme.primaryColor : 'transparent',
    color: plan.featured ? '#fff' : theme.primaryColor,
    border: plan.featured ? 'none' : `2px solid ${theme.primaryColor}`,
  };

  return (
    <div style={{
      padding: isMobile ? '1.5rem 1.15rem' : '2rem 1.75rem', borderRadius: radius, position: 'relative', display: 'flex', flexDirection: 'column', height: '100%',
      border: `${plan.featured ? 2 : 1}px solid ${plan.featured ? theme.primaryColor : `${theme.primaryColor}28`}`,
      background: plan.featured ? `linear-gradient(180deg, ${theme.primaryColor}18, ${theme.primaryColor}06)` : `${theme.primaryColor}06`,
      boxShadow: plan.featured ? `0 20px 50px ${theme.primaryColor}25` : 'none',
      transform: plan.featured && !isMobile ? 'scale(1.03)' : undefined,
    }}>
      {plan.featured && (
        <div style={{ position: 'absolute', top: -13, left: '50%', transform: 'translateX(-50%)', background: `linear-gradient(90deg, ${theme.primaryColor}, ${theme.secondaryColor})`, color: '#fff', fontSize: '0.68rem', fontWeight: 800, padding: '4px 14px', borderRadius: 20, letterSpacing: '0.06em' }}>MOST POPULAR</div>
      )}
      {plan.name && <p style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: '0.35rem' }}>{plan.name}</p>}
      {plan.description && <p style={{ opacity: 0.55, fontSize: '0.82rem', marginBottom: '0.75rem' }}>{plan.description}</p>}
      {(plan.price || plan.period) && (
        <p style={{ fontSize: isMobile ? '1.85rem' : '2.25rem', fontWeight: 900, color: theme.primaryColor, marginBottom: '1.5rem', lineHeight: 1 }}>
          {plan.price}
          {plan.period && <span style={{ fontSize: isMobile ? '0.82rem' : '0.95rem', fontWeight: 600, opacity: 0.65 }}>{plan.period}</span>}
        </p>
      )}
      {features.length > 0 && (
        <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.5rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {features.map((f, j) => (
            <li key={j} style={{ fontSize: '0.875rem', opacity: 0.78, display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
              <span style={{ color: theme.primaryColor, fontWeight: 800 }}>✓</span>{f}
            </li>
          ))}
        </ul>
      )}
      {showCta && (
        plan.ctaLink?.trim() ? (
          <a href={plan.ctaLink} style={ctaStyle}>{plan.ctaText}</a>
        ) : (
          <button type="button" style={ctaStyle}>{plan.ctaText}</button>
        )
      )}
    </div>
  );
}

export function PricingSection({ section, sectionTitle, theme, pad, altBg, variants, radius, isMobile, fv }: BaseProps) {
  const plans = getPricingPlansFromSection(section).filter(p => p.name?.trim() || p.price?.trim());
  const subtitle = fv('subtitle');
  const layout = fv('pricingLayout') || 'columns-3';
  const colCount = layout === 'columns-2' ? 2 : layout === 'featured' ? Math.min(plans.length, 3) : 3;
  const cols = isMobile ? '1fr' : `repeat(${Math.min(colCount, Math.max(plans.length, 1))}, 1fr)`;
  const cardAnim = getSectionCardAnim(section);
  const headingAnim = getSectionHeadingAnim(section);
  return (
    <SectionShell id={section.id} pad={pad} altBg={altBg} section={section} theme={theme}>
      <SectionHeader title={sectionTitle} subtitle={subtitle || 'Simple, transparent pricing'} compact={isMobile} theme={theme} centered badge="Pricing" headingAnim={headingAnim} />
      <div style={{ display: 'grid', gridTemplateColumns: cols, gap: '1.25rem', alignItems: 'stretch' }}>
        {plans.map((plan, i) => {
          const cv = getCardVariants(cardAnim, i);
          return (
            <motion.div key={plan.id} initial={cv.initial} whileInView={cv.animate} viewport={{ once: true }} transition={cv.transition}>
              <PricingPlanCard plan={plan} theme={theme} radius={radius} isMobile={isMobile} />
            </motion.div>
          );
        })}
      </div>
    </SectionShell>
  );
}

// ── FAQ ──────────────────────────────────────────────────────────────────────
function FAQAccordion({ item, theme, radius, index, isMobile }: { item: FAQItemBlock; theme: ThemeConfig; radius: string; index: number; isMobile: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.05 }}
      style={{ borderRadius: radius, overflow: 'hidden', border: `1px solid ${open ? theme.primaryColor : `${theme.primaryColor}22`}`, transition: 'border-color 0.2s', background: open ? `${theme.primaryColor}08` : `${theme.primaryColor}04` }}>
      <button type="button" onClick={() => setOpen(!open)}
        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: isMobile ? '1rem' : '1.15rem 1.35rem', background: 'transparent', border: 'none', cursor: 'pointer', color: 'inherit', textAlign: 'left' }}>
        <span style={{ fontWeight: 700, fontSize: isMobile ? '0.88rem' : '0.95rem', flex: 1, paddingRight: '1rem', wordBreak: 'break-word' }}>{item.question}</span>
        <motion.span animate={{ rotate: open ? 45 : 0 }} style={{ color: theme.primaryColor, fontSize: '1.5rem', lineHeight: 1, flexShrink: 0 }}>+</motion.span>
      </button>
      <AnimatePresence>
        {open && item.answer && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}>
            <p style={{ padding: isMobile ? '0 1rem 1rem' : '0 1.35rem 1.15rem', opacity: 0.72, lineHeight: 1.75, fontSize: isMobile ? '0.85rem' : '0.9rem', wordBreak: 'break-word' }}>{item.answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function FAQSection({ section, sectionTitle, theme, pad, altBg, variants, radius, fv, isMobile }: BaseProps) {
  const items = getFAQItemsFromSection(section).filter(f => f.question?.trim());
  const subtitle = fv('subtitle');
  const headingAnim = getSectionHeadingAnim(section);
  return (
    <SectionShell id={section.id} pad={pad} altBg={altBg} section={section} theme={theme}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <SectionHeader title={sectionTitle} subtitle={subtitle || 'Common questions answered'} compact={isMobile} theme={theme} centered badge="FAQ" headingAnim={headingAnim} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {items.map((item, i) => (
            <FAQAccordion key={item.id} item={item} theme={theme} radius={radius} index={i} isMobile={isMobile} />
          ))}
        </div>
      </div>
    </SectionShell>
  );
}

// ── CUSTOM ───────────────────────────────────────────────────────────────────
export function CustomSection({ section, sectionTitle, theme, pad, altBg, variants, radius, isMobile, fv }: BaseProps) {
  const content = fv('content');
  const subtitle = fv('subtitle');
  const customFields = getCustomFields(section, CUSTOM_KNOWN_IDS);
  return (
    <SectionShell id={section.id} pad={pad} altBg={altBg} section={section} theme={theme}>
      <div style={{
        padding: isMobile ? '2rem 1.5rem' : '3rem 2.5rem', borderRadius: radius,
        background: `linear-gradient(135deg, ${theme.primaryColor}10, ${theme.secondaryColor}06)`,
        border: `1px solid ${theme.primaryColor}22`,
      }}>
        <SectionHeader title={sectionTitle} subtitle={subtitle} compact={isMobile} theme={theme} badge="Custom" />
        {content && (
          <p style={{ opacity: 0.82, lineHeight: 1.9, fontSize: '1.05rem', whiteSpace: 'pre-wrap', maxWidth: 760 }}>{content}</p>
        )}
        {customFields.length > 0 && (
          <div style={{ marginTop: content ? '2rem' : 0 }}>
            <DynamicFieldsGrid fields={customFields} theme={theme} radius={radius} isMobile={isMobile} />
          </div>
        )}
      </div>
    </SectionShell>
  );
}
