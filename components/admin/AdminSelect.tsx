'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronDown } from 'lucide-react';
import { brand } from '@/lib/brand';

export interface AdminSelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface AdminSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: AdminSelectOption[];
  placeholder?: string;
  className?: string;
  size?: 'sm' | 'md';
  disabled?: boolean;
  'aria-label'?: string;
}

export default function AdminSelect({
  value,
  onChange,
  options,
  placeholder = 'Select…',
  className = '',
  size = 'md',
  disabled = false,
  'aria-label': ariaLabel,
}: AdminSelectProps) {
  const [open, setOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState<{ top: number; left: number; width: number } | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  const selected = options.find(o => o.value === value);
  const label = selected?.label ?? placeholder;

  const updateMenuPos = () => {
    const btn = btnRef.current;
    if (!btn) return;
    const r = btn.getBoundingClientRect();
    setMenuStyle({
      top: r.bottom + 6,
      left: r.left,
      width: r.width,
    });
  };

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node;
      if (rootRef.current?.contains(t)) return;
      if ((e.target as HTMLElement).closest?.('[data-admin-select-menu]')) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  useEffect(() => {
    if (!open) return;
    updateMenuPos();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    const onScroll = () => updateMenuPos();
    document.addEventListener('keydown', onKey);
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onScroll);
    return () => {
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onScroll);
    };
  }, [open]);

  const py = size === 'sm' ? 'py-1.5' : 'py-2.5';
  const text = size === 'sm' ? 'text-xs' : 'text-sm';

  const menu = open && menuStyle && typeof document !== 'undefined' ? createPortal(
    <ul
      role="listbox"
      data-admin-select-menu
      className="fixed z-[9999] max-h-60 overflow-y-auto rounded-xl border py-1 shadow-2xl shadow-black/60"
      style={{
        top: menuStyle.top,
        left: menuStyle.left,
        width: menuStyle.width,
        background: brand.navySoft,
        borderColor: brand.border,
      }}
    >
      {options.map(opt => {
        const active = opt.value === value;
        return (
          <li key={opt.value || '__empty__'} role="option" aria-selected={active}>
            <button
              type="button"
              disabled={opt.disabled}
              onClick={() => {
                if (opt.disabled) return;
                onChange(opt.value);
                setOpen(false);
              }}
              className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 text-left text-sm transition disabled:opacity-40 ${
                active
                  ? 'bg-orange-500/15 text-orange-100'
                  : 'text-gray-300 hover:bg-white/[0.06] hover:text-white'
              }`}
            >
              <span className="truncate">{opt.label}</span>
              {active && <Check className="w-4 h-4 shrink-0 text-orange-400" />}
            </button>
          </li>
        );
      })}
    </ul>,
    document.body,
  ) : null;

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        ref={btnRef}
        type="button"
        disabled={disabled}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => {
          if (disabled) return;
          if (!open) updateMenuPos();
          setOpen(v => !v);
        }}
        className={`w-full flex items-center justify-between gap-2 rounded-xl border px-3 ${py} ${text} font-medium transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed ${
          open
            ? 'border-orange-500/50 bg-white/[0.08] text-white shadow-[0_0_0_1px_rgba(242,140,40,0.15)]'
            : 'border-white/10 bg-[#0f2438] text-gray-200 hover:border-white/20 hover:bg-white/[0.06]'
        }`}
      >
        <span className={`truncate text-left ${selected ? 'text-white' : 'text-gray-500'}`}>{label}</span>
        <ChevronDown
          className={`w-4 h-4 shrink-0 text-gray-400 transition-transform duration-200 ${open ? 'rotate-180 text-orange-400' : ''}`}
        />
      </button>
      {menu}
    </div>
  );
}
