import type { RowDataPacket, ResultSetHeader } from 'mysql2';
import { getPool } from './db';
import { APP_NAME, getPublicWebsiteUrl } from './brand';
import { slugifyMarketing } from './marketing-seo';

export type BlogPostStatus = 'draft' | 'published';

export interface MarketingBlogPost {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  status: BlogPostStatus;
  authorName: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  ogImage: string;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BlogPostInput {
  title: string;
  slug?: string;
  excerpt?: string;
  body?: string;
  status?: BlogPostStatus;
  authorName?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  ogImage?: string;
  publishedAt?: string | null;
}

let schemaReady = false;

export async function ensureBlogSchema() {
  if (schemaReady) return;
  const pool = getPool();
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS marketing_blog_posts (
      id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
      slug VARCHAR(160) NOT NULL,
      title VARCHAR(300) NOT NULL,
      excerpt VARCHAR(500) NOT NULL DEFAULT '',
      body LONGTEXT NOT NULL,
      status ENUM('draft','published') NOT NULL DEFAULT 'draft',
      author_name VARCHAR(120) NOT NULL DEFAULT '',
      seo_title VARCHAR(200) NOT NULL DEFAULT '',
      seo_description VARCHAR(320) NOT NULL DEFAULT '',
      seo_keywords VARCHAR(500) NOT NULL DEFAULT '',
      og_image VARCHAR(500) NOT NULL DEFAULT '',
      published_at DATETIME NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY uq_slug (slug),
      INDEX idx_status_published (status, published_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `).catch(() => {});
  schemaReady = true;
}

function rowToPost(r: RowDataPacket): MarketingBlogPost {
  return {
    id: Number(r.id),
    slug: String(r.slug),
    title: String(r.title),
    excerpt: String(r.excerpt || ''),
    body: String(r.body || ''),
    status: r.status === 'published' ? 'published' : 'draft',
    authorName: String(r.author_name || ''),
    seoTitle: String(r.seo_title || ''),
    seoDescription: String(r.seo_description || ''),
    seoKeywords: String(r.seo_keywords || ''),
    ogImage: String(r.og_image || ''),
    publishedAt: r.published_at ? new Date(r.published_at as Date).toISOString() : null,
    createdAt: new Date(r.created_at as Date).toISOString(),
    updatedAt: new Date(r.updated_at as Date).toISOString(),
  };
}

async function uniqueSlug(base: string, excludeId?: number): Promise<string> {
  await ensureBlogSchema();
  const pool = getPool();
  let slug = slugifyMarketing(base);
  let n = 0;
  while (true) {
    const candidate = n === 0 ? slug : `${slug}-${n}`;
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT id FROM marketing_blog_posts WHERE slug = ? LIMIT 1',
      [candidate],
    );
    const existing = rows[0] as { id: number } | undefined;
    if (!existing || (excludeId && Number(existing.id) === excludeId)) return candidate;
    n += 1;
  }
}

function normalizeInput(input: BlogPostInput, existing?: MarketingBlogPost): Omit<MarketingBlogPost, 'id' | 'createdAt' | 'updatedAt'> & { slug: string } {
  const title = String(input.title || existing?.title || '').trim().slice(0, 300);
  const status: BlogPostStatus = input.status === 'published' || input.status === 'draft'
    ? input.status
    : (existing?.status || 'draft');
  const excerpt = String(input.excerpt ?? existing?.excerpt ?? '').slice(0, 500);
  const body = String(input.body ?? existing?.body ?? '').slice(0, 100_000);
  const authorName = String(input.authorName ?? existing?.authorName ?? APP_NAME).slice(0, 120);
  const seoTitle = String(input.seoTitle ?? existing?.seoTitle ?? title).slice(0, 200);
  const seoDescription = String(input.seoDescription ?? existing?.seoDescription ?? excerpt).slice(0, 320);
  const seoKeywords = String(input.seoKeywords ?? existing?.seoKeywords ?? '').slice(0, 500);
  const ogImage = String(input.ogImage ?? existing?.ogImage ?? '').slice(0, 500);
  let publishedAt = input.publishedAt !== undefined ? input.publishedAt : existing?.publishedAt ?? null;
  if (status === 'published' && !publishedAt) publishedAt = new Date().toISOString();
  if (status === 'draft') publishedAt = null;
  const slugBase = input.slug?.trim() || existing?.slug || title;
  return {
    slug: slugifyMarketing(slugBase),
    title,
    excerpt,
    body,
    status,
    authorName,
    seoTitle,
    seoDescription,
    seoKeywords,
    ogImage,
    publishedAt,
  };
}

export async function listBlogPostsAdmin(): Promise<MarketingBlogPost[]> {
  await ensureBlogSchema();
  const pool = getPool();
  const [rows] = await pool.execute<RowDataPacket[]>(
    'SELECT * FROM marketing_blog_posts ORDER BY COALESCE(published_at, created_at) DESC, id DESC',
  );
  return rows.map(rowToPost);
}

export async function listPublishedBlogPosts(limit = 50): Promise<MarketingBlogPost[]> {
  await ensureBlogSchema();
  const pool = getPool();
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT * FROM marketing_blog_posts
     WHERE status = 'published'
     ORDER BY published_at DESC, id DESC
     LIMIT ?`,
    [limit],
  );
  return rows.map(rowToPost);
}

export async function getBlogPostById(id: number): Promise<MarketingBlogPost | null> {
  await ensureBlogSchema();
  const pool = getPool();
  const [rows] = await pool.execute<RowDataPacket[]>(
    'SELECT * FROM marketing_blog_posts WHERE id = ? LIMIT 1',
    [id],
  );
  return rows[0] ? rowToPost(rows[0]) : null;
}

export async function getPublishedBlogPostBySlug(slug: string): Promise<MarketingBlogPost | null> {
  await ensureBlogSchema();
  const pool = getPool();
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT * FROM marketing_blog_posts WHERE slug = ? AND status = 'published' LIMIT 1`,
    [slug],
  );
  return rows[0] ? rowToPost(rows[0]) : null;
}

export async function createBlogPost(input: BlogPostInput): Promise<MarketingBlogPost> {
  await ensureBlogSchema();
  const pool = getPool();
  const draft = normalizeInput(input);
  const slug = await uniqueSlug(draft.slug || draft.title);
  const [result] = await pool.execute<ResultSetHeader>(
    `INSERT INTO marketing_blog_posts
      (slug, title, excerpt, body, status, author_name, seo_title, seo_description, seo_keywords, og_image, published_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      slug,
      draft.title,
      draft.excerpt,
      draft.body,
      draft.status,
      draft.authorName,
      draft.seoTitle,
      draft.seoDescription,
      draft.seoKeywords,
      draft.ogImage,
      draft.publishedAt ? new Date(draft.publishedAt) : null,
    ],
  );
  const post = await getBlogPostById(Number(result.insertId));
  if (!post) throw new Error('Failed to create post');
  return post;
}

export async function updateBlogPost(id: number, input: BlogPostInput): Promise<MarketingBlogPost> {
  const existing = await getBlogPostById(id);
  if (!existing) throw new Error('Post not found');
  const draft = normalizeInput(input, existing);
  const slug = await uniqueSlug(draft.slug || draft.title, id);
  const pool = getPool();
  await pool.execute(
    `UPDATE marketing_blog_posts SET
      slug = ?, title = ?, excerpt = ?, body = ?, status = ?, author_name = ?,
      seo_title = ?, seo_description = ?, seo_keywords = ?, og_image = ?, published_at = ?
     WHERE id = ?`,
    [
      slug,
      draft.title,
      draft.excerpt,
      draft.body,
      draft.status,
      draft.authorName,
      draft.seoTitle,
      draft.seoDescription,
      draft.seoKeywords,
      draft.ogImage,
      draft.publishedAt ? new Date(draft.publishedAt) : null,
      id,
    ],
  );
  const post = await getBlogPostById(id);
  if (!post) throw new Error('Failed to update post');
  return post;
}

export async function deleteBlogPost(id: number): Promise<void> {
  await ensureBlogSchema();
  const pool = getPool();
  await pool.execute('DELETE FROM marketing_blog_posts WHERE id = ?', [id]);
}

export function getBlogSeo(post: MarketingBlogPost) {
  const base = getPublicWebsiteUrl();
  return {
    title: post.seoTitle || `${post.title} — Blog — ${APP_NAME}`,
    description: post.seoDescription || post.excerpt || post.title,
    keywords: post.seoKeywords,
    ogImage: post.ogImage,
    canonicalUrl: `${base}/blog/${post.slug}`,
    publishedAt: post.publishedAt,
  };
}

export function getBlogIndexSeo() {
  const base = getPublicWebsiteUrl();
  return {
    title: `Blog — ${APP_NAME}`,
    description: `Product updates, guides, and tips from the ${APP_NAME} team.`,
    keywords: `${APP_NAME}, blog, website builder, portfolio, tutorials`,
    ogImage: '',
    canonicalUrl: `${base}/blog`,
  };
}
