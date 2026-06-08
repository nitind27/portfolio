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
  Circle, Search, Grid3x3, List, Clock, Globe, Crown, Shield
} from 'lucide-react';
import PremiumModal from './PremiumModal';
import ProjectExpiryBadge from './ProjectExpiryBadge';
import BrandLogo from './BrandLogo';
import { brand, STORAGE_POLICY_DAYS } from '@/lib/brand';
import { getDaysRemaining } from '@/lib/project-expiry';

export default function Dashboard() {
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
    <div className="min-h-screen" style={{ background: brand.bg, color: brand.text }}>
      {/* Header */}
      <header className="border-b px-6 py-3 flex items-center justify-between sticky top-0 z-10 backdrop-blur-md" style={{ background: `${brand.bg}ee`, borderColor: brand.border }}>
        <div className="flex items-center gap-4">
          <BrandLogo size="sm" />
          <p className="text-xs text-[#64748b] hidden sm:block border-l pl-4" style={{ borderColor: brand.border }}>
            Your projects · saved to your account
          </p>
        </div>
        <div className="flex items-center gap-2">
          {user && (
            <div className="hidden sm:flex items-center gap-2 text-xs text-gray-400 mr-2">
              {user.role === 'admin' && (
                <a href="/admin"
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-blue-500/30 text-blue-300 hover:bg-blue-500/10 transition text-xs font-medium">
                  <Shield className="w-3 h-3" /> Admin
                </a>
              )}
              <span>{user.name}</span>
              {user.isPremium ? (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <Crown className="w-3 h-3" /> Premium
                </span>
              ) : (
                <button onClick={() => setShowPremium(true)}
                  className="flex items-center gap-1 px-2 py-0.5 rounded-full text-amber-300 border border-amber-500/30 hover:bg-amber-500/10 transition"
                  style={{ background: 'rgba(245,158,11,0.1)' }}>
                  <Crown className="w-3 h-3" /> Upgrade ₹{process.env.NEXT_PUBLIC_PREMIUM_PRICE || 99}
                </button>
              )}
            </div>
          )}
          <button onClick={logout} className="flex items-center gap-2 text-gray-400 hover:text-white transition text-sm px-3 py-1.5 rounded-lg hover:bg-white/5">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </header>

      <PremiumModal open={showPremium} onClose={() => setShowPremium(false)} reason="general" />

      <div className="max-w-6xl mx-auto px-6 py-8">
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
            <p className="text-sm font-medium text-[#e8edf2]">
              {STORAGE_POLICY_DAYS}-day cloud storage — projects auto-remove after expiry
            </p>
            <p className="text-xs text-[#8b9aab] mt-0.5">
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
            { label: 'Drafts', value: portfolios.length - publishedCount, icon: Circle, color: 'text-[#8b9aab]', bg: 'rgba(255,255,255,0.04)' },
            { label: 'Expiring soon', value: portfolios.filter(p => getDaysRemaining(p.createdAt) <= 2).length, icon: Clock, color: 'text-amber-400', bg: 'rgba(245,158,11,0.1)' },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="border border-white/[0.06] rounded-2xl p-4 flex items-center gap-3" style={{ background: brand.surface }}>
              <div className={`${s.color}`}><s.icon className="w-5 h-5" /></div>
              <div>
                <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-gray-500">{s.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="flex-1 min-w-48 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search projects..."
              className="w-full bg-white/[0.04] border rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder-[#64748b] focus:outline-none focus:border-blue-500/40 transition"
              style={{ borderColor: brand.border }}
            />

          </div>

          {/* Category filter */}
          <div className="flex gap-1 flex-wrap">
            {categories.map(c => (
              <button key={c} onClick={() => setFilterCategory(c)}
                className={`px-3 py-1.5 text-xs rounded-lg transition ${filterCategory === c ? '' : 'bg-white/5 text-[#94a3b8] hover:bg-white/10'}`}
                style={filterCategory === c ? { background: brand.accent, color: brand.onAccent } : undefined}>
                {c === 'all' ? 'All' : (CATEGORY_LABELS[c as keyof typeof CATEGORY_LABELS] || c)}
              </button>
            ))}
          </div>

          {/* View toggle */}
          <div className="flex gap-1 bg-white/5 rounded-lg p-1">
            <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded transition ${viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-gray-500'}`}>
              <Grid3x3 className="w-4 h-4" />
            </button>
            <button onClick={() => setViewMode('list')} className={`p-1.5 rounded transition ${viewMode === 'list' ? 'bg-white/10 text-white' : 'text-gray-500'}`}>
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
            className="text-center py-24 border border-dashed border-white/10 rounded-2xl">
            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
              <Layers className="w-8 h-8 text-gray-600" />
            </div>
            <p className="text-gray-400 text-lg font-medium">{search ? 'No results found' : 'No projects yet'}</p>
            <p className="text-gray-600 text-sm mt-1">{search ? 'Try a different search term' : 'Create your first website — portfolio, business, shop, and more'}</p>
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
                  className="rounded-2xl overflow-hidden border border-white/[0.08] hover:border-blue-500/30 transition group"
                  style={{ background: brand.surface }}>
                  {/* Thumbnail — website preview box */}
                  <div className="h-40 relative overflow-hidden border-b border-white/[0.06]">
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
                        <p className="text-[10px] text-[#8b9aab] mt-2 truncate max-w-[90%]">{p.name}</p>
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
                      <span className={`text-xs px-2 py-0.5 rounded-full ${p.published ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-white/5 text-[#8b9aab] border border-white/10'}`}>
                        {p.published ? '🟢 Live' : 'Draft'}
                      </span>
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className="font-semibold text-white truncate">{p.name}</h3>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      {p.meta?.purpose && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded border text-blue-300" style={{ background: brand.accentMuted, borderColor: 'rgba(37,99,235,0.25)' }}>
                          {getPurposeConfig(p.meta.purpose).icon} {getPurposeConfig(p.meta.purpose).title}
                        </span>
                      )}
                      <span className="text-xs text-[#5c6b7a]">{template?.name}</span>
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
                        className={`p-2 rounded-lg transition ${p.published ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
                        {p.published ? <CheckCircle2 className="w-4 h-4" /> : <Globe className="w-4 h-4" />}
                      </button>
                      <button onClick={() => duplicatePortfolio(p.id)} title="Duplicate"
                        className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition text-gray-400 hover:text-white">
                        <Copy className="w-4 h-4" />
                      </button>
                      <button onClick={() => setConfirmDelete(p.id)} title="Delete"
                        className="p-2 bg-white/5 hover:bg-red-500/20 hover:text-red-400 rounded-lg transition text-gray-400">
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
                  className="bg-[#111] border border-white/10 rounded-xl px-4 py-3 flex items-center gap-4 hover:border-blue-500/30 transition">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
                    style={{ background: `linear-gradient(135deg, ${template?.defaultTheme.primaryColor}22, ${template?.defaultTheme.secondaryColor}22)` }}>
                    {CATEGORY_EMOJI[template?.category || ''] || '🌟'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white truncate">{p.name}</p>
                    <p className="text-xs text-[#5c6b7a] flex items-center gap-1.5 flex-wrap mt-0.5">
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
                    <span className={`text-xs px-2 py-0.5 rounded-full ${p.published ? 'bg-green-500/20 text-green-400' : 'bg-white/5 text-gray-500'}`}>
                      {p.published ? 'Live' : 'Draft'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => setActivePortfolio(p.id)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition" style={{ background: brand.accent, color: brand.onAccent }}>
                      <Edit3 className="w-3 h-3" /> Edit
                    </button>
                    <button onClick={() => duplicatePortfolio(p.id)} className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg transition text-gray-400">
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => setConfirmDelete(p.id)} className="p-1.5 bg-white/5 hover:bg-red-500/20 hover:text-red-400 rounded-lg transition text-gray-400">
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
              className="bg-[#111] border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
              <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-6 h-6 text-red-400" />
              </div>
              <h3 className="text-lg font-bold text-center mb-2">Delete Portfolio?</h3>
              <p className="text-sm text-gray-400 text-center mb-6">This action cannot be undone. The portfolio will be permanently deleted.</p>
              <div className="flex gap-3">
                <button onClick={() => setConfirmDelete(null)} className="flex-1 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 transition text-sm">Cancel</button>
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
