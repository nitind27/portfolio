'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBuilderStore } from '@/lib/store';
import { TEMPLATES } from '@/lib/templates';
import { CATEGORY_EMOJI, CATEGORY_LABELS, getPurposeConfig } from '@/lib/website-purposes';
import CreateProjectWizard from './CreateProjectWizard';
import Builder from './Builder';
import OnboardingTour from './builder/OnboardingTour';
import { DASHBOARD_TOUR_STEPS } from '@/lib/tour-steps';
import {
  Plus, Trash2, Copy, Edit3, LogOut, Layers, CheckCircle2,
  Circle, Search, Grid3x3, List, Clock, Globe, Crown, Loader2,
} from 'lucide-react';
import DashboardHelpNav from './DashboardHelpNav';
import PremiumModal from './PremiumModal';
import ProjectExpiryBadge from './ProjectExpiryBadge';
import BrandLogo from './BrandLogo';
import ThemeToggle from './theme/ThemeToggle';
import { useBrand, useTheme } from './theme/ThemeProvider';
import { STORAGE_POLICY_DAYS } from '@/lib/brand';
import { getDaysRemaining } from '@/lib/project-expiry';
import { useRedirectIfAdmin } from '@/lib/use-redirect-admin';
import { usePromoStatus } from '@/lib/promo-client';
import { trackSearchDebounced } from '@/lib/analytics-client';

