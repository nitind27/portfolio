'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useBuilderStore } from '@/lib/store';
import Builder from '@/components/Builder';
import { setAdminSaveContext, markSkipProjectSync } from '@/lib/projects-storage';
import { useBrand } from '@/components/theme/ThemeProvider';

function AdminBuilderInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const brand = useBrand();
  const userId = Number(searchParams.get('userId'));
  const projectId = searchParams.get('projectId') || '';
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userName, setUserName] = useState('');
  const { setActivePortfolio, user, initAuth, authLoading } = useBuilderStore();
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => { initAuth().then(() => setAuthReady(true)); }, [initAuth]);

  useEffect(() => {
    if (!authReady || authLoading) return;
    if (!userId || !projectId) {
      setError('Missing userId or projectId');
      setLoading(false);
      return;
    }
    if (user?.role !== 'admin') {
      setError('Admin access required');
      setLoading(false);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const [profileRes, projectRes] = await Promise.all([
          fetch(`/api/admin/users/${userId}`),
          fetch(`/api/admin/users/${userId}/projects/${projectId}`),
        ]);
        const profileData = await profileRes.json();
        const projectData = await projectRes.json();
        if (!profileRes.ok || !projectRes.ok) {
          throw new Error(projectData.error || profileData.error || 'Failed to load');
        }
        if (cancelled) return;

        setUserName(profileData.profile?.name || `User #${userId}`);
        setAdminSaveContext({ userId });
        markSkipProjectSync();
        useBuilderStore.setState({
          portfolios: [projectData.portfolio],
          activePortfolioId: projectId,
          projectsLoaded: true,
          hasSeenBuilderTour: true,
          hasSeenDashboardTour: true,
        });
        setActivePortfolio(projectId);
        setLoading(false);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Load failed');
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
      setAdminSaveContext(null);
    };
  }, [userId, projectId, user?.role, setActivePortfolio, authReady, authLoading]);

  if (!authReady || authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: brand.bg }}>
        <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6" style={{ background: brand.bg }}>
        <p className="text-red-400 text-sm">{error}</p>
        <button type="button" onClick={() => router.push(`/admin/user/${userId}`)} className="text-sm text-orange-400 hover:underline">
          Back to user profile
        </button>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <div className="shrink-0 px-4 py-2 border-b flex items-center justify-between text-xs" style={{ borderColor: brand.border, background: brand.navy }}>
        <span className="text-amber-400 font-medium">Admin editing: {userName}&apos;s project</span>
        <button
          type="button"
          onClick={() => router.push(`/admin/user/${userId}`)}
          className="text-gray-400 hover:text-white transition"
        >
          ← Back to profile
        </button>
      </div>
      <div className="flex-1 min-h-0">
        <Builder />
      </div>
    </div>
  );
}

export default function AdminBuilderPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#0a1628]">
        <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
      </div>
    }>
      <AdminBuilderInner />
    </Suspense>
  );
}
