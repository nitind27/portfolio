/**
 * Seed 5 published marketing blog posts for site99.
 * Run: node database/seed_marketing_blog.mjs
 */
import fs from 'fs';
import mysql from 'mysql2/promise';

const envPath = '.env.local';
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, '');
  }
}

const POSTS = [
  {
    slug: 'build-portfolio-website-2026-no-code',
    title: 'How to Build a Portfolio Website in 2026 — No Code Required',
    excerpt: 'A step-by-step guide for freelancers and creators to launch a polished portfolio site in 2026 using a visual builder — no HTML, no hosting headaches.',
    publishedAt: '2026-01-15 10:00:00',
    seoTitle: 'Build a Portfolio Website in 2026 Without Coding | site99 Blog',
    seoDescription: 'Learn how to create a professional portfolio website in 2026 with drag-and-drop tools. Perfect for freelancers, designers, and developers.',
    seoKeywords: 'portfolio website 2026, no code website builder, freelancer portfolio, site99',
    body: `In 2026, your portfolio is often the first impression clients get — before a call, before a proposal, before anything else. The good news: you no longer need to write code or hire an agency to look professional online.

Start with a clear goal. Are you showcasing design work, development projects, photography, or consulting services? Your homepage should answer that in under five seconds.

Pick a template that matches your industry, then customise colours, fonts, and sections to match your personal brand. site99 lets you add hero banners, project galleries, testimonials, contact forms, and social links — all from a visual editor with live preview.

Structure matters for conversions. Put your best work above the fold, add a short bio, list your skills or services, and make contact effortless. A single clear call-to-action ("Hire me", "Book a call", "View projects") performs better than three competing buttons.

Before you share the link, test on mobile and desktop. site99 previews both viewports so you can catch layout issues early. Add basic SEO — page title, description, and Open Graph image — so your site looks great when shared on LinkedIn or WhatsApp.

Finally, publish and share. Every site99 account gets a free shareable link so you can send your portfolio to clients immediately. When you're ready to export code or deploy to your own domain, premium plans unlock HTML, React, and Next.js export.

Your 2026 portfolio doesn't need to be perfect on day one. Ship something clean today, refine it this week, and keep adding projects as you grow.`,
  },
  {
    slug: 'freelancer-website-why-it-matters-2026',
    title: 'Why Every Freelancer Needs a Website in 2026 (Not Just a LinkedIn Profile)',
    excerpt: 'LinkedIn helps you network — but a dedicated website helps you win clients. Here is why freelancers in 2026 are investing in their own domain.',
    publishedAt: '2026-02-08 11:30:00',
    seoTitle: 'Why Freelancers Need a Website in 2026 | site99 Blog',
    seoDescription: 'Discover why a personal website beats social profiles alone for freelancers in 2026 — credibility, SEO, ownership, and higher-paying clients.',
    seoKeywords: 'freelancer website 2026, personal brand, client acquisition, portfolio online',
    body: `Social profiles are rented space. Your website is yours.

In 2026, clients still Google you before they reply to your pitch. If the only result is a generic social profile — or worse, nothing — you lose trust before the conversation starts. A dedicated website signals that you treat your work seriously.

Ownership is the second reason. Algorithm changes on social platforms can slash your reach overnight. Your site99 portfolio lives on a URL you control. You decide the layout, the messaging, and what visitors see first.

SEO compounds over time. A well-structured site with project pages, a blog, and clear service descriptions can rank for searches like "freelance web designer Mumbai" or "brand photographer Delhi". Social posts disappear in feeds; search results work while you sleep.

Pricing psychology matters too. Freelancers with professional sites consistently report higher perceived value. A clean portfolio with case studies, testimonials, and a contact form makes it easier for clients to say yes — especially for ₹25,000+ projects.

You don't need months to launch. With a visual builder, most freelancers can go live in an afternoon: pick a template, upload work samples, write a short bio, add payment or booking links, and publish.

If you're still relying only on LinkedIn or Instagram in 2026, you're leaving clients and credibility on the table. Build something you own.`,
  },
  {
    slug: 'launch-business-website-under-one-hour',
    title: 'Launch Your Business Website in Under One Hour with site99',
    excerpt: 'Restaurants, clinics, salons, and local shops — this quick-start workflow shows how to go from zero to live website in under 60 minutes.',
    publishedAt: '2026-03-22 09:00:00',
    seoTitle: 'Launch a Business Website in Under 1 Hour | site99 Guide 2026',
    seoDescription: 'Step-by-step guide to launch a small business website in under one hour using site99 — templates, contact forms, hours, and maps.',
    seoKeywords: 'small business website, quick website launch, site99 tutorial, local business online 2026',
    body: `Small business owners rarely have time for a three-month website project. In 2026, speed wins — customers expect to find your hours, menu, services, and contact details online before they visit.

Here is a realistic one-hour workflow on site99:

Minute 0–10: Choose a template for your industry — restaurant, clinic, salon, coaching, or general business. Don't overthink it; you can swap layouts later.

Minute 10–25: Replace placeholder text. Add your business name, tagline, address, phone, WhatsApp link, and opening hours. Use real photos if you have them; stock images work as a starting point.

Minute 25–40: Add essential sections — services or menu, about story, testimonials if available, FAQ, and a contact form. For local businesses, embed Google Maps and list landmarks so customers can find you easily.

Minute 40–50: Set SEO basics — page title (e.g. "Mehta Dental Clinic — Teeth Whitening in Pune"), meta description, and social preview image. This helps when customers share your link on WhatsApp.

Minute 50–60: Preview on mobile and desktop, fix spacing issues, then publish your shareable link. Post it on Google Business Profile, Instagram bio, and printed QR codes at your shop.

You can always refine copy and images later. The goal of hour one is to be findable and trustworthy — not perfect.

site99 is built for this exact workflow: visual editing, instant preview, and a live link without touching code. Upgrade when you need custom domain export or long-term hosting.`,
  },
  {
    slug: 'website-seo-checklist-2026',
    title: 'Website SEO Checklist for 2026: Rank Higher Without Being an Expert',
    excerpt: 'A practical SEO checklist for portfolio and business sites — titles, descriptions, speed, structure, and social previews that actually matter in 2026.',
    publishedAt: '2026-04-10 14:00:00',
    seoTitle: 'Website SEO Checklist 2026 — Simple Guide for Beginners | site99',
    seoDescription: 'Follow this 2026 SEO checklist for portfolios and small business websites: meta tags, headings, mobile, speed, and social sharing.',
    seoKeywords: 'SEO checklist 2026, website SEO tips, meta title description, small business SEO India',
    body: `SEO in 2026 is not about tricks — it's about clarity. Search engines reward sites that answer real questions quickly and load well on phones.

1. Unique page titles
Every important page needs its own title under 60 characters. Include your name or business plus what you do: "Riya Sharma — UI/UX Designer Portfolio" beats "Home".

2. Meta descriptions
Write 150–160 characters that summarise the page and include a soft call-to-action. This text often appears in Google results and influences clicks.

3. Heading structure
Use one H1 per page (your main headline), then H2/H3 for sections. Don't skip levels randomly — structure helps both readers and crawlers.

4. Mobile-first design
Most Indian traffic is mobile. If text is tiny, buttons overlap, or images crop badly, visitors leave — and rankings suffer. Always preview mobile before publishing.

5. Fast loading
Compress images, avoid huge video autoplay on the homepage, and keep sections lean. A simple fast site beats a heavy flashy one for local and portfolio searches.

6. Open Graph & social cards
When someone shares your site on LinkedIn or WhatsApp, a good preview image and title increase trust. Set OG image and description in your SEO panel.

7. Internal links
Link from your homepage to projects, services, contact, and blog posts. Internal links help visitors explore and help search engines understand your site map.

8. Real content
Add case studies, service details, location info, and FAQs. Thin one-page sites rank poorly; helpful specific content ranks better over time.

site99 includes built-in SEO fields for every project — title, description, keywords, and social preview. You don't need plugins or code; fill them in once per page and keep improving as you add content.

SEO is a marathon, not a launch-day checkbox. Start with this list, publish, then improve monthly.`,
  },
  {
    slug: 'export-nextjs-react-html-site99-2026',
    title: 'Export Your site99 Site as HTML, React, or Next.js in 2026',
    excerpt: 'Own your code, deploy anywhere, and skip vendor lock-in — how premium export works on site99 and when it makes sense for your project.',
    publishedAt: '2026-05-18 16:00:00',
    seoTitle: 'Export Website as HTML, React or Next.js | site99 Premium 2026',
    seoDescription: 'Learn how to export your site99 website as production-ready HTML, React, or Next.js code in 2026 — deploy to Hostinger, Vercel, or your own server.',
    seoKeywords: 'export website code, Next.js export, React portfolio, HTML download, site99 premium',
    body: `Building visually is fast. Owning the output is freedom.

site99's premium export lets you download your entire site as production-ready code — not a screenshot, not a PDF, but real files you can host anywhere. In 2026, that matters more than ever as founders and agencies want flexibility without rebuilding from scratch.

HTML export is ideal when you need a static site on any cheap hosting plan. Upload the folder, point your domain, done. Perfect for landing pages, event sites, and simple portfolios.

React export suits developers who want components they can extend — add animations, connect APIs, or merge sections into an existing app. You get structured components instead of messy copy-paste markup.

Next.js export is the best fit for modern SEO, fast routing, and deployment on Vercel or similar platforms. If you plan to scale content or add a blog later, starting with Next.js saves migration pain.

When should you export vs stay on site99 hosting? Export if you need full server control, custom backends, or agency handoff. Stay on the builder if you're iterating quickly and a shareable link is enough for now.

Hostinger deploy integration on site99 pushes your site live in a few clicks for users who want a domain without managing FTP manually.

The workflow is simple: finish your design in the builder, run a final preview pass, choose your export format, download the zip, and deploy. Your visual work becomes portable assets — no lock-in, no starting over.

Whether you're a freelancer delivering client sites or a business owner planning long-term growth, code export turns a afternoon project into an asset you control for years.`,
  },
];

