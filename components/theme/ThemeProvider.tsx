'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  type ThemeMode,
  type BrandPalette,
  THEME_STORAGE_KEY,
  getBrandPalette,
  applyThemeToDocument,
  readStoredTheme,
} from '@/lib/app-theme';

interface ThemeContextValue {
  theme: ThemeMode;
  brand: BrandPalette;
  setTheme: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  isLight: boolean;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Always match SSR first paint — sync real preference after mount (avoids hydration mismatch).
  const [theme, setThemeState] = useState<ThemeMode>('dark');

  useEffect(() => {
    const attr = document.documentElement.getAttribute('data-theme');
    const resolved: ThemeMode =
      attr === 'light' || attr === 'dark' ? attr : readStoredTheme();
    setThemeState(resolved);
    applyThemeToDocument(resolved);
  }, []);

  const setTheme = useCallback((mode: ThemeMode) => {
    setThemeState(mode);
    applyThemeToDocument(mode);
    try { localStorage.setItem(THEME_STORAGE_KEY, mode); } catch { /* ignore */ }
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState(prev => {
      const next: ThemeMode = prev === 'dark' ? 'light' : 'dark';
      applyThemeToDocument(next);
      try { localStorage.setItem(THEME_STORAGE_KEY, next); } catch { /* ignore */ }
      return next;
    });
  }, []);

  const value = useMemo<ThemeContextValue>(() => ({
    theme,
    brand: getBrandPalette(theme),
    setTheme,
    toggleTheme,
    isLight: theme === 'light',
  }), [theme, setTheme, toggleTheme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}

export function useBrand(): BrandPalette {
  return useTheme().brand;
}
