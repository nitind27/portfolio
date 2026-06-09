'use client';
import { useCallback, useRef, useState, useEffect } from 'react';
import { useBuilderStore } from '@/lib/store';
import { SectionField } from '@/lib/types';
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus, Trash2, X, GripVertical, Upload, Image as ImageIcon, Images, ChevronLeft, ChevronRight } from 'lucide-react';
import { BlogPostBlock, TestimonialBlock, TeamMemberBlock, PricingPlanBlock, FAQItemBlock } from '@/lib/types';
import BlogPostsEditor from './BlogPostsEditor';
import TestimonialsEditor from './TestimonialsEditor';
import TeamEditor from './TeamEditor';
import PricingEditor from './PricingEditor';
import FAQEditor from './FAQEditor';
import SectionAnimationEditor from './SectionAnimationEditor';
import HeroContentEditor from './HeroContentEditor';
import HeroLayoutEditor from './HeroLayoutEditor';
import AboutLayoutEditor from './AboutLayoutEditor';
import CustomSectionEditor from './CustomSectionEditor';
import SectionHelpBanner from './SectionHelpBanner';
import { resolveAssetUrl } from '@/lib/media-url';

interface Props { sectionId: string; variant?: 'canvas' | 'sidebar'; }

type EditorTab = 'content' | 'animation';

// ── Sortable field row ───────────────────────────────────────────────────────
function SortableFieldRow({ field, children }: { field: SectionField; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: field.id });
  return (
    <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }}
      className="relative group/field">
      <button {...attributes} {...listeners}
        className="drag-handle absolute -left-5 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-300 opacity-0 group-hover/field:opacity-100 transition z-10"
        onClick={e => e.stopPropagation()}>
        <GripVertical className="w-3.5 h-3.5" />
      </button>
      {children}
    </div>
  );
}

