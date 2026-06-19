'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Search, Mail, Send, Loader2, X, User, Clock, Globe, FileWarning,
  Eye, History, AlertCircle,
} from 'lucide-react';
import Link from 'next/link';
import { SectionHeader, Badge, adminInput, adminCard, adminCardStyle, AdminSelect } from '../ui';
import { brand } from '@/lib/brand';
import type { OutreachUserRow, OutreachEmailLog } from '@/lib/outreach-server';

const TEMPLATES = [
  {
    id: 'custom',
    label: 'Custom message',
    subject: 'Message from our team',
    message: `We wanted to reach out personally.

Write your message here — ask anything, share an update, or offer help.

The user can reply directly to this email to continue the conversation.`,
  },
  {
    id: 'general_hi',
    label: 'General check-in (Hindi + English)',
    subject: 'Kaise hain aap? / How are things going?',
    message: `Namaste! Hum aapke account ke baare mein check-in kar rahe hain.

Hi! We're checking in to see how things are going with your account.

Agar koi sawal hai, koi problem aayi, ya kuch help chahiye — bas is email ka reply karein.
If you have any questions, faced any issue, or need help — just reply to this email.

Hum 24-48 ghante mein jawab denge. / We'll respond within 24-48 hours.`,
  },
  {
    id: 'not_started',
    label: 'Registered but not started',
    subject: 'Ready to create your first website?',
    message: `You signed up for an account but haven't created your first project yet.

Would you like help getting started? Reply to this email and let us know:
• What type of website you want to build (portfolio, business, etc.)
• If you had trouble finding the "Create" button
• Any questions about templates or pricing

We can guide you step by step!`,
  },
  {
    id: 'draft_reminder',
    label: 'Draft reminder (Hindi + English)',
    subject: 'Aapka website abhi draft mein hai — Need help?',
    message: `Hi! Aapne website banana shuru kiya tha lekin abhi publish nahi kiya.

Hi! You started building your website but haven't published it yet.

Kya koi problem aayi? / Did you face any issue?
• Kahan atak gaye? / Where did you get stuck?
• Koi error dikha? / Did you see any error?
• Template ya payment se related sawal? / Questions about templates or payment?

Bas is email ka reply karein — hum 24-48 ghante mein jawab denge.
Just reply to this email and we'll get back to you within 24-48 hours.`,
  },
  {
    id: 'issue_check',
    label: 'Ask what issue they faced',
    subject: 'Quick question — how can we help?',
    message: `We're reaching out because we want to make sure you're having a smooth experience.

Could you tell us if you faced any of these?
1. Technical issue or bug while building
2. Confusion about how to use a feature
3. Payment or plan related question
4. Something else — please describe

Your feedback helps us improve. Reply to this email with whatever happened — no question is too small.`,
  },
];

