'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useBuilderStore } from '@/lib/store';
import AdminPanel from '@/components/admin/AdminPanel';
import BrandLogo from '@/components/BrandLogo';
import { AuthModal } from '@/components/LoginPage';
import { brand } from '@/lib/brand';

export default function AdminPage() {
  const { isAuthenticated, authLoading, initAuth, user } = useBuilderStore();
  const [authOpen, setAuthOpen] = useState(true);

  useEffect(() => { initAuth(); }, [initAuth]);

  useEffect(() => {
    if (!authLoading && isAuthenticated && user?.role !== 'admin') {
      window.location.href = '/';
    }
  }, [authLoading, isAuthenticated, user?.role]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: brand.bg }}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: brand.accent }} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{ background: brand.bg }}>
        <BrandLogo size="md" />
        <p className="text-sm text-gray-500 mt-6 mb-2">Administrator sign in</p>
        <p className="text-xs text-gray-600 mb-6 text-center max-w-sm">
          Access the control center. Works even when the site is in maintenance mode.
        </p>
        <AuthModal open={authOpen} onClose={() => setAuthOpen(true)} initialMode="login" />
      </div>
    );
  }

  if (user?.role !== 'admin') return null;

  return <AdminPanel />;
}
