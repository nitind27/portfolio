'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useBuilderStore } from '@/lib/store';
import AdminPanel from '@/components/admin/AdminPanel';
import { brand } from '@/lib/brand';

export default function AdminPage() {
  const router = useRouter();
  const { isAuthenticated, authLoading, initAuth, user } = useBuilderStore();

  useEffect(() => { initAuth(); }, [initAuth]);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) router.replace('/?login=1');
    else if (user?.role !== 'admin') router.replace('/');
  }, [authLoading, isAuthenticated, user?.role, router]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: brand.bg }}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: brand.accent }} />
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'admin') return null;

  return <AdminPanel />;
}