function fmtDate(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

function statusLabel(s: OutreachUserRow['status'], isPremium?: boolean) {
  if (isPremium) return { label: 'Premium', variant: 'warning' as const };
  if (s === 'published') return { label: 'Live site', variant: 'success' as const };
  if (s === 'no_project') return { label: 'Not started', variant: 'warning' as const };
  if (s === 'draft_only') return { label: 'Draft only', variant: 'info' as const };
  return { label: 'Has drafts', variant: 'default' as const };
}

interface Props {
  initialUserId?: number | null;
  onInitialUserHandled?: () => void;
}

export default function OutreachTab({ initialUserId, onInitialUserHandled }: Props) {
  const [users, setUsers] = useState<OutreachUserRow[]>([]);
  const [stats, setStats] = useState<{
    totalUsers: number;
    totalIncomplete: number;
    noProject: number;
    draftOnly: number;
    published: number;
    premium: number;
    notContacted: number;
    contactedThisWeek: number;
  } | null>(null);
  const [smtpConfigured, setSmtpConfigured] = useState(false);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all_users');
  const [selected, setSelected] = useState<OutreachUserRow | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [subject, setSubject] = useState(TEMPLATES[0].subject);
  const [message, setMessage] = useState(TEMPLATES[0].message);
  const [templateId, setTemplateId] = useState(TEMPLATES[0].id);
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<string | null>(null);
  const [history, setHistory] = useState<OutreachEmailLog[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [previewHtml, setPreviewHtml] = useState('');
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams();
      if (filter !== 'all') q.set('filter', filter);
      if (search.trim()) q.set('search', search.trim());
      const res = await fetch(`/api/admin/outreach?${q}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load');
      setUsers(data.users || []);
      setStats(data.stats || null);
      setSmtpConfigured(Boolean(data.smtpConfigured));
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [filter, search]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!initialUserId || !users.length) return;
    const u = users.find(x => x.id === initialUserId);
    if (u) {
      setSelected(u);
      onInitialUserHandled?.();
    }
  }, [initialUserId, users, onInitialUserHandled]);

  const loadHistory = useCallback(async (userId: number) => {
    setLoadingHistory(true);
    try {
      const res = await fetch(`/api/admin/outreach?userId=${userId}`);
      const data = await res.json();
      setHistory(data.history || []);
    } catch {
      setHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    if (selected) {
      loadHistory(selected.id);
      setSendResult(null);
    }
  }, [selected, loadHistory]);

  const loadPreview = useCallback(() => {
    setLoadingPreview(true);
    const q = new URLSearchParams({ type: 'outreach', message });
    fetch(`/api/admin/email-preview?${q}`)
      .then(r => r.text())
      .then(html => { setPreviewHtml(html); setLoadingPreview(false); })
      .catch(() => setLoadingPreview(false));
  }, [message]);

  useEffect(() => {
    if (showPreview) loadPreview();
  }, [showPreview, loadPreview]);

  const applyTemplate = (id: string) => {
    const t = TEMPLATES.find(x => x.id === id);
    if (!t) return;
    setTemplateId(t.id);
    setSubject(t.subject);
    setMessage(t.message);
  };

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAllVisible = () => {
    setSelectedIds(new Set(users.map(u => u.id)));
  };

  const clearSelection = () => setSelectedIds(new Set());

  const sendToUser = async (userIds: number[]) => {
    if (!userIds.length) return;
    setSending(true);
    setSendResult(null);
    try {
      const res = await fetch('/api/admin/outreach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userIds, subject, message, templateId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Send failed');
      setSendResult(`Sent ${data.sent} email(s)${data.failed ? ` · ${data.failed} failed` : ''}`);
      clearSelection();
      load();
      if (selected && userIds.includes(selected.id)) loadHistory(selected.id);
    } catch (e) {
      setSendResult(e instanceof Error ? e.message : 'Send failed');
    } finally {
      setSending(false);
    }
  };

  const filteredCount = users.length;
  const notContactedCount = useMemo(() => users.filter(u => u.outreachCount === 0).length, [users]);

  return (
    <div className="space-y-5">
      <SectionHeader
        title="Email users"
        desc="Contact any registered user by email — send custom messages, get replies, and track conversation history"
      />

      {!smtpConfigured && (
        <div className="p-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 text-amber-200 text-sm flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>
            SMTP is not configured. Go to <strong>Email & SMTP</strong> tab first, then you can send emails from here.
          </span>
        </div>
      )}

      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {[
            { label: 'All users', value: stats.totalUsers, color: 'text-white', border: 'border-white/10 bg-white/[0.03]' },
            { label: 'Incomplete', value: stats.totalIncomplete, color: 'text-amber-400', border: 'border-amber-500/20 bg-amber-500/5' },
            { label: 'Live sites', value: stats.published, color: 'text-green-400', border: 'border-green-500/20 bg-green-500/5' },
            { label: 'Premium', value: stats.premium, color: 'text-yellow-400', border: 'border-yellow-500/20 bg-yellow-500/5' },
            { label: 'Not started', value: stats.noProject, color: 'text-orange-400', border: 'border-orange-500/20 bg-orange-500/5' },
            { label: 'Never emailed', value: stats.notContacted, color: 'text-red-400', border: 'border-red-500/20 bg-red-500/5' },
            { label: 'Emailed this week', value: stats.contactedThisWeek, color: 'text-blue-400', border: 'border-blue-500/20 bg-blue-500/5' },
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
            placeholder="Search name, email, project…"
            className={adminInput + ' pl-9'}
          />
        </div>
        <AdminSelect
          value={filter}
          onChange={setFilter}
          className="w-44"
          aria-label="Filter users"
          options={[
            { value: 'all_users', label: 'All users' },
            { value: 'not_contacted', label: 'Never emailed' },
            { value: 'incomplete', label: 'Incomplete sites' },
            { value: 'published', label: 'Live / published' },
            { value: 'premium', label: 'Premium users' },
            { value: 'no_project', label: 'Not started' },
            { value: 'draft', label: 'Has drafts' },
          ]}
        />
        <button onClick={load} disabled={loading} className="px-3 py-2 rounded-xl text-xs border border-white/10 hover:bg-white/5">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Refresh'}
        </button>
      </div>

      {selectedIds.size > 0 && (
        <div className="flex flex-wrap items-center gap-2 p-3 rounded-xl border border-blue-500/25 bg-blue-500/10">
          <span className="text-xs text-blue-300">{selectedIds.size} selected</span>
          <button
            type="button"
            onClick={() => sendToUser([...selectedIds])}
            disabled={sending || !smtpConfigured}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white disabled:opacity-50"
            style={{ background: brand.accent }}
          >
            <Send className="w-3.5 h-3.5" /> Send to selected
          </button>
          <button type="button" onClick={clearSelection} className="text-xs text-gray-400 hover:text-white">Clear</button>
        </div>
      )}

      <div className="grid lg:grid-cols-5 gap-5">
        {/* User list */}
        <div className={`lg:col-span-2 ${adminCard} overflow-hidden`} style={adminCardStyle}>
          <div className="px-4 py-2 border-b border-white/10 flex items-center justify-between">
            <p className="text-xs text-gray-500">{filteredCount} users · {notContactedCount} not emailed</p>
            <button type="button" onClick={selectAllVisible} className="text-[10px] text-blue-400 hover:underline">Select all</button>
          </div>
          {loading && !users.length ? (
            <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-gray-500" /></div>
          ) : users.length === 0 ? (
            <div className="text-center py-16 px-4">
              <User className="w-10 h-10 text-gray-600 mx-auto mb-3" />
              <p className="text-sm text-gray-500">No users match this filter</p>
            </div>
          ) : (
            <div className="max-h-[calc(100vh-380px)] overflow-y-auto divide-y divide-white/5">
              {users.map(u => {
                const meta = statusLabel(u.status, u.isPremium);
                const active = selected?.id === u.id;
                return (
                  <div
                    key={u.id}
                    className={`flex items-start gap-2 p-4 transition hover:bg-white/[0.03] ${active ? 'bg-white/[0.06] border-l-2' : 'border-l-2 border-transparent'}`}
                    style={active ? { borderLeftColor: brand.accent } : undefined}
                  >
                    <input
                      type="checkbox"
                      checked={selectedIds.has(u.id)}
                      onChange={() => toggleSelect(u.id)}
                      className="mt-1 w-4 h-4 rounded accent-blue-500 shrink-0"
                      aria-label={`Select ${u.name}`}
                    />
                    <button type="button" onClick={() => setSelected(u)} className="flex-1 text-left min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="text-sm font-medium text-white truncate">{u.name}</p>
                        <Badge variant={meta.variant}>{meta.label}</Badge>
                      </div>
                      <p className="text-xs text-blue-400 truncate">{u.email}</p>
                      {u.planName && (
                        <p className="text-[10px] text-gray-500 mt-0.5">{u.planName}</p>
                      )}
                      {u.draftNames.length > 0 && (
                        <p className="text-[10px] text-gray-500 mt-1 truncate">
                          <FileWarning className="w-3 h-3 inline mr-0.5" />
                          {u.draftNames.join(', ')}
                        </p>
                      )}
                      {u.publishedNames.length > 0 && (
                        <p className="text-[10px] text-green-500/70 mt-1 truncate">
                          <Globe className="w-3 h-3 inline mr-0.5" />
                          {u.publishedNames.join(', ')}
                        </p>
                      )}
                      <div className="flex items-center gap-3 mt-1.5 text-[10px] text-gray-600">
                        <span>Active {fmtDate(u.lastActivity || u.createdAt)}</span>
                        {u.outreachCount > 0 && (
                          <span className="text-green-500/80">
                            <Mail className="w-3 h-3 inline mr-0.5" />
                            Emailed {u.outreachCount}x
                          </span>
                        )}
                      </div>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Compose panel */}
        <div className={`lg:col-span-3 ${adminCard} p-0 overflow-hidden`} style={adminCardStyle}>
          {!selected ? (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <Mail className="w-12 h-12 text-gray-700 mb-4" />
              <p className="text-sm text-gray-500">Select a user to compose email</p>
              <p className="text-xs text-gray-600 mt-2 max-w-sm">
                Or select multiple users and use &quot;Send to selected&quot; with a template below
              </p>
            </div>
          ) : (
            <div className="flex flex-col max-h-[calc(100vh-320px)]">
              <div className="p-5 border-b border-white/10 shrink-0">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="text-lg font-bold text-white">{selected.name}</h3>
                    <a href={`mailto:${selected.email}`} className="text-sm text-blue-400 hover:underline">{selected.email}</a>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <Badge variant={statusLabel(selected.status, selected.isPremium).variant}>
                        {statusLabel(selected.status, selected.isPremium).label}
                      </Badge>
                      {selected.planName && <span className="text-[10px] text-gray-500">{selected.planName}</span>}
                      {selected.phone && <span className="text-[10px] text-gray-500">{selected.phone}</span>}
                      <Link href={`/admin/user/${selected.id}`} className="text-[10px] text-orange-400 hover:underline">
                        View profile →
                      </Link>
                    </div>
                  </div>
                  <button type="button" onClick={() => setSelected(null)} className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/5">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid sm:grid-cols-3 gap-2 mt-4">
                  <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10">
                    <p className="text-[10px] text-gray-500">Projects</p>
                    <p className="text-sm font-medium text-white">{selected.totalProjects} total · {selected.draftCount} draft</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10">
                    <p className="text-[10px] text-gray-500">Registered</p>
                    <p className="text-sm text-gray-300 flex items-center gap-1"><Clock className="w-3 h-3" /> {fmtDate(selected.createdAt)}</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10">
                    <p className="text-[10px] text-gray-500">Last emailed</p>
                    <p className="text-sm text-gray-300 flex items-center gap-1">
                      <Mail className="w-3 h-3" /> {selected.lastOutreachAt ? fmtDate(selected.lastOutreachAt) : 'Never'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                <div>
                  <label className="text-xs text-gray-400 block mb-1.5">Quick templates</label>
                  <div className="flex flex-wrap gap-1.5">
                    {TEMPLATES.map(t => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => applyTemplate(t.id)}
                        className={`px-2.5 py-1.5 rounded-lg text-[10px] font-medium border transition ${
                          templateId === t.id
                            ? 'border-blue-500 bg-blue-500/15 text-white'
                            : 'border-white/10 text-gray-400 hover:bg-white/5'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-400 block mb-1.5">Subject</label>
                  <input
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    className={adminInput}
                    placeholder="Email subject…"
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-400 block mb-1.5">Your message</label>
                  <textarea
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    rows={8}
                    className={adminInput + ' resize-y min-h-[160px]'}
                    placeholder="Write your message… User will see this in a formatted email with a reply prompt."
                  />
                  <p className="text-[10px] text-gray-600 mt-1">
                    Branded email to <strong className="text-gray-400">{selected.email}</strong>. User replies come to your SMTP inbox — full two-way contact.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setShowPreview(v => !v)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs border border-white/10 hover:bg-white/5"
                  >
                    <Eye className="w-3.5 h-3.5" /> {showPreview ? 'Hide preview' : 'Preview email'}
                  </button>
                </div>

                {showPreview && (
                  <div className="rounded-xl overflow-hidden border border-white/10 relative bg-white" style={{ minHeight: 320 }}>
                    {loadingPreview && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-10">
                        <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
                      </div>
                    )}
                    {previewHtml && (
                      <iframe
                        srcDoc={previewHtml}
                        className="w-full"
                        style={{ minHeight: 320, border: 'none' }}
                        title="Email preview"
                        sandbox="allow-same-origin"
                      />
                    )}
                  </div>
                )}

                {history.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-400 flex items-center gap-1.5 mb-2">
                      <History className="w-3.5 h-3.5" /> Previous emails sent
                    </p>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {loadingHistory ? (
                        <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
                      ) : history.map(h => (
                        <div key={h.id} className="p-3 rounded-xl bg-white/[0.03] border border-white/10">
                          <p className="text-xs font-medium text-white">{h.subject}</p>
                          <p className="text-[10px] text-gray-600 mt-0.5">{fmtDate(h.sentAt)}</p>
                          <p className="text-[10px] text-gray-500 mt-1 line-clamp-2">{h.message}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-white/10 flex flex-wrap items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => sendToUser([selected.id])}
                  disabled={sending || !smtpConfigured || !subject.trim() || !message.trim()}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium text-white disabled:opacity-50"
                  style={{ background: `linear-gradient(135deg, ${brand.accent}, ${brand.accentHover})` }}
                >
                  {sending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  Send to {selected.email}
                </button>
                {sendResult && (
                  <span className={`text-xs ${sendResult.includes('failed') || sendResult.includes('Failed') ? 'text-red-400' : 'text-green-400'}`}>
                    {sendResult}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
