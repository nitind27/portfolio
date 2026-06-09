'use client';

import { motion } from 'framer-motion';
import type { CustomBlock, CustomLayoutId, ThemeConfig } from '@/lib/types';
import { getVideoEmbedUrl } from '@/lib/custom-section';
import { useInViewViewport } from './preview-motion';

interface Props {
  blocks: CustomBlock[];
  theme: ThemeConfig;
  radius: string;
  isMobile: boolean;
  layout: CustomLayoutId;
  align?: 'left' | 'center' | 'right';
}

function blockHasContent(block: CustomBlock): boolean {
  switch (block.type) {
    case 'heading': return Boolean(block.heading?.trim());
    case 'text': return Boolean(block.text?.trim());
    case 'quote': return Boolean(block.quote?.trim());
    case 'image': return Boolean(block.image?.trim());
    case 'button': return Boolean(block.buttonLabel?.trim());
    case 'stat': return Boolean(block.statValue?.trim());
    case 'icon-card': return Boolean(block.heading?.trim() || block.subtext?.trim());
    case 'list': return Boolean(block.items?.some(i => i.trim()));
    case 'video': return Boolean(getVideoEmbedUrl(block.videoUrl || ''));
    case 'highlight': return Boolean(block.heading?.trim() || block.text?.trim());
    case 'divider': return true;
    default: return false;
  }
}

function CustomBlockItem({ block, theme, radius, index, layout }: {
  block: CustomBlock; theme: ThemeConfig; radius: string; index: number; layout: CustomLayoutId;
}) {
  const animVp = useInViewViewport();
  const align = block.align || 'left';
  const textAlign = align as React.CSSProperties['textAlign'];

  const wrap = (children: React.ReactNode, style?: React.CSSProperties) => (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={animVp}
      transition={{ delay: index * 0.06, duration: 0.45 }}
      style={style}
    >{children}</motion.div>
  );

  switch (block.type) {
    case 'heading':
      return wrap(
        <h3 style={{
          fontSize: layout === 'magazine' ? 'clamp(1.5rem, 3vw, 2rem)' : 'clamp(1.25rem, 2.5vw, 1.65rem)',
          fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.2, textAlign,
        }}>{block.heading}</h3>,
      );
    case 'text':
      return wrap(<p style={{ opacity: 0.82, lineHeight: 1.9, fontSize: '1.02rem', whiteSpace: 'pre-wrap', textAlign }}>{block.text}</p>);
    case 'quote':
      return wrap(
        <blockquote style={{
          margin: 0, padding: '1.25rem 1.5rem', borderLeft: `4px solid ${theme.primaryColor}`,
          background: `${theme.primaryColor}08`, borderRadius: `0 ${radius} ${radius} 0`, textAlign,
        }}>
          <p style={{ fontSize: '1.05rem', fontStyle: 'italic', opacity: 0.88, lineHeight: 1.75 }}>&ldquo;{block.quote}&rdquo;</p>
          {block.author && <cite style={{ display: 'block', marginTop: '0.75rem', fontSize: '0.82rem', opacity: 0.55, fontStyle: 'normal' }}>— {block.author}</cite>}
        </blockquote>,
      );
    case 'image':
      return wrap(
        <figure>
          {block.image ? (
            <img src={block.image} alt={block.heading || ''} style={{ width: '100%', borderRadius: radius, display: 'block', boxShadow: `0 16px 40px ${theme.primaryColor}18` }} />
          ) : (
            <div style={{ aspectRatio: '16/9', borderRadius: radius, background: `${theme.primaryColor}10`, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.4 }}>🖼</div>
          )}
          {block.heading && <figcaption style={{ marginTop: '0.65rem', fontSize: '0.82rem', opacity: 0.55, textAlign }}>{block.heading}</figcaption>}
        </figure>,
      );
    case 'button':
      return wrap(
        <a href={block.url || '#'} target="_blank" rel="noopener noreferrer" style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.75rem 1.5rem',
          borderRadius: radius, background: theme.primaryColor, color: '#fff', fontWeight: 700,
          fontSize: '0.92rem', textDecoration: 'none', boxShadow: `0 8px 24px ${theme.primaryColor}40`,
        }}>{block.buttonLabel} →</a>,
        { textAlign, ...(textAlign === 'center' ? {} : {}) },
      );
    case 'stat':
      return wrap(
        <div style={{
          textAlign: 'center', padding: '1.25rem', borderRadius: radius,
          background: `linear-gradient(135deg, ${theme.primaryColor}12, ${theme.secondaryColor}08)`,
          border: `1px solid ${theme.primaryColor}20`,
        }}>
          <p style={{ fontSize: '1.75rem', fontWeight: 800, color: theme.primaryColor, lineHeight: 1 }}>{block.statValue}</p>
          <p style={{ fontSize: '0.8rem', opacity: 0.6, marginTop: '0.4rem' }}>{block.statLabel}</p>
        </div>,
      );
    case 'icon-card':
      return wrap(
        <div style={{
          padding: '1.25rem', borderRadius: radius, height: '100%',
          background: `${theme.primaryColor}06`, border: `1px solid ${theme.primaryColor}16`,
        }}>
          <span style={{ fontSize: '1.75rem', display: 'block', marginBottom: '0.65rem' }}>{block.icon || '✨'}</span>
          <p style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.35rem' }}>{block.heading}</p>
          <p style={{ fontSize: '0.85rem', opacity: 0.7, lineHeight: 1.65 }}>{block.subtext}</p>
        </div>,
      );
    case 'list':
      return wrap(
        <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
          {(block.items || []).filter(Boolean).map((item, i) => (
            <li key={i} style={{ display: 'flex', gap: '0.55rem', alignItems: 'flex-start', opacity: 0.85, lineHeight: 1.6 }}>
              <span style={{ color: theme.primaryColor, fontWeight: 800 }}>•</span><span>{item}</span>
            </li>
          ))}
        </ul>,
      );
    case 'video': {
      const embed = getVideoEmbedUrl(block.videoUrl || '');
      return wrap(
        embed ? (
          <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, borderRadius: radius, overflow: 'hidden', boxShadow: `0 16px 40px ${theme.primaryColor}15` }}>
            <iframe src={embed} title="Video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }} />
          </div>
        ) : (
          <p style={{ opacity: 0.5, fontSize: '0.85rem' }}>Add a valid YouTube or Vimeo URL</p>
        ),
      );
    }
    case 'highlight':
      return wrap(
        <div style={{
          padding: '1.25rem 1.5rem', borderRadius: radius,
          background: `linear-gradient(135deg, ${theme.primaryColor}14, ${theme.secondaryColor}08)`,
          border: `1px solid ${theme.primaryColor}28`,
        }}>
          {block.heading && <p style={{ fontWeight: 700, marginBottom: '0.5rem', color: theme.primaryColor }}>{block.heading}</p>}
          <p style={{ opacity: 0.85, lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{block.text}</p>
        </div>,
      );
    case 'divider':
      return wrap(<hr style={{ border: 'none', height: 1, background: `${theme.primaryColor}22`, margin: '0.5rem 0' }} />);
    default:
      return null;
  }
}

