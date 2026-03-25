'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useBuilderStore } from '@/lib/store';
import { PortfolioSection, SectionType } from '@/lib/types';
import { GripVertical, Eye, EyeOff, Trash2, Plus, Search, ChevronDown, ChevronRight } from 'lucide-react';

const SECTION_ICONS: Record<string, string> = {
  hero: '🏠', about: '👤', skills: '⚡', experience: '💼', projects: '🚀',
  gallery: '🖼️', testimonials: '💬', contact: '📧', videos: '🎬',
  services: '🛠️', team: '👥', stats: '📊', social: '🔗',
  pricing: '💰', faq: '❓', blog: '📝', custom: '✏️',
};

const SECTION_GROUPS: { label: string; types: SectionType[] }[] = [
  { label: 'Core', types: ['hero', 'about', 'contact'] },
  { label: 'Content', types: ['skills', 'experience', 'projects', 'services', 'blog'] },
  { label: 'Media', types: ['gallery', 'videos'] },
  { label: 'Social', types: ['social', 'testimonials', 'stats'] },
  { label: 'Business', types: ['team', 'pricing', 'faq'] },
  { label: 'Other', types: ['custom'] },
];

function SortableSection({ section }: { section: PortfolioSection }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: section.id });
  const { toggleSectionVisibility, removeSection, setActiveSection, activeSection } = useBuilderStore();
  const isActive = activeSection === section.id;

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }}
      className={`group flex items-center gap-1.5 px-2 py-1.5 rounded-lg cursor-pointer transition-all ${
        isActive ? 'bg-indigo-600/20 border border-indigo-500/40' : 'hover:bg-white/5 border border-transparent'
      } ${!section.visible ? 'opacity-40' : ''}`}
      onClick={() => setActiveSection(isActive ? null : section.id)}
    >
      <button {...attributes} {...listeners} className="drag-handle text-gray-700 hover:text-gray-400 shrink-0 cursor-grab active:cursor-grabbing" onClick={e => e.stopPropagation()}>
        <GripVertical className="w-3.5 h-3.5" />
      </button>
      <span className="text-sm shrink-0">{SECTION_ICONS[section.type] || '📄'}</span>
      <span className="flex-1 text-xs font-medium truncate text-gray-300">{section.title}</span>
      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition shrink-0">
        <button onClick={e => { e.stopPropagation(); toggleSectionVisibility(section.id); }}
          className={`p-1 rounded transition ${section.visible ? 'hover:text-indigo-400' : 'text-gray-600 hover:text-gray-400'}`}>
          {section.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
        </button>
        <button onClick={e => { e.stopPropagation(); removeSection(section.id); }}
          className="p-1 rounded hover:text-red-400 transition">
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}

export default function BuilderSidebar() {
  const { getActivePortfolio, reorderSections, addSection } = useBuilderStore();
  const portfolio = getActivePortfolio();
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState('');
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

  if (!portfolio) return null;

  const sections = [...portfolio.sections].sort((a, b) => a.order - b.order);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = sections.findIndex(s => s.id === active.id);
    const newIdx = sections.findIndex(s => s.id === over.id);
    const reordered = arrayMove(sections, oldIdx, newIdx).map((s, i) => ({ ...s, order: i }));
    reorderSections(reordered);
  };

  const toggleGroup = (label: string) => {
    setCollapsedGroups(prev => {
      const next = new Set(prev);
      next.has(label) ? next.delete(label) : next.add(label);
      return next;
    });
  };

  const filteredTypes = SECTION_GROUPS.flatMap(g => g.types).filter(t =>
    t.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <aside className="w-52 border-r border-white/10 bg-[#0d0d0d] flex flex-col overflow-hidden shrink-0">
      {/* Header */}
      <div className="p-2.5 border-b border-white/10 space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Sections</p>
          <span className="text-xs text-gray-600">{sections.length}</span>
        </div>
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-600" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search sections..."
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-6 pr-2 py-1 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/50"
          />
        </div>
      </div>

      {/* Section list */}
      <div className="flex-1 overflow-y-auto p-1.5">
        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={sections.map(s => s.id)} strategy={verticalListSortingStrategy}>
            {sections.map(section => (
              <SortableSection key={section.id} section={section} />
            ))}
          </SortableContext>
        </DndContext>
        {sections.length === 0 && (
          <p className="text-xs text-gray-600 text-center py-6">No sections yet</p>
        )}
      </div>

      {/* Add section */}
      <div className="p-2 border-t border-white/10">
        <button onClick={() => setShowAdd(!showAdd)}
          className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 text-xs font-medium transition">
          <Plus className="w-3.5 h-3.5" />
          {showAdd ? 'Close' : 'Add Section'}
        </button>

        <AnimatePresence>
          {showAdd && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mt-2">
              {search ? (
                <div className="grid grid-cols-2 gap-1">
                  {filteredTypes.map(type => (
                    <button key={type} onClick={() => { addSection(type); setShowAdd(false); setSearch(''); }}
                      className="flex items-center gap-1 px-2 py-1.5 rounded-lg hover:bg-white/5 text-xs text-gray-400 hover:text-white transition text-left">
                      <span>{SECTION_ICONS[type]}</span>
                      <span className="capitalize truncate">{type}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="space-y-1 max-h-64 overflow-y-auto">
                  {SECTION_GROUPS.map(group => (
                    <div key={group.label}>
                      <button onClick={() => toggleGroup(group.label)}
                        className="w-full flex items-center justify-between px-2 py-1 text-xs text-gray-500 hover:text-gray-300 transition">
                        <span className="font-semibold uppercase tracking-wider">{group.label}</span>
                        {collapsedGroups.has(group.label) ? <ChevronRight className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </button>
                      {!collapsedGroups.has(group.label) && (
                        <div className="grid grid-cols-2 gap-0.5 mb-1">
                          {group.types.map(type => (
                            <button key={type} onClick={() => { addSection(type); setShowAdd(false); }}
                              className="flex items-center gap-1 px-2 py-1.5 rounded-lg hover:bg-white/5 text-xs text-gray-400 hover:text-white transition text-left">
                              <span>{SECTION_ICONS[type]}</span>
                              <span className="capitalize truncate">{type}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </aside>
  );
}
