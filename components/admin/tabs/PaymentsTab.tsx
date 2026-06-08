'use client';

import { useMemo, useState } from 'react';
import { Search, Download, CreditCard } from 'lucide-react';
import { SectionHeader, Badge, adminInput, adminCard, adminCardStyle, AdminSelect } from '../ui';
import type { AdminPaymentRow } from '@/lib/admin-data';

interface Props {
  payments: AdminPaymentRow[];
}

export default function PaymentsTab({ payments }: Props) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = useMemo(() => payments.filter(p => {
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return p.orderId.toLowerCase().includes(q) || p.userEmail.toLowerCase().includes(q) || p.userName.toLowerCase().includes(q);
    }
    return true;
  }), [payments, search, statusFilter]);

  const totals = useMemo(() => ({
    paid: payments.filter(p => p.status === 'paid').reduce((s, p) => s + p.amount, 0),
    pending: payments.filter(p => p.status === 'pending').length,
    failed: payments.filter(p => p.status === 'failed').length,
  }), [payments]);

  const exportCsv = () => {
    const header = 'Order ID,User,Email,Plan,Amount,Status,Date\n';
    const rows = filtered.map(p =>
      `${p.orderId},"${p.userName}",${p.userEmail},${p.planName || ''},${p.amount},${p.status},${p.createdAt}`,
    ).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `site99-payments-${Date.now()}.csv`;
    a.click();
  };

  return (
    <div className="space-y-5">
      <SectionHeader
        title="Payments & orders"
        desc={`${payments.length} transactions · ₹${totals.paid.toLocaleString('en-IN')} collected`}
        action={
          <button onClick={exportCsv} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs border border-white/10 hover:bg-white/5">
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
        }
      />

      <div className="grid sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-xl border border-green-500/20 bg-green-500/5">
          <p className="text-lg font-bold text-green-400">₹{totals.paid.toLocaleString('en-IN')}</p>
          <p className="text-[10px] text-gray-500">Total collected</p>
        </div>
        <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5">
          <p className="text-lg font-bold text-amber-400">{totals.pending}</p>
          <p className="text-[10px] text-gray-500">Pending orders</p>
        </div>
        <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/5">
          <p className="text-lg font-bold text-red-400">{totals.failed}</p>
          <p className="text-[10px] text-gray-500">Failed orders</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search order, user…" className={adminInput + ' pl-9'} />
        </div>
        <AdminSelect
          value={statusFilter}
          onChange={setStatusFilter}
          className="w-40"
          aria-label="Filter by status"
          options={[
            { value: 'all', label: 'All status' },
            { value: 'paid', label: 'Paid' },
            { value: 'pending', label: 'Pending' },
            { value: 'failed', label: 'Failed' },
            { value: 'expired', label: 'Expired' },
          ]}
        />
      </div>

      <div className={`${adminCard} overflow-x-auto`} style={adminCardStyle}>
        <table className="w-full text-sm min-w-[900px]">
          <thead>
            <tr className="border-b border-white/10 text-left text-xs text-gray-500">
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Plan</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                <td className="px-4 py-3">
                  <p className="font-mono text-xs text-gray-300">{p.orderId}</p>
                </td>
                <td className="px-4 py-3">
                  <p className="text-white text-sm">{p.userName}</p>
                  <p className="text-[10px] text-gray-500">{p.userEmail}</p>
                </td>
                <td className="px-4 py-3 text-xs text-gray-400">{p.planName || '—'}</td>
                <td className="px-4 py-3 font-mono text-green-400">₹{p.amount}</td>
                <td className="px-4 py-3">
                  <Badge variant={p.status === 'paid' ? 'success' : p.status === 'pending' ? 'warning' : 'danger'}>{p.status}</Badge>
                </td>
                <td className="px-4 py-3 text-xs text-gray-500">
                  {new Date(p.createdAt).toLocaleString('en-IN')}
                  {p.paidAt && <span className="block text-[10px] text-green-600">Paid {new Date(p.paidAt).toLocaleDateString('en-IN')}</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-16 text-center text-gray-500">
            <CreditCard className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No payments found</p>
          </div>
        )}
      </div>
    </div>
  );
}
