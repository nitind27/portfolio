'use client';

import { Clock, AlertTriangle } from 'lucide-react';
import {
  formatDaysRemaining, getDaysRemaining, getExpiryProgress, getExpiryUrgency,
} from '@/lib/project-expiry';
import { STORAGE_POLICY_DAYS } from '@/lib/brand';
import { useBrand, useTheme } from './theme/ThemeProvider';

interface Props {
  createdAt: string;
  compact?: boolean;
  showBar?: boolean;
}

const urgencyStyles = {
  ok: { badge: 'bg-blue-500/15 text-blue-600 border-blue-500/25', bar: 'bg-blue-500' },
  warning: { badge: 'bg-amber-500/15 text-amber-700 border-amber-500/25', bar: 'bg-amber-500' },
  critical: { badge: 'bg-red-500/15 text-red-600 border-red-500/25', bar: 'bg-red-500' },
  expired: { badge: 'bg-red-500/20 text-red-600 border-red-500/30', bar: 'bg-red-600' },
};

export default function ProjectExpiryBadge({ createdAt, compact, showBar = true }: Props) {
  const brand = useBrand();
  const { isLight } = useTheme();
  const urgency = getExpiryUrgency(createdAt);
  const styles = urgencyStyles[urgency];
  const days = getDaysRemaining(createdAt);
  const progress = getExpiryProgress(createdAt);

  if (compact) {
    return (
      <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border ${styles.badge}`}>
        {urgency === 'critical' || urgency === 'warning'
          ? <AlertTriangle className="w-3 h-3" />
          : <Clock className="w-3 h-3" />}
        {formatDaysRemaining(createdAt)}
      </span>
    );
  }

  return (
    <div className="rounded-xl border p-3" style={{ borderColor: brand.border, background: isLight ? 'rgba(15,23,42,0.02)' : 'rgba(255,255,255,0.03)' }}>
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5">
          {(urgency === 'warning' || urgency === 'critical')
            ? <AlertTriangle className={`w-3.5 h-3.5 ${urgency === 'critical' ? 'text-red-500' : 'text-amber-600'}`} />
            : <Clock className="w-3.5 h-3.5 text-blue-500" />}
          <span className="text-xs font-medium" style={{ color: brand.text }}>{formatDaysRemaining(createdAt)}</span>
        </div>
        <span className="text-[10px]" style={{ color: brand.textDim }}>{STORAGE_POLICY_DAYS}-day cloud storage</span>
      </div>
      {showBar && (
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: isLight ? 'rgba(15,23,42,0.08)' : 'rgba(255,255,255,0.08)' }}>
          <div
            className={`h-full rounded-full transition-all ${styles.bar}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
      {days <= 2 && days > 0 && (
        <p className="text-[10px] text-amber-600 mt-2">
          Export or go live before it&apos;s removed from your account.
        </p>
      )}
    </div>
  );
}
