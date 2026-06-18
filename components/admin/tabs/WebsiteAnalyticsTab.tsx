'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Search, Eye, Users, MousePointerClick, Loader2, RefreshCw,
  Globe, TrendingUp, UserPlus,
} from 'lucide-react';
import { SectionHeader, StatCard, MiniBarChart, Badge, adminCard, adminCardStyle } from '../ui';
import { brand } from '@/lib/brand';

interface AnalyticsData {
  today: {
    pageViews: number;
    searches: number;
    uniqueVisitors: number;
    registrations: number;
    modalViews: number;
    modalClicks: number;
  };
  last7Days: { date: string; pageViews: number; searches: number; visitors: number }[];
  topSearches: { query: string; count: number }[];
  recentSearches: {
    id: number;
    query: string | null;
    userName: string | null;
    userEmail: string | null;
    ipAddress: string | null;
    path: string | null;
    createdAt: string;
  }[];
  todayVisitors: {
    sessionId: string | null;
    ipAddress: string | null;
    userName: string | null;
    userEmail: string | null;
    firstSeen: string;
    lastSeen: string;
    pageViews: number;
    searches: number;
  }[];
  topPagesToday: { path: string; count: number }[];
  recentEvents: {
    id: number;
    eventType: string;
    sessionId: string | null;
    userName: string | null;
    userEmail: string | null;
    ipAddress: string | null;
    path: string | null;
    query: string | null;
    createdAt: string;
  }[];
  searchEngineReferrers: { source: string; count: number }[];
  promo?: {
    freeGrantCount: number;
    slotsRemaining: number;
    freeGrantLimit: number;
  };
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' });
  } catch {
    return iso;
  }
}

function shortDate(d: string) {
  try {
    return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  } catch {
    return d.slice(5);
  }
}

function prettyEventType(t: string) {
  switch (t) {
    case 'page_view': return 'Page view';
    case 'search': return 'Search';
    case 'modal_view': return 'Modal view';
    case 'modal_cta': return 'Modal click';
    case 'registration': return 'Registration';
    case 'promo_claim': return 'Promo claim';
    default: return t;
  }
}

