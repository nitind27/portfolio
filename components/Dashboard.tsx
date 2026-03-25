'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBuilderStore } from '@/lib/store';
import { TEMPLATES } from '@/lib/templates';
import { formatDate } from '@/lib/utils';
import Builder from './Builder';
import {
  Plus, Trash2, Copy, Edit3, LogOut, Layers, CheckCircle2,
  Circle, Search, Grid3x3, List, Clock, Globe
} from 'lucide-react';

const CATEGORY_EMOJI: Record<string, string> = {
  developer: '💻', photographer: '📷', model: '✨', agency: '🏢', designer: '🎨', minimal: '⬜', creative: '🌈',
};

export default function Dashboard() {
  const { portfolios, createPortfolio, deletePortfolio, duplicatePortfolio, setActivePortfolio, activePortfolioId, logout, togglePublished } = useBuilderStore();
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState(TEMPLATES[0].id);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterCategory, setFilterCategory] = useState('all');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const activePortfolio = portfolios.find(p => p.id === activePortfolioId);
  if (activePortfolio) return <Builder />;

  const handleCreate = () => {
    if (!newName.trim()) return;
    const id = createPortfolio(selectedTemplate, newName.trim());
    setActivePortfolio(id);
    setShowCreate(false);
    setNewName('');
  };

  const categories = ['all', ...Array.from(new Set(portfolios.map(p => TEMPLATES.find(t => t.id === p.templateId)?.category || 'custom')))];

  const filtered = portfolios.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const template = TEMPLATES.find(t => t.id === p.templateId);
    const matchCat = filterCategory === 'all' || template?.category === filterCategory;
    return matchSearch && matchCat;
  });

  const publishedCount = portfolios.filter(p => p.published).length;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <header className="border-b border-white/10 px-6 py-4 flex items-center justify-between sticky top-0 bg-[#0a0a0a]/95 backdrop-blur-sm z-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-lg">Portfolio Builder</span>
            <p className="text-xs text-gray-500 -mt-0.5">Professional portfolio creator</p>
          </div>
        </div>
        <button onClick={logout} className="flex items-center gap-2 text-gray-400 hover:text-white transition text-sm px-3 py-1.5 rounded-lg hover:bg-white/5">
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Stats bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            { label: 'Total Portfolios', value: portfolios.length, icon: Layers, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
            { label: 'Published', value: publishedCount, icon: Globe, color: 'text-green-400', bg: 'bg-green-500/10' },
            { label: 'Drafts', value: portfolios.length - publishedCount, icon: Circle, color: 'text-gray-400', bg: 'bg-white/5' },
            { label: 'Templates Used', value: new Set(portfolios.map(p => p.templateId)).size, icon: Grid3x3, color: 'text-purple-400', bg: 'bg-purple-500/10' },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className={`${s.bg} border border-white/5 rounded-2xl p-4 flex items-center gap-3`}>
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
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search portfolios..."
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition" />
          </div>

          {/* Category filter */}
          <div className="flex gap-1 flex-wrap">
            {categories.map(c => (
              <button key={c} onClick={() => setFilterCategory(c)}
                className={`px-3 py-1.5 text-xs rounded-lg transition capitalize ${filterCategory === c ? 'bg-indigo-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
                {c}
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

          <button onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-xl font-medium transition text-sm shadow-lg shadow-indigo-500/20">
            <Plus className="w-4 h-4" /> New Portfolio
          </button>
        </div>

        {/* Empty state */}
        {filtered.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-center py-24 border border-dashed border-white/10 rounded-2xl">
            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
              <Layers className="w-8 h-8 text-gray-600" />
            </div>
            <p className="text-gray-400 text-lg font-medium">{search ? 'No results found' : 'No portfolios yet'}</p>
            <p className="text-gray-600 text-sm mt-1">{search ? 'Try a different search term' : 'Create your first portfolio to get started'}</p>
            {!search && (
              <button onClick={() => setShowCreate(true)}
                className="mt-6 bg-indigo-600 hover:bg-indigo-500 px-6 py-2.5 rounded-xl font-medium transition text-sm">
                Create Portfolio
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
                  className="bg-[#111] border border-white/10 rounded-2xl overflow-hidden hover:border-indigo-500/40 transition group">
                  {/* Thumbnail */}
                  <div className="h-36 flex items-center justify-center text-5xl relative overflow-hidden"
                    style={{ background: `linear-gradient(135deg, ${template?.defaultTheme.primaryColor}22, ${template?.defaultTheme.secondaryColor}22)` }}>
                    <span className="group-hover:scale-110 transition-transform duration-300">
                      {CATEGORY_EMOJI[template?.category || ''] || '🌟'}
                    </span>
                    {/* Color swatches */}
                    <div className="absolute bottom-2 left-3 flex gap-1">
                      {[template?.defaultTheme.primaryColor, template?.defaultTheme.secondaryColor, template?.defaultTheme.accentColor].map((c, j) => (
                        <div key={j} className="w-3 h-3 rounded-full border border-white/20" style={{ background: c }} />
                      ))}
                    </div>
                    {/* Published badge */}
                    <div className="absolute top-2 right-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${p.published ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-white/5 text-gray-500 border border-white/10'}`}>
                        {p.published ? '🟢 Live' : 'Draft'}
                      </span>
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className="font-semibold text-white truncate">{p.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500 capitalize">{template?.name}</span>
                      <span className="text-gray-700">·</span>
                      <span className="text-xs text-gray-600 flex items-center gap-1">
                        <Clock className="w-3 h-3" />{formatDate(p.updatedAt)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      <button onClick={() => setActivePortfolio(p.id)}
                        className="flex-1 flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 py-2 rounded-lg text-sm font-medium transition">
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
                  className="bg-[#111] border border-white/10 rounded-xl px-4 py-3 flex items-center gap-4 hover:border-indigo-500/30 transition">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
                    style={{ background: `linear-gradient(135deg, ${template?.defaultTheme.primaryColor}22, ${template?.defaultTheme.secondaryColor}22)` }}>
                    {CATEGORY_EMOJI[template?.category || ''] || '🌟'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white truncate">{p.name}</p>
                    <p className="text-xs text-gray-500">{template?.name} · {formatDate(p.updatedAt)}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${p.published ? 'bg-green-500/20 text-green-400' : 'bg-white/5 text-gray-500'}`}>
                    {p.published ? 'Live' : 'Draft'}
                  </span>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => setActivePortfolio(p.id)} className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-500 px-3 py-1.5 rounded-lg text-xs font-medium transition">
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

      {/* Create Modal */}
      <AnimatePresence>
        {showCreate && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={e => e.target === e.currentTarget && setShowCreate(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#111] border border-white/10 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
              <h3 className="text-xl font-bold mb-1">Create New Portfolio</h3>
              <p className="text-sm text-gray-500 mb-6">Choose a template and give it a name to get started.</p>

              <div className="mb-5">
                <label className="block text-sm text-gray-400 mb-2">Portfolio Name</label>
                <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="My Awesome Portfolio"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition"
                  onKeyDown={e => e.key === 'Enter' && handleCreate()} autoFocus />
              </div>

              <div className="mb-6">
                <label className="block text-sm text-gray-400 mb-3">Choose Template</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {TEMPLATES.map(t => (
                    <button key={t.id} onClick={() => setSelectedTemplate(t.id)}
                      className={`p-3 rounded-xl border text-left transition ${selectedTemplate === t.id ? 'border-indigo-500 bg-indigo-500/10 shadow-lg shadow-indigo-500/10' : 'border-white/10 hover:border-white/20 hover:bg-white/5'}`}>
                      <div className="h-14 rounded-lg mb-2 flex items-center justify-center text-2xl"
                        style={{ background: `linear-gradient(135deg, ${t.defaultTheme.primaryColor}33, ${t.defaultTheme.secondaryColor}33)` }}>
                        {CATEGORY_EMOJI[t.category] || '🌟'}
                      </div>
                      <p className="font-medium text-sm">{t.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5 capitalize">{t.category}</p>
                      <div className="flex gap-1 mt-2">
                        {[t.defaultTheme.primaryColor, t.defaultTheme.secondaryColor, t.defaultTheme.backgroundColor].map((c, i) => (
                          <div key={i} className="w-3 h-3 rounded-full border border-white/10" style={{ background: c }} />
                        ))}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setShowCreate(false)} className="flex-1 py-3 rounded-xl border border-white/10 hover:bg-white/5 transition text-sm">Cancel</button>
                <button onClick={handleCreate} disabled={!newName.trim()}
                  className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition text-sm">
                  Create Portfolio
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
    </div>
  );
}
