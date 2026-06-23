'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, LayoutTemplate } from 'lucide-react';
import { TEMPLATES } from '@/lib/templates';
import type { Template } from '@/lib/types';
import { CATEGORY_EMOJI, CATEGORY_LABELS } from '@/lib/website-purposes';
import { MiniSitePreview } from '@/components/shared/TemplatesGallery';
import { useBrand } from '@/components/theme/ThemeProvider';

const SHOWCASE_IDS = [
  'site99-pro', 'aurora-saas', 'noir-creative', 'golden-luxe',
  'developer-neon', 'designer-minimal', 'photographer-bold',
  'landing-saas-pro', 'corp-executive', 'ecom-luxury',
  'portfolio-showcase', 'editorial-mag', 'neon-dev',
  'navy-corporate', 'rose-boutique', 'startup-modern',
  'mint-wellness', 'violet-startup', 'marketplace-pro',
];

function pickShowcaseTemplates(all: Template[], count = 20): Template[] {
  const byId = new Map(all.map(t => [t.id, t]));
  const picked: Template[] = [];
  for (const id of SHOWCASE_IDS) {
    const t = byId.get(id);
    if (t) picked.push(t);
  }
  const seen = new Set(picked.map(t => t.id));
  for (const t of all) {
    if (picked.length >= count) break;
    if (!seen.has(t.id)) {
      picked.push(t);
      seen.add(t.id);
    }
  }
  return picked.slice(0, count);
}

function TemplateShowcaseCard({ template }: { template: Template }) {
  const theme = template.defaultTheme;
  const categoryLabel = CATEGORY_LABELS[template.category] || template.category;

  return (
    <div
      className="landing-template-card shrink-0 flex flex-col rounded-2xl border overflow-hidden group transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-black/40"
      style={{ background: 'var(--surface, #111827)', borderColor: 'rgba(255,255,255,0.08)' }}
    >
      <div className="p-3 pb-2" role="img" aria-label={`${template.name} website template preview`}>
        <MiniSitePreview template={template} className="shadow-md group-hover:shadow-xl transition-shadow" />
      </div>
      <div className="px-4 pb-4 pt-1 space-y-2 flex-1 flex flex-col">
        <div className="flex-1">
          <p className="text-sm font-semibold text-white truncate">
            <span className="mr-1">{CATEGORY_EMOJI[template.category] || '✨'}</span>
            {template.name}
          </p>
          <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-2 leading-relaxed">
            {template.description}
          </p>
        </div>
        <div className="flex items-center justify-between gap-2 pt-1">
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.06] text-gray-400 border border-white/[0.08] capitalize truncate">
            {categoryLabel}
          </span>
          <div className="flex -space-x-1 shrink-0">
            {[theme.primaryColor, theme.secondaryColor, theme.accentColor].map((c, i) => (
              <div
                key={i}
                className="w-3.5 h-3.5 rounded-full border-2 border-[#0a1628]"
                style={{ background: c }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

interface Props {
  templateCount: number;
  onStartFree?: () => void;
}

export default function LandingTemplatesShowcase({ templateCount, onStartFree }: Props) {
  const brand = useBrand();
  const showcase = useMemo(() => pickShowcaseTemplates(TEMPLATES, 20), []);

  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    for (const t of TEMPLATES) {
      const label = CATEGORY_LABELS[t.category] || t.category;
      counts.set(label, (counts.get(label) || 0) + 1);
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);
  }, []);

  const loop = useMemo(() => [...showcase, ...showcase], [showcase]);

  return (
    <section id="templates" className="relative z-10 py-24 overflow-hidden" style={{ background: brand.surface }}>
      <div className="max-w-7xl mx-auto px-5 sm:px-8 mb-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
        >
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: brand.accent }}>
            Templates
          </p>
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div className="max-w-2xl">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">Start with a pro design</h2>
              <p className="text-[#94a3b8] text-base leading-relaxed">
                <strong className="text-white font-semibold">{templateCount}+ real templates</strong> — Dev Dark, Aurora SaaS,
                Golden Luxe, and more. Switch anytime without losing your content.
              </p>
            </div>
            {onStartFree && (
              <button
                type="button"
                onClick={onStartFree}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold border border-white/10 text-white hover:bg-white/[0.06] transition shrink-0 self-start lg:self-auto"
              >
                <LayoutTemplate className="w-4 h-4" style={{ color: brand.accent }} />
                Browse all {templateCount} templates
                <ArrowRight className="w-4 h-4 opacity-60" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2 mt-6">
            {categories.map(([label, count]) => (
              <span
                key={label}
                className="text-[11px] px-2.5 py-1 rounded-full border border-white/[0.08] bg-white/[0.03] text-gray-400"
              >
                {label} <span className="text-gray-600">· {count}</span>
              </span>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Single horizontal row — infinite slide */}
      <div className="landing-templates-slider mask-fade-x">
        <div className="landing-templates-track">
          {loop.map((t, i) => (
            <TemplateShowcaseCard key={`${t.id}-${i}`} template={t} />
          ))}
        </div>
      </div>

      <p className="text-center text-[11px] text-gray-600 mt-6 px-5">
        Hover to pause · Swipe on mobile · Real template previews
      </p>
    </section>
  );
}
