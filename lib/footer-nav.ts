import type { FooterConfig, NavbarConfig, PortfolioSection } from './types';

export interface FooterNavItem {
  id: string;
  title: string;
  href: string;
}

/** Sections shown in footer navigation, with visibility, labels, and optional limit. */
export function getFooterNavItems(
  sections: PortfolioSection[],
  footer: FooterConfig,
  navbar?: NavbarConfig,
): FooterNavItem[] {
  const visible = sections.filter(s => s.visible).sort((a, b) => a.order - b.order);
  const hidden = new Set(footer.hiddenNavSections ?? []);

  if (footer.syncNavWithNavbar !== false && navbar?.hiddenSections?.length) {
    navbar.hiddenSections.forEach(id => hidden.add(id));
  }

  let items: FooterNavItem[] = visible
    .filter(s => !hidden.has(s.id))
    .map(s => ({
      id: s.id,
      title:
        footer.customNavLabels?.[s.id]?.trim() ||
        navbar?.customLabels?.[s.id]?.trim() ||
        s.title,
      href: `#${s.id}`,
    }));

  const max = footer.navMaxItems ?? 0;
  if (max > 0) items = items.slice(0, max);

  return items;
}
