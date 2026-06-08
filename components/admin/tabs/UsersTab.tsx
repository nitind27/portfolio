'use client';

import { useMemo, useState } from 'react';
import { Search, User, Mail, Phone, Crown, Shield, ChevronRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { brand } from '@/lib/brand';
import { SectionHeader, Badge, adminInput, adminCard, adminCardStyle, AdminSelect } from '../ui';
import type { SubscriptionPlan } from '@/lib/plans-types';

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

interface Props {
  users: AdminUser[];
  plans: SubscriptionPlan[];
  onRefresh: () => void;
}

export default function UsersTab({ users, plans, onRefresh }: Props) {
  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selected, setSelected] = useState<AdminUser | null>(null);

  const filtered = useMemo(() => users.filter(u => {
    if (planFilter !== 'all' && String(u.planId) !== planFilter) return false;
    if (roleFilter !== 'all' && u.role !== roleFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.phone.includes(q);
    }
    return true;
  }), [users, search, planFilter, roleFilter]);

  const updateUser = async (userId: number, action: string, payload: Record<string, unknown>) => {
    const res = await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, action, ...payload }),
    });
    if (res.ok) {
      onRefresh();
      if (selected?.id === userId) {
        const updated = users.find(u => u.id === userId);
        if (updated) setSelected({ ...updated, ...payload, planName: plans.find(p => p.id === payload.planId)?.name ?? updated.planName });
      }
    } else alert((await res.json()).error || 'Update failed');
  };

  return (
    <div className="space-y-5">
      <SectionHeader title="User management" desc={`${users.length} registered users`} />

      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, email, phone…" className={adminInput + ' pl-9'} />
        </div>
        <AdminSelect
          value={planFilter}
          onChange={setPlanFilter}
          className="w-40"
          aria-label="Filter by plan"
          options={[
            { value: 'all', label: 'All plans' },
            ...plans.map(p => ({ value: String(p.id), label: p.name })),
          ]}
        />
        <AdminSelect
          value={roleFilter}
          onChange={setRoleFilter}
          className="w-36"
          aria-label="Filter by role"
          options={[
            { value: 'all', label: 'All roles' },
            { value: 'user', label: 'Users' },
            { value: 'admin', label: 'Admins' },
          ]}
        />
      </div>

      <div className={`${adminCard} overflow-x-auto`} style={adminCardStyle}>
        <table className="w-full text-sm min-w-[800px]">
          <thead>
            <tr className="border-b border-white/10 text-left text-xs text-gray-500">
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Plan</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Revenue</th>
              <th className="px-4 py-3">Joined</th>
              <th className="px-4 py-3 w-10" />
            </tr>
          </thead>
          <tbody>
            {filtered.map(u => (
              <tr key={u.id} className="border-b border-white/5 hover:bg-white/[0.03] cursor-pointer" onClick={() => setSelected(u)}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                      style={{ background: brand.accentMuted, color: brand.accentLight }}>
                      {u.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-white flex items-center gap-1.5">
                        {u.name}
                        {u.isPremium && <Crown className="w-3 h-3 text-amber-400" />}
                      </p>
                      <p className="text-[10px] text-gray-500">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                  <AdminSelect
                    size="sm"
                    value={String(u.planId ?? '')}
                    onChange={v => updateUser(u.id, 'set_plan', { planId: Number(v) })}
                    className="min-w-[120px]"
                    aria-label="User plan"
                    options={plans.map(p => ({ value: String(p.id), label: p.name }))}
                  />
                </td>
                <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                  <AdminSelect
                    size="sm"
                    value={u.role}
                    onChange={v => updateUser(u.id, 'set_role', { role: v })}
                    className="w-28"
                    aria-label="User role"
                    options={[
                      { value: 'user', label: 'User' },
                      { value: 'admin', label: 'Admin' },
                    ]}
                  />
                </td>
                <td className="px-4 py-3">
                  <span className="text-green-400 font-mono text-xs">₹{u.totalPaid}</span>
                  <span className="text-gray-600 text-[10px] ml-1">({u.paymentCount})</span>
                </td>
                <td className="px-4 py-3 text-xs text-gray-500">{new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
                <td className="px-4 py-3"><ChevronRight className="w-4 h-4 text-gray-600" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {selected && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40" onClick={() => setSelected(null)} />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="fixed top-0 right-0 h-full w-full max-w-md z-50 border-l flex flex-col shadow-2xl"
              style={{ background: brand.navy, borderColor: brand.border }}>
              <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: brand.border }}>
                <h3 className="font-bold">User details</h3>
                <button onClick={() => setSelected(null)} className="p-2 rounded-lg hover:bg-white/5"><X className="w-4 h-4" /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-5 space-y-5">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold"
                    style={{ background: brand.accentMuted, color: brand.accent }}>
                    {selected.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-lg font-bold text-white">{selected.name}</p>
                    <div className="flex gap-2 mt-1">
                      <Badge variant={selected.role === 'admin' ? 'info' : 'default'}>{selected.role}</Badge>
                      {selected.isPremium && <Badge variant="warning">Premium</Badge>}
                    </div>
                  </div>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03]"><Mail className="w-4 h-4 text-gray-500" />{selected.email}</div>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03]"><Phone className="w-4 h-4 text-gray-500" />{selected.phone}</div>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03]"><User className="w-4 h-4 text-gray-500" />ID #{selected.id}</div>
                  {selected.role === 'admin' && <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20"><Shield className="w-4 h-4 text-blue-400" />Administrator access</div>}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 rounded-xl border border-white/5 text-center">
                    <p className="text-xl font-bold text-green-400">₹{selected.totalPaid}</p>
                    <p className="text-[10px] text-gray-500">Lifetime paid</p>
                  </div>
                  <div className="p-4 rounded-xl border border-white/5 text-center">
                    <p className="text-xl font-bold text-white">{selected.paymentCount}</p>
                    <p className="text-[10px] text-gray-500">Orders</p>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1.5 block">Assign plan</label>
                  <AdminSelect
                    value={String(selected.planId ?? '')}
                    onChange={v => updateUser(selected.id, 'set_plan', { planId: Number(v) })}
                    aria-label="Assign plan"
                    options={plans.map(p => ({ value: String(p.id), label: `${p.name} — ₹${p.price}` }))}
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1.5 block">Role</label>
                  <AdminSelect
                    value={selected.role}
                    onChange={v => updateUser(selected.id, 'set_role', { role: v })}
                    aria-label="Assign role"
                    options={[
                      { value: 'user', label: 'User' },
                      { value: 'admin', label: 'Admin' },
                    ]}
                  />
                </div>
                <p className="text-[10px] text-gray-600">Joined {new Date(selected.createdAt).toLocaleString('en-IN')}</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
