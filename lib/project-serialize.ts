import type { Portfolio, PortfolioSection, PortfolioMeta, PortfolioHosting } from './types';
import { rewritePortfolioAssetUrls } from './media-url';

/** Compact on-disk format (v1) — short keys to minimize JSON size */
interface CompactPortfolio {
  v: 1;
  i: string;
  n: string;
  tid: string;
  sl: string;
  pb: 0 | 1;
  ca: string;
  ua: string;
  lg: string;
  s: CompactSection[];
  th: Portfolio['theme'];
  seo: Portfolio['seo'];
  sm?: Portfolio['smtp'];
  po?: Portfolio['popup'];
  nb?: Portfolio['navbar'];
  ft?: Portfolio['footer'];
  so?: Portfolio['social'];
  m?: PortfolioMeta;
  h?: PortfolioHosting;
}

interface CompactSection {
  i: string;
  t: PortfolioSection['type'];
  tt: string;
  v: 0 | 1;
  o: number;
  f: PortfolioSection['fields'];
  st?: PortfolioSection['style'];
}

function stripEmpty<T extends Record<string, unknown>>(obj: T): Partial<T> {
  const out: Record<string, unknown> = {};
  for (const [k, val] of Object.entries(obj)) {
    if (val === undefined || val === null) continue;
    if (val === '') continue;
    if (typeof val === 'object' && !Array.isArray(val) && Object.keys(val as object).length === 0) continue;
    out[k] = val;
  }
  return out as Partial<T>;
}

export function portfolioToCompact(p: Portfolio): CompactPortfolio {
  const compact: CompactPortfolio = {
    v: 1,
    i: p.id,
    n: p.name,
    tid: p.templateId,
    sl: p.slug,
    pb: p.published ? 1 : 0,
    ca: p.createdAt,
    ua: p.updatedAt,
    lg: p.language,
    s: p.sections.map(sec => {
      const cs: CompactSection = {
        i: sec.id,
        t: sec.type,
        tt: sec.title,
        v: sec.visible ? 1 : 0,
        o: sec.order,
        f: sec.fields,
      };
      if (sec.style && Object.keys(sec.style).length) cs.st = sec.style;
      return cs;
    }),
    th: p.theme,
    seo: p.seo,
  };
  const sm = stripEmpty(p.smtp as unknown as Record<string, unknown>);
  if (Object.keys(sm).length > 2) compact.sm = p.smtp;
  compact.po = p.popup;
  compact.nb = p.navbar;
  compact.ft = p.footer;
  if (p.social && Object.values(p.social).some(Boolean)) compact.so = p.social;
  if (p.meta) compact.m = p.meta;
  if (p.hosting) compact.h = p.hosting;
  return compact;
}

export function compactToPortfolio(c: CompactPortfolio | Record<string, unknown>): Portfolio {
  const raw = c as CompactPortfolio;
  if (raw.v !== 1 || !raw.i) {
    return c as unknown as Portfolio;
  }
  return {
    id: raw.i,
    name: raw.n,
    templateId: raw.tid,
    slug: raw.sl,
    published: raw.pb === 1,
    createdAt: raw.ca,
    updatedAt: raw.ua,
    language: raw.lg || 'en',
    sections: (raw.s || []).map(sec => ({
      id: sec.i,
      type: sec.t,
      title: sec.tt,
      visible: sec.v !== 0,
      order: sec.o,
      fields: sec.f,
      style: sec.st,
    })),
    theme: raw.th,
    seo: raw.seo,
    smtp: raw.sm || {
      host: '', port: 587, secure: false, user: '', password: '', fromName: '', toEmail: '', provider: 'custom',
    },
    popup: raw.po || {
      enabled: false, type: 'message', title: '', message: '', buttonText: 'OK', delay: 2,
      bgColor: '#1a1a2e', textColor: '#fff', showOnce: true,
    },
    navbar: raw.nb!,
    footer: raw.ft!,
    social: raw.so || {},
    meta: raw.m,
    hosting: raw.h,
  };
}

export function parseConfigJson(raw: unknown): Portfolio {
  if (!raw) throw new Error('Empty config');
  const data = typeof raw === 'string' ? JSON.parse(raw) : raw;
  return rewritePortfolioAssetUrls(compactToPortfolio(data));
}

export function stringifyConfig(p: Portfolio): string {
  return JSON.stringify(portfolioToCompact(p));
}
