import type { RowDataPacket } from 'mysql2';
import { getPool } from './db';

export type AnalyticsEventType =
  | 'page_view'
  | 'search'
  | 'modal_view'
  | 'modal_cta'
  | 'registration'
  | 'promo_claim';

export interface TrackEventInput {
  eventType: AnalyticsEventType;
  sessionId?: string;
  userId?: number | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  path?: string;
  query?: string;
  referrer?: string;
  metadata?: Record<string, unknown>;
}

export interface AnalyticsEventRow {
  id: number;
  eventType: string;
  sessionId: string | null;
  userId: number | null;
  userName: string | null;
  userEmail: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  path: string | null;
  query: string | null;
  referrer: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export interface VisitorTodayRow {
  sessionId: string | null;
  ipAddress: string | null;
  userId: number | null;
  userName: string | null;
  userEmail: string | null;
  firstSeen: string;
  lastSeen: string;
  pageViews: number;
  searches: number;
}

export interface AnalyticsSummary {
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
  recentSearches: AnalyticsEventRow[];
  recentEvents: AnalyticsEventRow[];
  todayVisitors: VisitorTodayRow[];
  topPagesToday: { path: string; count: number }[];
  searchEngineReferrers: { source: string; count: number }[];
}

let schemaReady = false;

export async function ensureAnalyticsSchema() {
  if (schemaReady) return;
  const pool = getPool();
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS site_analytics_events (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
      event_type VARCHAR(40) NOT NULL,
      session_id VARCHAR(64) NULL,
      user_id INT UNSIGNED NULL,
      ip_address VARCHAR(64) NULL,
      user_agent VARCHAR(500) NULL,
      path VARCHAR(500) NULL,
      query VARCHAR(500) NULL,
      referrer VARCHAR(1000) NULL,
      metadata JSON NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_event_type (event_type),
      INDEX idx_created_at (created_at),
      INDEX idx_session (session_id),
      INDEX idx_user (user_id),
      INDEX idx_ip (ip_address),
      INDEX idx_query (query(100))
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `).catch(() => {});

  // Backfill older installs (safe to ignore errors).
  await pool.execute(`ALTER TABLE site_analytics_events ADD COLUMN ip_address VARCHAR(64) NULL`).catch(() => {});
  await pool.execute(`ALTER TABLE site_analytics_events ADD COLUMN user_agent VARCHAR(500) NULL`).catch(() => {});
  await pool.execute(`ALTER TABLE site_analytics_events ADD INDEX idx_ip (ip_address)`).catch(() => {});

  schemaReady = true;
}

function rowToEvent(r: RowDataPacket): AnalyticsEventRow {
  let metadata: Record<string, unknown> | null = null;
  if (r.metadata) {
    try {
      metadata = typeof r.metadata === 'string' ? JSON.parse(r.metadata) : r.metadata;
    } catch { /* ignore */ }
  }
  return {
    id: Number(r.id),
    eventType: String(r.event_type),
    sessionId: r.session_id ? String(r.session_id) : null,
    userId: r.user_id != null ? Number(r.user_id) : null,
    userName: r.user_name ? String(r.user_name) : null,
    userEmail: r.user_email ? String(r.user_email) : null,
    ipAddress: r.ip_address ? String(r.ip_address) : null,
    userAgent: r.user_agent ? String(r.user_agent) : null,
    path: r.path ? String(r.path) : null,
    query: r.query ? String(r.query) : null,
    referrer: r.referrer ? String(r.referrer) : null,
    metadata,
    createdAt: new Date(r.created_at as Date).toISOString(),
  };
}

export async function trackSiteEvent(input: TrackEventInput): Promise<void> {
  try {
    await ensureAnalyticsSchema();
    const pool = getPool();
    const query = input.query ? String(input.query).trim().slice(0, 500) : null;
    if (input.eventType === 'search' && !query) return;

    await pool.execute(
      `INSERT INTO site_analytics_events (event_type, session_id, user_id, ip_address, user_agent, path, query, referrer, metadata)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        input.eventType,
        input.sessionId?.slice(0, 64) || null,
        input.userId ?? null,
        input.ipAddress?.slice(0, 64) || null,
        input.userAgent?.slice(0, 500) || null,
        input.path?.slice(0, 500) || null,
        query,
        input.referrer?.slice(0, 1000) || null,
        input.metadata ? JSON.stringify(input.metadata) : null,
      ],
    );
  } catch {
    /* non-blocking */
  }
}