function slugify(text) {
  return text.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 120);
}

const conn = await mysql.createConnection({
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'portfolio_builder',
  port: Number(process.env.MYSQL_PORT || 3306),
});

let inserted = 0;
let skipped = 0;

for (const post of POSTS) {
  const [existing] = await conn.query(
    'SELECT id FROM marketing_blog_posts WHERE slug = ? LIMIT 1',
    [post.slug],
  );
  if (existing.length > 0) {
    skipped += 1;
    continue;
  }

  await conn.query(
    `INSERT INTO marketing_blog_posts
      (slug, title, excerpt, body, status, author_name, seo_title, seo_description, seo_keywords, og_image, published_at)
     VALUES (?, ?, ?, ?, 'published', 'site99 Team', ?, ?, ?, '', ?)`,
    [
      post.slug,
      post.title,
      post.excerpt,
      post.body,
      post.seoTitle,
      post.seoDescription,
      post.seoKeywords,
      post.publishedAt,
    ],
  );
  inserted += 1;
}

const [count] = await conn.query(
  "SELECT COUNT(*) AS n FROM marketing_blog_posts WHERE status = 'published'",
);
await conn.end();

console.log(`Done: ${inserted} inserted, ${skipped} skipped (already exist).`);
console.log(`Published posts in DB: ${count[0].n}`);
