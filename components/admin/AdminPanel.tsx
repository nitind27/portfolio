'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  LayoutDashboard, CreditCard, LayoutTemplate, Users, ArrowLeft,
  Loader2, Shield, RefreshCw, Grid3x3, Receipt, Bell, ExternalLink,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import BrandLogo from '../BrandLogo';
import { brand } from '@/lib/brand';
import type { SubscriptionPlan } from '@/lib/plans-types';
import type { ExtendedAdminStats, AdminPaymentRow } from '@/lib/admin-data';
import { useBuilderStore } from '@/lib/store';
import OverviewTab from './tabs/OverviewTab';
import PlansTab from './tabs/PlansTab';
import FeaturesMatrixTab from './tabs/FeaturesMatrixTab';
import TemplatesTab from './tabs/TemplatesTab';
import UsersTab from './tabs/UsersTab';
import PaymentsTab from './tabs/PaymentsTab';

type Tab = 'overview' | 'plans' | 'features' | 'templates' | 'users' | 'payments';

const NAV: { id: Tab; label: string; desc: string; icon: typeof LayoutDashboard; group: string }[] = [
  { id: 'overview', label: 'Dashboard', desc: 'Analytics & activity', icon: LayoutDashboard, group: 'Main' },
  { id: 'plans', label: 'Plans', desc: 'Pricing & tiers', icon: CreditCard, group: 'Billing' },
  { id: 'features', label: 'Feature matrix', desc: 'Toggle permissions', icon: Grid3x3, group: 'Billing' },
  { id: 'payments', label: 'Payments', desc: 'Orders & revenue', icon: Receipt, group: 'Billing' },
  { id: 'templates', label: 'Templates', desc: 'Access control', icon: LayoutTemplate, group: 'Content' },
  { id: 'users', label: 'Users', desc: 'Accounts & roles', icon: Users, group: 'Content' },
];

interface AdminTemplate {
  id: string;
  name: string;
  category: string;
  categoryLabel: string;
  minPlanId: number | null;
  minPlanName: string | null;
}

interface AdminUser {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  isPremium: boolean;
  planId: number | null;
  planName: string | null;
  planSlug: string | null;
  premiumPurchasedAt: string | null;
  totalPaid: number;
  paymentCount: number;
  createdAt: string;
}