// ── Single image upload ──────────────────────────────────────────────────────
function ImageUpload({ value, onChange, label }: { value: string; onChange: (v: string) => void; label: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);

  const readFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    setLoading(true);
    const reader = new FileReader();
    reader.onload = e => {
      const result = e.target?.result as string;
      if (result) onChange(result);
      setLoading(false);
    };
    reader.onerror = () => setLoading(false);
    reader.readAsDataURL(file);
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files[0];
    if (file) readFile(file);
  }, []);

  return (
    <div>
      {label ? <label className="text-xs text-gray-400 block mb-1">{label}</label> : null}
      <div
        onDrop={onDrop}
        onDragOver={e => { e.preventDefault(); e.stopPropagation(); }}
        onClick={() => !loading && inputRef.current?.click()}
        className="relative cursor-pointer border border-dashed border-white/20 rounded-xl overflow-hidden hover:border-blue-500/60 transition group/img bg-white/3"
        style={{ minHeight: 90 }}
      >
        {loading ? (
          <div className="flex flex-col items-center justify-center py-6 gap-2 text-blue-400">
            <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs">Loading…</span>
          </div>
        ) : value ? (
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={resolveAssetUrl(value)}
              alt="preview"
              className="w-full object-cover"
              style={{ maxHeight: 140, display: 'block' }}
              onError={e => {
                const el = e.currentTarget as HTMLImageElement;
                el.style.opacity = '0.35';
                el.alt = 'Image failed to load';
              }}
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/img:opacity-100 transition flex items-center justify-center gap-2">
              <span className="text-xs text-white font-medium bg-black/40 px-2 py-1 rounded">Click to change</span>
            </div>
            <button
              onClick={e => { e.stopPropagation(); onChange(''); }}
              className="absolute top-1.5 right-1.5 bg-red-500 hover:bg-red-600 rounded-full p-1 opacity-0 group-hover/img:opacity-100 transition shadow-lg"
            >
              <X className="w-3 h-3 text-white" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 gap-2 text-gray-500">
            <Upload className="w-5 h-5" />
            <span className="text-xs">Drop image or click to upload</span>
            <span className="text-xs text-gray-600">PNG, JPG, GIF, WebP</span>
          </div>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={e => {
          const f = e.target.files?.[0];
          if (f) readFile(f);
          // reset so same file can be re-selected
          e.target.value = '';
        }}
      />
    </div>
  );
}

// ── Multiple images upload ───────────────────────────────────────────────────
function MultiImageUpload({ value, onChange, label }: { value: string[]; onChange: (v: string[]) => void; label: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<number | null>(null);

  // Fix: collect all results then append at once to avoid stale closure
  const readFiles = (files: File[]) => {
    const imageFiles = files.filter(f => f.type.startsWith('image/'));
    if (!imageFiles.length) return;
    setLoading(true);
    let done = 0;
    const results: string[] = new Array(imageFiles.length);

    imageFiles.forEach((file, idx) => {
      const reader = new FileReader();
      reader.onload = e => {
        results[idx] = e.target?.result as string;
        done++;
        if (done === imageFiles.length) {
          // Use functional update to always get latest value
          onChange([...value, ...results.filter(Boolean)]);
          setLoading(false);
        }
      };
      reader.onerror = () => {
        done++;
        if (done === imageFiles.length) setLoading(false);
      };
      reader.readAsDataURL(file);
    });
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    readFiles(Array.from(e.dataTransfer.files));
  }, [value]);

  const removeImage = (idx: number) => onChange(value.filter((_, i) => i !== idx));

  const moveImage = (from: number, to: number) => {
    if (to < 0 || to >= value.length) return;
    const arr = [...value];
    const [item] = arr.splice(from, 1);
    arr.splice(to, 0, item);
    onChange(arr);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        {label ? <label className="text-xs text-gray-400">{label}</label> : <span />}
        {value.length > 0 && <span className="text-xs text-gray-600">{value.length} image{value.length !== 1 ? 's' : ''}</span>}
      </div>

      {/* Uploaded images grid */}
      {value.length > 0 && (
        <div className="grid grid-cols-3 gap-1.5 mb-2">
          {value.map((src, i) => (
            <div key={i} className="relative group/thumb rounded-lg overflow-hidden border border-white/10 bg-white/5" style={{ aspectRatio: '1' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={resolveAssetUrl(src)}
                alt={`img-${i}`}
                className="w-full h-full object-cover"
                style={{ display: 'block' }}
                onError={e => {
                  const el = e.currentTarget as HTMLImageElement;
                  el.style.opacity = '0.35';
                  el.alt = 'Missing';
                }}
              />
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/thumb:opacity-100 transition flex flex-col items-center justify-center gap-1">
                <div className="flex gap-1">
                  <button onClick={() => moveImage(i, i - 1)} disabled={i === 0}
                    className="bg-white/20 hover:bg-white/40 disabled:opacity-30 rounded p-1 transition">
                    <ChevronLeft className="w-3 h-3 text-white" />
                  </button>
                  <button onClick={() => setPreview(i)}
                    className="bg-white/20 hover:bg-white/40 rounded p-1 transition">
                    <ImageIcon className="w-3 h-3 text-white" />
                  </button>
                  <button onClick={() => moveImage(i, i + 1)} disabled={i === value.length - 1}
                    className="bg-white/20 hover:bg-white/40 disabled:opacity-30 rounded p-1 transition">
                    <ChevronRight className="w-3 h-3 text-white" />
                  </button>
                </div>
                <button onClick={() => removeImage(i)}
                  className="bg-red-500/80 hover:bg-red-500 rounded p-1 transition">
                  <Trash2 className="w-3 h-3 text-white" />
                </button>
              </div>
              <span className="absolute bottom-0.5 left-1 text-[10px] text-white/50 font-mono">{i + 1}</span>
            </div>
          ))}
        </div>
      )}

      {/* Drop zone */}
      <div
        onDrop={onDrop}
        onDragOver={e => { e.preventDefault(); e.stopPropagation(); }}
        onClick={() => !loading && inputRef.current?.click()}
        className="cursor-pointer border border-dashed border-white/20 rounded-xl hover:border-blue-500/60 transition flex items-center justify-center gap-2 py-3 text-gray-500 bg-white/3"
      >
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-blue-400">Uploading…</span>
          </>
        ) : (
          <>
            <Images className="w-4 h-4" />
            <span className="text-xs">Add images — drop or click</span>
          </>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={e => {
          if (e.target.files?.length) readFiles(Array.from(e.target.files));
          e.target.value = '';
        }}
      />

      {/* Lightbox preview */}
      {preview !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setPreview(null)}
        >
          <div className="relative max-w-3xl w-full" onClick={e => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={value[preview]} alt="" className="w-full max-h-[80vh] object-contain rounded-xl" />
            <button onClick={() => setPreview(null)}
              className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 rounded-full p-2 transition">
              <X className="w-4 h-4 text-white" />
            </button>
            {preview > 0 && (
              <button onClick={() => setPreview(p => (p ?? 1) - 1)}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 rounded-full p-2 transition">
                <ChevronLeft className="w-5 h-5 text-white" />
              </button>
            )}
            {preview < value.length - 1 && (
              <button onClick={() => setPreview(p => (p ?? 0) + 1)}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 rounded-full p-2 transition">
                <ChevronRight className="w-5 h-5 text-white" />
              </button>
            )}
            <p className="text-center text-xs text-gray-400 mt-2">{preview + 1} / {value.length}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main SectionEditor ───────────────────────────────────────────────────────
function FieldLabelInput({ label, onChange }: { label: string; onChange: (v: string) => void }) {
  return (
    <input
      value={label}
      onChange={e => onChange(e.target.value)}
      placeholder="Field label"
      title="Click to rename this field label"
      className="w-full text-xs font-medium text-blue-300/90 bg-blue-500/5 border border-blue-500/20 rounded-md px-2 py-1 mb-1.5 focus:outline-none focus:border-blue-500/60 hover:border-blue-500/40 transition placeholder:text-gray-600"
    />
  );
}

export default function SectionEditor({ sectionId, variant = 'canvas' }: Props) {
  const isSidebar = variant === 'sidebar';
  const { getActivePortfolio, updateField, updateFieldLabel, addField, removeField, reorderFields, updateSection, setActiveSection } = useBuilderStore();
  const portfolio = getActivePortfolio();
  const section = portfolio?.sections.find(s => s.id === sectionId);
  const [tab, setTab] = useState<EditorTab>('content');

  useEffect(() => {
    setTab('content');
  }, [sectionId]);

  if (!section || !portfolio) return null;

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = section.fields.findIndex(f => f.id === active.id);
    const newIdx = section.fields.findIndex(f => f.id === over.id);
    reorderFields(sectionId, arrayMove(section.fields, oldIdx, newIdx));
  };

  const PROTECTED = ['headline', 'subheadline', 'description', 'avatar', 'bannerImages', 'ctaText', 'ctaLink', 'heroLayout', 'aboutLayout', 'blogposts', 'testimonialitems', 'teamitems', 'pricingplans', 'faqitems'];
  const isBlog = section.type === 'blog';
  const isTestimonials = section.type === 'testimonials';
  const isTeam = section.type === 'team';
  const isPricing = section.type === 'pricing';
  const isFAQ = section.type === 'faq';
  const isStructuredSection = isBlog || isTestimonials || isTeam || isPricing || isFAQ;
  const structuredFieldId = isBlog ? 'blogposts' : isTestimonials ? 'testimonialitems' : isTeam ? 'teamitems' : isPricing ? 'pricingplans' : isFAQ ? 'faqitems' : null;

  const renderField = (field: SectionField) => {
    const onChange = (val: any) => updateField(sectionId, field.id, val);
    const onLabelChange = (label: string) => updateFieldLabel(sectionId, field.id, label);
    const labelEl = <FieldLabelInput label={field.label} onChange={onLabelChange} />;

    if (field.type === 'select' && field.options) {
      return (
        <div key={field.id} className="col-span-full">
          {labelEl}
          <select value={field.value as string} onChange={e => onChange(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500">
            {field.options.map(o => <option key={o} value={o} className="bg-[#1a1a1a]">{o}</option>)}
          </select>
        </div>
      );
    }

    if (field.type === 'image') {
      return (
        <div key={field.id} className="col-span-full sm:col-span-1">
          {labelEl}
          <ImageUpload value={field.value as string} onChange={onChange} label="" />
        </div>
      );
    }

    if (field.type === 'images') {
      const imgs = Array.isArray(field.value) ? field.value as string[] : [];
      return (
        <div key={field.id} className="col-span-full">
          {labelEl}
          <MultiImageUpload value={imgs} onChange={onChange} label="" />
        </div>
      );
    }

    if (field.type === 'blogposts') {
      const posts = Array.isArray(field.value) ? field.value as BlogPostBlock[] : [];
      return <BlogPostsEditor key={field.id} posts={posts} onChange={posts => onChange(posts)} />;
    }

    if (field.type === 'testimonialitems') {
      const items = Array.isArray(field.value) ? field.value as TestimonialBlock[] : [];
      return <TestimonialsEditor key={field.id} items={items} onChange={items => onChange(items)} />;
    }

    if (field.type === 'teamitems') {
      const items = Array.isArray(field.value) ? field.value as TeamMemberBlock[] : [];
      return <TeamEditor key={field.id} items={items} onChange={items => onChange(items)} />;
    }

    if (field.type === 'pricingplans') {
      const items = Array.isArray(field.value) ? field.value as PricingPlanBlock[] : [];
      return <PricingEditor key={field.id} items={items} onChange={items => onChange(items)} />;
    }

    if (field.type === 'faqitems') {
      const items = Array.isArray(field.value) ? field.value as FAQItemBlock[] : [];
      return <FAQEditor key={field.id} items={items} onChange={items => onChange(items)} />;
    }

    if (field.type === 'list') {
      const items = Array.isArray(field.value) ? field.value as string[] : [];
      return (
        <div key={field.id} className="col-span-full space-y-1.5">
          {labelEl}
          {items.map((item, i) => (
            <div key={i} className="flex gap-2 items-center">
              <GripVertical className="w-3.5 h-3.5 text-gray-600 shrink-0 cursor-grab" />
              <input value={item} onChange={e => { const n = [...items]; n[i] = e.target.value; onChange(n); }}
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500" />
              <button onClick={() => onChange(items.filter((_, j) => j !== i))} className="text-gray-600 hover:text-red-400 transition shrink-0">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          <button onClick={() => onChange([...items, ''])} className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition mt-1">
            <Plus className="w-3 h-3" /> Add item
          </button>
        </div>
      );
    }

    if (field.type === 'textarea' || field.type === 'richtext') {
      return (
        <div key={field.id} className="col-span-full">
          {labelEl}
          <textarea value={field.value as string} onChange={e => onChange(e.target.value)}
            rows={field.id === 'bio' ? 5 : 3}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 resize-y min-h-[80px]" />
        </div>
      );
    }

    return (
      <div key={field.id}>
        {labelEl}
        <input type={field.type === 'email' ? 'email' : field.type === 'url' ? 'url' : 'text'}
          placeholder={`Enter ${field.label.toLowerCase()}`}
          value={field.value as string} onChange={e => onChange(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500" />
      </div>
    );
  };

  const allSections = [...portfolio.sections].sort((a, b) => a.order - b.order);

  return (
    <div className={isSidebar ? 'flex flex-col h-full min-h-0' : 'bg-[#111] border border-white/10 rounded-2xl p-4 shadow-2xl'}>
      <div className={`shrink-0 ${isSidebar ? 'border-b border-white/10 bg-[#0a0a0a]' : ''}`}>
        <div className={`flex items-center justify-between gap-2 ${isSidebar ? 'p-3' : 'mb-4'}`}>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <input value={section.title} onChange={e => updateSection(sectionId, { title: e.target.value })}
                className="font-semibold bg-transparent border-b border-transparent hover:border-white/20 focus:border-blue-500 focus:outline-none text-white text-sm truncate w-full" />
              <span className="text-xs text-gray-500 capitalize bg-white/5 px-2 py-0.5 rounded shrink-0">{section.type}</span>
            </div>
            {isSidebar && (
              <p className="text-[10px] text-blue-400/90 mt-1">Live preview · header links switch this panel</p>
            )}
          </div>
          <button onClick={() => setActiveSection(null)} className="text-gray-500 hover:text-white transition shrink-0 p-1 rounded-lg hover:bg-white/5">
            <X className="w-4 h-4" />
          </button>
        </div>

        {isSidebar && (
          <div className="px-3 pb-3 flex gap-1 overflow-x-auto">
            {allSections.map(s => (
              <button
                key={s.id}
                type="button"
                onClick={() => setActiveSection(s.id)}
                className={`shrink-0 px-2.5 py-1 rounded-lg text-[10px] font-medium transition border ${
                  s.id === sectionId
                    ? 'bg-blue-600 border-blue-500 text-white'
                    : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:border-white/20'
                }`}
              >
                {s.title}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className={isSidebar ? 'flex-1 overflow-y-auto px-3 pb-4 min-h-0' : ''}>
      {isSidebar && <SectionHelpBanner sectionType={section.type} sectionTitle={section.title} />}
      <div className={`flex gap-1 mb-4 p-1 rounded-xl bg-white/3 border border-white/8 ${isSidebar ? 'mt-0' : ''}`}>
        {([
          { id: 'content' as const, label: 'Content' },
          { id: 'animation' as const, label: 'Animation' },
        ]).map(t => (
          <button key={t.id} type="button" onClick={() => setTab(t.id)}
            className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition ${
              tab === t.id ? 'bg-blue-600 text-white shadow' : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}>{t.label}</button>
        ))}
      </div>

      {tab === 'animation' && <SectionAnimationEditor sectionId={sectionId} />}

      {tab === 'content' && <>
      {section.type === 'hero' && <HeroLayoutEditor sectionId={sectionId} />}
      {section.type === 'hero' && <HeroContentEditor sectionId={sectionId} />}
      {section.type === 'about' && <AboutLayoutEditor sectionId={sectionId} />}
      {section.type === 'custom' && <CustomSectionEditor sectionId={sectionId} />}
      {/* Fields with drag-and-drop */}
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={section.fields.filter(f => !structuredFieldId || f.id !== structuredFieldId).map(f => f.id)} strategy={verticalListSortingStrategy}>
          <div className={`grid grid-cols-1 gap-3 overflow-y-auto pl-5 pr-1 ${isSidebar ? '' : `sm:grid-cols-2 lg:grid-cols-3 ${section.type === 'about' || section.type === 'contact' || isStructuredSection ? 'max-h-[32rem]' : 'max-h-72'}`}`}>
            {section.fields.filter(f => (!structuredFieldId || f.id !== structuredFieldId) && !(section.type === 'hero' && f.id === 'heroLayout')).map(field => (
              <SortableFieldRow key={field.id} field={field}>
                <div className="relative group/del">
                  {renderField(field)}
                  {!PROTECTED.includes(field.id) && (
                    <button onClick={() => removeField(sectionId, field.id)}
                      className="absolute -top-1 -right-1 bg-red-500/80 hover:bg-red-500 rounded-full p-0.5 opacity-0 group-hover/del:opacity-100 transition z-10">
                      <X className="w-2.5 h-2.5 text-white" />
                    </button>
                  )}
                </div>
              </SortableFieldRow>
            ))}
          </div>
        </SortableContext>
        {structuredFieldId && section.fields.find(f => f.id === structuredFieldId) && (
          <div className="mt-3 overflow-y-auto max-h-[28rem] pr-1">
            {renderField(section.fields.find(f => f.id === structuredFieldId)!)}
          </div>
        )}
      </DndContext>

      {!isStructuredSection && (
        <div className="mt-3 pt-3 border-t border-white/10">
          <p className="text-[10px] text-gray-600 uppercase tracking-wider mb-2">Add custom field</p>
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={() => addField(sectionId, { label: 'Custom Text', type: 'text', value: '' })}
              className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/15 px-2.5 py-1.5 rounded-lg transition">
              <Plus className="w-3.5 h-3.5" /> Text
            </button>
            <button onClick={() => addField(sectionId, { label: 'Custom Long Text', type: 'textarea', value: '' })}
              className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/15 px-2.5 py-1.5 rounded-lg transition">
              <Plus className="w-3.5 h-3.5" /> Long Text
            </button>
            <button onClick={() => addField(sectionId, { label: 'Custom Image', type: 'image', value: '' })}
              className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/15 px-2.5 py-1.5 rounded-lg transition">
              <ImageIcon className="w-3.5 h-3.5" /> Image
            </button>
            <button onClick={() => addField(sectionId, { label: 'Custom List', type: 'list', value: [''] })}
              className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/15 px-2.5 py-1.5 rounded-lg transition">
              <Plus className="w-3.5 h-3.5" /> List
            </button>
            <button onClick={() => addField(sectionId, { label: 'Custom Link', type: 'url', value: '' })}
              className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/15 px-2.5 py-1.5 rounded-lg transition">
              <Plus className="w-3.5 h-3.5" /> Link
            </button>
          </div>
          <p className="text-[10px] text-gray-600 mt-2">Rename any field label above — it shows on your live preview.</p>
        </div>
      )}
      {isBlog && (
        <p className="text-[10px] text-gray-600 mt-2">Each blog post has its own title, image, article, link & tags — all in one block.</p>
      )}
      {isTestimonials && (
        <p className="text-[10px] text-gray-600 mt-2">Only quote & name are required. Role, company, photo & rating are optional.</p>
      )}
      {isTeam && (
        <p className="text-[10px] text-gray-600 mt-2">Only name is required. Role, bio, profile photo & social links are optional.</p>
      )}
      {isPricing && (
        <p className="text-[10px] text-gray-600 mt-2">Only plan name & price are required. Features, tagline, period & button are optional.</p>
      )}
      {isFAQ && (
        <p className="text-[10px] text-gray-600 mt-2">Each FAQ has its own question & answer — add as many as you need.</p>
      )}
      </>}
      </div>
    </div>
  );
}
