'use client';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBuilderStore } from '@/lib/store';
import { exportPortfolio } from '@/lib/exporter';
import { saveAs } from 'file-saver';
import { ExportFormat } from '@/lib/types';
import { RightTab } from '../Builder';
import {
  Monitor, Tablet, Smartphone, Eye, EyeOff, Download, ArrowLeft,
  Layers, Palette, Search, Mail, LayoutTemplate, Megaphone, Share2, PanelTop, PanelBottom,
  Undo2, Redo2, ZoomIn, ZoomOut, Keyboard, Globe, BarChart2, Code2,
  ChevronDown, CheckCircle2, Circle, Copy, Check, ExternalLink, Crown, Lock, Rocket,
} from 'lucide-react';
import BrandLogo from '../BrandLogo';
import { brand, STORAGE_POLICY_DAYS } from '@/lib/brand';
import { formatDaysRemaining, getDaysRemaining } from '@/lib/project-expiry';
import PremiumModal from '../PremiumModal';
import HostingerDeployModal from '../HostingerDeployModal';
import { fetchPortfolioAccess, bindPortfolioSlot, accessToModalReason, type PremiumModalReason } from '@/lib/portfolio-access-client';
import { openPreviewInNewTab } from '@/lib/preview-tab';

interface Props {
  rightTab: RightTab;
  setRightTab: (t: RightTab) => void;
  onShowShortcuts: () => void;
}

// ── Click-outside hook ───────────────────────────────────────────────────────
function useClickOutside(ref: React.RefObject<HTMLElement | null>, handler: () => void) {
  useEffect(() => {
    const listener = (e: MouseEvent) => {
      if (!ref.current || ref.current.contains(e.target as Node)) return;
      handler();
    };
    document.addEventListener('mousedown', listener);
    return () => document.removeEventListener('mousedown', listener);
  }, [ref, handler]);
}

// ── Dropdown portal — renders outside the overflow-clipped header ────────────
function DropdownPortal({ anchor, open, children }: {
  anchor: React.RefObject<HTMLElement | null>;
  open: boolean;
  children: React.ReactNode;
}) {
  const [pos, setPos] = useState({ top: 0, right: 0 });

  useEffect(() => {
    if (!open || !anchor.current) return;
    const rect = anchor.current.getBoundingClientRect();
    setPos({
      top: rect.bottom + 8,
      right: window.innerWidth - rect.right,
    });
  }, [open, anchor]);

  if (!open) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: pos.top,
        right: pos.right,
        zIndex: 9999,
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: -6, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -6, scale: 0.97 }}
        transition={{ duration: 0.15, ease: 'easeOut' }}
      >
        {children}
      </motion.div>
    </div>
  );
}

