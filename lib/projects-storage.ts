import type { Portfolio } from './types';
import { migratePortfolios } from './projects-migrate';

const LEGACY_KEY = 'portfolio-builder-store';
let saveTimer: ReturnType<typeof setTimeout> | null = null;
let pendingSave: (() => Promise<void>) | null = null;
let skipNextSync = false;

export function markSkipProjectSync() {
  skipNextSync = true;
}

export function shouldSkipProjectSync() {
  if (!skipNextSync) return false;
  skipNextSync = false;
  return true;
}

export interface PersistedSlice {
  portfolios: Portfolio[];
  hasSeenDashboardTour: boolean;
  hasSeenBuilderTour: boolean;
}

function readLegacyLocalStorage(): PersistedSlice | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(LEGACY_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const state = parsed?.state;
    if (!state?.portfolios?.length) return null;
    return {
      portfolios: migratePortfolios(state.portfolios),
      hasSeenDashboardTour: Boolean(state.hasSeenDashboardTour),
      hasSeenBuilderTour: Boolean(state.hasSeenBuilderTour),
    };
  } catch {
    return null;
  }
}

function clearLegacyLocalStorage() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(LEGACY_KEY);
  } catch { /* ignore */ }
}

export async function fetchProjectsFromServer(): Promise<PersistedSlice | null> {
  const res = await fetch('/api/projects', { credentials: 'include' });
  if (res.status === 401) return null;
  if (!res.ok) throw new Error('Failed to load projects');

  const data = await res.json();
  let portfolios = migratePortfolios(data.portfolios || []);

  if (portfolios.length === 0) {
    const legacy = readLegacyLocalStorage();
    if (legacy?.portfolios.length) {
      await migrateLegacyToServer(legacy);
      return legacy;
    }
  }

  return {
    portfolios,
    hasSeenDashboardTour: Boolean(data.appConfig?.hasSeenDashboardTour),
    hasSeenBuilderTour: Boolean(data.appConfig?.hasSeenBuilderTour),
  };
}

export async function saveProjectsToServer(slice: PersistedSlice, options?: { merge?: boolean }): Promise<Portfolio[] | null> {
  const res = await fetch('/api/projects', {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      portfolios: slice.portfolios,
      merge: options?.merge,
      appConfig: {
        hasSeenDashboardTour: slice.hasSeenDashboardTour,
        hasSeenBuilderTour: slice.hasSeenBuilderTour,
      },
    }),
  });
  if (res.status === 401) return null;
  if (!res.ok) throw new Error('Failed to save projects');
  const data = await res.json();
  return (data.portfolios as Portfolio[]) || null;
}

async function migrateLegacyToServer(legacy: PersistedSlice): Promise<boolean> {
  try {
    for (const portfolio of legacy.portfolios) {
      await saveProjectsToServer(
        { ...legacy, portfolios: [portfolio] },
        { merge: true },
      );
    }
    clearLegacyLocalStorage();
    return true;
  } catch (e) {
    console.error('Legacy project migration failed:', e);
    return false;
  }
}

export function scheduleSaveProjectsToServer(slice: PersistedSlice, delayMs = 900) {
  pendingSave = async () => {
    const saved = await saveProjectsToServer(slice);
    if (saved?.length) {
      const { useBuilderStore } = await import('./store');
      markSkipProjectSync();
      useBuilderStore.setState(state => ({
        portfolios: state.portfolios.map(p => saved.find(s => s.id === p.id) || p),
      }));
    }
  };
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(async () => {
    try {
      await pendingSave?.();
    } catch (e) {
      console.error('Project sync failed:', e);
    }
  }, delayMs);
}

export async function flushProjectSave() {
  if (saveTimer) {
    clearTimeout(saveTimer);
    saveTimer = null;
  }
  if (pendingSave) await pendingSave();
}
