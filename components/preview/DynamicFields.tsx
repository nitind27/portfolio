'use client';
import { SectionField, ThemeConfig } from '@/lib/types';
import { GlassCard } from './SectionUI';

function hasValue(field: SectionField): boolean {
  const v = field.value;
  if (v == null) return false;
  if (typeof v === 'string') return v.trim().length > 0;
  if (Array.isArray(v)) return v.some(item => typeof item === 'string' && item.trim());
  return false;
}

export function getCustomFields(section: { fields: SectionField[] }, knownIds: Set<string>): SectionField[] {
  return section.fields.filter(f => !knownIds.has(f.id) && hasValue(f));
}

export function DynamicFieldBlock({ field, theme, radius, compact, showLabel = true }: {
  field: SectionField; theme: ThemeConfig; radius: string; compact?: boolean; showLabel?: boolean;
}) {
  const val = field.value;
  if (!hasValue(field)) return null;

  const labelEl = showLabel && (
    <p style={{
      fontSize: compact ? '0.68rem' : '0.72rem', fontWeight: 700, letterSpacing: '0.1em',
      textTransform: 'uppercase', opacity: 0.45, marginBottom: '0.65rem',
    }}>{field.label}</p>
  );

  if (field.type === 'image' && typeof val === 'string') {
    return (
      <div>
        {labelEl}
        <img src={val} alt={field.label} style={{ width: '100%', borderRadius: radius, display: 'block', boxShadow: `0 12px 32px ${theme.primaryColor}18` }} />
      </div>
    );
  }

  if (field.type === 'images' && Array.isArray(val)) {
    const imgs = (val as string[]).filter(Boolean);
    if (!imgs.length) return null;
    return (
      <div>
        {labelEl}
        <div style={{ display: 'grid', gridTemplateColumns: imgs.length === 1 ? '1fr' : 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.75rem' }}>
          {imgs.map((src, i) => (
            <img key={i} src={src} alt="" style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', borderRadius: radius }} />
          ))}
        </div>
      </div>
    );
  }

  if (field.type === 'list' && Array.isArray(val)) {
    const items = (val as string[]).filter(i => i.trim());
    if (!items.length) return null;
    return (
      <div>
        {labelEl}
        <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {items.map((item, i) => (
            <li key={i} style={{
              display: 'flex', alignItems: 'flex-start', gap: '0.55rem', fontSize: compact ? '0.88rem' : '0.92rem',
              opacity: 0.85, lineHeight: 1.6,
            }}>
              <span style={{ color: theme.primaryColor, fontWeight: 800, flexShrink: 0 }}>•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (field.type === 'url' && typeof val === 'string') {
    return (
      <div>
        {labelEl}
        <a href={val} target="_blank" rel="noopener noreferrer" style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
          padding: '0.65rem 1.15rem', borderRadius: radius, textDecoration: 'none',
          background: theme.primaryColor, color: '#fff', fontWeight: 600, fontSize: '0.88rem',
          transition: 'opacity 0.2s',
        }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '0.9')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
          {field.label} →
        </a>
      </div>
    );
  }

  if (field.type === 'email' && typeof val === 'string') {
    return (
      <div>
        {labelEl}
        <a href={`mailto:${val}`} style={{ color: theme.primaryColor, fontWeight: 600, textDecoration: 'none', fontSize: '0.95rem' }}>{val}</a>
      </div>
    );
  }

  if ((field.type === 'textarea' || field.type === 'richtext') && typeof val === 'string') {
    return (
      <div>
        {labelEl}
        <p style={{ opacity: 0.82, lineHeight: 1.85, fontSize: compact ? '0.92rem' : '1rem', whiteSpace: 'pre-wrap' }}>{val}</p>
      </div>
    );
  }

  if (typeof val === 'string') {
    return (
      <div>
        {labelEl}
        <p style={{ opacity: 0.82, lineHeight: 1.75, fontSize: compact ? '0.9rem' : '0.95rem', whiteSpace: 'pre-wrap' }}>{val}</p>
      </div>
    );
  }

  return null;
}

export function DynamicFieldsGrid({ fields, theme, radius, isMobile, compact, variant = 'cards' }: {
  fields: SectionField[]; theme: ThemeConfig; radius: string; isMobile: boolean; compact?: boolean; variant?: 'cards' | 'plain';
}) {
  if (!fields.length) return null;

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(260px, 1fr))',
      gap: compact ? '1rem' : '1.25rem',
    }}>
      {fields.map(field => {
        if (!hasValue(field)) return null;
        const isWide = field.type === 'image' || field.type === 'images' || field.type === 'list' || field.type === 'textarea' || field.type === 'richtext';
        const content = <DynamicFieldBlock field={field} theme={theme} radius={radius} compact={compact} />;

        if (variant === 'plain') {
          return (
            <div key={field.id} style={{ gridColumn: isWide ? '1 / -1' : undefined }}>
              {content}
            </div>
          );
        }

        return (
          <div key={field.id} style={{ gridColumn: isWide && !isMobile ? '1 / -1' : undefined }}>
            <GlassCard theme={theme} radius={radius} style={{ height: '100%' }}>
              {content}
            </GlassCard>
          </div>
        );
      })}
    </div>
  );
}

export function parseBlogPost(post: string) {
  const parts = post.split('|').map(s => s.trim());
  if (parts.length >= 4) {
    return {
      title: parts[0],
      date: parts[1],
      summary: parts[2],
      body: parts.slice(3).join('|').trim(),
    };
  }
  if (parts.length === 3) {
    return { title: parts[0], date: parts[1], summary: parts[2], body: parts[2] };
  }
  if (parts.length === 2) {
    return { title: parts[0], date: parts[1], summary: '', body: parts[0] };
  }
  return { title: post, date: '', summary: '', body: post };
}