export default function BuilderTopbar({ rightTab, setRightTab, onShowShortcuts }: Props) {
  const {
    getActivePortfolio, deviceView, setDeviceView, previewMode, setPreviewMode,
    setActivePortfolio, updatePortfolioName, undo, redo, canUndo, canRedo,
    canvasZoom, setCanvasZoom, togglePublished, user, refreshSession, updatePortfolioHosting,
  } = useBuilderStore();

  const portfolio = getActivePortfolio();

  const [exporting, setExporting] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameVal, setNameVal] = useState(portfolio?.name || '');
  const [copied, setCopied] = useState(false);
  const [showPremium, setShowPremium] = useState(false);
  const [premiumReason, setPremiumReason] = useState<PremiumModalReason>('general');
  const [showHostinger, setShowHostinger] = useState(false);

  const isPremium = Boolean(user?.isPremium);
  const isThisPortfolioUnlocked = Boolean(
    user?.premiumPortfolioId && portfolio?.id === user.premiumPortfolioId,
  );
  const hasBoundSlot = Boolean(user?.premiumPortfolioId);

  const shareDaysLeft = portfolio ? getDaysRemaining(portfolio.createdAt) : 0;
  const canTrialShare = !isPremium && shareDaysLeft > 0;
  const canUseShare = isThisPortfolioUnlocked || canTrialShare || (isPremium && !hasBoundSlot);
  const shareStatusText = !canUseShare
    ? (hasBoundSlot ? '🔒 Premium slot used on another portfolio' : shareDaysLeft <= 0 ? `🔒 Free share expired (${STORAGE_POLICY_DAYS}-day limit)` : '🔒 Upgrade to share')
    : canTrialShare && !isThisPortfolioUnlocked
      ? `🟢 Free share · ${formatDaysRemaining(portfolio!.createdAt)} · copy link below`
      : portfolio!.published
        ? '🟢 Live — anyone with the link can view & copy'
        : '⚫ Draft — publish to make the link public';

  const ensurePortfolioAccess = async (action: 'export' | 'share' | 'publish' | 'deploy'): Promise<boolean> => {
    if (!portfolio) return false;
    try {
      const access = await fetchPortfolioAccess(portfolio.id, action, portfolio.createdAt);
      if (access.status === 'allowed') return true;

      if (access.status === 'bind_on_action') {
        const bind = await bindPortfolioSlot(portfolio.id);
        if (bind.ok) {
          await refreshSession();
          return true;
        }
        if (bind.code === 'SLOT_USED') {
          setPremiumReason('unlock_another');
          setShowPremium(true);
          return false;
        }
        return false;
      }

      const reason = accessToModalReason(access.status, action);
      if (reason) {
        setPremiumReason(reason);
        setShowPremium(true);
      }
      return false;
    } catch {
      return false;
    }
  };

  const exportRef = useRef<HTMLDivElement>(null);
  const shareRef = useRef<HTMLDivElement>(null);

  useClickOutside(exportRef, () => setShowExport(false));
  useClickOutside(shareRef, () => setShowShare(false));

  if (!portfolio) return null;

  const handleExport = async (format: ExportFormat) => {
    setShowExport(false);
    const allowed = await ensurePortfolioAccess('export');
    if (!allowed) return;
    setExporting(true);
    try {
      const blob = await exportPortfolio(portfolio, format);
      saveAs(blob, `${portfolio.name.replace(/\s+/g, '-')}-${format}.zip`);
    } finally {
      setExporting(false);
    }
  };

  const shareUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/p/${portfolio.slug}`;

  const handleCopy = async () => {
    const allowed = await ensurePortfolioAccess('share');
    if (!allowed) return;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePublishToggle = async () => {
    const allowed = await ensurePortfolioAccess('publish');
    if (!allowed) return;
    togglePublished(portfolio.id);
  };

  const handleGoLive = async () => {
    const allowed = await ensurePortfolioAccess('deploy');
    if (!allowed) return;
    setShowHostinger(true);
  };

  const handleHostingerDeployed = (liveUrl: string, domain: string) => {
    updatePortfolioHosting(portfolio.id, {
      provider: 'hostinger',
      domain,
      liveUrl,
      status: 'live',
      lastDeployedAt: new Date().toISOString(),
    });
    if (!portfolio.published) togglePublished(portfolio.id);
  };

  const tabs: { id: RightTab; icon: any; label: string }[] = [
    { id: 'sections', icon: Layers, label: 'Sections' },
    { id: 'theme', icon: Palette, label: 'Theme' },
    { id: 'navbar', icon: PanelTop, label: 'Navbar' },
    { id: 'footer', icon: PanelBottom, label: 'Footer' },
    { id: 'templates', icon: LayoutTemplate, label: 'Templates' },
    { id: 'popup', icon: Megaphone, label: 'Popup' },
    { id: 'social', icon: Globe, label: 'Social' },
    { id: 'seo', icon: Search, label: 'SEO' },
    { id: 'smtp', icon: Mail, label: 'SMTP' },
    { id: 'analytics', icon: BarChart2, label: 'Analytics' },
    { id: 'css', icon: Code2, label: 'CSS' },
  ];

  return (
    <header className="h-14 border-b flex items-center px-3 gap-2 shrink-0" style={{ background: brand.navy, borderColor: brand.border }}>
      {/* Back + logo */}
      <button
        onClick={() => setActivePortfolio('')}
        className="flex items-center gap-1.5 text-gray-400 hover:text-white transition shrink-0 p-1.5 rounded-lg hover:bg-white/5"
        title="Back to dashboard"
      >
        <ArrowLeft className="w-4 h-4" />
      </button>
      <BrandLogo size="xs" className="hidden sm:inline-flex shrink-0" />

      {/* Portfolio name + status */}
      <div className="flex items-center gap-1.5 shrink-0">
        {editingName ? (
          <input
            value={nameVal}
            onChange={e => setNameVal(e.target.value)}
            onBlur={() => { updatePortfolioName(portfolio.id, nameVal); setEditingName(false); }}
            onKeyDown={e => {
              if (e.key === 'Enter') { updatePortfolioName(portfolio.id, nameVal); setEditingName(false); }
              if (e.key === 'Escape') setEditingName(false);
            }}
            className="bg-white/10 border border-blue-500 rounded-lg px-2 py-0.5 text-sm text-white focus:outline-none w-36"
            autoFocus
          />
        ) : (
          <button
            onClick={() => { setNameVal(portfolio.name); setEditingName(true); }}
            className="text-sm font-medium text-white hover:text-blue-400 transition max-w-[130px] truncate"
            title="Click to rename"
          >
            {portfolio.name}
          </button>
        )}
        <button
          onClick={handlePublishToggle}
          className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border transition ${
            portfolio.published
              ? 'bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30'
              : 'bg-white/5 text-gray-500 border-white/10 hover:bg-white/10'
          }`}
        >
          {portfolio.published ? <CheckCircle2 className="w-3 h-3" /> : <Circle className="w-3 h-3" />}
          {portfolio.published ? 'Live' : 'Draft'}
        </button>
      </div>

      <div className="w-px h-6 bg-white/10 shrink-0" />

      {/* Undo / Redo */}
      <div className="flex items-center gap-0.5 shrink-0">
        <button onClick={undo} disabled={!canUndo()} title="Undo (Ctrl+Z)"
          className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 disabled:opacity-25 disabled:cursor-not-allowed transition">
          <Undo2 className="w-4 h-4" />
        </button>
        <button onClick={redo} disabled={!canRedo()} title="Redo (Ctrl+Y)"
          className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 disabled:opacity-25 disabled:cursor-not-allowed transition">
          <Redo2 className="w-4 h-4" />
        </button>
      </div>

      <div className="w-px h-6 bg-white/10 shrink-0" />

      {/* Panel tabs — scrollable, no overflow clip */}
      <div data-tour="panel-tabs" className="flex items-center gap-0.5 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setRightTab(t.id)}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap shrink-0 ${
              rightTab === t.id ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <t.icon className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">{t.label}</span>
          </button>
        ))}
      </div>

      <div className="flex-1 min-w-0" />

      {/* Zoom */}
      <div className="flex items-center gap-0.5 bg-white/5 rounded-lg px-1 py-0.5 shrink-0">
        <button onClick={() => setCanvasZoom(canvasZoom - 10)} className="p-1 text-gray-400 hover:text-white transition" title="Zoom out">
          <ZoomOut className="w-3.5 h-3.5" />
        </button>
        <span className="text-xs text-gray-400 w-9 text-center font-mono">{canvasZoom}%</span>
        <button onClick={() => setCanvasZoom(canvasZoom + 10)} className="p-1 text-gray-400 hover:text-white transition" title="Zoom in">
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Device view */}
      <div data-tour="device-view" className="flex items-center gap-0.5 bg-white/5 rounded-lg p-0.5 shrink-0">
        {[
          { view: 'desktop', Icon: Monitor, title: 'Desktop' },
          { view: 'tablet', Icon: Tablet, title: 'Tablet' },
          { view: 'mobile', Icon: Smartphone, title: 'Mobile' },
        ].map(({ view, Icon, title }) => (
          <button
            key={view}
            onClick={() => setDeviceView(view as any)}
            title={title}
            className={`p-1.5 rounded transition ${deviceView === view ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
          >
            <Icon className="w-3.5 h-3.5" />
          </button>
        ))}
      </div>

      {/* Preview toggle + new tab */}
      <div className="flex items-center shrink-0 rounded-lg overflow-hidden border border-white/10">
        <button
          onClick={() => setPreviewMode(!previewMode)}
          title="Toggle preview (Ctrl+P)"
          className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium transition ${
            previewMode ? 'bg-green-600 hover:bg-green-500 text-white' : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
          }`}
        >
          {previewMode ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          <span className="hidden sm:inline">{previewMode ? 'Edit' : 'Preview'}</span>
        </button>
        <button
          type="button"
          onClick={() => openPreviewInNewTab(portfolio)}
          title="Open preview in new tab (live sync)"
          className="flex items-center gap-1 px-2 py-1.5 text-xs font-medium bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 border-l border-white/10 transition"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span className="hidden md:inline">New tab</span>
        </button>
      </div>

      {/* ── Share & Export ── */}
      <div data-tour="export-share" className="flex items-center gap-1 shrink-0">
      {/* Go Live on Hostinger */}
      <button
        onClick={handleGoLive}
        title="Deploy to your Hostinger domain"
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition shrink-0 text-white shadow-lg shadow-blue-500/20"
        style={{ background: `linear-gradient(135deg, ${brand.accent}, ${brand.accentHover})` }}
      >
        {!isThisPortfolioUnlocked ? <Lock className="w-3.5 h-3.5" /> : <Rocket className="w-3.5 h-3.5" />}
        <span className="hidden sm:inline">Go Live</span>
      </button>
      {portfolio.hosting?.status === 'live' && (
        <a
          href={portfolio.hosting.liveUrl}
          target="_blank"
          rel="noopener noreferrer"
          title={`Live at ${portfolio.hosting.domain}`}
          className="hidden md:flex items-center gap-1 px-2 py-1.5 rounded-lg text-[10px] text-green-400 bg-green-500/10 border border-green-500/20 hover:bg-green-500/20 transition"
        >
          <Globe className="w-3 h-3" />
          {portfolio.hosting.domain}
        </a>
      )}
      <div ref={shareRef} className="shrink-0">
        <button
          onClick={() => { setShowShare(v => !v); setShowExport(false); }}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition ${
            showShare ? 'bg-white/15 text-white' : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
          }`}
        >
          {!canUseShare ? <Lock className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
          <span className="hidden sm:inline">Share</span>
          <ChevronDown className={`w-3 h-3 transition-transform ${showShare ? 'rotate-180' : ''}`} />
        </button>

        <DropdownPortal anchor={shareRef} open={showShare}>
          <div className="bg-[#1a1a1a] border border-white/15 rounded-2xl shadow-2xl w-80 overflow-hidden">
            {/* Header */}
            <div className="px-4 pt-4 pb-3 border-b border-white/10">
              <p className="text-sm font-semibold text-white">Share Portfolio</p>
              <p className="text-xs text-gray-500 mt-0.5">{shareStatusText}</p>
            </div>

            {/* URL row */}
            <div className="p-4 space-y-3">
              <div className="flex gap-2">
                <div className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 flex items-center gap-2 min-w-0">
                  <Globe className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                  <span className="text-xs text-gray-300 truncate font-mono">{shareUrl}</span>
                </div>
                <button
                  onClick={handleCopy}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition shrink-0 ${
                    copied ? 'bg-green-600 text-white' : 'bg-blue-600 hover:bg-blue-500 text-white'
                  }`}
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>

              {/* Hostinger deploy */}
              <button
                onClick={() => { setShowShare(false); handleGoLive(); }}
                className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl border border-blue-500/30 bg-blue-500/10 text-blue-300 hover:bg-blue-500/20 transition"
              >
                <Rocket className="w-4 h-4" />
                <div className="text-left">
                  <p className="text-xs font-medium">Go Live on Hostinger</p>
                  <p className="text-[10px] opacity-70">Deploy to your own domain</p>
                </div>
              </button>

              {/* Publish toggle */}
              <button
                onClick={handlePublishToggle}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border transition ${
                  portfolio.published
                    ? 'bg-green-500/10 border-green-500/30 text-green-400 hover:bg-green-500/20'
                    : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  {portfolio.published ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                  <div className="text-left">
                    <p className="text-xs font-medium">{portfolio.published ? 'Published — Live' : 'Unpublished — Draft'}</p>
                    <p className="text-xs opacity-60">{portfolio.published ? 'Click to unpublish' : 'Click to publish'}</p>
                  </div>
                </div>
                <div className={`w-9 h-5 rounded-full transition-colors relative ${portfolio.published ? 'bg-green-500' : 'bg-white/20'}`}>
                  <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${portfolio.published ? 'left-4' : 'left-0.5'}`} />
                </div>
              </button>

              {/* Open in new tab */}
              {portfolio.published && (
                <a
                  href={shareUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-gray-400 hover:text-white transition"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Open in new tab
                </a>
              )}
            </div>
          </div>
        </DropdownPortal>
      </div>

      {/* ── Export dropdown ── */}
      <div ref={exportRef} className="shrink-0">
        <button
          onClick={async () => {
            if (!isPremium) {
              setPremiumReason('export');
              setShowPremium(true);
              return;
            }
            if (!isThisPortfolioUnlocked && hasBoundSlot) {
              setPremiumReason('unlock_another');
              setShowPremium(true);
              return;
            }
            setShowExport(v => !v); setShowShare(false);
          }}
          disabled={exporting}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition disabled:opacity-50 ${
            !isThisPortfolioUnlocked ? 'bg-white/10 text-gray-400 hover:bg-white/15' : showExport ? 'bg-blue-500 text-white' : 'bg-blue-600 hover:bg-blue-500 text-white'
          }`}
        >
          {!isThisPortfolioUnlocked ? <Lock className="w-3.5 h-3.5" /> : <Download className="w-3.5 h-3.5" />}
          <span className="hidden sm:inline">{exporting ? 'Exporting…' : isThisPortfolioUnlocked ? 'Export' : 'Export 🔒'}</span>
          <ChevronDown className={`w-3 h-3 transition-transform ${showExport ? 'rotate-180' : ''}`} />
        </button>

        <DropdownPortal anchor={exportRef} open={showExport}>
          <div className="bg-[#1a1a1a] border border-white/15 rounded-2xl shadow-2xl w-52 overflow-hidden">
            <div className="px-4 pt-3 pb-2 border-b border-white/10">
              <p className="text-xs font-semibold text-white">Export As</p>
              <p className="text-xs text-gray-500 mt-0.5">
                {isThisPortfolioUnlocked ? 'Download your portfolio as a ZIP' : hasBoundSlot ? `1 portfolio per ₹99 · unlock this for ₹${process.env.NEXT_PUBLIC_PREMIUM_PRICE || 99}` : `Premium required · ₹${process.env.NEXT_PUBLIC_PREMIUM_PRICE || 99}`}
              </p>
            </div>
            {([
              { fmt: 'html', icon: '🌐', label: 'HTML / CSS / JS', desc: 'Static files, open in browser' },
              { fmt: 'react', icon: '⚛️', label: 'React.js', desc: 'Vite + React project' },
              { fmt: 'nextjs', icon: '▲', label: 'Next.js', desc: 'App Router project' },
            ] as const).map(({ fmt, icon, label, desc }) => (
              <button
                key={fmt}
                onClick={() => handleExport(fmt)}
                className="w-full text-left px-4 py-3 hover:bg-white/5 transition border-b border-white/5 last:border-0 group"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-lg">{icon}</span>
                  <div>
                    <p className="text-sm font-medium text-white group-hover:text-blue-300 transition">{label}</p>
                    <p className="text-xs text-gray-500">{desc}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </DropdownPortal>
      </div>
      </div>

      {/* Shortcuts */}
      {isPremium && isThisPortfolioUnlocked && (
        <span className="hidden lg:flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] text-green-400 bg-green-500/10 border border-green-500/20 shrink-0">
          ✓ Download unlocked
        </span>
      )}
      {(!isPremium || (isPremium && !isThisPortfolioUnlocked)) && (
        <button
          onClick={() => { setPremiumReason(hasBoundSlot ? 'unlock_another' : 'general'); setShowPremium(true); }}
          className="hidden md:flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-amber-500/15 text-amber-300 border border-amber-500/25 hover:bg-amber-500/25 transition shrink-0"
        >
          <Crown className="w-3.5 h-3.5" />
          ₹{process.env.NEXT_PUBLIC_PREMIUM_PRICE || 99}
        </button>
      )}

      <button
        onClick={onShowShortcuts}
        title="Keyboard shortcuts (?)"
        className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition shrink-0"
      >
        <Keyboard className="w-4 h-4" />
      </button>

      <PremiumModal open={showPremium} onClose={() => setShowPremium(false)} reason={premiumReason} />
      <HostingerDeployModal
        open={showHostinger}
        onClose={() => setShowHostinger(false)}
        portfolio={portfolio}
        onDeployed={handleHostingerDeployed}
      />
    </header>
  );
}
