'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Search, BookOpen, ChevronRight } from 'lucide-react';
import MarketingShell from '@/components/marketing/MarketingShell';
import { DOC_CATEGORIES, SITE_DOCS, type DocSection } from '@/lib/site-knowledge';
import { APP_NAME, brand } from '@/lib/brand';

function DocBlock({ doc }: { doc: DocSection }) {
  return (
    <article id={doc.id} className="scroll-mt-24 pb-12 border-b last:border-0" style={{ borderColor: brand.border }}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ background: brand.accentMuted, color: brand.accentLight }}>
          {DOC_CATEGORIES.find(c => c.id === doc.category)?.label}
        </span>
      </div>
      <h2 className="text-xl font-bold text-white mb-2">{doc.title}</h2>
      <p className="text-sm text-gray-500 mb-4">{doc.summary}</p>
      <div className="text-sm text-gray-300 leading-relaxed whitespace-pre-line">{doc.body}</div>
    </article>
  );
}

export default function DocsPageClient() {
  const [search, setSearch] = useState('');
  const [activeCat, setActiveCat] = useState<string | 'all'>('all');

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return SITE_DOCS.filter(d => {
      if (activeCat !== 'all' && d.category !== activeCat) return false;
      if (!q) return true;
      return (
        d.title.toLowerCase().includes(q) ||
        d.body.toLowerCase().includes(q) ||
        d.keywords.some(k => k.includes(q))
      );
    });
  }, [search, activeCat]);

  return (
    <MarketingShell
      title="Documentation"
      subtitle={`Everything about ${APP_NAME} — builder panels, sections, sharing, billing, and policies.`}
    >
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-10 flex flex-col lg:flex-row gap-10">
        <aside className="lg:w-64 shrink-0">
          <div className="sticky top-20 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search docs…"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl text-sm bg-white/5 border border-white/10 text-white placeholder:text-gray-600 focus:outline-none focus:border-orange-500/50"
              />
            </div>
            <nav className="space-y-1">
              <button
                type="button"
                onClick={() => setActiveCat('all')}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${activeCat === 'all' ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5'}`}
              >
                All topics
              </button>
              {DOC_CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCat(cat.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition flex items-center gap-2 ${activeCat === cat.id ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5'}`}
                >
                  <span>{cat.icon}</span> {cat.label}
                </button>
              ))}
            </nav>
            <Link
              href="/ask"
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm border transition"
              style={{ borderColor: `${brand.accent}44`, color: brand.accentLight, background: brand.accentMuted }}
            >
              <BookOpen className="w-4 h-4" /> Ask AI instead
              <ChevronRight className="w-3 h-3 ml-auto" />
            </Link>
          </div>
        </aside>

        <div className="flex-1 min-w-0 space-y-0">
          {filtered.length === 0 ? (
            <p className="text-gray-500 text-sm">No docs match your search.</p>
          ) : (
            filtered.map(doc => <DocBlock key={doc.id} doc={doc} />)
          )}
        </div>
      </div>
    </MarketingShell>
  );
}
