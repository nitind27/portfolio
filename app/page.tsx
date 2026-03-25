'use client';
import { useBuilderStore } from '@/lib/store';
import LoginPage from '@/components/LoginPage';
import Dashboard from '@/components/Dashboard';

export default function Home() {
  const isAuthenticated = useBuilderStore(s => s.isAuthenticated);
  return isAuthenticated ? <Dashboard /> : <LoginPage />;
}