export async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  await ensureAnalyticsSchema();
  const pool = getPool();

  const [[todayStats]] = await pool.execute<RowDataPacket[]>(`
    SELECT
      SUM(event_type = 'page_view') AS page_views,
      SUM(event_type = 'search') AS searches,
      COUNT(DISTINCT session_id) AS unique_visitors,
      SUM(event_type = 'registration') AS registrations,
      SUM(event_type = 'modal_view') AS modal_views,
      SUM(event_type = 'modal_cta') AS modal_clicks
    FROM site_analytics_events
    WHERE DATE(created_at) = CURDATE()
  `);

  const [last7] = await pool.execute<RowDataPacket[]>(`
    SELECT DATE(created_at) AS d,
           SUM(event_type = 'page_view') AS page_views,
           SUM(event_type = 'search') AS searches,
           COUNT(DISTINCT session_id) AS visitors
    FROM site_analytics_events
    WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
    GROUP BY DATE(created_at)
    ORDER BY d ASC
  `);

  const [topSearches] = await pool.execute<RowDataPacket[]>(`
    SELECT query, COUNT(*) AS c
    FROM site_analytics_events
    WHERE event_type = 'search' AND query IS NOT NULL AND query != ''
    GROUP BY query
    ORDER BY c DESC
    LIMIT 20
  `);

  const [recentSearches] = await pool.execute<RowDataPacket[]>(`
    SELECT e.*, u.name AS user_name, u.email AS user_email
    FROM site_analytics_events e
    LEFT JOIN users u ON u.id = e.user_id
    WHERE e.event_type = 'search'
    ORDER BY e.created_at DESC
    LIMIT 50
  `);

  const [recentEvents] = await pool.execute<RowDataPacket[]>(`
    SELECT e.*, u.name AS user_name, u.email AS user_email
    FROM site_analytics_events e
    LEFT JOIN users u ON u.id = e.user_id
    ORDER BY e.created_at DESC
    LIMIT 100
  `);

  const [todayVisitors] = await pool.execute<RowDataPacket[]>(`
    SELECT
      e.session_id,
      e.ip_address,
      e.user_id,
      u.name AS user_name,
      u.email AS user_email,
      MIN(e.created_at) AS first_seen,
      MAX(e.created_at) AS last_seen,
      SUM(e.event_type = 'page_view') AS page_views,
      SUM(e.event_type = 'search') AS searches
    FROM site_analytics_events e
    LEFT JOIN users u ON u.id = e.user_id
    WHERE DATE(e.created_at) = CURDATE()
    GROUP BY e.session_id, e.ip_address, e.user_id, u.name, u.email
    ORDER BY last_seen DESC
    LIMIT 100
  `);

  const [topPagesToday] = await pool.execute<RowDataPacket[]>(`
    SELECT path, COUNT(*) AS c
    FROM site_analytics_events
    WHERE event_type = 'page_view'
      AND DATE(created_at) = CURDATE()
      AND path IS NOT NULL AND path != ''
    GROUP BY path
    ORDER BY c DESC
    LIMIT 15
  `);

  const [searchRefs] = await pool.execute<RowDataPacket[]>(`
    SELECT referrer, COUNT(*) AS c
    FROM site_analytics_events
    WHERE event_type = 'page_view'
      AND referrer IS NOT NULL AND referrer != ''
      AND (referrer LIKE '%google.%' OR referrer LIKE '%bing.%' OR referrer LIKE '%yahoo.%'
           OR referrer LIKE '%duckduckgo.%' OR referrer LIKE '%baidu.%')
    GROUP BY referrer
    ORDER BY c DESC
    LIMIT 15
  `);

  const dayMap = new Map<string, { pageViews: number; searches: number; visitors: number }>();
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    dayMap.set(key, { pageViews: 0, searches: 0, visitors: 0 });
  }
  for (const r of last7) {
    const key = new Date(r.d as Date).toISOString().slice(0, 10);
    if (dayMap.has(key)) {
      dayMap.set(key, {
        pageViews: Number(r.page_views ?? 0),
        searches: Number(r.searches ?? 0),
        visitors: Number(r.visitors ?? 0),
      });
    }
  }

  return {
    today: {
      pageViews: Number(todayStats?.page_views ?? 0),
      searches: Number(todayStats?.searches ?? 0),
      uniqueVisitors: Number(todayStats?.unique_visitors ?? 0),
      registrations: Number(todayStats?.registrations ?? 0),
      modalViews: Number(todayStats?.modal_views ?? 0),
      modalClicks: Number(todayStats?.modal_clicks ?? 0),
    },
    last7Days: [...dayMap.entries()].map(([date, v]) => ({ date, ...v })),
    topSearches: topSearches.map(r => ({ query: String(r.query), count: Number(r.c) })),
    recentSearches: recentSearches.map(rowToEvent),
    recentEvents: recentEvents.map(rowToEvent),
    todayVisitors: todayVisitors.map(r => ({
      sessionId: r.session_id ? String(r.session_id) : null,
      ipAddress: r.ip_address ? String(r.ip_address) : null,
      userId: r.user_id != null ? Number(r.user_id) : null,
      userName: r.user_name ? String(r.user_name) : null,
      userEmail: r.user_email ? String(r.user_email) : null,
      firstSeen: new Date(r.first_seen as Date).toISOString(),
      lastSeen: new Date(r.last_seen as Date).toISOString(),
      pageViews: Number(r.page_views ?? 0),
      searches: Number(r.searches ?? 0),
    })),
    topPagesToday: topPagesToday.map(r => ({ path: String(r.path), count: Number(r.c) })),
    searchEngineReferrers: searchRefs.map(r => ({
      source: String(r.referrer).slice(0, 120),
      count: Number(r.c),
    })),
  };
}
