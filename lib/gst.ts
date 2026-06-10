/**
 * India tax on digital/SaaS services.
 * GST is only charged when the business is GST-registered (CHARGE_GST=true or GSTIN set).
 * Unregistered businesses: all-inclusive pricing, no GST line at checkout.
 */

export const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

const GSTIN_CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';

/** Whether to add GST at checkout (requires GST registration). */
export function isGstCharged(): boolean {
  const flag = process.env.CHARGE_GST?.trim().toLowerCase();
  if (flag === 'false' || flag === '0' || flag === 'no') return false;
  if (flag === 'true' || flag === '1' || flag === 'yes') return true;
  const gstin = (process.env.NEXT_PUBLIC_COMPANY_GSTIN || process.env.COMPANY_GSTIN || '').trim();
  return gstin.length > 0;
}

export function getGstRate(): number {
  if (!isGstCharged()) return 0;
  const rate = Number(process.env.GST_RATE ?? 18);
  return Number.isFinite(rate) && rate >= 0 && rate <= 100 ? rate : 18;
}

export function getGstTaxLabel(rate = getGstRate()): string {
  if (!isGstCharged() || rate <= 0) return 'All-inclusive price';
  return `GST (${rate}%)`;
}

export function formatPremiumPriceLabel(price: number, currency = 'INR'): string {
  const symbol = currency === 'INR' ? '₹' : `${currency} `;
  if (!isGstCharged()) return `${symbol}${price} (all-inclusive)`;
  const { total } = calculateGst(price);
  return `${symbol}${price} + GST = ${symbol}${total}`;
}

export interface GstBreakdown {
  subtotal: number;
  gstRate: number;
  gstAmount: number;
  total: number;
}

export function calculateGst(subtotal: number, gstRate = getGstRate()): GstBreakdown {
  const base = Math.round(subtotal * 100) / 100;
  const rate = isGstCharged() ? gstRate : 0;
  const gstAmount = rate > 0 ? Math.round(base * rate) / 100 : 0;
  const total = Math.round((base + gstAmount) * 100) / 100;
  return { subtotal: base, gstRate: rate, gstAmount, total };
}

export function normalizeGstin(value: string): string {
  return value.trim().toUpperCase().replace(/\s/g, '');
}

export function isValidGstinFormat(gstin: string): boolean {
  const g = normalizeGstin(gstin);
  return g.length === 15 && GSTIN_REGEX.test(g);
}

/** Official GSTIN checksum (15th character) */
export function isValidGstinChecksum(gstin: string): boolean {
  const g = normalizeGstin(gstin);
  if (g.length !== 15) return false;
  let sum = 0;
  for (let i = 0; i < 14; i++) {
    const code = GSTIN_CHARS.indexOf(g[i]);
    if (code < 0) return false;
    const factor = (i % 2) + 1;
    const product = code * factor;
    sum += Math.floor(product / 36) + (product % 36);
  }
  const checksum = (36 - (sum % 36)) % 36;
  return GSTIN_CHARS[checksum] === g[14];
}

export function validateGstinLocal(gstin: string): { ok: boolean; error?: string } {
  const g = normalizeGstin(gstin);
  if (!g) return { ok: false, error: 'GSTIN is required' };
  if (!isValidGstinFormat(g)) return { ok: false, error: 'Invalid GSTIN format (15 characters)' };
  if (!isValidGstinChecksum(g)) return { ok: false, error: 'Invalid GSTIN checksum' };
  return { ok: true };
}

export function formatGstMoney(amount: number, currency = 'INR'): string {
  return currency === 'INR' ? `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : `${currency} ${amount}`;
}
