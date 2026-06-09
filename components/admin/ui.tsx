'use client';

import { useState } from 'react';
import { LucideIcon, Eye, EyeOff } from 'lucide-react';
import { brand } from '@/lib/brand';

export function StatCard({
  label, value, sub, icon: Icon, accent = brand.accent, trend,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: LucideIcon;
  accent?: string;
  trend?: { value: string; up?: boolean };
}) {
  return (
    <div className="rounded-2xl border p-5 relative overflow-hidden group hover:border-white/20 transition"
      style={{ background: brand.surface, borderColor: brand.border }}>
      <div className="absolute top-0 right-0 w-24 h-24 rounded-full blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2"
        style={{ background: accent }} />
      <div className="flex items-start justify-between relative">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${accent}22` }}>
          <Icon className="w-5 h-5" style={{ color: accent }} />
        </div>
        {trend && (
          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${trend.up ? 'bg-green-500/15 text-green-400' : 'bg-white/5 text-gray-500'}`}>
            {trend.value}
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-white mt-4 tabular-nums">{value}</p>
      <p className="text-xs text-gray-500 mt-1">{label}</p>
      {sub && <p className="text-[10px] text-gray-600 mt-2">{sub}</p>}
    </div>
  );
}

export function MiniBarChart({ data, valueKey = 'count', color = brand.accent }: {
  data: { label: string; value: number }[];
  valueKey?: string;
  color?: string;
}) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="flex items-end gap-1 h-16">
      {data.map(d => (
        <div key={d.label} className="flex-1 flex flex-col items-center gap-1 min-w-0">
          <div className="w-full rounded-t-sm transition-all" style={{
            height: `${Math.max(4, (d.value / max) * 100)}%`,
            background: d.value > 0 ? color : 'rgba(255,255,255,0.06)',
            minHeight: 4,
          }} title={`${d.label}: ${d.value}`} />
          <span className="text-[8px] text-gray-600 truncate w-full text-center">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

export function Badge({ children, variant = 'default' }: { children: React.ReactNode; variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' }) {
  const styles = {
    default: 'bg-white/10 text-gray-300',
    success: 'bg-green-500/15 text-green-400 border-green-500/25',
    warning: 'bg-amber-500/15 text-amber-400 border-amber-500/25',
    danger: 'bg-red-500/15 text-red-400 border-red-500/25',
    info: 'bg-blue-500/15 text-blue-400 border-blue-500/25',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border border-transparent ${styles[variant]}`}>
      {children}
    </span>
  );
}

export function SectionHeader({ title, desc, action }: { title: string; desc?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
      <div>
        <h2 className="text-lg font-bold text-white">{title}</h2>
        {desc && <p className="text-sm text-gray-500 mt-0.5">{desc}</p>}
      </div>
      {action}
    </div>
  );
}

export const adminInput = 'w-full bg-[#0f2438] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50 focus:bg-white/[0.06] transition shadow-inner shadow-black/10';

export function AdminPasswordInput({
  value,
  onChange,
  placeholder,
  autoComplete = 'current-password',
  required = true,
  minLength,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
  minLength?: number;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        type={visible ? 'text' : 'password'}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        autoComplete={autoComplete}
        minLength={minLength}
        className={`${adminInput} pr-10`}
      />
      <button
        type="button"
        onClick={() => setVisible(v => !v)}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-white transition rounded-md"
        aria-label={visible ? 'Hide password' : 'Show password'}
        tabIndex={-1}
      >
        {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  );
}
export const adminSelect = adminInput + ' cursor-pointer appearance-none';
export const adminCard = 'rounded-2xl border overflow-hidden';
export const adminCardStyle = { background: brand.surface, borderColor: brand.border };

export { default as AdminSelect } from './AdminSelect';
export type { AdminSelectOption } from './AdminSelect';
