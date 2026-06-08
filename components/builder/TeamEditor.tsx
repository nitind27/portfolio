'use client';
import { useRef, useState } from 'react';
import { TeamMemberBlock } from '@/lib/types';
import { createEmptyTeamMember } from '@/lib/team-utils';
import { Plus, Trash2, ChevronDown, ChevronUp, Upload } from 'lucide-react';

interface Props {
  items: TeamMemberBlock[];
  onChange: (items: TeamMemberBlock[]) => void;
}

function ProfileImageInput({ value, onChange, name }: { value: string; onChange: (v: string) => void; name: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const initial = (name || '?').charAt(0).toUpperCase();

  const readFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    setLoading(true);
    const reader = new FileReader();
    reader.onload = e => { onChange((e.target?.result as string) || ''); setLoading(false); };
    reader.onerror = () => setLoading(false);
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-2">
      <label className="text-xs text-gray-400">Profile Photo (optional)</label>
      <div className="flex items-start gap-3">
        <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-blue-500/30 shrink-0 bg-white/5">
          {value ? (
            <>
              <img src={value} alt="" className="w-full h-full object-cover" />
              <button type="button" onClick={() => onChange('')}
                className="absolute inset-0 bg-black/50 text-white text-[10px] opacity-0 hover:opacity-100 flex items-center justify-center transition">Remove</button>
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xl font-bold text-blue-300/60">{initial}</div>
          )}
        </div>
        <div className="flex-1 space-y-2 min-w-0">
          <input value={value.startsWith('data:') ? '' : value} onChange={e => onChange(e.target.value)}
            placeholder="Image URL or upload"
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500" />
          <button type="button" onClick={() => inputRef.current?.click()} disabled={loading}
            className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 px-2.5 py-1 border border-blue-500/30 rounded-lg transition">
            <Upload className="w-3 h-3" /> {loading ? 'Uploading…' : 'Upload photo'}
          </button>
        </div>
      </div>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) readFile(f); }} />
    </div>
  );
}

export default function TeamEditor({ items, onChange }: Props) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set(items.map(t => t.id)));
  const inputCls = 'w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500';

  const update = (id: string, patch: Partial<TeamMemberBlock>) => {
    onChange(items.map(t => t.id === id ? { ...t, ...patch } : t));
  };

  const toggle = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <div className="col-span-full space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Team Members</p>
        <button type="button"
          onClick={() => { const m = createEmptyTeamMember(); onChange([...items, m]); setExpanded(s => new Set([...s, m.id])); }}
          className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 bg-blue-500/10 px-2.5 py-1 rounded-lg transition">
          <Plus className="w-3.5 h-3.5" /> Add Member
        </button>
      </div>

      {items.map((item, index) => {
        const isOpen = expanded.has(item.id);
        return (
          <div key={item.id} className="border border-white/10 rounded-xl bg-white/[0.03] overflow-hidden">
            <button type="button" onClick={() => toggle(item.id)}
              className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-white/5 transition text-left">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-[10px] font-bold text-blue-400 bg-blue-500/15 px-1.5 py-0.5 rounded shrink-0">#{index + 1}</span>
                {item.image ? (
                  <img src={item.image} alt="" className="w-7 h-7 rounded-full object-cover shrink-0 border border-white/10" />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-blue-500/20 flex items-center justify-center text-[10px] font-bold text-blue-300 shrink-0">
                    {(item.name || '?').charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <span className="text-sm text-white font-medium truncate block">{item.name || 'New member'}</span>
                  {item.role && <span className="text-[10px] text-gray-500 truncate block">{item.role}</span>}
                </div>
              </div>
              {isOpen ? <ChevronUp className="w-4 h-4 text-gray-500 shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-500 shrink-0" />}
            </button>

            {isOpen && (
              <div className="px-3 pb-3 space-y-3 border-t border-white/10 pt-3">
                <ProfileImageInput value={item.image} onChange={v => update(item.id, { image: v })} name={item.name} />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">Name *</label>
                    <input value={item.name} onChange={e => update(item.id, { name: e.target.value })} placeholder="Alice Morgan" className={inputCls} />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">Role (optional)</label>
                    <input value={item.role} onChange={e => update(item.id, { role: e.target.value })} placeholder="CEO & Founder" className={inputCls} />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-400 block mb-1">Short Bio (optional)</label>
                  <textarea value={item.bio} onChange={e => update(item.id, { bio: e.target.value })} rows={2}
                    placeholder="A brief intro about this team member…"
                    className={`${inputCls} resize-y min-h-[56px]`} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">LinkedIn (optional)</label>
                    <input value={item.linkedin} onChange={e => update(item.id, { linkedin: e.target.value })} placeholder="https://linkedin.com/in/…" className={inputCls} />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">Twitter / X (optional)</label>
                    <input value={item.twitter} onChange={e => update(item.id, { twitter: e.target.value })} placeholder="https://x.com/…" className={inputCls} />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">Email (optional)</label>
                    <input value={item.email} onChange={e => update(item.id, { email: e.target.value })} placeholder="alice@company.com" className={inputCls} />
                  </div>
                </div>

                {items.length > 1 && (
                  <button type="button" onClick={() => onChange(items.filter(t => t.id !== item.id))}
                    className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 transition">
                    <Trash2 className="w-3.5 h-3.5" /> Delete member
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
