'use client';

import { Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useBuilderStore } from '@/lib/store';
import LandingPage from '@/components/LandingPage';
import Dashboard from '@/components/Dashboard';
import { Loader2 } from 'lucide-react';
import type { AuthMode } from '@/components/LoginPage';
import { useRedirectIfAdmin } from '@/lib/use-redirect-admin';

function HomeContent() {
  const { isAuthenticated, authLoading, initAuth } = useBuilderStore();
  const redirectingAdmin = useRedirectIfAdmin();
  const searchParams = useSearchParams();
  const wantsLogin = searchParams.get('login') === '1';
  const wantsRegister = searchParams.get('register') === '1';
  const authError = searchParams.get('error') || '';

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  if (isAuthenticated) {
    if (authLoading || redirectingAdmin) {
      return (
        <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--background)' }}>
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--accent)' }} />
        </div>
      );
    }
    return <Dashboard />;
  }

  // Guests (and auth check in progress): always render landing — SSR-friendly for SEO crawlers
  return (
    <LandingPage
      initialAuthOpen={wantsLogin || wantsRegister || Boolean(authError)}
      initialAuthMode={(wantsRegister ? 'register' : 'login') as AuthMode}
      initialAuthError={authError}
    />
  );
}

export default function HomePageClient() {
  return (
    <Suspense
      fallback={
        <LandingPage initialAuthOpen={false} initialAuthMode="login" initialAuthError="" />
      }
    >
      <HomeContent />
    </Suspense>
  );
}