export default function AdminPanel() {
  const router = useRouter();
  const { user, logout } = useBuilderStore();
  const [tab, setTab] = useState<Tab>('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState<ExtendedAdminStats | null>(null);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [templates, setTemplates] = useState<AdminTemplate[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [payments, setPayments] = useState<AdminPaymentRow[]>([]);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [statsRes, plansRes, templatesRes, usersRes, payRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/plans'),
        fetch('/api/admin/templates'),
        fetch('/api/admin/users'),
        fetch('/api/admin/payments?limit=200'),
      ]);
      if (statsRes.status === 403) throw new Error('Admin access required');
      if (!statsRes.ok) throw new Error('Failed to load admin data');
      const [statsData, plansData, templatesData, usersData, payData] = await Promise.all([
        statsRes.json(), plansRes.json(), templatesRes.json(), usersRes.json(), payRes.json(),
      ]);
      setStats(statsData);
      setPlans(plansData.plans || []);
      setTemplates(templatesData.templates || []);
      setUsers(usersData.users || []);
      setPayments(payData.payments || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Load failed');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const currentNav = NAV.find(n => n.id === tab);
  const groups = [...new Set(NAV.map(n => n.group))];

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: brand.bg }}>
        <div className="text-center max-w-md p-8 rounded-2xl border" style={{ borderColor: brand.border, background: brand.surface }}>
          <Shield className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-white mb-2">Admin access required</h1>
          <p className="text-gray-400 text-sm mb-6">Set role = admin in database for your account.</p>
          <button onClick={() => router.push('/')} className="px-5 py-2.5 rounded-xl text-sm font-medium" style={{ background: brand.accent, color: brand.onAccent }}>
            Go home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex" style={{ background: '#060b14', color: brand.text }}>
      {/* Sidebar */}
      <aside className="w-64 shrink-0 border-r flex flex-col hidden md:flex" style={{ borderColor: brand.border, background: brand.navy }}>
        <div className="p-5 border-b" style={{ borderColor: brand.border }}>
          <BrandLogo size="sm" onDark={false} />
          <div className="mt-3 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-[10px] text-gray-500 uppercase tracking-widest font-medium">Control Center</span>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-5">
          {groups.map(group => (
            <div key={group}>
              <p className="text-[10px] uppercase tracking-wider text-gray-600 px-3 mb-2">{group}</p>
              <div className="space-y-0.5">
                {NAV.filter(n => n.group === group).map(item => (
                  <button key={item.id} onClick={() => setTab(item.id)}
                    className={`w-full flex items-start gap-3 px-3 py-2.5 rounded-xl text-left transition ${
                      tab === item.id ? 'bg-blue-600/90 text-white shadow-lg shadow-blue-900/30' : 'text-gray-400 hover:text-white hover:bg-white/[0.04]'
                    }`}>
                    <item.icon className="w-4 h-4 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium leading-none">{item.label}</p>
                      <p className={`text-[10px] mt-1 ${tab === item.id ? 'text-blue-100/70' : 'text-gray-600'}`}>{item.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-3 border-t space-y-1" style={{ borderColor: brand.border }}>
          <button onClick={() => router.push('/')} className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-gray-400 hover:text-white rounded-xl hover:bg-white/5">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to builder
          </button>
          <button onClick={() => { logout(); router.push('/'); }} className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-gray-500 hover:text-red-400 rounded-xl hover:bg-red-500/5">
            Sign out
          </button>
        </div>
      </aside>

      {/* Mobile nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 border-t flex overflow-x-auto" style={{ background: brand.navy, borderColor: brand.border }}>
        {NAV.map(item => (
          <button key={item.id} onClick={() => setTab(item.id)}
            className={`flex-1 min-w-[72px] py-3 flex flex-col items-center gap-0.5 text-[10px] ${tab === item.id ? 'text-blue-400' : 'text-gray-500'}`}>
            <item.icon className="w-4 h-4" /> {item.label}
          </button>
        ))}
      </div>

      <main className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
        {/* Top bar */}
        <header className="sticky top-0 z-20 border-b px-4 md:px-8 py-4 flex items-center justify-between gap-4 backdrop-blur-xl"
          style={{ background: 'rgba(6,11,20,0.85)', borderColor: brand.border }}>
          <div className="min-w-0">
            <p className="text-[10px] text-gray-600 uppercase tracking-wider mb-0.5">{currentNav?.group}</p>
            <h1 className="text-xl font-bold text-white truncate">{currentNav?.label}</h1>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {stats && stats.pendingPayments > 0 && (
              <button onClick={() => setTab('payments')} className="relative p-2 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20">
                <Bell className="w-4 h-4" />
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-[9px] font-bold text-black flex items-center justify-center">{stats.pendingPayments}</span>
              </button>
            )}
            <button onClick={loadAll} disabled={loading}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs border border-white/10 hover:bg-white/5 transition">
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Sync</span>
            </button>
            <a href="/" target="_blank" rel="noopener noreferrer" className="hidden sm:flex items-center gap-1 px-3 py-2 rounded-xl text-xs border border-white/10 hover:bg-white/5 text-gray-400">
              <ExternalLink className="w-3.5 h-3.5" /> Site
            </a>
            <div className="hidden lg:flex items-center gap-2 pl-3 border-l border-white/10">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: brand.accentMuted, color: brand.accentLight }}>
                {user?.name?.charAt(0)}
              </div>
              <div className="text-left">
                <p className="text-xs font-medium text-white truncate max-w-[120px]">{user?.name}</p>
                <p className="text-[10px] text-gray-600">Administrator</p>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 px-4 md:px-8 py-6 overflow-auto">
          {error && (
            <div className="mb-5 p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-300 text-sm flex items-center gap-2">
              <Shield className="w-4 h-4 shrink-0" /> {error}
            </div>
          )}

          {loading && !stats ? (
            <div className="flex flex-col items-center justify-center py-32 gap-3">
              <Loader2 className="w-10 h-10 animate-spin text-blue-400" />
              <p className="text-sm text-gray-500">Loading control center…</p>
            </div>
          ) : (
            <>
              {tab === 'overview' && stats && <OverviewTab stats={stats} />}
              {tab === 'plans' && <PlansTab plans={plans} onRefresh={loadAll} />}
              {tab === 'features' && <FeaturesMatrixTab plans={plans} onRefresh={loadAll} />}
              {tab === 'templates' && <TemplatesTab templates={templates} plans={plans} onRefresh={loadAll} />}
              {tab === 'users' && <UsersTab users={users} plans={plans} onRefresh={loadAll} />}
              {tab === 'payments' && <PaymentsTab payments={payments} />}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
