'use client';

import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';
import { brand } from '@/lib/brand';

/** Shown to logged-in admins when maintenance mode is on and admin preview is enabled */
export default function AdminMaintenanceBanner() {
  return (
    <div
      className="sticky top-0 z-[100] px-4 py-2.5 flex flex-wrap items-center justify-center gap-2 text-center text-xs border-b"
      style={{
        background: 'rgba(245, 158, 11, 0.12)',
        borderColor: 'rgba(245, 158, 11, 0.35)',
        color: '#fcd34d',
      }}
    >
      <AlertTriangle className="w-4 h-4 shrink-0" />
      <span>
        <strong>Maintenance mode is ON.</strong> Visitors see the maintenance page — you see the live site because admin preview is enabled.
      </span>
      <Link
        href="/maintenance"
        target="_blank"
        className="underline font-medium hover:text-white"
        style={{ color: brand.accentLight }}
      >
        Preview visitor page
      </Link>
    </div>
  );
}
