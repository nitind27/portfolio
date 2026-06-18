import type { MouseEvent } from 'react';
import type { PortfolioSection } from './types';

export const NAVBAR_SCROLL_OFFSET = 80;

export function getPreviewScrollRoot(): HTMLElement | null {
  return document.querySelector('[data-preview-scroll-root]') as HTMLElement | null;
}

export function getNavbarScrollTarget(): HTMLElement | Window {
  const previewRoot = getPreviewScrollRoot();
  if (previewRoot) return previewRoot;
  const top = document.getElementById('portfolio-top');
  if (!top) return window;
  let el: HTMLElement | null = top.parentElement;
  while (el) {
    const s = getComputedStyle(el);
    if (/auto|scroll/.test(s.overflowY) && el.scrollHeight > el.clientHeight + 2) return el;
    el = el.parentElement;
  }
  return window;
}

export function scrollPreviewToTop(): void {
  const root = getPreviewScrollRoot();
  if (root) {
    root.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

export function scrollToPreviewSection(sectionId: string, offset = NAVBAR_SCROLL_OFFSET): void {
  const id = sectionId.replace(/^#/, '');
  const target = document.getElementById(id);
  if (!target) return;
  const root = getPreviewScrollRoot();
  if (root) {
    const rootRect = root.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    root.scrollTo({
      top: Math.max(0, root.scrollTop + (targetRect.top - rootRect.top) - offset),
      behavior: 'smooth',
    });
    return;
  }
  const y = target.getBoundingClientRect().top + window.scrollY - offset;
  window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
}

export function resolveSectionId(href: string, sections: PortfolioSection[]): string {
  const id = href.replace(/^#/, '').toLowerCase();
  if (!id) return '';
  const byId = sections.find(s => s.id.toLowerCase() === id);
  if (byId) return byId.id;
  const byType = sections.find(s => s.type.toLowerCase() === id);
  if (byType) return byType.id;
  return href.replace(/^#/, '');
}

export function goToPreviewSection(sectionId: string, onSectionSelect?: (id: string) => void): void {
  scrollToPreviewSection(sectionId);
  onSectionSelect?.(sectionId);
}

export function handleHashNavClick(
  e: MouseEvent<HTMLAnchorElement>,
  href: string,
  sections?: PortfolioSection[],
  onSectionSelect?: (id: string) => void,
): void {
  if (!href.startsWith('#')) return;
  e.preventDefault();
  e.stopPropagation();
  const raw = href.slice(1).toLowerCase();
  if (raw === 'portfolio-top' || raw === 'top') {
    scrollPreviewToTop();
    return;
  }
  const id = sections ? resolveSectionId(href, sections) : href.slice(1);
  goToPreviewSection(id, onSectionSelect);
}
