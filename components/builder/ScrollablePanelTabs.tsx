'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Lock } from 'lucide-react';
import { useBrand } from '../theme/ThemeProvider';

export interface PanelTabItem<T extends string = string> {
  id: T;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  locked?: boolean;
}

interface Props<T extends string = string> {
  tabs: PanelTabItem<T>[];
  activeId: T;
  onSelect: (id: T) => void;
  className?: string;
}

export default function ScrollablePanelTabs<T extends string>({ tabs, activeId, onSelect, className = '' }: Props<T>) {
  const brand = useBrand();
  const scrollRef = useRef<HTMLDivElement>(null);
  const moreWrapRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [overflowTabs, setOverflowTabs] = useState<PanelTabItem<T>[]>([]);
  const [moreOpen, setMoreOpen] = useState(false);

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    const hasOverflow = scrollWidth > clientWidth + 4;
    setCanScrollLeft(hasOverflow && scrollLeft > 6);
    setCanScrollRight(hasOverflow && scrollLeft < scrollWidth - clientWidth - 6);

    const visibleRight = scrollLeft + clientWidth - 1;
    const hidden: PanelTabItem<T>[] = [];
    for (const tab of tabs) {
      const btn = el.querySelector(`[data-panel-tab="${tab.id}"]`) as HTMLElement | null;
      if (!btn) continue;
      const tabRight = btn.offsetLeft + btn.offsetWidth;
      if (tabRight > visibleRight + 0.5) hidden.push(tab);
    }
    setOverflowTabs(hidden);
  }, [tabs]);

  useEffect(() => {
    updateScrollState();
    const el = scrollRef.current;
    if (!el) return;

    el.addEventListener('scroll', updateScrollState, { passive: true });
    const ro = new ResizeObserver(updateScrollState);
    ro.observe(el);

    return () => {
      el.removeEventListener('scroll', updateScrollState);
      ro.disconnect();
    };
  }, [updateScrollState, tabs.length]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const btn = el.querySelector(`[data-panel-tab="${activeId}"]`) as HTMLElement | null;
    btn?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
  }, [activeId]);

  useEffect(() => {
    if (!moreOpen) return;
    const onPointer = (e: MouseEvent) => {
      if (!moreWrapRef.current?.contains(e.target as Node)) setMoreOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMoreOpen(false);
    };
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [moreOpen]);

  const scrollBy = (dir: -1 | 1) => {
    scrollRef.current?.scrollBy({ left: dir * 140, behavior: 'smooth' });
  };

  const pickTab = (id: T) => {
    onSelect(id);
    setMoreOpen(false);
  };

  const showMoreMenu = overflowTabs.length > 0;

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
        {canScrollRight && !moreOpen && (
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
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap shrink-0"
                style={active
                  ? { background: brand.accent, color: brand.onAccent, boxShadow: `0 1px 8px ${brand.accentGlow}` }
                  : { color: t.locked ? brand.textDim : brand.textMuted }}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden sm:inline">{t.label}</span>
                {t.locked && <Lock className="w-3 h-3 shrink-0 text-amber-500/80" />}
              </button>
            );
          })}
        </div>
      </div>

      {showMoreMenu && (
        <div ref={moreWrapRef} className="relative shrink-0">
          <button
            type="button"
            onClick={() => setMoreOpen(o => !o)}
            aria-expanded={moreOpen}
            aria-haspopup="menu"
            title="More settings"
            className={`flex items-center gap-0.5 h-7 pl-2 pr-1.5 rounded-lg text-[10px] font-semibold border transition ${
              moreOpen
                ? 'bg-blue-600 text-white border-blue-400/50 shadow-md shadow-blue-500/30'
                : 'bg-white/8 text-gray-300 border-white/12 hover:bg-blue-600/20 hover:text-blue-200 hover:border-blue-500/30'
            }`}
          >
            <span>More</span>
            <ChevronRight className={`w-3.5 h-3.5 transition-transform ${moreOpen ? 'rotate-90' : ''}`} />
          </button>

          {moreOpen && (
            <div
              role="menu"
              className="absolute right-0 top-full mt-1.5 z-[200] min-w-[11rem] max-h-[min(70vh,320px)] overflow-y-auto rounded-xl border border-white/10 bg-[#141414] py-1 shadow-2xl shadow-black/50"
            >
              {overflowTabs.map(t => {
                const Icon = t.icon;
                const active = activeId === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    role="menuitem"
                    onClick={() => pickTab(t.id)}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-left text-xs transition ${
                      active ? 'bg-blue-600/20 text-blue-200' : 'text-gray-300 hover:bg-white/8 hover:text-white'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span className="flex-1 truncate">{t.label}</span>
                    {t.locked && <Lock className="w-3 h-3 shrink-0 text-amber-500/80" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
