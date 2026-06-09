'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useBuilderStore } from '@/lib/store';
import AdminPanel from '@/components/admin/AdminPanel';
import BrandLogo from '@/components/BrandLogo';
import { AuthModal } from '@/components/LoginPage';
import { brand } from '@/lib/brand';

export default function AdminPage() {
  const router = useRouter();
  const { isAuthenticated, authLoading, initAuth, user } = useBuilderStore();
  const [authOpen, setAuthOpen] = useState(true);
  const [maintenanceOn, setMaintenanceOn] = useState(false);

  useEffect(() => { initAuth(); }, [initAuth]);

  useEffect(() => {
    fetch('/api/site-status')
      .then(r => r.json())
      .then(d => setMaintenanceOn(Boolean(d.maintenanceMode)))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (isAuthenticated && user?.role !== 'admin') {
      router.replace('/');
    }
  }, [authLoading, isAuthenticated, user?.role, router]);

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
        <p className="text-sm text-gray-400 mt-6 mb-1">Sign in</p>
        <p className="text-xs text-gray-600 mb-6 text-center max-w-sm">
          {maintenanceOn
            ? 'Enter your credentials to access this area.'
            : 'Administrator access only.'}
        </p>
        <AuthModal open={authOpen} onClose={() => setAuthOpen(true)} initialMode="login" adminOnly />
      </div>
    );
  }

  if (user?.role !== 'admin') return null;

  return <AdminPanel />;
}
