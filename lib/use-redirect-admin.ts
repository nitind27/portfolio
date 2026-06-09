'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useBuilderStore } from '@/lib/store';

/** Sends authenticated admins to /admin (user dashboard & billing pages). */
export function useRedirectIfAdmin() {
  const router = useRouter();
  const { user, authLoading, isAuthenticated } = useBuilderStore();

  useEffect(() => {
    if (!authLoading && isAuthenticated && user?.role === 'admin') {
      router.replace('/admin');
    }
  }, [authLoading, isAuthenticated, user?.role, router]);

  return !authLoading && isAuthenticated && user?.role === 'admin';
}
