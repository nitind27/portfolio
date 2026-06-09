/**
 * India tax on digital/SaaS services (OIDAR): 18% GST.
 * Plan prices are exclusive of tax; GST is added at checkout (B2C default).
 * Rate configurable via GST_RATE env (default 18).
 */

export const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

const GSTIN_CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';

export function getGstRate(): number {
  const rate = Number(process.env.GST_RATE ?? 18);
  return Number.isFinite(rate) && rate >= 0 && rate <= 100 ? rate : 18;
}

export function getGstTaxLabel(rate = getGstRate()): string {
  return `GST (${rate}%)`;
}

export interface GstBreakdown {
  subtotal: number;
  gstRate: number;
  gstAmount: number;
  total: number;
}

export function calculateGst(subtotal: number, gstRate = getGstRate()): GstBreakdown {
  const base = Math.round(subtotal * 100) / 100;
  const gstAmount = Math.round(base * gstRate) / 100;
  const total = Math.round((base + gstAmount) * 100) / 100;
  return { subtotal: base, gstRate, gstAmount, total };
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
