'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from './ThemeProvider';

interface Props {
  /** compact = icon + short label; full = icon + "Light mode" / "Dark mode" */
  variant?: 'compact' | 'full' | 'icon';
  className?: string;
}

export default function ThemeToggle({ variant = 'full', className = '' }: Props) {
  const { theme, toggleTheme, brand, isLight } = useTheme();

  const label = isLight ? 'Dark mode' : 'Light mode';
  const shortLabel = isLight ? 'Dark' : 'Light';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={label}
      aria-label={`Switch to ${label.toLowerCase()}`}
      className={`inline-flex items-center justify-center gap-2 rounded-xl text-xs font-medium border transition hover:scale-[1.02] active:scale-[0.98] ${
        variant === 'icon' ? 'p-2' : 'px-3 py-2'
      } ${className}`}
      style={{
        borderColor: brand.border,
        background: isLight ? 'rgba(15,23,42,0.04)' : 'rgba(255,255,255,0.05)',
        color: brand.textMuted,
      }}
    >
      {isLight ? (
        <Moon className="w-4 h-4 shrink-0" style={{ color: brand.accent }} />
      ) : (
        <Sun className="w-4 h-4 shrink-0" style={{ color: brand.accentLight }} />
      )}
      {variant === 'full' && <span className="whitespace-nowrap">{label}</span>}
      {variant === 'compact' && <span className="whitespace-nowrap hidden sm:inline">{shortLabel}</span>}
    </button>
  );
}