export default function WebsiteAnalyticsTab() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchFilter, setSearchFilter] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/analytics');
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setData(json);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading && !data) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
      </div>
    );
  }

  if (!data) {
    return <div className="text-center py-16 text-gray-500 text-sm">Could not load analytics.</div>;
  }

  const filteredSearches = data.recentSearches.filter(s => {
    if (!searchFilter.trim()) return true;
    const q = searchFilter.toLowerCase();
    return (
      (s.query || '').toLowerCase().includes(q)
      || (s.userEmail || '').toLowerCase().includes(q)
      || (s.userName || '').toLowerCase().includes(q)
    );
  });

  const chartData = data.last7Days.map(d => ({
    label: shortDate(d.date),
    value: d.searches,
  }));

  const visitorChart = data.last7Days.map(d => ({
    label: shortDate(d.date),
    value: d.visitors,
  }));

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Website analytics"
        desc="Track who searched on your site, daily visitors, page views, and promo modal engagement."
        action={
          <button
            type="button"
            onClick={load}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs border border-white/10 hover:bg-white/5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        }
      />

      <div className="flex items-center gap-2 flex-wrap">
        <Badge variant="info">Today — {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</Badge>
        {data.promo && data.promo.slotsRemaining > 0 && (
          <Badge variant="success">{data.promo.slotsRemaining} promo slots left</Badge>
        )}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard label="Page views today" value={data.today.pageViews} icon={Eye} accent="#3b82f6" />
        <StatCard label="Searches today" value={data.today.searches} icon={Search} accent={brand.accent} />
        <StatCard label="Unique visitors" value={data.today.uniqueVisitors} icon={Users} accent="#8b5cf6" />
        <StatCard label="Registrations" value={data.today.registrations} icon={UserPlus} accent="#22c55e" />
        <StatCard label="Modal views" value={data.today.modalViews} icon={Globe} accent="#f59e0b" />
        <StatCard label="Modal clicks" value={data.today.modalClicks} icon={MousePointerClick} accent="#ec4899" />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className={adminCard} style={adminCardStyle}>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-gray-500" />
            <h3 className="text-sm font-semibold text-white">Searches — last 7 days</h3>
          </div>
          <MiniBarChart data={chartData} color={brand.accent} />
        </div>
        <div className={adminCard} style={adminCardStyle}>
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-4 h-4 text-gray-500" />
            <h3 className="text-sm font-semibold text-white">Unique visitors — last 7 days</h3>
          </div>
          <MiniBarChart data={visitorChart} color="#8b5cf6" />
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className={adminCard} style={adminCardStyle}>
          <h3 className="text-sm font-semibold text-white mb-3">Top search terms</h3>
          {data.topSearches.length === 0 ? (
            <p className="text-xs text-gray-600 py-6 text-center">No searches recorded yet.</p>
          ) : (
            <div className="space-y-2">
              {data.topSearches.map((s, i) => (
                <div key={s.query} className="flex items-center justify-between gap-2 text-xs">
                  <span className="text-gray-400 truncate">
                    <span className="text-gray-600 w-5 inline-block">{i + 1}.</span> {s.query}
                  </span>
                  <span className="font-mono text-white shrink-0">{s.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={adminCard} style={adminCardStyle}>
          <h3 className="text-sm font-semibold text-white mb-3">Top pages today</h3>
          {data.topPagesToday.length === 0 ? (
            <p className="text-xs text-gray-600 py-6 text-center">No page views recorded today.</p>
          ) : (
            <div className="space-y-2">
              {data.topPagesToday.map((p, i) => (
                <div key={p.path} className="flex items-center justify-between gap-2 text-xs">
                  <span className="text-gray-400 truncate">
                    <span className="text-gray-600 w-5 inline-block">{i + 1}.</span> <span className="font-mono">{p.path}</span>
                  </span>
                  <span className="font-mono text-white shrink-0">{p.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className={adminCard} style={adminCardStyle}>
          <h3 className="text-sm font-semibold text-white mb-3">Search engine referrers</h3>
          {data.searchEngineReferrers.length === 0 ? (
            <p className="text-xs text-gray-600 py-6 text-center">No search engine traffic yet.</p>
          ) : (
            <div className="space-y-2">
              {data.searchEngineReferrers.map(r => (
                <div key={r.source} className="flex items-center justify-between gap-2 text-xs">
                  <span className="text-gray-400 truncate">{r.source}</span>
                  <span className="font-mono text-white shrink-0">{r.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className={adminCard} style={adminCardStyle}>
          <h3 className="text-sm font-semibold text-white mb-3">Promo engagement</h3>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between gap-2">
              <span className="text-gray-400">Modal views today</span>
              <span className="font-mono text-white">{data.today.modalViews}</span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-gray-400">Modal clicks today</span>
              <span className="font-mono text-white">{data.today.modalClicks}</span>
            </div>
            {data.promo && (
              <>
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/10">
                  <span className="text-gray-400">Free grants used</span>
                  <span className="font-mono text-white">{data.promo.freeGrantCount} / {data.promo.freeGrantLimit}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-gray-400">Slots remaining</span>
                  <span className="font-mono text-white">{data.promo.slotsRemaining}</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className={adminCard + ' overflow-hidden'} style={adminCardStyle}>
        <h3 className="text-sm font-semibold text-white mb-3">Today visitors (who came today)</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs min-w-[780px]">
            <thead>
              <tr className="border-b border-white/10 text-left text-gray-500">
                <th className="px-3 py-2">Last seen</th>
                <th className="px-3 py-2">IP</th>
                <th className="px-3 py-2">User</th>
                <th className="px-3 py-2">Page views</th>
                <th className="px-3 py-2">Searches</th>
                <th className="px-3 py-2">First seen</th>
              </tr>
            </thead>
            <tbody>
              {data.todayVisitors.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 py-8 text-center text-gray-600">No visitors recorded today.</td>
                </tr>
              ) : data.todayVisitors.map((v, idx) => (
                <tr key={`${v.sessionId || 'guest'}_${v.ipAddress || idx}`} className="border-b border-white/5 hover:bg-white/[0.02]">
                  <td className="px-3 py-2.5 text-gray-500 whitespace-nowrap">{formatDate(v.lastSeen)}</td>
                  <td className="px-3 py-2.5 font-mono text-gray-300">{v.ipAddress || '—'}</td>
                  <td className="px-3 py-2.5">
                    {v.userEmail ? (
                      <div>
                        <p className="text-gray-300">{v.userName || 'User'}</p>
                        <p className="text-gray-600">{v.userEmail}</p>
                      </div>
                    ) : (
                      <span className="text-gray-600">Guest</span>
                    )}
                  </td>
                  <td className="px-3 py-2.5 font-mono text-white">{v.pageViews}</td>
                  <td className="px-3 py-2.5 font-mono text-white">{v.searches}</td>
                  <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">{formatDate(v.firstSeen)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className={adminCard + ' overflow-hidden'} style={adminCardStyle}>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h3 className="text-sm font-semibold text-white">Who searched — recent activity</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
            <input
              value={searchFilter}
              onChange={e => setSearchFilter(e.target.value)}
              placeholder="Filter by query, user…"
              className="pl-9 pr-3 py-2 rounded-lg text-xs bg-white/5 border border-white/10 text-white w-56"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs min-w-[600px]">
            <thead>
              <tr className="border-b border-white/10 text-left text-gray-500">
                <th className="px-3 py-2">Time</th>
                <th className="px-3 py-2">Search query</th>
                <th className="px-3 py-2">User</th>
                <th className="px-3 py-2">IP</th>
                <th className="px-3 py-2">Page</th>
              </tr>
            </thead>
            <tbody>
              {filteredSearches.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-3 py-8 text-center text-gray-600">No search activity yet.</td>
                </tr>
              ) : filteredSearches.map(s => (
                <tr key={s.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                  <td className="px-3 py-2.5 text-gray-500 whitespace-nowrap">{formatDate(s.createdAt)}</td>
                  <td className="px-3 py-2.5 text-white font-medium">{s.query || '—'}</td>
                  <td className="px-3 py-2.5">
                    {s.userEmail ? (
                      <div>
                        <p className="text-gray-300">{s.userName || 'User'}</p>
                        <p className="text-gray-600">{s.userEmail}</p>
                      </div>
                    ) : (
                      <span className="text-gray-600">Guest</span>
                    )}
                  </td>
                  <td className="px-3 py-2.5 font-mono text-gray-300">{s.ipAddress || '—'}</td>
                  <td className="px-3 py-2.5 text-gray-500 font-mono">{s.path || '/'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className={adminCard + ' overflow-hidden'} style={adminCardStyle}>
        <h3 className="text-sm font-semibold text-white mb-3">Recent activity (all events)</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs min-w-[860px]">
            <thead>
              <tr className="border-b border-white/10 text-left text-gray-500">
                <th className="px-3 py-2">Time</th>
                <th className="px-3 py-2">Event</th>
                <th className="px-3 py-2">Page</th>
                <th className="px-3 py-2">Query</th>
                <th className="px-3 py-2">User</th>
                <th className="px-3 py-2">IP</th>
              </tr>
            </thead>
            <tbody>
              {data.recentEvents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 py-8 text-center text-gray-600">No activity yet.</td>
                </tr>
              ) : data.recentEvents.map(e => (
                <tr key={e.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                  <td className="px-3 py-2.5 text-gray-500 whitespace-nowrap">{formatDate(e.createdAt)}</td>
                  <td className="px-3 py-2.5 text-white">{prettyEventType(e.eventType)}</td>
                  <td className="px-3 py-2.5 text-gray-500 font-mono">{e.path || '/'}</td>
                  <td className="px-3 py-2.5 text-gray-300">{e.query || '—'}</td>
                  <td className="px-3 py-2.5">
                    {e.userEmail ? (
                      <div>
                        <p className="text-gray-300">{e.userName || 'User'}</p>
                        <p className="text-gray-600">{e.userEmail}</p>
                      </div>
                    ) : (
                      <span className="text-gray-600">Guest</span>
                    )}
                  </td>
                  <td className="px-3 py-2.5 font-mono text-gray-300">{e.ipAddress || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
