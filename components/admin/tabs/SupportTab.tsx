'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Search, Download, MessageSquare, AlertCircle, ThumbsUp, Bug, CreditCard,
  HelpCircle, Mail, Loader2, X, CheckCircle2, Clock, User,
} from 'lucide-react';
import { SectionHeader, Badge, adminInput, adminCard, adminCardStyle, AdminSelect } from '../ui';
import { brand, SUPPORT_EMAIL } from '@/lib/brand';
import type { SupportTicketRow, SupportTicketStats } from '@/lib/support-tickets';

const TYPE_META: Record<string, { label: string; icon: typeof MessageSquare; variant: 'default' | 'danger' | 'info' | 'warning' | 'success' }> = {
  complaint: { label: 'Complaint', icon: AlertCircle, variant: 'danger' },
  feedback: { label: 'Feedback', icon: ThumbsUp, variant: 'success' },
  bug: { label: 'Bug', icon: Bug, variant: 'warning' },
  billing: { label: 'Billing', icon: CreditCard, variant: 'info' },
  other: { label: 'Other', icon: HelpCircle, variant: 'default' },
};

const STATUS_VARIANT: Record<string, 'warning' | 'info' | 'success' | 'default'> = {
  open: 'warning',
  in_progress: 'info',
  resolved: 'success',
  closed: 'default',
};

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

