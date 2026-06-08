import { Portfolio } from './types';
import { STORAGE_POLICY_DAYS } from './brand';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function getProjectExpiryDate(createdAt: string): Date {
  const created = new Date(createdAt);
  return new Date(created.getTime() + STORAGE_POLICY_DAYS * MS_PER_DAY);
}

export function getDaysRemaining(createdAt: string): number {
  const expiry = getProjectExpiryDate(createdAt).getTime();
  const diff = expiry - Date.now();
  if (diff <= 0) return 0;
  return Math.ceil(diff / MS_PER_DAY);
}

export function getHoursRemaining(createdAt: string): number {
  const expiry = getProjectExpiryDate(createdAt).getTime();
  const diff = expiry - Date.now();
  if (diff <= 0) return 0;
  return Math.ceil(diff / (60 * 60 * 1000));
}

export function isProjectExpired(createdAt: string): boolean {
  return Date.now() >= getProjectExpiryDate(createdAt).getTime();
}

export function getExpiryProgress(createdAt: string): number {
  const created = new Date(createdAt).getTime();
  const expiry = getProjectExpiryDate(createdAt).getTime();
  const total = expiry - created;
  const elapsed = Date.now() - created;
  return Math.min(100, Math.max(0, (elapsed / total) * 100));
}

export type ExpiryUrgency = 'ok' | 'warning' | 'critical' | 'expired';

export function getExpiryUrgency(createdAt: string): ExpiryUrgency {
  const days = getDaysRemaining(createdAt);
  if (days <= 0) return 'expired';
  if (days <= 1) return 'critical';
  if (days <= 2) return 'warning';
  return 'ok';
}

export function formatDaysRemaining(createdAt: string): string {
  const days = getDaysRemaining(createdAt);
  if (days <= 0) return 'Expired';
  if (days === 1) return '1 day left';
  return `${days} days left`;
}

export function purgeExpiredPortfolios(portfolios: Portfolio[]): Portfolio[] {
  return portfolios.filter(p => !isProjectExpired(p.createdAt));
}
