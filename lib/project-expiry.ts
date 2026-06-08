import { Portfolio } from './types';
import { STORAGE_POLICY_DAYS } from './brand';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function getStorageDaysForExpiry(storageDays?: number): number {
  return storageDays && storageDays > 0 ? storageDays : STORAGE_POLICY_DAYS;
}

export function getProjectExpiryDate(createdAt: string, storageDays?: number): Date {
  const days = getStorageDaysForExpiry(storageDays);
  const created = new Date(createdAt);
  return new Date(created.getTime() + days * MS_PER_DAY);
}

export function getDaysRemaining(createdAt: string, storageDays?: number): number {
  const expiry = getProjectExpiryDate(createdAt, storageDays).getTime();
  const diff = expiry - Date.now();
  if (diff <= 0) return 0;
  return Math.ceil(diff / MS_PER_DAY);
}

export function getHoursRemaining(createdAt: string, storageDays?: number): number {
  const expiry = getProjectExpiryDate(createdAt, storageDays).getTime();
  const diff = expiry - Date.now();
  if (diff <= 0) return 0;
  return Math.ceil(diff / (60 * 60 * 1000));
}

export function isProjectExpired(createdAt: string, storageDays?: number): boolean {
  return Date.now() >= getProjectExpiryDate(createdAt, storageDays).getTime();
}

export function isProjectExpiredWithPolicy(createdAt: string, storageDays: number): boolean {
  if (storageDays >= 365) return false;
  return isProjectExpired(createdAt, storageDays);
}

export function getExpiryProgress(createdAt: string, storageDays?: number): number {
  const created = new Date(createdAt).getTime();
  const expiry = getProjectExpiryDate(createdAt, storageDays).getTime();
  const total = expiry - created;
  const elapsed = Date.now() - created;
  return Math.min(100, Math.max(0, (elapsed / total) * 100));
}

export type ExpiryUrgency = 'ok' | 'warning' | 'critical' | 'expired';

export function getExpiryUrgency(createdAt: string, storageDays?: number): ExpiryUrgency {
  const days = getDaysRemaining(createdAt, storageDays);
  if (days <= 0) return 'expired';
  if (days <= 1) return 'critical';
  if (days <= 2) return 'warning';
  return 'ok';
}

export function formatDaysRemaining(createdAt: string, storageDays?: number): string {
  const days = getDaysRemaining(createdAt, storageDays);
  if (days <= 0) return 'Expired';
  if (days === 1) return '1 day left';
  return `${days} days left`;
}

export function purgeExpiredPortfolios(portfolios: Portfolio[]): Portfolio[] {
  return portfolios.filter(p => !isProjectExpired(p.createdAt));
}
