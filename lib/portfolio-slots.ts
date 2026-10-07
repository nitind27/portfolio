/** Portfolio IDs bound to a paid plan (Premium includes 2). */
export function parsePortfolioSlotIds(raw: unknown, primary?: string | null): string[] {
  let ids: string[] = [];
  if (Array.isArray(raw)) {
    ids = raw.map(id => String(id));
  } else if (typeof raw === 'string' && raw.trim()) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) ids = parsed.map(id => String(id));
    } catch { /* ignore malformed json */ }
  }
  if (primary && !ids.includes(primary)) ids.unshift(primary);
  return [...new Set(ids.map(id => id.trim()).filter(Boolean))];
}

export function boundPortfolioIds(user: {
  premiumPortfolioId?: string | null;
  premiumPortfolioIds?: string[] | null;
} | null | undefined): string[] {
  if (!user) return [];
  if (user.premiumPortfolioIds?.length) return user.premiumPortfolioIds;
  return user.premiumPortfolioId ? [user.premiumPortfolioId] : [];
}
