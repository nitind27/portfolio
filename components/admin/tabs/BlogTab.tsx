'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Newspaper, Loader2, Plus, Save, Trash2, ExternalLink, Pencil, Eye,
} from 'lucide-react';
import { SectionHeader, Badge, adminInput, adminSelect, adminCard, adminCardStyle } from '../ui';
import { brand, APP_NAME } from '@/lib/brand';
import type { MarketingBlogPost, BlogPostStatus } from '@/lib/marketing-blog';

const EMPTY_DRAFT = {
  title: '',
  slug: '',
  excerpt: '',
  body: '',
  status: 'draft' as BlogPostStatus,
  authorName: APP_NAME,
  seoTitle: '',
  seoDescription: '',
  seoKeywords: '',
  ogImage: '',
};

export default function BlogTab() {
  const [posts, setPosts] = useState<MarketingBlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [editingId, setEditingId] = useState<number | 'new' | null>(null);
  const [draft, setDraft] = useState(EMPTY_DRAFT);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/marketing/blog');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setPosts(data.posts || []);
    } catch {
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openNew = () => {
    setEditingId('new');
    setDraft(EMPTY_DRAFT);
    setMsg('');
  };

  const openEdit = (post: MarketingBlogPost) => {
    setEditingId(post.id);
    setDraft({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      body: post.body,
      status: post.status,
      authorName: post.authorName,
      seoTitle: post.seoTitle,
      seoDescription: post.seoDescription,
      seoKeywords: post.seoKeywords,
      ogImage: post.ogImage,
    });
    setMsg('');
  };

  const save = async () => {
    if (!draft.title.trim()) {
      setMsg('Title is required');
      return;
    }
    setSaving(true);
    setMsg('');
    try {
      const isNew = editingId === 'new';
      const res = await fetch(
        isNew ? '/api/admin/marketing/blog' : `/api/admin/marketing/blog/${editingId}`,
        {
          method: isNew ? 'POST' : 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(draft),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed');
      setEditingId(null);
      setDraft(EMPTY_DRAFT);
      await load();
      setMsg('Post saved');
      setTimeout(() => setMsg(''), 2500);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    if (!confirm('Delete this blog post permanently?')) return;
    try {
      const res = await fetch(`/api/admin/marketing/blog/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      if (editingId === id) setEditingId(null);
      await load();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Delete failed');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Blog"
        desc={`Create and publish blog posts with full SEO control on ${APP_NAME}`}
        action={(
          <button
            type="button"
            onClick={openNew}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white"
            style={{ background: `linear-gradient(135deg, ${brand.accent}, ${brand.accentHover})` }}
          >
            <Plus className="w-4 h-4" /> New post
          </button>
        )}
      />

      {msg && (
        <p className={`text-sm ${msg.includes('failed') || msg.includes('required') ? 'text-red-400' : 'text-green-400'}`}>
          {msg}
        </p>
      )}

      {editingId !== null && (
        <div className={adminCard} style={adminCardStyle}>
          <div className="p-5 border-b border-white/10 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Newspaper className="w-4 h-4 text-orange-400" />
              <h3 className="text-sm font-bold text-white">
                {editingId === 'new' ? 'New post' : 'Edit post'}
              </h3>
            </div>
            <button type="button" onClick={() => setEditingId(null)} className="text-xs text-gray-500 hover:text-white">
              Cancel
            </button>
          </div>
          <div className="p-5 grid lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <Field label="Title *" value={draft.title} onChange={v => setDraft(d => ({ ...d, title: v }))} />
              <Field label="URL slug (optional)" value={draft.slug} onChange={v => setDraft(d => ({ ...d, slug: v }))} hint="Auto-generated from title if empty" />
              <Field label="Excerpt" value={draft.excerpt} onChange={v => setDraft(d => ({ ...d, excerpt: v }))} multiline />
              <Field label="Body" value={draft.body} onChange={v => setDraft(d => ({ ...d, body: v }))} multiline rows={12} />
              <label className="block">
                <span className="text-xs text-gray-500 mb-1 block">Status</span>
                <select
                  className={adminSelect}
                  value={draft.status}
                  onChange={e => setDraft(d => ({ ...d, status: e.target.value as BlogPostStatus }))}
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </label>
              <Field label="Author name" value={draft.authorName} onChange={v => setDraft(d => ({ ...d, authorName: v }))} />
            </div>
            <div className="space-y-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">SEO</p>
              <Field label="SEO title" value={draft.seoTitle} onChange={v => setDraft(d => ({ ...d, seoTitle: v }))} hint="Defaults to post title" />
              <Field label="SEO description" value={draft.seoDescription} onChange={v => setDraft(d => ({ ...d, seoDescription: v }))} multiline hint="Defaults to excerpt" />
              <Field label="Keywords" value={draft.seoKeywords} onChange={v => setDraft(d => ({ ...d, seoKeywords: v }))} />
              <Field label="OG image URL" value={draft.ogImage} onChange={v => setDraft(d => ({ ...d, ogImage: v }))} />
              <button
                type="button"
                onClick={save}
                disabled={saving}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
                style={{ background: `linear-gradient(135deg, ${brand.accent}, ${brand.accentHover})` }}
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save post
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={adminCard} style={adminCardStyle}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left text-xs text-gray-500">
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Published</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center text-gray-500">No posts yet. Create your first blog post.</td>
                </tr>
              ) : posts.map(post => (
                <tr key={post.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                  <td className="px-4 py-3">
                    <p className="font-medium text-white">{post.title}</p>
                    <p className="text-xs text-gray-600 mt-0.5">/blog/{post.slug}</p>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={post.status === 'published' ? 'success' : 'default'}>
                      {post.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      {post.status === 'published' && (
                        <a
                          href={`/blog/${post.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-white/5"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </a>
                      )}
                      <button type="button" onClick={() => openEdit(post)} className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-white/5" title="Edit">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button type="button" onClick={() => remove(post.id)} className="p-2 rounded-lg text-red-400/70 hover:text-red-400 hover:bg-red-500/10" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Field({
  label, value, onChange, multiline, hint, rows = 4,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  hint?: string;
  rows?: number;
}) {
  return (
    <label className="block">
      <span className="text-xs text-gray-500 mb-1 block">{label}</span>
      {multiline ? (
        <textarea
          className={adminInput + ' min-h-[88px]'}
          rows={rows}
          value={value}
          onChange={e => onChange(e.target.value)}
        />
      ) : (
        <input className={adminInput} value={value} onChange={e => onChange(e.target.value)} />
      )}
      {hint && <span className="text-[10px] text-gray-600 mt-1 block">{hint}</span>}
    </label>
  );
}
