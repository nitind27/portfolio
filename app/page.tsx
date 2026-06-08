'use client';

import { Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useBuilderStore } from '@/lib/store';
import LandingPage from '@/components/LandingPage';
import Dashboard from '@/components/Dashboard';
import { Loader2 } from 'lucide-react';
import { brand } from '@/lib/brand';
import type { AuthMode } from '@/components/LoginPage';

function HomeContent() {
  const { isAuthenticated, authLoading, initAuth } = useBuilderStore();
  const searchParams = useSearchParams();
  const wantsLogin = searchParams.get('login') === '1';
  const wantsRegister = searchParams.get('register') === '1';
  const authError = searchParams.get('error') || '';

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: brand.bg }}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: brand.accent }} />
      </div>
    );
  }

  if (isAuthenticated) return <Dashboard />;

  return (
    <LandingPage
      initialAuthOpen={wantsLogin || wantsRegister || Boolean(authError)}
      initialAuthMode={(wantsRegister ? 'register' : 'login') as AuthMode}
      initialAuthError={authError}
    />
  );
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center" style={{ background: brand.bg }}>
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: brand.accent }} />
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  );
}
