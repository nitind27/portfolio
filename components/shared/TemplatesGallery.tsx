'use client';

import { useMemo, useState } from 'react';
import { Check, Lock } from 'lucide-react';
import type { Template, TemplateCategory } from '@/lib/types';
import { CATEGORY_EMOJI, CATEGORY_LABELS } from '@/lib/website-purposes';
import { inferPreviewVariant } from '@/lib/templates-v2';

interface PreviewProps {
  template: Template;
  className?: string;
}

function MiniSitePreview({ template, className = '' }: PreviewProps) {
  const theme = template.defaultTheme;
  const variant = inferPreviewVariant(template);
  const { primaryColor, secondaryColor, backgroundColor, textColor, accentColor } = theme;

  const heroBlock = () => {
    if (variant === 'banner') {
      return (
        <div className="mx-1.5 mt-1 rounded-md overflow-hidden relative" style={{ minHeight: 36, background: `linear-gradient(120deg, ${primaryColor}55, ${secondaryColor}33)` }}>
          <div className="absolute inset-0 flex flex-col items-center justify-center p-2">
            <div className="h-1.5 w-2/3 rounded-full mb-1" style={{ background: textColor, opacity: 0.85 }} />
            <div className="h-1 w-1/2 rounded-full mb-1.5" style={{ background: textColor, opacity: 0.35 }} />
            <div className="h-2 w-10 rounded-full" style={{ background: primaryColor }} />
          </div>
        </div>
      );
    }
    if (variant === 'center') {
      return (
        <div className="mx-1.5 mt-1 rounded-md p-2 flex flex-col items-center text-center" style={{ background: `${textColor}08`, minHeight: 36 }}>
          <div className="h-1.5 w-3/4 rounded-full mb-1" style={{ background: textColor, opacity: 0.85 }} />
          <div className="h-1 w-1/2 rounded-full mb-1.5" style={{ background: textColor, opacity: 0.3 }} />
          <div className="h-2 w-8 rounded-full" style={{ background: primaryColor }} />
        </div>
      );
    }
    if (variant === 'cards') {
      return (
        <div className="mx-1.5 mt-1 grid grid-cols-3 gap-0.5">
          {[0, 1, 2].map(i => (
            <div key={i} className="rounded-sm overflow-hidden" style={{ background: `${textColor}10`, minHeight: 28 }}>
              <div className="h-3" style={{ background: `linear-gradient(135deg, ${primaryColor}${i === 1 ? '88' : '44'}, ${secondaryColor}33)` }} />
              <div className="p-1">
                <div className="h-0.5 w-full rounded mb-0.5" style={{ background: textColor, opacity: 0.5 }} />
                <div className="h-0.5 w-2/3 rounded" style={{ background: textColor, opacity: 0.2 }} />
              </div>
            </div>
          ))}
        </div>
      );
    }
    if (variant === 'magazine') {
      return (
        <div className="mx-1.5 mt-1 flex gap-0.5" style={{ minHeight: 36 }}>
          <div className="flex-[2] rounded-sm p-1.5" style={{ background: `linear-gradient(160deg, ${primaryColor}44, ${secondaryColor}22)` }}>
            <div className="h-1.5 w-4/5 rounded mb-1" style={{ background: textColor, opacity: 0.8 }} />
            <div className="h-1 w-3/5 rounded" style={{ background: textColor, opacity: 0.3 }} />
          </div>
          <div className="flex-1 flex flex-col gap-0.5">
            {[0, 1].map(i => (
              <div key={i} className="flex-1 rounded-sm" style={{ background: `${textColor}${i ? '0a' : '12'}` }} />
            ))}
          </div>
        </div>
      );
    }
    return (
      <div className="mx-1.5 mt-1 rounded-md p-1.5 flex gap-1.5 items-center" style={{ background: `linear-gradient(135deg, ${primaryColor}33, ${secondaryColor}18)`, minHeight: 36 }}>
        <div className="flex-1 min-w-0">
          <div className="h-1.5 w-4/5 rounded mb-0.5" style={{ background: textColor, opacity: 0.9 }} />
          <div className="h-1 w-3/5 rounded mb-1" style={{ background: textColor, opacity: 0.35 }} />
          <div className="h-2 w-8 rounded-full" style={{ background: primaryColor }} />
        </div>
        <div className="w-9 h-9 rounded-md shrink-0" style={{ background: `linear-gradient(145deg, ${accentColor}88, ${primaryColor}55)` }} />
      </div>
    );
  };

  return (
    <div className={`rounded-xl overflow-hidden border border-white/10 shadow-lg ${className}`} style={{ background: backgroundColor }}>
      <div className="h-4 flex items-center gap-0.5 px-1.5" style={{ background: `${textColor}12` }}>
        <div className="w-1.5 h-1.5 rounded-full bg-red-400/70" />
        <div className="w-1.5 h-1.5 rounded-full bg-yellow-400/70" />
        <div className="w-1.5 h-1.5 rounded-full bg-green-400/70" />
        <div className="flex-1 mx-1 h-2 rounded-sm" style={{ background: `${textColor}10` }} />
      </div>
      <div className="h-5 mx-1.5 mt-1 rounded flex items-center justify-between px-1.5" style={{ background: `${primaryColor}22`, borderBottom: `1px solid ${primaryColor}33` }}>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm" style={{ background: primaryColor }} />
          <div className="h-1 w-6 rounded-full" style={{ background: textColor, opacity: 0.6 }} />
        </div>
        <div className="flex gap-0.5">
          {[0, 1, 2].map(i => <div key={i} className="h-0.5 w-2.5 rounded-full" style={{ background: `${textColor}${i === 0 ? '50' : '25'}` }} />)}
        </div>
      </div>
      {heroBlock()}
      <div className="mx-1.5 mt-1 mb-1.5 space-y-0.5">
        <div className="h-1 w-1/3 rounded-full mx-auto" style={{ background: `${textColor}20` }} />
        <div className="grid grid-cols-4 gap-0.5">
          {[0, 1, 2, 3].map(i => (
            <div key={i} className="h-2 rounded-sm" style={{ background: `${textColor}${8 + i * 4}` }} />
          ))}
        </div>
      </div>
    </div>
  );
}

