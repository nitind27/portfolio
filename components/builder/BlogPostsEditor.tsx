'use client';
import { useRef, useState } from 'react';
import { BlogPostBlock } from '@/lib/types';
import { createEmptyBlogPost } from '@/lib/blog-utils';
import { Plus, Trash2, ChevronDown, ChevronUp, Upload } from 'lucide-react';

interface Props {
  posts: BlogPostBlock[];
  onChange: (posts: BlogPostBlock[]) => void;
}

function PostImageInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);

  const readFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    setLoading(true);
    const reader = new FileReader();
    reader.onload = e => { onChange((e.target?.result as string) || ''); setLoading(false); };
    reader.onerror = () => setLoading(false);
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-1.5">
      <label className="text-xs text-gray-400">Cover Image</label>
      {value && (
        <div className="relative rounded-lg overflow-hidden border border-white/10 h-28">
          <img src={value} alt="" className="w-full h-full object-cover" />
          <button type="button" onClick={() => onChange('')}
            className="absolute top-1 right-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded">Remove</button>
        </div>
      )}
      <input value={value.startsWith('data:') ? '' : value} onChange={e => onChange(e.target.value)}
        placeholder="https://image-url.jpg"
        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500" />
      <button type="button" onClick={() => inputRef.current?.click()} disabled={loading}
        className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition">
        <Upload className="w-3 h-3" /> {loading ? 'Uploading...' : 'Upload image'}
      </button>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) readFile(f); }} />
    </div>
  );
}

export default function BlogPostsEditor({ posts, onChange }: Props) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set(posts.map(p => p.id)));

  const updatePost = (id: string, patch: Partial<BlogPostBlock>) => {
    onChange(posts.map(p => p.id === id ? { ...p, ...patch } : p));
  };

  const removePost = (id: string) => onChange(posts.filter(p => p.id !== id));

  const toggleExpand = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const inputCls = 'w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500';

  return (
    <div className="col-span-full space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Blog Posts</p>
        <button type="button" onClick={() => { const p = createEmptyBlogPost(); onChange([...posts, p]); setExpanded(s => new Set([...s, p.id])); }}
          className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 bg-blue-500/10 px-2.5 py-1 rounded-lg transition">
          <Plus className="w-3.5 h-3.5" /> Add Post
        </button>
      </div>

      {posts.map((post, index) => {
        const isOpen = expanded.has(post.id);
        return (
          <div key={post.id} className="border border-white/10 rounded-xl bg-white/[0.03] overflow-hidden">
            <button type="button" onClick={() => toggleExpand(post.id)}
              className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-white/5 transition text-left">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-[10px] font-bold text-blue-400 bg-blue-500/15 px-1.5 py-0.5 rounded shrink-0">#{index + 1}</span>
                <span className="text-sm text-white font-medium truncate">{post.title || 'Untitled post'}</span>
                {post.date && <span className="text-[10px] text-gray-500 shrink-0">{post.date}</span>}
              </div>
              {isOpen ? <ChevronUp className="w-4 h-4 text-gray-500 shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-500 shrink-0" />}
            </button>

            {isOpen && (
              <div className="px-3 pb-3 space-y-3 border-t border-white/10 pt-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">Title</label>
                    <input value={post.title} onChange={e => updatePost(post.id, { title: e.target.value })} className={inputCls} />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">Date</label>
                    <input value={post.date} onChange={e => updatePost(post.id, { date: e.target.value })} placeholder="Jan 2025" className={inputCls} />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-400 block mb-1">Summary (short preview)</label>
                  <input value={post.summary} onChange={e => updatePost(post.id, { summary: e.target.value })} className={inputCls} />
                </div>

                <div>
                  <label className="text-xs text-gray-400 block mb-1">Full Article</label>
                  <textarea value={post.body} onChange={e => updatePost(post.id, { body: e.target.value })} rows={5}
                    placeholder="Write the full blog post here..."
                    className={`${inputCls} resize-y min-h-[100px]`} />
                </div>

                <PostImageInput value={post.image} onChange={v => updatePost(post.id, { image: v })} />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">Link URL</label>
                    <input value={post.link} onChange={e => updatePost(post.id, { link: e.target.value })} placeholder="https://..." className={inputCls} />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">Link Button Text</label>
                    <input value={post.linkLabel} onChange={e => updatePost(post.id, { linkLabel: e.target.value })} placeholder="Read more" className={inputCls} />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-400 block mb-1">Tags / List</label>
                  <div className="space-y-1.5">
                    {(post.list.length ? post.list : ['']).map((item, i) => (
                      <div key={i} className="flex gap-2">
                        <input value={item} onChange={e => {
                          const list = [...(post.list.length ? post.list : [''])];
                          list[i] = e.target.value;
                          updatePost(post.id, { list: list.filter((_, j) => j < list.length - 1 || list[j]) });
                        }} placeholder="Tag or bullet point" className={`${inputCls} flex-1`} />
                        <button type="button" onClick={() => updatePost(post.id, { list: post.list.filter((_, j) => j !== i) })}
                          className="text-gray-600 hover:text-red-400 p-1"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    ))}
                    <button type="button" onClick={() => updatePost(post.id, { list: [...post.list, ''] })}
                      className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition">
                      <Plus className="w-3 h-3" /> Add item
                    </button>
                  </div>
                </div>

                {posts.length > 1 && (
                  <button type="button" onClick={() => removePost(post.id)}
                    className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 transition">
                    <Trash2 className="w-3.5 h-3.5" /> Delete this post
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
