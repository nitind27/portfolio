'use client';

import Link from 'next/link';
import { Calendar, User, ArrowLeft } from 'lucide-react';
import MarketingShell from './MarketingShell';
import { brand } from '@/lib/brand';
import type { MarketingBlogPost } from '@/lib/marketing-blog';

interface Props {
  post: MarketingBlogPost;
}

function renderBody(body: string) {
  return body.split(/\n\n+/).filter(Boolean).map((para, i) => (
    <p key={i} className="text-sm sm:text-base text-gray-400 leading-relaxed mb-4 whitespace-pre-line">
      {para}
    </p>
  ));
}

export default function BlogPostClient({ post }: Props) {
  return (
    <MarketingShell narrow>
      <article className="max-w-3xl mx-auto px-5 sm:px-8 py-10 sm:py-14">
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-white mb-8 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to blog
        </Link>

        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mb-4">
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

        <h1 className="text-2xl sm:text-4xl font-bold text-white leading-tight mb-6">{post.title}</h1>

        {post.excerpt && (
          <p className="text-base text-gray-400 leading-relaxed mb-8 pb-8 border-b" style={{ borderColor: brand.border }}>
            {post.excerpt}
          </p>
        )}

        <div className="prose-invert max-w-none">
          {renderBody(post.body)}
        </div>
      </article>
    </MarketingShell>
  );
}
