'use client';

const SESSION_KEY = 'pb_analytics_sid';

function getSessionId(): string {
  if (typeof window === 'undefined') return '';
  try {
    let sid = sessionStorage.getItem(SESSION_KEY);
    if (!sid) {
      sid = `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
      sessionStorage.setItem(SESSION_KEY, sid);
    }
    return sid;
  } catch {
    return `anon_${Date.now()}`;
  }
}

export function trackAnalytics(
  eventType: 'page_view' | 'search' | 'modal_view' | 'modal_cta' | 'registration' | 'promo_claim',
  extra?: { query?: string; path?: string; metadata?: Record<string, unknown> },
) {
  if (typeof window === 'undefined') return;
  const payload = {
    eventType,
    sessionId: getSessionId(),
    path: extra?.path ?? window.location.pathname,
    query: extra?.query,
    referrer: document.referrer || undefined,
    metadata: extra?.metadata,
  };
  fetch('/api/analytics/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    keepalive: true,
  }).catch(() => {});
}

let searchDebounce: ReturnType<typeof setTimeout> | null = null;

export function trackSearchDebounced(query: string, context?: string) {
  const q = query.trim();
  if (!q || q.length < 2) return;
  if (searchDebounce) clearTimeout(searchDebounce);
  searchDebounce = setTimeout(() => {
    trackAnalytics('search', { query: q, metadata: context ? { context } : undefined });
  }, 800);
}