export interface TemplatePreviewCardProps {
  template: Template;
  selected?: boolean;
  locked?: boolean;
  lockLabel?: string;
  compact?: boolean;
  onClick?: () => void;
}

export function TemplatePreviewCard({
  template, selected, locked, lockLabel, compact, onClick,
}: TemplatePreviewCardProps) {
  const theme = template.defaultTheme;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={locked}
      className={`group text-left w-full rounded-2xl border transition-all duration-200 ${
        locked
          ? 'border-amber-500/25 bg-amber-500/[0.04] opacity-80 cursor-not-allowed'
          : selected
            ? 'border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/15 ring-1 ring-blue-500/30'
            : 'border-white/10 bg-white/[0.02] hover:border-white/25 hover:bg-white/[0.04] hover:shadow-xl hover:shadow-black/20'
      } ${compact ? 'p-2' : 'p-3'}`}
    >
      <div className="relative">
        <MiniSitePreview template={template} className={compact ? 'scale-[0.98]' : ''} />
        {selected && !locked && (
          <span className="absolute top-2 right-2 w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center shadow-lg">
            <Check className="w-3.5 h-3.5 text-white" />
          </span>
        )}
        {locked && (
          <span className="absolute top-2 right-2 flex items-center gap-0.5 text-[9px] px-2 py-0.5 rounded-full bg-amber-500/25 text-amber-200 border border-amber-500/30">
            <Lock className="w-2.5 h-2.5" /> {lockLabel || 'Pro'}
          </span>
        )}
      </div>

      <div className={`${compact ? 'mt-2' : 'mt-3'} space-y-1.5`}>
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className={`font-semibold text-white truncate ${compact ? 'text-xs' : 'text-sm'}`}>
              <span className="mr-1">{CATEGORY_EMOJI[template.category] || '🌟'}</span>
              {template.name}
            </p>
            {!compact && (
              <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-2 leading-relaxed">{template.description}</p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="flex -space-x-1">
            {[theme.primaryColor, theme.secondaryColor, theme.accentColor, theme.backgroundColor].map((c, i) => (
              <div key={i} className="w-4 h-4 rounded-full border-2 border-[#111]" style={{ background: c }} title={c} />
            ))}
          </div>
          <span className="text-[9px] text-gray-600 truncate">{theme.fontFamily.split(' ')[0]}</span>
        </div>

        {(template.layoutTags?.length || template.defaultSections.length) && !compact && (
          <div className="flex flex-wrap gap-1 pt-0.5">
            {template.layoutTags?.slice(0, 2).map(tag => (
              <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded-md bg-blue-500/10 text-blue-300/90 border border-blue-500/15">{tag}</span>
            ))}
            <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-white/5 text-gray-500">{template.defaultSections.length} sections</span>
          </div>
        )}

        {compact && (
          <p className="text-[10px] text-gray-600 capitalize">{CATEGORY_LABELS[template.category] || template.category}</p>
        )}
      </div>
    </button>
  );
}

export interface TemplatesGalleryProps {
  templates: Template[];
  selectedId?: string;
  onSelect: (id: string) => void;
  isLocked?: (id: string) => boolean;
  getLockLabel?: (id: string) => string;
  compact?: boolean;
  showSearch?: boolean;
  showCategories?: boolean;
}

export default function TemplatesGallery({
  templates,
  selectedId,
  onSelect,
  isLocked,
  getLockLabel,
  compact,
  showSearch = true,
  showCategories = true,
}: TemplatesGalleryProps) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const categories = useMemo(() => {
    const cats = Array.from(new Set(templates.map(t => t.category)));
    return ['all', ...cats.sort((a, b) =>
      (CATEGORY_LABELS[a] || a).localeCompare(CATEGORY_LABELS[b] || b),
    )];
  }, [templates]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return templates.filter(t => {
      const matchCat = filter === 'all' || t.category === filter;
      if (!matchCat) return false;
      if (!q) return true;
      return (
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        (t.layoutTags || []).some(tag => tag.toLowerCase().includes(q))
      );
    });
  }, [templates, search, filter]);

  return (
    <div className="space-y-3">
      {showSearch && (
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search templates…"
          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500"
        />
      )}
      {showCategories && (
        <div className="flex flex-wrap gap-1">
          {categories.map(c => (
            <button
              key={c}
              type="button"
              onClick={() => setFilter(c)}
              className={`px-2.5 py-1 text-[11px] rounded-full transition ${
                filter === c ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25' : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              {c === 'all' ? `All (${templates.length})` : `${CATEGORY_EMOJI[c] || ''} ${CATEGORY_LABELS[c as TemplateCategory] || c}`}
            </button>
          ))}
        </div>
      )}
      {filtered.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-8">No templates match your search.</p>
      ) : (
        <div className={`grid gap-3 ${compact ? 'grid-cols-1' : 'grid-cols-2 lg:grid-cols-3'}`}>
          {filtered.map(t => (
            <TemplatePreviewCard
              key={t.id}
              template={t}
              selected={selectedId === t.id}
              locked={isLocked?.(t.id)}
              lockLabel={getLockLabel?.(t.id)}
              compact={compact}
              onClick={() => !isLocked?.(t.id) && onSelect(t.id)}
            />
          ))}
        </div>
      )}
      <p className="text-[10px] text-gray-600 text-center">{filtered.length} template{filtered.length !== 1 ? 's' : ''} shown</p>
    </div>
  );
}
