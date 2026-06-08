'use client';

import { motion } from 'framer-motion';
import { Users, Crown, IndianRupee, CreditCard, TrendingUp, Clock, LayoutTemplate, AlertCircle } from 'lucide-react';
import { brand } from '@/lib/brand';
import { StatCard, MiniBarChart, Badge, SectionHeader, adminCard, adminCardStyle } from '../ui';
import type { ExtendedAdminStats } from '@/lib/admin-data';

function formatDay(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

export default function OverviewTab({ stats }: { stats: ExtendedAdminStats }) {
  const signupChart = stats.signupsByDay.slice(-7).map(d => ({
    label: formatDay(d.date).split(' ')[0],
    value: d.count,
  }));
  const revenueChart = stats.revenueByDay.slice(-7).map(d => ({
    label: formatDay(d.date).split(' ')[0],
    value: d.amount ?? 0,
  }));

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Total users" value={stats.totalUsers} icon={Users} accent="#3b82f6"
          sub={`+${stats.newUsersThisMonth} this month`} trend={{ value: `+${stats.newUsersThisMonth} MTD`, up: stats.newUsersThisMonth > 0 }} />
        <StatCard label="Premium users" value={stats.premiumUsers} icon={Crown} accent="#f59e0b"
          sub={`${stats.conversionRate}% conversion`} />
        <StatCard label="Total revenue" value={`₹${stats.revenue.toLocaleString('en-IN')}`} icon={IndianRupee} accent="#22c55e"
          sub={`₹${stats.revenueThisMonth.toLocaleString('en-IN')} this month`} />
        <StatCard label="Paid orders" value={stats.paidOrders} icon={CreditCard} accent="#8b5cf6"
          sub={`${stats.pendingPayments} pending · ${stats.failedPayments} failed`} />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className={`lg:col-span-2 ${adminCard} p-5`} style={adminCardStyle}>
          <SectionHeader title="Growth (14 days)" desc="New signups vs paid revenue" />
          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <p className="text-xs text-gray-500 mb-3 flex items-center gap-1"><Users className="w-3 h-3" /> Signups</p>
              <MiniBarChart data={signupChart.length ? signupChart : [{ label: '—', value: 0 }]} color="#3b82f6" />
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-3 flex items-center gap-1"><TrendingUp className="w-3 h-3" /> Revenue (₹)</p>
              <MiniBarChart data={revenueChart.length ? revenueChart : [{ label: '—', value: 0 }]} color="#22c55e" />
            </div>
          </div>
        </div>

        <div className={`${adminCard} p-5`} style={adminCardStyle}>
          <SectionHeader title="Plan distribution" />
          <div className="space-y-3">
            {stats.planBreakdown.map(p => {
              const pct = stats.totalUsers > 0 ? Math.round((p.userCount / stats.totalUsers) * 100) : 0;
              return (
                <div key={p.slug}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-300">{p.name}</span>
                    <span className="text-gray-500">{p.userCount} · {pct}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.6 }}
                      className="h-full rounded-full" style={{ background: brand.accent }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className={`${adminCard}`} style={adminCardStyle}>
          <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
            <h3 className="font-semibold text-sm flex items-center gap-2"><Clock className="w-4 h-4 text-blue-400" /> Recent signups</h3>
          </div>
          <div className="divide-y divide-white/5">
            {stats.recentUsers.map(u => (
              <div key={u.id} className="px-5 py-3 flex items-center justify-between gap-3 hover:bg-white/[0.02]">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white truncate">{u.name}</p>
                  <p className="text-[10px] text-gray-500 truncate">{u.email}</p>
                </div>
                <div className="text-right shrink-0">
                  <Badge variant="info">{u.planName || 'Free'}</Badge>
                  <p className="text-[10px] text-gray-600 mt-1">{new Date(u.createdAt).toLocaleDateString('en-IN')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={`${adminCard}`} style={adminCardStyle}>
          <div className="px-5 py-4 border-b border-white/5">
            <h3 className="font-semibold text-sm flex items-center gap-2"><CreditCard className="w-4 h-4 text-green-400" /> Recent payments</h3>
          </div>
          <div className="divide-y divide-white/5">
            {stats.recentPayments.length === 0 ? (
              <p className="px-5 py-8 text-sm text-gray-500 text-center">No payments yet</p>
            ) : stats.recentPayments.map(p => (
              <div key={p.id} className="px-5 py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm text-white">₹{p.amount} · {p.planName || 'Plan'}</p>
                  <p className="text-[10px] text-gray-500 truncate">{p.userEmail}</p>
                </div>
                <Badge variant={p.status === 'paid' ? 'success' : p.status === 'pending' ? 'warning' : 'danger'}>{p.status}</Badge>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={`${adminCard} p-5`} style={adminCardStyle}>
        <SectionHeader title="Template access" desc="Free vs premium templates across categories" />
        <div className="grid sm:grid-cols-3 gap-4 mb-4">
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 text-center">
            <LayoutTemplate className="w-5 h-5 text-blue-400 mx-auto mb-2" />
            <p className="text-xl font-bold">{stats.templateStats.total}</p>
            <p className="text-[10px] text-gray-500">Total templates</p>
          </div>
          <div className="p-4 rounded-xl bg-green-500/5 border border-green-500/20 text-center">
            <p className="text-xl font-bold text-green-400">{stats.templateStats.free}</p>
            <p className="text-[10px] text-gray-500">Free access</p>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 text-center">
            <p className="text-xl font-bold text-amber-400">{stats.templateStats.premium}</p>
            <p className="text-[10px] text-gray-500">Plan required</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {stats.templateStats.byCategory.slice(0, 8).map(c => (
            <span key={c.category} className="text-[10px] px-2 py-1 rounded-lg bg-white/5 text-gray-400">
              {c.category}: <span className="text-green-400">{c.free}</span> free · <span className="text-amber-400">{c.premium}</span> pro
            </span>
          ))}
        </div>
      </div>

      {(stats.pendingPayments > 0) && (
        <div className="flex items-start gap-3 p-4 rounded-xl border border-amber-500/20 bg-amber-500/5">
          <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
          <div>
            <p className="text-sm font-medium text-amber-200">{stats.pendingPayments} pending payment(s)</p>
            <p className="text-xs text-gray-500 mt-0.5">Check Payments tab for orders awaiting completion.</p>
          </div>
        </div>
      )}
    </div>
  );
}
