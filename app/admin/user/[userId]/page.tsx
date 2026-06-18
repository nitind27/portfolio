'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useBuilderStore } from '@/lib/store';
import UserProfileTab from '@/components/admin/tabs/UserProfileTab';
import { useBrand } from '@/components/theme/ThemeProvider';

export default function AdminUserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const brand = useBrand();
  const userId = Number(params.userId);
  const { user, authLoading, initAuth, isAuthenticated } = useBuilderStore();
  const [ready, setReady] = useState(false);

  useEffect(() => { initAuth().then(() => setReady(true)); }, [initAuth]);

  useEffect(() => {
    if (ready && !authLoading && isAuthenticated && user?.role !== 'admin') {
      router.replace('/');
    }
  }, [ready, authLoading, isAuthenticated, user?.role, router]);

  if (!ready || authLoading) {
    return (
      <div className="theme-aware min-h-screen flex items-center justify-center" style={{ background: brand.bg }}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: brand.accent }} />
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'admin') return null;

  if (!userId || Number.isNaN(userId)) {
    return <div className="p-8 text-center text-gray-500">Invalid user ID</div>;
  }

  return (
    <div className="theme-aware min-h-screen" style={{ background: brand.bg }}>
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-8">
        <UserProfileTab userId={userId} />
      </div>
    </div>
  );
}
