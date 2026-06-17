'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { trackAnalytics } from '@/lib/analytics-client';

export default function SiteAnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;
    trackAnalytics('page_view', { path: pathname });
  }, [pathname]);

  return null;
}
