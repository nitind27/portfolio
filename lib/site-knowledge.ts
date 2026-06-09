import { APP_NAME, APP_DOMAIN, STORAGE_POLICY_DAYS } from './brand';

export interface DocSection {
  id: string;
  title: string;
  category: string;
  summary: string;
  body: string;
  keywords: string[];
}

export interface DocCategory {
  id: string;
  label: string;
  icon: string;
}

export const DOC_CATEGORIES: DocCategory[] = [
  { id: 'getting-started', label: 'Getting started', icon: '🚀' },
  { id: 'builder', label: 'Builder panels', icon: '🛠️' },
  { id: 'sections', label: 'Page sections', icon: '📄' },
  { id: 'publish', label: 'Share & deploy', icon: '🌐' },
  { id: 'billing', label: 'Plans & billing', icon: '💳' },
  { id: 'legal', label: 'Legal & policies', icon: '⚖️' },
];

const PREMIUM = process.env.NEXT_PUBLIC_PREMIUM_PRICE || '99';

export const SITE_DOCS: DocSection[] = [
  {
    id: 'intro',
    category: 'getting-started',
    title: `What is ${APP_NAME}?`,
    summary: 'Visual website builder for portfolios, business sites, and landing pages.',
    keywords: ['what', 'site99', 'introduction', 'overview', 'builder'],
    body: `${APP_NAME} is a no-code website builder. Pick a template, edit sections visually, customize theme/navbar/footer, preview on desktop/tablet/mobile, then share a live link, export ZIP (HTML/React/Next.js), or deploy to Hostinger. Projects save to your account automatically.`,
  },
  {
    id: 'create-project',
    category: 'getting-started',
    title: 'Create your first project',
    summary: 'Sign up, choose purpose & template, name your site.',
    keywords: ['create', 'new', 'project', 'signup', 'register', 'template', 'wizard'],
    body: `1. Register with name, email, phone & password.\n2. Click **New Project** on the dashboard.\n3. Choose website purpose (portfolio, business, shop, etc.).\n4. Pick a template from the gallery.\n5. Name your project — a URL slug is generated for sharing.\n6. The builder opens with your template sections pre-loaded.`,
  },
  {
    id: 'dashboard',
    category: 'getting-started',
    title: 'Dashboard overview',
    summary: 'Manage projects, publish status, expiry, and upgrades.',
    keywords: ['dashboard', 'projects', 'list', 'grid', 'delete', 'duplicate'],
    body: `The dashboard lists all your projects with Live/Draft badges. You can search, filter by category, duplicate, delete, publish/unpublish, and open the builder. Free accounts store projects for ${STORAGE_POLICY_DAYS} days — see the expiry badge on each card. Use **Billing** for payment history and **Ask AI** for help.`,
  },
  {
    id: 'sections-panel',
    category: 'builder',
    title: 'Sections panel (left sidebar)',
    summary: 'Add, reorder, hide, and edit page sections.',
    keywords: ['sections', 'sidebar', 'left', 'reorder', 'drag', 'add section', 'visibility'],
    body: `The left sidebar lists all page sections (Hero, About, Contact, etc.). Click a section to edit it in the right panel. Drag to reorder. Use the eye icon to show/hide. Click **+ Add Section** to insert new section types. Clicking a section in the live preview also selects it.`,
  },
  {
    id: 'sections-editor',
    category: 'builder',
    title: 'Section editor (right panel)',
    summary: 'Edit text, images, lists, and advanced section content.',
    keywords: ['section editor', 'fields', 'image', 'text', 'content', 'edit'],
    body: `When **Sections** tab is active and a section is selected, the right panel shows all fields for that section: headings, paragraphs, images, buttons, lists, blog posts, team members, pricing plans, FAQ items, etc. Changes update the canvas instantly. Upload images — they are stored on the server under your project folder.`,
  },
  {
    id: 'theme-panel',
    category: 'builder',
    title: 'Theme panel',
    summary: 'Colors, fonts, spacing, border radius, and animations.',
    keywords: ['theme', 'colors', 'font', 'palette', 'spacing', 'animation', 'design'],
    body: `Open the **Theme** tab to customize:\n• Primary, secondary, accent, background & text colors (with color picker)\n• Font family & size scale\n• Border radius (none → full rounded)\n• Section spacing (compact / normal / relaxed)\n• Animation intensity (subtle / moderate / expressive)\nTheme applies globally across all sections.`,
  },
  {
    id: 'navbar-panel',
    category: 'builder',
    title: 'Navbar panel',
    summary: 'Site header, logo, menu style, scroll behavior, and nav links.',
    keywords: ['navbar', 'header', 'menu', 'navigation', 'logo', 'sticky', 'drawer'],
    body: `The **Navbar** tab controls the top navigation:\n• Show/hide logo and site name\n• Menu style: side drawer, left drawer, fullscreen, or bottom popup\n• Menu icon style\n• Scroll behavior: static, sticky, or hide-on-scroll\n• Scroll animation on nav links\n• Auto-generate nav links from visible sections\n• Custom nav links with external URLs\nPreview menu styles in the builder canvas.`,
  },
  {
    id: 'footer-panel',
    category: 'builder',
    title: 'Footer panel',
    summary: 'Copyright, columns, social icons, and live badge.',
    keywords: ['footer', 'copyright', 'columns', 'bottom'],
    body: `The **Footer** tab configures the site footer:\n• Copyright text & year\n• Multi-column link groups\n• Show social icons from Social panel\n• **Live badge** — displays when portfolio is published\n• Background override and layout options`,
  },
  {
    id: 'templates-panel',
    category: 'builder',
    title: 'Templates panel',
    summary: 'Switch design preset; some templates require Pro plan.',
    keywords: ['templates', 'switch', 'design', 'preset', 'locked', 'premium template'],
    body: `The **Templates** tab opens a visual gallery. Switching template updates default theme and may adjust sections. Some templates show a lock icon — they require Pro or Business plan (set by admin). Your content is preserved where field IDs match.`,
  },
  {
    id: 'popup-panel',
    category: 'builder',
    title: 'Popup panel',
    summary: 'Lead capture popups with triggers and styling.',
    keywords: ['popup', 'modal', 'lead', 'newsletter', 'trigger', 'delay', 'exit'],
    body: `The **Popup** tab builds marketing popups:\n• Enable/disable popup\n• Headline, body, button text & link\n• Trigger: time delay, scroll percentage, or exit intent\n• Display once per session or every visit\n• Position, colors, and border radius\n• **Preview** button tests popup in builder\nPopups appear on published/shared sites. Great for email signups or announcements.`,
  },
  {
    id: 'social-panel',
    category: 'builder',
    title: 'Social panel',
    summary: 'Social profile links used in navbar, footer, and contact areas.',
    keywords: ['social', 'instagram', 'twitter', 'linkedin', 'facebook', 'youtube', 'links'],
    body: `The **Social** tab stores your social URLs:\n• Instagram, Twitter/X, LinkedIn, Facebook, YouTube, GitHub, Dribbble, Behance, etc.\n• Links appear in footer, navbar (optional), and Social sections\n• Leave blank to hide each network\n• URLs must include https://`,
  },
  {
    id: 'seo-panel',
    category: 'builder',
    title: 'SEO panel',
    summary: 'Page title, meta description, keywords, and Open Graph image.',
    keywords: ['seo', 'meta', 'title', 'description', 'google', 'search', 'og image'],
    body: `The **SEO** tab sets search & social preview metadata:\n• **Page title** — browser tab & search result title\n• **Meta description** — snippet in Google results\n• **Keywords** — comma-separated (legacy support)\n• **OG image** — image when link is shared on WhatsApp/Facebook/Twitter\nApplies to exported HTML and shared /p/slug pages.`,
  },
  {
    id: 'smtp-panel',
    category: 'builder',
    title: 'SMTP / Contact form panel',
    summary: 'Configure email delivery for contact form submissions (Pro).',
    keywords: ['smtp', 'email', 'contact form', 'mail', 'host', 'port', 'password'],
    body: `The **SMTP** tab configures contact form email (Pro plan):\n• SMTP host, port, username, password\n• From name & from email\n• To email (where submissions go)\n• Test connection button\nWhen visitors submit the Contact section form on your live site, ${APP_NAME} sends email via your SMTP server. Keep credentials secure — they are stored in your project config.`,
  },
  {
    id: 'analytics-panel',
    category: 'builder',
    title: 'Analytics panel',
    summary: 'Paste Google Analytics or other tracking IDs (Pro).',
    keywords: ['analytics', 'google', 'gtag', 'tracking', 'visitors', 'stats'],
    body: `The **Analytics** tab accepts tracking IDs:\n• Google Analytics 4 measurement ID (G-XXXX)\n• Custom head scripts (advanced)\nTracking code is injected in exported HTML and live pages. View stats in your Google Analytics dashboard — ${APP_NAME} does not host analytics data.`,
  },
  {
    id: 'css-panel',
    category: 'builder',
    title: 'Custom CSS panel',
    summary: 'Add advanced CSS overrides (Pro).',
    keywords: ['css', 'custom', 'style', 'code', 'override'],
    body: `The **CSS** tab (Pro) adds custom CSS appended to your site:\n• Target sections with data attributes\n• Override theme variables\n• Use for fine-tuning spacing, animations, or hiding elements\nInvalid CSS may break layout — test in preview first.`,
  },
  {
    id: 'preview-controls',
    category: 'builder',
    title: 'Preview, zoom & device views',
    summary: 'Desktop/tablet/mobile preview, zoom, and new-tab preview.',
    keywords: ['preview', 'mobile', 'tablet', 'desktop', 'zoom', 'device'],
    body: `Top bar controls:\n• **Preview mode** — hide editing chrome, see clean site\n• **New tab** — open live-sync preview in separate tab\n• **Device icons** — switch desktop (1280px), tablet, mobile layouts\n• **Zoom** — scale canvas 50%–150%\n• **Undo/Redo** — Ctrl+Z / Ctrl+Y`,
  },
  {
    id: 'section-hero',
    category: 'sections',
    title: 'Hero section',
    summary: 'Main headline, subtitle, CTA buttons, and background image.',
    keywords: ['hero', 'banner', 'headline', 'cta', 'above fold'],
    body: `Hero is the first screen visitors see. Edit headline, subheadline, primary/secondary buttons, background image or gradient, and optional badge text. Supports video background on some layouts.`,
  },
  {
    id: 'section-about',
    category: 'sections',
    title: 'About section',
    summary: 'Bio, story, image, and stats.',
    keywords: ['about', 'bio', 'story', 'introduction'],
    body: `Tell your story: title, rich text, profile image, and optional stat counters (years experience, projects completed, etc.).`,
  },
  {
    id: 'section-skills',
    category: 'sections',
    title: 'Skills section',
    summary: 'Skill bars or tags with proficiency levels.',
    keywords: ['skills', 'technologies', 'proficiency', 'bars'],
    body: `List skills with labels and percentage or level. Displays as progress bars or tag grid depending on template.`,
  },
  {
    id: 'section-experience',
    category: 'sections',
    title: 'Experience section',
    summary: 'Work history timeline with roles and dates.',
    keywords: ['experience', 'work', 'jobs', 'career', 'timeline'],
    body: `Add jobs: company, role, date range, description, and optional logo. Renders as vertical timeline.`,
  },
  {
    id: 'section-projects',
    category: 'sections',
    title: 'Projects section',
    summary: 'Portfolio grid with images, links, and tags.',
    keywords: ['projects', 'portfolio', 'work samples', 'case studies'],
    body: `Showcase work: project name, description, image, live URL, GitHub link, and tech tags.`,
  },
  {
    id: 'section-services',
    category: 'sections',
    title: 'Services section',
    summary: 'Service cards with icons, pricing hints, and descriptions.',
    keywords: ['services', 'offerings', 'what we do'],
    body: `List services you offer with icon, title, short description, and optional price or CTA link.`,
  },
  {
    id: 'section-blog',
    category: 'sections',
    title: 'Blog section (Pro)',
    summary: 'Blog post cards with read-more modal.',
    keywords: ['blog', 'posts', 'articles', 'news'],
    body: `Pro plan unlocks Blog section. Add posts: title, excerpt, cover image, date, author, and full body (opens in read modal on live site). Manage posts in section editor.`,
  },
  {
    id: 'section-gallery',
    category: 'sections',
    title: 'Gallery section',
    summary: 'Image grid or masonry gallery.',
    keywords: ['gallery', 'photos', 'images', 'portfolio grid'],
    body: `Upload multiple images. Layout adapts to template — grid, masonry, or carousel.`,
  },
  {
    id: 'section-videos',
    category: 'sections',
    title: 'Videos section',
    summary: 'Embedded YouTube/Vimeo or uploaded video links.',
    keywords: ['video', 'youtube', 'vimeo', 'embed'],
    body: `Add video URLs — auto-embeds in responsive players.`,
  },
  {
    id: 'section-testimonials',
    category: 'sections',
    title: 'Testimonials section',
    summary: 'Client quotes with name, role, photo, and rating.',
    keywords: ['testimonials', 'reviews', 'quotes', 'clients'],
    body: `Add testimonial items: quote text, person name, job title, avatar image, star rating. Carousel or grid layout.`,
  },
  {
    id: 'section-team',
    category: 'sections',
    title: 'Team section (Pro)',
    summary: 'Team member cards with photos and social links.',
    keywords: ['team', 'staff', 'members', 'employees'],
    body: `Pro plan unlocks Team section. Each member: name, role, bio, photo, LinkedIn/Twitter links.`,
  },
  {
    id: 'section-pricing',
    category: 'sections',
    title: 'Pricing section (Pro)',
    summary: 'Pricing plan cards for your own products/services.',
    keywords: ['pricing', 'plans', 'packages', 'subscription', 'price table'],
    body: `Pro plan unlocks Pricing section. Create your own pricing tiers: name, price, period, feature list, highlight badge, CTA button. This is YOUR site pricing — separate from ${APP_NAME} subscription plans.`,
  },
  {
    id: 'section-faq',
    category: 'sections',
    title: 'FAQ section',
    summary: 'Accordion FAQ items.',
    keywords: ['faq', 'questions', 'answers', 'accordion', 'help'],
    body: `Add question/answer pairs. Visitors expand items on live site. Good for support and sales objections.`,
  },
  {
    id: 'section-contact',
    category: 'sections',
    title: 'Contact section',
    summary: 'Contact form, map embed, and contact details.',
    keywords: ['contact', 'form', 'email', 'phone', 'address', 'map'],
    body: `Contact section includes form fields (name, email, message), your email/phone/address, and optional map embed URL. Form sends via SMTP when configured (Pro).`,
  },
  {
    id: 'section-stats',
    category: 'sections',
    title: 'Stats section',
    summary: 'Number counters for metrics and achievements.',
    keywords: ['stats', 'numbers', 'metrics', 'counters'],
    body: `Display animated counters: label + number (clients, projects, awards, etc.).`,
  },
  {
    id: 'section-custom',
    category: 'sections',
    title: 'Custom section',
    summary: 'Flexible section with custom fields you define.',
    keywords: ['custom', 'flexible', 'fields'],
    body: `Custom sections let you add arbitrary text/image fields for unique layouts not covered by standard types.`,
  },
  {
    id: 'share-free',
    category: 'publish',
    title: 'Free share link (7 days)',
    summary: 'Publish and share /p/your-slug for 7 days on free plan.',
    keywords: ['share', 'link', 'free', '7 days', 'publish', 'copy'],
    body: `Free plan includes share & publish for ${STORAGE_POLICY_DAYS} days from project creation:\n1. Open **Share** in builder top bar\n2. Toggle **Publish** to Live\n3. **Copy** link (format: yoursite.com/p/your-slug)\n4. Anyone with the link can view your site\nAfter ${STORAGE_POLICY_DAYS} days the link expires unless you upgrade to Pro.`,
  },
  {
    id: 'share-premium',
    category: 'publish',
    title: 'Premium share & export slot',
    summary: 'Pro unlocks export, long-term share, and Hostinger deploy.',
    keywords: ['premium', 'pro', 'export', 'zip', 'unlock', 'slot'],
    body: `Pro plan (₹${PREMIUM} one-time) unlocks one portfolio slot:\n• Export HTML, React, Next.js ZIP\n• Share/publish long-term (365 days storage)\n• Hostinger deploy to your domain\n• SMTP, analytics, custom CSS, premium sections\nFirst export or deploy binds the slot to that project. Upgrade again to unlock another portfolio.`,
  },
  {
    id: 'export',
    category: 'publish',
    title: 'Export ZIP',
    summary: 'Download standalone HTML, React, or Next.js project.',
    keywords: ['export', 'download', 'zip', 'html', 'react', 'nextjs'],
    body: `Click **Export** → choose format:\n• **HTML** — static files, open index.html anywhere\n• **React** — Vite + React components\n• **Next.js** — App router project\nRequires Pro and bound portfolio slot. Images and assets included in ZIP.`,
  },
  {
    id: 'hostinger',
    category: 'publish',
    title: 'Hostinger deploy',
    summary: 'Deploy live to your Hostinger domain.',
    keywords: ['hostinger', 'deploy', 'domain', 'go live', 'hosting'],
    body: `Click **Go Live** → connect Hostinger API token → pick domain → deploy. ${APP_NAME} uploads your site files. Requires Pro plan. Token encrypted server-side. Re-deploy after major edits.`,
  },
  {
    id: 'plans-overview',
    category: 'billing',
    title: 'Plans overview',
    summary: 'Free and Premium plan comparison.',
    keywords: ['plans', 'pricing', 'free', 'premium', 'pro', 'subscription'],
    body: `**Free** — Build, preview, ${STORAGE_POLICY_DAYS}-day share link, basic sections\n**Premium (₹${PREMIUM})** — Export, deploy, 1 portfolio slot, premium sections, SMTP, analytics, custom CSS\nView current plan on **Billing** page.`,
  },
  {
    id: 'payment-flow',
    category: 'billing',
    title: 'How payment works',
    summary: 'Cashfree checkout, order verification, instant unlock.',
    keywords: ['payment', 'cashfree', 'checkout', 'pay', 'order', 'upi', 'card'],
    body: `1. Click Upgrade → Premium (₹${PREMIUM} + GST)\n2. Pay via Cashfree (UPI, card, netbanking)\n3. Redirect to callback page — payment verified automatically\n4. Plan activates instantly on your account\n5. Receipt appears in **Billing** history\nPayments processed securely by Cashfree — ${APP_NAME} does not store card numbers.`,
  },
  {
    id: 'refund-policy',
    category: 'billing',
    title: 'Refund policy — no refunds',
    summary: 'All sales are final; digital goods are non-refundable.',
    keywords: ['refund', 'return', 'money back', 'cancel', 'chargeback'],
    body: `**${APP_NAME} does not offer refunds.** All premium purchases are final sale for digital services (export unlock, deploy slot, extended hosting period). Once payment is confirmed and plan features are activated, the order cannot be refunded, reversed, or transferred.\n\nBefore paying, use the free plan to build and preview. Contact support only for duplicate charges or technical payment errors — not for change-of-mind refunds.`,
  },
  {
    id: 'billing-page',
    category: 'billing',
    title: 'Billing & payment history',
    summary: 'View orders, status, and total spent on Billing page.',
    keywords: ['billing', 'history', 'invoice', 'receipt', 'orders', 'transactions'],
    body: `Open **Billing** from dashboard header when logged in. See:\n• Current plan & premium status\n• Total amount paid\n• Full payment history with order ID, date, amount, status (paid/pending/failed)\n• Plan name for each transaction\nPending orders expire if checkout abandoned.`,
  },
  {
    id: 'privacy-summary',
    category: 'legal',
    title: 'Privacy policy summary',
    summary: 'What data we collect and how we use it.',
    keywords: ['privacy', 'data', 'personal', 'cookies', 'gdpr'],
    body: `We collect: account info (name, email, phone), project content you save, payment order IDs (via Cashfree), and usage logs. We use data to run the service, process payments, and support you. We do not sell personal data. Project images stored on our servers. See full Privacy Policy page for details.`,
  },
  {
    id: 'terms-summary',
    category: 'legal',
    title: 'Terms of use summary',
    summary: 'Acceptable use and account responsibilities.',
    keywords: ['terms', 'rules', 'acceptable use', 'account'],
    body: `You must provide accurate registration info, not upload illegal content, and not abuse the platform. ${APP_NAME} may suspend accounts violating terms. Service provided as-is. We may update features and pricing with notice on site.`,
  },
  {
    id: 'about-company',
    category: 'legal',
    title: `About ${APP_NAME}`,
    summary: 'Mission and what we build.',
    keywords: ['about', 'company', 'mission', 'team', 'who'],
    body: `${APP_NAME} (${APP_DOMAIN}) helps creators, freelancers, and businesses launch professional websites without code. Our mission: **Building the future online.** We combine visual editing, production-ready export, and one-click deploy so anyone can go from idea to live site in minutes.`,
  },
];

export function getDocById(id: string): DocSection | undefined {
  return SITE_DOCS.find(d => d.id === id);
}

export function getDocsByCategory(category: string): DocSection[] {
  return SITE_DOCS.filter(d => d.category === category);
}

export const SUGGESTED_AI_QUESTIONS = [
  'How does the Popup panel work?',
  'How to share my site for free?',
  'What is the refund policy?',
  'How does SMTP contact form work?',
  'Difference between Free and Pro plan?',
  'How to export HTML ZIP?',
  'What sections are available?',
  'How does SEO panel work?',
];
