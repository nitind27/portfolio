'use client';
import { useCallback, useRef, useState } from 'react';
import { useBuilderStore } from '@/lib/store';
import { SectionField } from '@/lib/types';
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus, Trash2, X, GripVertical, Upload, Image as ImageIcon, Images, ChevronLeft, ChevronRight } from 'lucide-react';

interface Props { sectionId: string; }

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
      <label className="text-xs text-gray-400 block mb-1">{label}</label>
      <div
        onDrop={onDrop}
        onDragOver={e => { e.preventDefault(); e.stopPropagation(); }}
        onClick={() => !loading && inputRef.current?.click()}
        className="relative cursor-pointer border border-dashed border-white/20 rounded-xl overflow-hidden hover:border-indigo-500/60 transition group/img bg-white/3"
        style={{ minHeight: 90 }}
      >
        {loading ? (
          <div className="flex flex-col items-center justify-center py-6 gap-2 text-indigo-400">
            <div className="w-5 h-5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs">Loading…</span>
          </div>
        ) : value ? (
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={value} alt="preview" className="w-full object-cover" style={{ maxHeight: 140, display: 'block' }} />
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
        <label className="text-xs text-gray-400">{label}</label>
        {value.length > 0 && <span className="text-xs text-gray-600">{value.length} image{value.length !== 1 ? 's' : ''}</span>}
      </div>

      {/* Uploaded images grid */}
      {value.length > 0 && (
        <div className="grid grid-cols-3 gap-1.5 mb-2">
          {value.map((src, i) => (
            <div key={i} className="relative group/thumb rounded-lg overflow-hidden border border-white/10 bg-white/5" style={{ aspectRatio: '1' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={`img-${i}`}
                className="w-full h-full object-cover"
                style={{ display: 'block' }}
                onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
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
        className="cursor-pointer border border-dashed border-white/20 rounded-xl hover:border-indigo-500/60 transition flex items-center justify-center gap-2 py-3 text-gray-500 bg-white/3"
      >
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-indigo-400">Uploading…</span>
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
export default function SectionEditor({ sectionId }: Props) {
  const { getActivePortfolio, updateField, addField, removeField, reorderFields, updateSection, setActiveSection } = useBuilderStore();
  const portfolio = getActivePortfolio();
  const section = portfolio?.sections.find(s => s.id === sectionId);
  if (!section) return null;

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = section.fields.findIndex(f => f.id === active.id);
    const newIdx = section.fields.findIndex(f => f.id === over.id);
    reorderFields(sectionId, arrayMove(section.fields, oldIdx, newIdx));
  };

  const PROTECTED = ['headline', 'subheadline', 'description', 'avatar', 'bannerImages', 'ctaText', 'ctaLink', 'heroLayout'];

  const renderField = (field: SectionField) => {
    const onChange = (val: any) => updateField(sectionId, field.id, val);

    if (field.type === 'select' && field.options) {
      return (
        <div key={field.id} className="col-span-full">
          <label className="text-xs text-gray-400 block mb-1">{field.label}</label>
          <select value={field.value as string} onChange={e => onChange(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500">
            {field.options.map(o => <option key={o} value={o} className="bg-[#1a1a1a]">{o}</option>)}
          </select>
        </div>
      );
    }

    if (field.type === 'image') {
      return (
        <div key={field.id} className="col-span-full sm:col-span-1">
          <ImageUpload value={field.value as string} onChange={onChange} label={field.label} />
        </div>
      );
    }

    if (field.type === 'images') {
      const imgs = Array.isArray(field.value) ? field.value as string[] : [];
      return (
        <div key={field.id} className="col-span-full">
          <MultiImageUpload value={imgs} onChange={onChange} label={field.label} />
        </div>
      );
    }

    if (field.type === 'list') {
      const items = Array.isArray(field.value) ? field.value as string[] : [];
      return (
        <div key={field.id} className="col-span-full space-y-1.5">
          <label className="text-xs text-gray-400">{field.label}</label>
          {items.map((item, i) => (
            <div key={i} className="flex gap-2 items-center">
              <GripVertical className="w-3.5 h-3.5 text-gray-600 shrink-0 cursor-grab" />
              <input value={item} onChange={e => { const n = [...items]; n[i] = e.target.value; onChange(n); }}
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-indigo-500" />
              <button onClick={() => onChange(items.filter((_, j) => j !== i))} className="text-gray-600 hover:text-red-400 transition shrink-0">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          <button onClick={() => onChange([...items, ''])} className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition mt-1">
            <Plus className="w-3 h-3" /> Add item
          </button>
        </div>
      );
    }

    if (field.type === 'textarea' || field.type === 'richtext') {
      return (
        <div key={field.id} className="col-span-full">
          <label className="text-xs text-gray-400 block mb-1">{field.label}</label>
          <textarea value={field.value as string} onChange={e => onChange(e.target.value)} rows={3}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 resize-none" />
        </div>
      );
    }

    return (
      <div key={field.id}>
        <label className="text-xs text-gray-400 block mb-1">{field.label}</label>
        <input type={field.type === 'email' ? 'email' : field.type === 'url' ? 'url' : 'text'}
          value={field.value as string} onChange={e => onChange(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500" />
      </div>
    );
  };

  return (
    <div className="bg-[#111] border border-white/10 rounded-2xl p-4 shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <input value={section.title} onChange={e => updateSection(sectionId, { title: e.target.value })}
            className="font-semibold bg-transparent border-b border-transparent hover:border-white/20 focus:border-indigo-500 focus:outline-none text-white text-sm" />
          <span className="text-xs text-gray-500 capitalize bg-white/5 px-2 py-0.5 rounded">{section.type}</span>
        </div>
        <button onClick={() => setActiveSection(null)} className="text-gray-500 hover:text-white transition">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Fields with drag-and-drop */}
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={section.fields.map(f => f.id)} strategy={verticalListSortingStrategy}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-72 overflow-y-auto pl-5 pr-1">
            {section.fields.map(field => (
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
      </DndContext>

      {/* Footer */}
      <div className="flex items-center gap-3 mt-3 pt-3 border-t border-white/10">
        <button onClick={() => addField(sectionId, { label: 'Text Field', type: 'text', value: '' })}
          className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 transition">
          <Plus className="w-3.5 h-3.5" /> Add Text
        </button>
        <button onClick={() => addField(sectionId, { label: 'Image', type: 'image', value: '' })}
          className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 transition">
          <ImageIcon className="w-3.5 h-3.5" /> Add Image
        </button>
        <button onClick={() => addField(sectionId, { label: 'List', type: 'list', value: [] })}
          className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 transition">
          <Plus className="w-3.5 h-3.5" /> Add List
        </button>
      </div>
    </div>
  );
}