function getBlocksGridStyle(layout: CustomLayoutId, isMobile: boolean): React.CSSProperties {
  if (isMobile) return { display: 'flex', flexDirection: 'column', gap: '1rem' };
  switch (layout) {
    case 'columns-2':
    case 'split':
      return { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' };
    case 'columns-3':
      return { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' };
    case 'bento':
      return { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', gridAutoRows: 'minmax(100px, auto)' };
    case 'strip':
      return { display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '0.25rem' };
    case 'magazine':
      return { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' };
    default:
      return { display: 'flex', flexDirection: 'column', gap: '1rem' };
  }
}

export function CustomSectionBlocks({ blocks, theme, radius, isMobile, layout, align }: Props) {
  const visible = blocks.filter(b => b.visible !== false && blockHasContent(b));
  if (!visible.length) return null;

  const gridStyle = getBlocksGridStyle(layout, isMobile);

  return (
    <div style={gridStyle}>
      {visible.map((block, i) => {
        const span = !isMobile && layout === 'bento' && block.span === 2 ? { gridColumn: 'span 2' } : {};
        const stripItem = layout === 'strip' && !isMobile ? { flex: '0 0 min(280px, 80vw)' } : {};
        return (
          <div key={block.id} style={{ ...span, ...stripItem, textAlign: align }}>
            <CustomBlockItem block={block} theme={theme} radius={radius} index={i} layout={layout} />
          </div>
        );
      })}
    </div>
  );
}
