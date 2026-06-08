'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Loader2, ExternalLink, RefreshCw, Radio } from 'lucide-react';
import type { Portfolio } from '@/lib/types';
import PortfolioPreview from './PortfolioPreview';
import { readPreviewSnapshot, subscribePreviewUpdates, writePreviewSnapshot } from '@/lib/preview-tab';
import { brand, APP_NAME } from '@/lib/brand';

export default function PreviewTabPage() {
  const params = useParams();
  const projectId = typeof params.id === 'string' ? params.id : '';
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [liveSync, setLiveSync] = useState(false);

  const loadFromApi = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/projects/${encodeURIComponent(projectId)}`, {
        credentials: 'include',
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to load preview');
      }
      const data = await res.json();
      setPortfolio(data.portfolio);
      if (data.portfolio) writePreviewSnapshot(data.portfolio);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load preview');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!projectId) return;

    const snapshot = readPreviewSnapshot(projectId);
    if (snapshot) {
      setPortfolio(snapshot);
      setLiveSync(true);
      setLoading(false);
    } else {
      loadFromApi();
    }

    const unsub = subscribePreviewUpdates(projectId, (updated) => {
      setPortfolio(updated);
      setLiveSync(true);
    });

    return unsub;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  useEffect(() => {
    if (portfolio?.name) {
      document.title = `${portfolio.name} — Preview · ${APP_NAME}`;
    }
  }, [portfolio?.name]);

  const focusEditor = () => {
    if (window.opener && !window.opener.closed) {
      window.opener.focus();
    } else {
      window.close();
    }
  };

  if (!projectId) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400" style={{ background: brand.bg }}>
        Invalid preview link
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3" style={{ background: brand.bg }}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: brand.accent }} />
        <p className="text-sm text-gray-500">Loading preview…</p>
      </div>
    );
  }

  if (error || !portfolio) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6 text-center" style={{ background: brand.bg }}>
        <p className="text-red-400 text-sm">{error || 'Preview not available'}</p>
        <button
          onClick={loadFromApi}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-white"
          style={{ background: brand.accent }}
        >
          <RefreshCw className="w-4 h-4" /> Retry
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: brand.bg }}>
      <header className="sticky top-0 z-50 flex items-center gap-3 px-4 py-2.5 border-b border-white/10 bg-[#0a0a0a]/95 backdrop-blur-md">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <span className="shrink-0 px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider bg-blue-600/20 text-blue-300 border border-blue-500/30">
            Preview
          </span>
          <p className="text-sm text-white font-medium truncate">{portfolio.name}</p>
          {liveSync && (
            <span className="hidden sm:flex items-center gap-1 text-[10px] text-green-400 shrink-0">
              <Radio className="w-3 h-3" /> Live sync
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={loadFromApi}
            title="Reload from server"
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={focusEditor}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white transition"
            style={{ background: `linear-gradient(135deg, ${brand.accent}, ${brand.accentHover})` }}
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Back to editor</span>
          </button>
        </div>
      </header>

      <main className="flex-1 min-h-0">
        <PortfolioPreview portfolio={portfolio} />
      </main>
    </div>
  );
}
