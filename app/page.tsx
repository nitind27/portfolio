'use client';
import { useEffect } from 'react';
import { useBuilderStore } from '@/lib/store';
import LandingPage from '@/components/LandingPage';
import Dashboard from '@/components/Dashboard';
import { Loader2 } from 'lucide-react';
import { brand } from '@/lib/brand';

export default function Home() {
  const { isAuthenticated, authLoading, initAuth } = useBuilderStore();

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

  return isAuthenticated ? <Dashboard /> : <LandingPage />;
}
