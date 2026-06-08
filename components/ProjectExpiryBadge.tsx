'use client';

import { Clock, AlertTriangle } from 'lucide-react';
import {
  formatDaysRemaining, getDaysRemaining, getExpiryProgress, getExpiryUrgency,
} from '@/lib/project-expiry';
import { STORAGE_POLICY_DAYS } from '@/lib/brand';

interface Props {
  createdAt: string;
  compact?: boolean;
  showBar?: boolean;
}

const urgencyStyles = {
  ok: { badge: 'bg-blue-500/15 text-blue-300 border-blue-500/25', bar: 'bg-blue-500' },
  warning: { badge: 'bg-amber-500/15 text-amber-300 border-amber-500/25', bar: 'bg-amber-500' },
  critical: { badge: 'bg-red-500/15 text-red-300 border-red-500/25', bar: 'bg-red-500' },
  expired: { badge: 'bg-red-500/20 text-red-400 border-red-500/30', bar: 'bg-red-600' },
};

export default function ProjectExpiryBadge({ createdAt, compact, showBar = true }: Props) {
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
    <div className="rounded-xl border border-white/8 bg-white/[0.03] p-3">
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5">
          {(urgency === 'warning' || urgency === 'critical')
            ? <AlertTriangle className={`w-3.5 h-3.5 ${urgency === 'critical' ? 'text-red-400' : 'text-amber-400'}`} />
            : <Clock className="w-3.5 h-3.5 text-blue-400" />}
          <span className="text-xs font-medium text-[#c8d0da]">{formatDaysRemaining(createdAt)}</span>
        </div>
        <span className="text-[10px] text-[#5c6b7a]">{STORAGE_POLICY_DAYS}-day cloud storage</span>
      </div>
      {showBar && (
        <div className="h-1.5 rounded-full bg-white/8 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${styles.bar}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
      {days <= 2 && days > 0 && (
        <p className="text-[10px] text-amber-400/80 mt-2">
          Export or go live before it&apos;s removed from your account.
        </p>
      )}
    </div>
  );
}
