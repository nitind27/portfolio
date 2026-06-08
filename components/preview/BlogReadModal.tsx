'use client';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { BlogPostBlock, ThemeConfig } from '@/lib/types';

interface Props {
  post: BlogPostBlock | null;
  theme: ThemeConfig;
  radius: string;
  isMobile: boolean;
  onClose: () => void;
}

export default function BlogReadModal({ post, theme, radius, isMobile, onClose }: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!post) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [post, onClose]);

  if (!mounted || !post) return null;

  const tags = post.list.filter(t => t.trim());

  return createPortal(
    <AnimatePresence>
      {post && (
        <motion.div
          key="blog-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={e => { if (e.target === e.currentTarget) onClose(); }}
          style={{
            position: 'fixed', inset: 0, zIndex: 9998,
            background: 'rgba(0,0,0,0.78)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
            padding: isMobile ? '1rem' : '2rem', overflowY: 'auto',
          }}
        >
          <motion.article
            key="blog-modal-card"
            initial={{ opacity: 0, y: 28, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 28, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            style={{
              width: '100%', maxWidth: 720, margin: 'auto 0',
              background: theme.backgroundColor, color: theme.textColor,
              borderRadius: radius, overflow: 'hidden',
              border: `1px solid ${theme.primaryColor}28`,
              boxShadow: `0 32px 80px rgba(0,0,0,0.5)`,
            }}
          >
            {post.image && (
              <div style={{ height: isMobile ? 180 : 240, overflow: 'hidden' }}>
                <img src={post.image} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            )}

            <div style={{ height: 4, background: `linear-gradient(90deg, ${theme.primaryColor}, ${theme.secondaryColor})` }} />

            <div style={{ padding: isMobile ? '1.5rem' : '2.25rem 2.5rem 2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '1.25rem' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  {post.date && (
                    <span style={{
                      display: 'inline-block', fontSize: '0.72rem', fontWeight: 700,
                      color: theme.primaryColor, letterSpacing: '0.08em', textTransform: 'uppercase',
                      marginBottom: '0.65rem', padding: '0.3rem 0.75rem', borderRadius: 999,
                      background: `${theme.primaryColor}14`, border: `1px solid ${theme.primaryColor}28`,
                    }}>{post.date}</span>
                  )}
                  <h2 style={{ fontSize: 'clamp(1.4rem, 4vw, 2rem)', fontWeight: 800, lineHeight: 1.2, color: theme.primaryColor }}>{post.title}</h2>
                </div>
                <button type="button" onClick={onClose} aria-label="Close"
                  style={{
                    flexShrink: 0, width: 36, height: 36, borderRadius: '50%', border: 'none', cursor: 'pointer',
                    background: `${theme.primaryColor}18`, color: theme.textColor,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                  <X size={18} />
                </button>
              </div>

              {post.summary && post.summary !== post.body && (
                <p style={{
                  fontSize: '1.05rem', opacity: 0.65, lineHeight: 1.7, marginBottom: '1.5rem',
                  paddingBottom: '1.25rem', borderBottom: `1px solid ${theme.primaryColor}18`, fontStyle: 'italic',
                }}>{post.summary}</p>
              )}

              {tags.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem', marginBottom: '1.25rem' }}>
                  {tags.map((tag, i) => (
                    <span key={i} style={{
                      fontSize: '0.72rem', fontWeight: 600, padding: '0.3rem 0.7rem', borderRadius: 999,
                      background: `${theme.primaryColor}14`, color: theme.primaryColor,
                      border: `1px solid ${theme.primaryColor}28`,
                    }}>{tag}</span>
                  ))}
                </div>
              )}

              {post.body && (
                <div style={{ fontSize: '1rem', lineHeight: 1.9, opacity: 0.88, whiteSpace: 'pre-wrap', marginBottom: post.link ? '1.5rem' : 0 }}>
                  {post.body}
                </div>
              )}

              {post.link && (
                <a href={post.link} target="_blank" rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                    padding: '0.75rem 1.35rem', borderRadius: radius, textDecoration: 'none',
                    background: theme.primaryColor, color: '#fff', fontWeight: 700, fontSize: '0.9rem',
                  }}>
                  {post.linkLabel || 'Read more'} →
                </a>
              )}
            </div>
          </motion.article>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
