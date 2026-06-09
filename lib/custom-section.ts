import type {
  CustomBlock,
  CustomBlockType,
  CustomContainerId,
  CustomContentWidth,
  CustomLayoutId,
  CustomSectionSettings,
  PortfolioSection,
} from './types';

export const CUSTOM_LAYOUT_OPTIONS: { id: CustomLayoutId; label: string; description: string }[] = [
  { id: 'default', label: 'Classic Card', description: 'Header + content in a card' },
  { id: 'centered', label: 'Centered Hero', description: 'Centered title & content' },
  { id: 'split', label: 'Split Layout', description: 'Intro left · blocks right' },
  { id: 'magazine', label: 'Magazine', description: 'Bold header + grid below' },
  { id: 'columns-2', label: '2 Columns', description: 'Blocks in two columns' },
  { id: 'columns-3', label: '3 Columns', description: 'Blocks in three columns' },
  { id: 'bento', label: 'Bento Grid', description: 'Mixed-size block grid' },
  { id: 'strip', label: 'Feature Strip', description: 'Horizontal card row' },
  { id: 'banner', label: 'CTA Banner', description: 'Full-width call-to-action' },
  { id: 'minimal', label: 'Minimal', description: 'Clean, no container box' },
];

export const CUSTOM_CONTAINER_OPTIONS: { id: CustomContainerId; label: string }[] = [
  { id: 'gradient', label: 'Gradient' },
  { id: 'glass', label: 'Glass' },
  { id: 'solid', label: 'Solid' },
  { id: 'bordered', label: 'Bordered' },
  { id: 'none', label: 'None' },
];

export const CUSTOM_WIDTH_OPTIONS: { id: CustomContentWidth; label: string; px: number }[] = [
  { id: 'narrow', label: 'Narrow', px: 640 },
  { id: 'normal', label: 'Normal', px: 900 },
  { id: 'wide', label: 'Wide', px: 1100 },
  { id: 'full', label: 'Full', px: 1280 },
];

export const CUSTOM_BLOCK_TYPES: { id: CustomBlockType; label: string; icon: string }[] = [
  { id: 'heading', label: 'Heading', icon: 'H' },
  { id: 'text', label: 'Text', icon: '¶' },
  { id: 'highlight', label: 'Highlight Box', icon: '✦' },
  { id: 'quote', label: 'Quote', icon: '❝' },
  { id: 'stat', label: 'Stat', icon: '#' },
  { id: 'icon-card', label: 'Icon Card', icon: '◆' },
  { id: 'image', label: 'Image', icon: '🖼' },
  { id: 'button', label: 'Button / CTA', icon: '→' },
  { id: 'list', label: 'Bullet List', icon: '•' },
  { id: 'video', label: 'Video Embed', icon: '▶' },
  { id: 'divider', label: 'Divider', icon: '—' },
];

export const DEFAULT_CUSTOM_SECTION: CustomSectionSettings = {
  layout: 'default',
  container: 'gradient',
  align: 'left',
  contentWidth: 'normal',
  showBadge: true,
  badgeText: 'Custom',
  hideTitle: false,
  hideSubtitle: false,
  blocks: [],
};

export const SAMPLE_CUSTOM_BLOCKS: CustomBlock[] = [
  {
    id: 'sample-stat-1',
    type: 'stat',
    statValue: '99%',
    statLabel: 'Client satisfaction',
    visible: true,
  },
  {
    id: 'sample-stat-2',
    type: 'stat',
    statValue: '24/7',
    statLabel: 'Support available',
    visible: true,
  },
  {
    id: 'sample-icon',
    type: 'icon-card',
    icon: '⚡',
    heading: 'Fast delivery',
    subtext: 'Launch your section in minutes with flexible blocks.',
    visible: true,
  },
];

export function normalizeCustomLayout(value?: string): CustomLayoutId {
  const ids = CUSTOM_LAYOUT_OPTIONS.map(o => o.id);
  if (value && ids.includes(value as CustomLayoutId)) return value as CustomLayoutId;
  return 'default';
}

export function normalizeCustomContainer(value?: string): CustomContainerId {
  const ids = CUSTOM_CONTAINER_OPTIONS.map(o => o.id);
  if (value && ids.includes(value as CustomContainerId)) return value as CustomContainerId;
  return 'gradient';
}

export function getCustomSection(section: PortfolioSection): CustomSectionSettings {
  const cs = section.style?.customSection;
  return {
    ...DEFAULT_CUSTOM_SECTION,
    ...cs,
    layout: normalizeCustomLayout(cs?.layout),
    container: normalizeCustomContainer(cs?.container),
    blocks: cs?.blocks ?? [],
  };
}

export function getContentMaxWidth(width: CustomContentWidth | undefined): number {
  return CUSTOM_WIDTH_OPTIONS.find(w => w.id === width)?.px ?? 900;
}

export function createCustomBlock(type: CustomBlockType): CustomBlock {
  const id = `cb-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const base: CustomBlock = { id, type, visible: true, align: 'left' };
  switch (type) {
    case 'heading': return { ...base, heading: 'Your heading', align: 'left' };
    case 'text': return { ...base, text: 'Write your paragraph here.' };
    case 'quote': return { ...base, quote: 'A memorable quote goes here.', author: 'Author name' };
    case 'image': return { ...base, image: '', heading: 'Image caption' };
    case 'button': return { ...base, buttonLabel: 'Learn more', url: 'https://' };
    case 'stat': return { ...base, statValue: '100+', statLabel: 'Happy clients', align: 'center' };
    case 'icon-card': return { ...base, icon: '✨', heading: 'Feature title', subtext: 'Short description.' };
    case 'list': return { ...base, items: ['First point', 'Second point', 'Third point'] };
    case 'video': return { ...base, videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' };
    case 'highlight': return { ...base, heading: 'Important note', text: 'Use this box to highlight key information.' };
    case 'divider': return base;
    default: return base;
  }
}

export function getVideoEmbedUrl(url: string): string | null {
  if (!url?.trim()) return null;
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{11})/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  const vimeo = url.match(/vimeo\.com\/(\d+)/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;
  if (url.includes('embed') || url.includes('player')) return url;
  return null;
}

export function visibleCustomBlocks(blocks: CustomBlock[] | undefined): CustomBlock[] {
  return (blocks ?? []).filter(b => b.visible !== false);
}

export function customLayoutExportClass(layout: CustomLayoutId): string {
  return `custom-layout-${layout}`;
}

export function customContainerExportClass(container: CustomContainerId): string {
  return `custom-container-${container}`;
}
