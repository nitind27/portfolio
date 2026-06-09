'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { brand } from '@/lib/brand';

export interface PanelTabItem<T extends string = string> {
  id: T;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}

interface Props<T extends string = string> {
  tabs: PanelTabItem<T>[];
  activeId: T;
  onSelect: (id: T) => void;
  className?: string;
}

export default function ScrollablePanelTabs<T extends string>({ tabs, activeId, onSelect, className = '' }: Props<T>) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [highlightMore, setHighlightMore] = useState(false);

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    const hasOverflow = scrollWidth > clientWidth + 4;
    setCanScrollLeft(hasOverflow && scrollLeft > 6);
    setCanScrollRight(hasOverflow && scrollLeft < scrollWidth - clientWidth - 6);
    if (scrollLeft > 12) setHighlightMore(false);
  }, []);

  useEffect(() => {
    updateScrollState();
    const el = scrollRef.current;
    if (!el) return;

    const onScroll = () => {
      updateScrollState();
      if (el.scrollLeft > 12) setHighlightMore(false);
    };

    el.addEventListener('scroll', onScroll, { passive: true });
    const ro = new ResizeObserver(updateScrollState);
    ro.observe(el);

    return () => {
      el.removeEventListener('scroll', onScroll);
      ro.disconnect();
    };
  }, [updateScrollState, tabs.length]);

  useEffect(() => {
    try {
      if (sessionStorage.getItem('panel-tabs-scroll-hint') === '1') return;
    } catch { /* ignore */ }
    const t = setTimeout(() => {
      const el = scrollRef.current;
      if (el && el.scrollWidth > el.clientWidth + 4) setHighlightMore(true);
    }, 500);
    return () => clearTimeout(t);
  }, [tabs.length]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const btn = el.querySelector(`[data-panel-tab="${activeId}"]`) as HTMLElement | null;
    btn?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
  }, [activeId]);

  const dismissHint = () => {
    setHighlightMore(false);
    try { sessionStorage.setItem('panel-tabs-scroll-hint', '1'); } catch { /* ignore */ }
  };

  const scrollBy = (dir: -1 | 1) => {
    dismissHint();
    scrollRef.current?.scrollBy({ left: dir * 140, behavior: 'smooth' });
  };

  return (
    <div
      data-tour="panel-tabs"
      className={`flex items-center gap-1 min-w-0 ${className}`}
    >
      {canScrollLeft && (
        <button
          type="button"
          onClick={() => scrollBy(-1)}
          className="shrink-0 w-6 h-7 flex items-center justify-center rounded-md bg-white/8 hover:bg-white/15 text-gray-400 hover:text-white border border-white/10 transition"
          aria-label="Scroll tabs left"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>
      )}

      <div className="relative flex-1 min-w-0">
        {canScrollRight && (
          <div
            className="pointer-events-none absolute right-0 top-0 bottom-0 w-6 z-10"
            style={{ background: `linear-gradient(to left, ${brand.navy} 40%, transparent)` }}
          />
        )}
        {canScrollLeft && (
          <div
            className="pointer-events-none absolute left-0 top-0 bottom-0 w-5 z-10"
            style={{ background: `linear-gradient(to right, ${brand.navy} 50%, transparent)` }}
          />
        )}

        <div
          ref={scrollRef}
          className="flex items-center gap-0.5 overflow-x-auto py-0.5"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {tabs.map(t => {
            const Icon = t.icon;
            const active = activeId === t.id;
            return (
              <button
                key={t.id}
                type="button"
                data-panel-tab={t.id}
                onClick={() => onSelect(t.id)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap shrink-0 ${
                  active ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/25' : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden sm:inline">{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {canScrollRight && (
        <button
          type="button"
          onClick={() => scrollBy(1)}
          title="Templates, Popup, SEO, Social, SMTP & more"
          className={`shrink-0 flex items-center gap-0.5 h-7 pl-2 pr-1.5 rounded-lg text-[10px] font-semibold border transition ${
            highlightMore
              ? 'bg-blue-600 text-white border-blue-400/50 shadow-md shadow-blue-500/30 ring-2 ring-blue-400/40'
              : 'bg-white/8 text-gray-300 border-white/12 hover:bg-blue-600/20 hover:text-blue-200 hover:border-blue-500/30'
          }`}
          aria-label="Show more settings tabs"
        >
          <span>More</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