export default function SupportTab() {
  const [tickets, setTickets] = useState<SupportTicketRow[]>([]);
  const [stats, setStats] = useState<SupportTicketStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selected, setSelected] = useState<SupportTicketRow | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams();
      if (statusFilter !== 'all') q.set('status', statusFilter);
      if (typeFilter !== 'all') q.set('type', typeFilter);
      if (search.trim()) q.set('search', search.trim());
      const res = await fetch(`/api/admin/support?${q}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load');
      setTickets(data.tickets || []);
      setStats(data.stats || null);
    } catch {
      setTickets([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, typeFilter, search]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (selected) {
      setAdminNotes(selected.adminNotes || '');
      setSaveMsg('');
    }
  }, [selected]);

  const openCount = stats ? stats.open + stats.inProgress : 0;

  const exportCsv = () => {
    const header = 'Ref,Type,Status,Priority,Name,Email,Subject,Order ID,User ID,Created\n';
    const rows = tickets.map(t =>
      `${t.ticketRef},${t.type},${t.status},${t.priority},"${t.name}",${t.email},"${t.subject.replace(/"/g, '""')}",${t.orderId || ''},${t.userId || ''},${t.createdAt}`,
    ).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `site99-support-${Date.now()}.csv`;
    a.click();
  };

  const patchTicket = async (id: number, body: Record<string, string>) => {
    setSaving(true);
    setSaveMsg('');
    try {
      const res = await fetch(`/api/admin/support/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Update failed');
      setSelected(data.ticket);
      setTickets(prev => prev.map(t => (t.id === id ? data.ticket : t)));
      setSaveMsg('Saved');
      setTimeout(() => setSaveMsg(''), 2000);
    } catch (e) {
      setSaveMsg(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const saveNotes = () => {
    if (!selected) return;
    patchTicket(selected.id, { adminNotes });
  };

  const replyMailto = (t: SupportTicketRow) => {
    const subject = encodeURIComponent(`Re: [${t.ticketRef}] ${t.subject}`);
    const body = encodeURIComponent(
      `Hi ${t.name},\n\nThank you for contacting site99 support regarding:\n"${t.subject}"\n\n---\n`,
    );
    window.open(`mailto:${t.email}?subject=${subject}&body=${body}`, '_blank');
  };

  return (
    <div className="space-y-5">
      <SectionHeader
        title="Support inbox"
        desc={`${stats?.total ?? 0} tickets · ${openCount} need attention`}
        action={
          <button onClick={exportCsv} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs border border-white/10 hover:bg-white/5">
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
        }
      />

      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          {[
            { label: 'Open', value: stats.open, color: 'text-amber-400', border: 'border-amber-500/20 bg-amber-500/5' },
            { label: 'In progress', value: stats.inProgress, color: 'text-blue-400', border: 'border-blue-500/20 bg-blue-500/5' },
            { label: 'Resolved', value: stats.resolved, color: 'text-green-400', border: 'border-green-500/20 bg-green-500/5' },
            { label: 'Complaints', value: stats.complaints, color: 'text-red-400', border: 'border-red-500/20 bg-red-500/5' },
            { label: 'Feedback', value: stats.feedback, color: 'text-emerald-400', border: 'border-emerald-500/20 bg-emerald-500/5' },
            { label: 'Bugs', value: stats.bugs, color: 'text-orange-400', border: 'border-orange-500/20 bg-orange-500/5' },
          ].map(s => (
            <div key={s.label} className={`p-3 rounded-xl border ${s.border}`}>
              <p className={`text-lg font-bold tabular-nums ${s.color}`}>{s.value}</p>
              <p className="text-[10px] text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search ref, name, email, subject…"
            className={adminInput + ' pl-9'}
          />
        </div>
        <AdminSelect
          value={statusFilter}
          onChange={setStatusFilter}
          className="w-36"
          aria-label="Filter by status"
          options={[
            { value: 'all', label: 'All status' },
            { value: 'open', label: 'Open' },
            { value: 'in_progress', label: 'In progress' },
            { value: 'resolved', label: 'Resolved' },
            { value: 'closed', label: 'Closed' },
          ]}
        />
        <AdminSelect
          value={typeFilter}
          onChange={setTypeFilter}
          className="w-36"
          aria-label="Filter by type"
          options={[
            { value: 'all', label: 'All types' },
            { value: 'complaint', label: 'Complaint' },
            { value: 'feedback', label: 'Feedback' },
            { value: 'bug', label: 'Bug' },
            { value: 'billing', label: 'Billing' },
            { value: 'other', label: 'Other' },
          ]}
        />
        <button onClick={load} disabled={loading} className="px-3 py-2 rounded-xl text-xs border border-white/10 hover:bg-white/5">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Refresh'}
        </button>
      </div>

      <div className="grid lg:grid-cols-5 gap-5">
        {/* List */}
        <div className={`lg:col-span-2 ${adminCard} overflow-hidden`} style={adminCardStyle}>
          {loading && !tickets.length ? (
            <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-gray-500" /></div>
          ) : tickets.length === 0 ? (
            <div className="text-center py-16 px-4">
              <MessageSquare className="w-10 h-10 text-gray-600 mx-auto mb-3" />
              <p className="text-sm text-gray-500">No support tickets yet</p>
              <p className="text-xs text-gray-600 mt-1">Submissions from /support appear here</p>
            </div>
          ) : (
            <div className="max-h-[calc(100vh-320px)] overflow-y-auto divide-y divide-white/5">
              {tickets.map(t => {
                const meta = TYPE_META[t.type] || TYPE_META.other;
                const Icon = meta.icon;
                const active = selected?.id === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setSelected(t)}
                    className={`w-full text-left p-4 transition hover:bg-white/[0.03] ${active ? 'bg-white/[0.06] border-l-2' : 'border-l-2 border-transparent'}`}
                    style={active ? { borderLeftColor: brand.accent } : undefined}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span className="text-[10px] font-mono text-gray-500">{t.ticketRef}</span>
                      <Badge variant={STATUS_VARIANT[t.status] || 'default'}>
                        {t.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <p className="text-sm font-medium text-white line-clamp-1">{t.subject}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <Icon className="w-3 h-3 text-gray-500" />
                      <span className="text-[10px] text-gray-500">{meta.label} · {t.name}</span>
                    </div>
                    <p className="text-[10px] text-gray-600 mt-1">{fmtDate(t.createdAt)}</p>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Detail */}
        <div className={`lg:col-span-3 ${adminCard} p-0 overflow-hidden`} style={adminCardStyle}>
          {!selected ? (
            <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
              <MessageSquare className="w-12 h-12 text-gray-700 mb-4" />
              <p className="text-sm text-gray-500">Select a ticket to view details and take action</p>
              <p className="text-xs text-gray-600 mt-2 max-w-sm">
                Manage status, add internal notes, and reply to users at {SUPPORT_EMAIL}
              </p>
            </div>
          ) : (
            <div className="flex flex-col max-h-[calc(100vh-320px)]">
              <div className="p-5 border-b border-white/10 shrink-0">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[10px] font-mono text-orange-400/90 mb-1">{selected.ticketRef}</p>
                    <h3 className="text-lg font-bold text-white leading-snug">{selected.subject}</h3>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <Badge variant={TYPE_META[selected.type]?.variant || 'default'}>
                        {TYPE_META[selected.type]?.label || selected.type}
                      </Badge>
                      <Badge variant={STATUS_VARIANT[selected.status] || 'default'}>
                        {selected.status.replace('_', ' ')}
                      </Badge>
                      {selected.priority === 'high' && <Badge variant="danger">High priority</Badge>}
                      {!selected.emailSent && <Badge variant="warning">Email not sent</Badge>}
                    </div>
                  </div>
                  <button type="button" onClick={() => setSelected(null)} className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/5">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-5">
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10">
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">From</p>
                    <p className="text-sm font-medium text-white flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-gray-500" /> {selected.name}
                    </p>
                    <a href={`mailto:${selected.email}`} className="text-xs text-blue-400 hover:underline mt-0.5 block">{selected.email}</a>
                    {selected.userId && <p className="text-[10px] text-gray-600 mt-1">User ID: #{selected.userId}</p>}
                  </div>
                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10">
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Submitted</p>
                    <p className="text-sm text-gray-300 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-gray-500" /> {fmtDate(selected.createdAt)}
                    </p>
                    {selected.orderId && (
                      <p className="text-xs text-gray-500 mt-1">Order: <span className="font-mono text-gray-400">{selected.orderId}</span></p>
                    )}
                    {selected.resolvedAt && (
                      <p className="text-xs text-green-500/80 mt-1 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Resolved {fmtDate(selected.resolvedAt)}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">Message</p>
                  <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {selected.message}
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-400 block mb-1.5">Status</label>
                    <AdminSelect
                      value={selected.status}
                      onChange={v => patchTicket(selected.id, { status: v })}
                      aria-label="Ticket status"
                      options={[
                        { value: 'open', label: 'Open' },
                        { value: 'in_progress', label: 'In progress' },
                        { value: 'resolved', label: 'Resolved' },
                        { value: 'closed', label: 'Closed' },
                      ]}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 block mb-1.5">Priority</label>
                    <AdminSelect
                      value={selected.priority}
                      onChange={v => patchTicket(selected.id, { priority: v })}
                      aria-label="Ticket priority"
                      options={[
                        { value: 'low', label: 'Low' },
                        { value: 'normal', label: 'Normal' },
                        { value: 'high', label: 'High' },
                      ]}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-400 block mb-1.5">Internal admin notes</label>
                  <textarea
                    value={adminNotes}
                    onChange={e => setAdminNotes(e.target.value)}
                    rows={3}
                    placeholder="Notes visible only to admins…"
                    className={adminInput + ' resize-y min-h-[80px]'}
                  />
                  <div className="flex items-center gap-3 mt-2">
                    <button
                      type="button"
                      onClick={saveNotes}
                      disabled={saving}
                      className="px-4 py-2 rounded-xl text-xs font-medium text-white disabled:opacity-50"
                      style={{ background: brand.accent }}
                    >
                      {saving ? 'Saving…' : 'Save notes'}
                    </button>
                    {saveMsg && <span className="text-xs text-gray-500">{saveMsg}</span>}
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-white/10 flex flex-wrap gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => replyMailto(selected)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium text-white"
                  style={{ background: `linear-gradient(135deg, ${brand.accent}, ${brand.accentHover})` }}
                >
                  <Mail className="w-3.5 h-3.5" /> Reply to user
                </button>
                {selected.status !== 'resolved' && (
                  <button
                    type="button"
                    onClick={() => patchTicket(selected.id, { status: 'resolved' })}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs border border-green-500/30 text-green-400 hover:bg-green-500/10"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Mark resolved
                  </button>
                )}
                {selected.status === 'open' && (
                  <button
                    type="button"
                    onClick={() => patchTicket(selected.id, { status: 'in_progress' })}
                    className="px-4 py-2 rounded-xl text-xs border border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
                  >
                    Start working
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
