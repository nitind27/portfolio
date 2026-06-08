export const BUILDER_LAYOUT_KEY = 'pb-builder-layout';

export const BUILDER_LAYOUT = {
  left: { min: 180, max: 420, default: 208 },
  right: { min: 260, max: 560, default: 288 },
} as const;

export function clampSidebarWidth(value: number, side: 'left' | 'right') {
  const { min, max } = BUILDER_LAYOUT[side];
  return Math.min(max, Math.max(min, Math.round(value)));
}

export function loadBuilderLayout() {
  const fallback = {
    left: BUILDER_LAYOUT.left.default,
    right: BUILDER_LAYOUT.right.default,
  };
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(BUILDER_LAYOUT_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as { left?: number; right?: number };
    return {
      left: clampSidebarWidth(parsed.left ?? fallback.left, 'left'),
      right: clampSidebarWidth(parsed.right ?? fallback.right, 'right'),
    };
  } catch {
    return fallback;
  }
}

export function saveBuilderLayout(left: number, right: number) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(
    BUILDER_LAYOUT_KEY,
    JSON.stringify({ left, right }),
  );
}
