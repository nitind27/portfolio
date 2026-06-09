export type AboutLayoutId =
  | 'split'
  | 'image-right'
  | 'centered'
  | 'wide'
  | 'stacked'
  | 'minimal'
  | 'overlap'
  | 'card';

export interface AboutLayoutOption {
  id: AboutLayoutId;
  label: string;
  description: string;
}

export const ABOUT_LAYOUT_OPTIONS: AboutLayoutOption[] = [
  { id: 'split', label: 'Split Left', description: 'Photo left · content right' },
  { id: 'image-right', label: 'Split Right', description: 'Content left · photo right' },
  { id: 'centered', label: 'Centered', description: 'Stacked & centered' },
  { id: 'wide', label: 'Wide Photo', description: 'Content + large photo' },
  { id: 'stacked', label: 'Banner Top', description: 'Full-width photo on top' },
  { id: 'minimal', label: 'Compact', description: 'Small avatar + text row' },
  { id: 'overlap', label: 'Overlap', description: 'Photo with overlapping card' },
  { id: 'card', label: 'Card', description: 'All content in one card' },
];

export const ABOUT_LAYOUT_IDS = ABOUT_LAYOUT_OPTIONS.map(o => o.id);

export function normalizeAboutLayout(value: string | undefined): AboutLayoutId {
  if (value && ABOUT_LAYOUT_IDS.includes(value as AboutLayoutId)) {
    return value as AboutLayoutId;
  }
  return 'split';
}

export function aboutLayoutExportClass(layout: AboutLayoutId): string {
  if (layout === 'centered') return 'about-centered';
  if (layout === 'wide') return 'about-wide';
  return `about-layout-${layout}`;
}

export interface AboutLayoutPreview {
  centered: boolean;
  contentFirst: boolean;
  gridCols: string;
  imageAspect: string;
  imageMaxHeight: number;
  imageMaxWidth?: number | string;
  imageFullWidth: boolean;
  minimal: boolean;
  overlap: boolean;
  card: boolean;
  hideRoleBadge: boolean;
}

export function getAboutLayoutPreview(layoutId: string, isMobile: boolean): AboutLayoutPreview {
  const layout = normalizeAboutLayout(layoutId);
  const centered = layout === 'centered';
  const minimal = layout === 'minimal';
  const overlap = layout === 'overlap';
  const card = layout === 'card';
  const stacked = layout === 'stacked';
  const wide = layout === 'wide';

  const contentFirst = !isMobile && (layout === 'image-right' || wide);

  let gridCols = 'minmax(240px, 340px) 1fr';
  if (isMobile) gridCols = '1fr';
  else if (centered || stacked || card) gridCols = '1fr';
  else if (wide) gridCols = '1fr 1.35fr';
  else if (layout === 'image-right') gridCols = '1fr minmax(240px, 340px)';
  else if (minimal) gridCols = 'auto 1fr';
  else if (overlap) gridCols = 'minmax(200px, 42%) 1fr';

  let imageAspect = '4/5';
  let imageMaxHeight = 460;
  if (minimal) { imageAspect = '1'; imageMaxHeight = 96; }
  else if (wide) { imageAspect = '16/10'; imageMaxHeight = 380; }
  else if (stacked) { imageAspect = '21/9'; imageMaxHeight = 320; }
  else if (card) { imageAspect = '16/9'; imageMaxHeight = 280; }

  return {
    centered,
    contentFirst,
    gridCols,
    imageAspect,
    imageMaxHeight,
    imageMaxWidth: centered ? 300 : minimal ? 96 : stacked || card ? '100%' : undefined,
    imageFullWidth: stacked || card,
    minimal,
    overlap,
    card,
    hideRoleBadge: minimal,
  };
}
