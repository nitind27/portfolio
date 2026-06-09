'use client';

import { createContext, useContext, useLayoutEffect, useRef, useState, type RefObject } from 'react';
import type { PortfolioSection, ThemeConfig } from '@/lib/types';
import { getMotionViewport } from '@/lib/section-animation';

export type InViewViewport = {
  once?: boolean;
  amount?: number | 'some' | 'all';
  margin?: string;
  root?: RefObject<Element | null>;
};

const PreviewScrollRootContext = createContext<RefObject<Element | null> | null>(null);

/** Detects builder preview scroll container so whileInView works inside the canvas. */
export function PreviewScrollRootProvider({ children }: { children: React.ReactNode }) {
  const anchorRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<Element | null>(null);
  const [, setTick] = useState(0);

  useLayoutEffect(() => {
    const el = anchorRef.current?.closest('[data-preview-scroll-root]') ?? null;
    if (rootRef.current !== el) {
      rootRef.current = el;
      setTick(t => t + 1);
    }
  });

  return (
    <PreviewScrollRootContext.Provider value={rootRef}>
      <div ref={anchorRef} style={{ display: 'contents' }}>{children}</div>
    </PreviewScrollRootContext.Provider>
  );
}

export function usePreviewScrollRoot(): RefObject<Element | null> | null {
  return useContext(PreviewScrollRootContext);
}

/** Viewport for cards, headings, and inner elements. */
export function useInViewViewport(overrides: InViewViewport = {}): InViewViewport {
  const root = usePreviewScrollRoot();
  const base: InViewViewport = { once: true, amount: 0.12, margin: '-20px', ...overrides };
  if (root?.current) return { ...base, root };
  return base;
}

/** Viewport for full section entrance (scroll / load). */
export function useSectionViewport(section: PortfolioSection, theme: ThemeConfig): InViewViewport {
  const root = usePreviewScrollRoot();
  const base = getMotionViewport(section, theme);
  if (root?.current) return { ...base, root };
  return base;
}
