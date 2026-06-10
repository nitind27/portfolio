import { headers } from 'next/headers';
import { getPublicSiteStatus } from '@/lib/site-settings';
import MaintenancePage from './MaintenancePage';

/** Staff login, APIs, support & legal/info pages during maintenance */
const BYPASS_PREFIXES = [
  '/admin', '/api', '/maintenance', '/support',
  '/about', '/contact', '/privacy', '/terms',
];

function shouldBypassPath(pathname: string) {
  if (BYPASS_PREFIXES.some(p => pathname.startsWith(p))) return true;
  if (pathname.startsWith('/logo') || pathname.startsWith('/uploads')) return true;
  return false;
}

export default async function MaintenanceGate({ children }: { children: React.ReactNode }) {
  const h = await headers();
  let pathname = h.get('x-pathname') || '';
  if (!pathname) {
    const nextUrl = h.get('x-url') || h.get('next-url');
    if (nextUrl) {
      try { pathname = new URL(nextUrl).pathname; } catch { /* ignore */ }
    }
  }

  if (shouldBypassPath(pathname)) {
    return <>{children}</>;
  }

  const status = await getPublicSiteStatus();
  if (!status.maintenanceMode) {
    return <>{children}</>;
  }

  return <MaintenancePage />;
}
