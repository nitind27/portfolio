'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Calendar, User } from 'lucide-react';
import MarketingShell from './MarketingShell';
import { brand } from '@/lib/brand';
import type { MarketingBlogPost } from '@/lib/marketing-blog';

const fade = {
  initial: { opacity: 0, y: 12 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.4 },
};

interface Props {
  posts: MarketingBlogPost[];
}

export default function BlogIndexClient({ posts }: Props) {
  return (
    <MarketingShell
      title="Blog"
      subtitle="Product updates, guides, and tips from our team."
    >
      <section className="max-w-4xl mx-auto px-5 sm:px-8 py-12 sm:py-16">
        {posts.length === 0 ? (
          <p className="text-center text-gray-500 text-sm py-16">No posts published yet. Check back soon.</p>
        ) : (
          <div className="space-y-5">
            {posts.map(post => (
              <motion.article
                key={post.id}
                className="p-6 sm:p-8 rounded-2xl border group hover:border-white/20 transition"
                style={{ borderColor: brand.border, background: brand.surface }}
                {...fade}
              >
                <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mb-3">
                  {post.publishedAt && (
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(post.publishedAt).toLocaleDateString(undefined, {
                        year: 'numeric', month: 'long', day: 'numeric',
                      })}
                    </span>
                  )}
                  {post.authorName && (
                    <span className="inline-flex items-center gap-1">
                      <User className="w-3.5 h-3.5" /> {post.authorName}
                    </span>
                  )}
                </div>
                <h2 className="text-xl font-bold text-white mb-2 group-hover:text-orange-300 transition">
                  <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                </h2>
                {post.excerpt && (
                  <p className="text-sm text-gray-400 leading-relaxed mb-4">{post.excerpt}</p>
                )}
                <Link
                  href={`/blog/${post.slug}`}
                  className="inline-flex items-center gap-1.5 text-sm font-medium"
                  style={{ color: brand.accentLight }}
                >
                  Read more <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.article>
            ))}
          </div>
        )}
      </section>
    </MarketingShell>
  );
}