export default function Dashboard() {
  const redirectingAdmin = useRedirectIfAdmin();
  const {
    portfolios, deletePortfolio, duplicatePortfolio,
    setActivePortfolio, activePortfolioId, logout, togglePublished,
    hasSeenDashboardTour, completeDashboardTour, user, purgeExpiredProjects,
  } = useBuilderStore();
  const [showPremium, setShowPremium] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [showTour, setShowTour] = useState(false);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterCategory, setFilterCategory] = useState('all');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const promo = usePromoStatus();
  const brand = useBrand();
  const { isLight } = useTheme();

  useEffect(() => {
    purgeExpiredProjects();
    const interval = setInterval(() => purgeExpiredProjects(), 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [purgeExpiredProjects]);

  useEffect(() => {
    if (!hasSeenDashboardTour) {
      const t = setTimeout(() => setShowTour(true), 500);
      return () => clearTimeout(t);
    }
  }, [hasSeenDashboardTour]);

  useEffect(() => {
    if (search.trim().length >= 2) {
      trackSearchDebounced(search, 'dashboard_projects');
    }
  }, [search]);

  if (redirectingAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: brand.bg }}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: brand.accent }} />
      </div>
    );
  }

  const activePortfolio = portfolios.find(p => p.id === activePortfolioId);
  if (activePortfolio) return <Builder />;

  const categories = ['all', ...Array.from(new Set(portfolios.map(p => TEMPLATES.find(t => t.id === p.templateId)?.category || 'custom')))];

  const filtered = portfolios.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const template = TEMPLATES.find(t => t.id === p.templateId);
    const matchCat = filterCategory === 'all' || template?.category === filterCategory;
    return matchSearch && matchCat;
  });

  const publishedCount = portfolios.filter(p => p.published).length;

  return (
    <div className="theme-aware min-h-screen" style={{ background: brand.bg, color: brand.text }}>
      {/* Header */}
      <header className="border-b px-4 sm:px-6 py-3 flex items-center justify-between sticky top-0 z-10 backdrop-blur-md" style={{ background: `${brand.bg}ee`, borderColor: brand.border }}>
        <div className="flex items-center gap-4">
          <BrandLogo size="sm" />
          <p className="text-xs hidden sm:block border-l pl-4" style={{ borderColor: brand.border, color: brand.textDim }}>
            Your projects · saved to your account
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle variant="compact" />
          <DashboardHelpNav />

          <div className="hidden sm:block w-px h-8" style={{ background: brand.border }} />

          {user && (
            <div className="hidden sm:flex items-center gap-2 text-xs mr-2" style={{ color: brand.textMuted }}>
              <a href="/profile" className="transition truncate max-w-[120px] hover:opacity-80" style={{ color: brand.text }}>
                {user.name}
              </a>
              {user.isPremium ? (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <Crown className="w-3 h-3" /> Premium
                </span>
              ) : !promo.hidePaidPricing && !promo.paidPlanDisabled ? (
                <button onClick={() => setShowPremium(true)}
                  className="flex items-center gap-1 px-2 py-0.5 rounded-full text-amber-300 border border-amber-500/30 hover:bg-amber-500/10 transition"
                  style={{ background: 'rgba(245,158,11,0.1)' }}>
                  <Crown className="w-3 h-3" /> Upgrade ₹{process.env.NEXT_PUBLIC_PREMIUM_PRICE || 99}
                </button>
              ) : promo.hidePaidPricing ? (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/15 text-green-300 border border-green-500/30">
                  <Crown className="w-3 h-3" /> Premium FREE
                </span>
              ) : null}
            </div>
          )}
          <button
            onClick={logout}
            className="flex items-center gap-2 transition text-xs font-medium px-3 py-2 rounded-lg border border-transparent"
            style={{ color: brand.textMuted }}
            onMouseEnter={e => { e.currentTarget.style.color = brand.text; e.currentTarget.style.background = isLight ? 'rgba(15,23,42,0.04)' : 'rgba(255,255,255,0.04)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = brand.textMuted; e.currentTarget.style.background = 'transparent'; }}
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden md:inline">Sign out</span>
          </button>
        </div>
      </header>

      <PremiumModal open={showPremium} onClose={() => setShowPremium(false)} reason="general" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Storage policy banner */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center gap-3"
          style={{ background: brand.surface, borderColor: 'rgba(245,158,11,0.2)' }}
        >
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(245,158,11,0.12)' }}>
            <Clock className="w-5 h-5 text-amber-400" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium" style={{ color: brand.text }}>
              {STORAGE_POLICY_DAYS}-day cloud storage — projects auto-remove after expiry
            </p>
            <p className="text-xs mt-0.5" style={{ color: brand.textMuted }}>
              Sites exist only in this browser. After {STORAGE_POLICY_DAYS} days they are deleted automatically.
              Export or deploy to Hostinger to keep them permanently.
            </p>
          </div>
        </motion.div>

        {/* Stats bar */}
        <div data-tour="stats" className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            { label: 'Total Projects', value: portfolios.length, icon: Layers, color: 'text-blue-400', bg: brand.accentMuted },
            { label: 'Published', value: publishedCount, icon: Globe, color: 'text-green-400', bg: 'rgba(34,197,94,0.1)' },
            { label: 'Drafts', value: portfolios.length - publishedCount, icon: Circle, color: brand.textMuted, bg: isLight ? 'rgba(15,23,42,0.04)' : 'rgba(255,255,255,0.04)' },
            { label: 'Expiring soon', value: portfolios.filter(p => getDaysRemaining(p.createdAt) <= 2).length, icon: Clock, color: 'text-amber-400', bg: 'rgba(245,158,11,0.1)' },
          ].map((s, i) => {
            const accentClass = typeof s.color === 'string' && s.color.startsWith('text-') ? s.color : '';
            const accentStyle = typeof s.color === 'string' && !s.color.startsWith('text-') ? { color: s.color } : undefined;
            return (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="border rounded-2xl p-4 flex items-center gap-3" style={{ background: brand.surface, borderColor: brand.border }}>
              <div className={accentClass} style={accentStyle}><s.icon className="w-5 h-5" /></div>
              <div>
                <p className={`text-xl font-bold ${accentClass}`} style={accentStyle}>{s.value}</p>
                <p className="text-xs" style={{ color: brand.textMuted }}>{s.label}</p>
              </div>
            </motion.div>
            );
          })}
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="flex-1 min-w-48 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: brand.textDim }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search projects..."
              className="w-full border rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-blue-500/40 transition"
              style={{
                borderColor: brand.border,
                background: isLight ? 'rgba(15,23,42,0.03)' : 'rgba(255,255,255,0.04)',
                color: brand.text,
              }}
            />

          </div>

          {/* Category filter */}
          <div className="flex gap-1 flex-wrap">
            {categories.map(c => (
              <button key={c} onClick={() => setFilterCategory(c)}
                className="px-3 py-1.5 text-xs rounded-lg transition"
                style={filterCategory === c
                  ? { background: brand.accent, color: brand.onAccent }
                  : { background: isLight ? 'rgba(15,23,42,0.04)' : 'rgba(255,255,255,0.05)', color: brand.textMuted }}>
                {c === 'all' ? 'All' : (CATEGORY_LABELS[c as keyof typeof CATEGORY_LABELS] || c)}
              </button>
            ))}
          </div>

          {/* View toggle */}
          <div className="flex gap-1 rounded-lg p-1" style={{ background: isLight ? 'rgba(15,23,42,0.04)' : 'rgba(255,255,255,0.05)' }}>
            <button onClick={() => setViewMode('grid')}
              className="p-1.5 rounded transition"
              style={viewMode === 'grid'
                ? { background: isLight ? 'rgba(15,23,42,0.08)' : 'rgba(255,255,255,0.1)', color: brand.text }
                : { color: brand.textDim }}>
              <Grid3x3 className="w-4 h-4" />
            </button>
            <button onClick={() => setViewMode('list')}
              className="p-1.5 rounded transition"
              style={viewMode === 'list'
                ? { background: isLight ? 'rgba(15,23,42,0.08)' : 'rgba(255,255,255,0.1)', color: brand.text }
                : { color: brand.textDim }}>
              <List className="w-4 h-4" />
            </button>
          </div>

          <button data-tour="new-portfolio" onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition text-sm"
            style={{ background: brand.accent, color: brand.onAccent }}>
            <Plus className="w-4 h-4" /> New Website
          </button>
        </div>

        {/* Empty state */}
        {filtered.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-center py-24 border border-dashed rounded-2xl"
            style={{ borderColor: brand.border }}>
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: isLight ? 'rgba(15,23,42,0.04)' : 'rgba(255,255,255,0.05)' }}>
              <Layers className="w-8 h-8" style={{ color: brand.textDim }} />
            </div>
            <p className="text-lg font-medium" style={{ color: brand.textMuted }}>{search ? 'No results found' : 'No projects yet'}</p>
            <p className="text-sm mt-1" style={{ color: brand.textDim }}>{search ? 'Try a different search term' : 'Create your first website — portfolio, business, shop, and more'}</p>
            {!search && (
              <button onClick={() => setShowCreate(true)}
                className="mt-6 px-6 py-2.5 rounded-xl font-medium transition text-sm"
                style={{ background: brand.accent, color: brand.onAccent }}>
                Create Website
              </button>
            )}
          </motion.div>
        )}

        {/* Grid view */}
        {viewMode === 'grid' && filtered.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((p, i) => {
              const template = TEMPLATES.find(t => t.id === p.templateId);
              return (
                <motion.div key={p.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                  className="rounded-2xl overflow-hidden border transition group"
                  style={{ background: brand.surface, borderColor: brand.border }}>
                  <div className="h-40 relative overflow-hidden border-b" style={{ borderColor: brand.border }}>
                    <div className="absolute inset-0 flex flex-col" style={{ background: `linear-gradient(160deg, ${template?.defaultTheme.primaryColor}18, ${brand.bg})` }}>
                      <div className="flex items-center gap-1.5 px-3 py-2 border-b border-white/[0.06] bg-black/20">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-400/70" />
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-400/70" />
                        <div className="w-1.5 h-1.5 rounded-full bg-green-400/70" />
                        <div className="flex-1 mx-2 h-3 rounded bg-white/10" />
                      </div>
                      <div className="flex-1 p-3 flex flex-col justify-center items-center">
                        <span className="text-4xl group-hover:scale-105 transition-transform duration-300">
                          {CATEGORY_EMOJI[template?.category || ''] || '🌟'}
                        </span>
                        <p className="text-[10px] mt-2 truncate max-w-[90%]" style={{ color: brand.textMuted }}>{p.name}</p>
                      </div>
                    </div>
                    {/* Color swatches */}
                    <div className="absolute bottom-2 left-3 flex gap-1">
                      {[template?.defaultTheme.primaryColor, template?.defaultTheme.secondaryColor, template?.defaultTheme.accentColor].map((c, j) => (
                        <div key={j} className="w-3 h-3 rounded-full border border-white/20" style={{ background: c }} />
                      ))}
                    </div>
                    {/* Badges */}
                    <div className="absolute top-2 right-2 flex flex-col items-end gap-1">
                      <ProjectExpiryBadge createdAt={p.createdAt} compact />
                      {user?.premiumPortfolioId === p.id && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                          <Crown className="w-3 h-3" /> Unlocked
                        </span>
                      )}
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${p.published ? 'bg-green-500/20 text-green-600 border-green-500/30' : ''}`}
                        style={!p.published ? { background: isLight ? 'rgba(15,23,42,0.04)' : 'rgba(255,255,255,0.05)', color: brand.textMuted, borderColor: brand.border } : undefined}>
                        {p.published ? '🟢 Live' : 'Draft'}
                      </span>
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className="font-semibold truncate" style={{ color: brand.text }}>{p.name}</h3>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      {p.meta?.purpose && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded border text-blue-300" style={{ background: brand.accentMuted, borderColor: 'rgba(37,99,235,0.25)' }}>
                          {getPurposeConfig(p.meta.purpose).icon} {getPurposeConfig(p.meta.purpose).title}
                        </span>
                      )}
                      <span className="text-xs" style={{ color: brand.textDim }}>{template?.name}</span>
                    </div>
                    <div className="mt-3">
                      <ProjectExpiryBadge createdAt={p.createdAt} showBar />
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      <button onClick={() => setActivePortfolio(p.id)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition"
                        style={{ background: brand.accent, color: brand.onAccent }}>
                        <Edit3 className="w-3.5 h-3.5" /> Edit
                      </button>
                      <button onClick={() => togglePublished(p.id)} title={p.published ? 'Unpublish' : 'Publish'}
                        className={`p-2 rounded-lg transition ${p.published ? 'bg-green-500/10 text-green-600 hover:bg-green-500/20' : ''}`}
                        style={!p.published ? { background: isLight ? 'rgba(15,23,42,0.04)' : 'rgba(255,255,255,0.05)', color: brand.textMuted } : undefined}>
                        {p.published ? <CheckCircle2 className="w-4 h-4" /> : <Globe className="w-4 h-4" />}
                      </button>
                      <button onClick={() => duplicatePortfolio(p.id)} title="Duplicate"
                        className="p-2 rounded-lg transition"
                        style={{ background: isLight ? 'rgba(15,23,42,0.04)' : 'rgba(255,255,255,0.05)', color: brand.textMuted }}>
                        <Copy className="w-4 h-4" />
                      </button>
                      <button onClick={() => setConfirmDelete(p.id)} title="Delete"
                        className="p-2 hover:bg-red-500/20 hover:text-red-500 rounded-lg transition"
                        style={{ background: isLight ? 'rgba(15,23,42,0.04)' : 'rgba(255,255,255,0.05)', color: brand.textMuted }}>
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* List view */}
        {viewMode === 'list' && filtered.length > 0 && (
          <div className="space-y-2">
            {filtered.map((p, i) => {
              const template = TEMPLATES.find(t => t.id === p.templateId);
              return (
                <motion.div key={p.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                  className="border rounded-xl px-4 py-3 flex items-center gap-4 transition"
                  style={{ background: brand.surface, borderColor: brand.border }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
                    style={{ background: `linear-gradient(135deg, ${template?.defaultTheme.primaryColor}22, ${template?.defaultTheme.secondaryColor}22)` }}>
                    {CATEGORY_EMOJI[template?.category || ''] || '🌟'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate" style={{ color: brand.text }}>{p.name}</p>
                    <p className="text-xs flex items-center gap-1.5 flex-wrap mt-0.5" style={{ color: brand.textDim }}>
                      {p.meta?.purpose && (
                        <span className="text-blue-400">{getPurposeConfig(p.meta.purpose).title}</span>
                      )}
                      {p.meta?.purpose && <span>·</span>}
                      {template?.name}
                    </p>
                  </div>
                  <ProjectExpiryBadge createdAt={p.createdAt} compact />
                  <div className="flex items-center gap-1 shrink-0">
                    {user?.premiumPortfolioId === p.id && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 flex items-center gap-1">
                        <Crown className="w-3 h-3" /> Unlocked
                      </span>
                    )}
                    <span className={`text-xs px-2 py-0.5 rounded-full ${p.published ? 'bg-green-500/20 text-green-600' : ''}`}
                      style={!p.published ? { background: isLight ? 'rgba(15,23,42,0.04)' : 'rgba(255,255,255,0.05)', color: brand.textMuted } : undefined}>
                      {p.published ? 'Live' : 'Draft'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => setActivePortfolio(p.id)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition" style={{ background: brand.accent, color: brand.onAccent }}>
                      <Edit3 className="w-3 h-3" /> Edit
                    </button>
                    <button onClick={() => duplicatePortfolio(p.id)} className="p-1.5 rounded-lg transition"
                      style={{ background: isLight ? 'rgba(15,23,42,0.04)' : 'rgba(255,255,255,0.05)', color: brand.textMuted }}>
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => setConfirmDelete(p.id)} className="p-1.5 hover:bg-red-500/20 hover:text-red-500 rounded-lg transition"
                      style={{ background: isLight ? 'rgba(15,23,42,0.04)' : 'rgba(255,255,255,0.05)', color: brand.textMuted }}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <CreateProjectWizard open={showCreate} onClose={() => setShowCreate(false)} />

      {/* Delete confirm */}
      <AnimatePresence>
        {confirmDelete && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={e => e.target === e.currentTarget && setConfirmDelete(null)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="border rounded-2xl p-6 w-full max-w-sm shadow-2xl"
              style={{ background: brand.surface, borderColor: brand.border }}>
              <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-center mb-2" style={{ color: brand.text }}>Delete Portfolio?</h3>
              <p className="text-sm text-center mb-6" style={{ color: brand.textMuted }}>This action cannot be undone. The portfolio will be permanently deleted.</p>
              <div className="flex gap-3">
                <button onClick={() => setConfirmDelete(null)} className="flex-1 py-2.5 rounded-xl border transition text-sm"
                  style={{ borderColor: brand.border, color: brand.textMuted }}>Cancel</button>
                <button onClick={() => { deletePortfolio(confirmDelete); setConfirmDelete(null); }}
                  className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 font-semibold transition text-sm">Delete</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {showTour && (
        <OnboardingTour
          steps={DASHBOARD_TOUR_STEPS}
          onComplete={() => { setShowTour(false); completeDashboardTour(); }}
        />
      )}

    </div>
  );
}
