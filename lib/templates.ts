import { Template, ThemeConfig, WebsitePurpose } from './types';
import { EXTRA_TEMPLATES } from './templates-extra';
import { PROFESSIONAL_TEMPLATES } from './templates-professional';
import { V2_TEMPLATES } from './templates-v2';

const defaultTheme: ThemeConfig = {
  primaryColor: '#6366f1',
  secondaryColor: '#8b5cf6',
  accentColor: '#f59e0b',
  backgroundColor: '#0f0f0f',
  textColor: '#f1f5f9',
  fontFamily: 'Inter',
  fontSize: 'md',
  borderRadius: 'md',
  spacing: 'normal',
  animation: 'moderate',
};

const BASE_TEMPLATES: Template[] = [
  {
    id: 'developer-dark',
    name: 'Dev Dark',
    category: 'developer',
    purposes: ['personal-portfolio', 'resume-cv', 'freelancer-services'],
    thumbnail: '/templates/dev-dark.jpg',
    description: 'Sleek dark theme for software developers with code aesthetics',
    defaultSections: ['hero', 'about', 'skills', 'experience', 'projects', 'contact'],
    defaultTheme: { ...defaultTheme, primaryColor: '#6366f1', backgroundColor: '#0a0a0a', textColor: '#e2e8f0' },
  },
  {
    id: 'developer-neon',
    name: 'Dev Neon',
    category: 'developer',
    purposes: ['personal-portfolio', 'saas-startup'],
    thumbnail: '/templates/dev-neon.jpg',
    description: 'Cyberpunk neon glow theme for modern developers',
    defaultSections: ['hero', 'skills', 'projects', 'experience', 'contact'],
    defaultTheme: { ...defaultTheme, primaryColor: '#00ff88', secondaryColor: '#00ccff', accentColor: '#ff00aa', backgroundColor: '#050510', textColor: '#e0ffe0', fontFamily: 'Space Grotesk', borderRadius: 'sm' },
  },
  {
    id: 'designer-minimal',
    name: 'Designer Minimal',
    category: 'designer',
    purposes: ['personal-portfolio', 'freelancer-services', 'photography-studio'],
    thumbnail: '/templates/designer-minimal.jpg',
    description: 'Clean minimal layout for UI/UX designers and creatives',
    defaultSections: ['hero', 'about', 'projects', 'gallery', 'testimonials', 'contact'],
    defaultTheme: { ...defaultTheme, primaryColor: '#ec4899', backgroundColor: '#fafafa', textColor: '#1a1a1a', animation: 'subtle' },
  },
  {
    id: 'designer-bold',
    name: 'Designer Bold',
    category: 'designer',
    purposes: ['agency-studio', 'personal-portfolio', 'blog-writer'],
    thumbnail: '/templates/designer-bold.jpg',
    description: 'Bold typographic layout for senior designers',
    defaultSections: ['hero', 'about', 'projects', 'gallery', 'contact'],
    defaultTheme: { ...defaultTheme, primaryColor: '#ff6b35', secondaryColor: '#f7c59f', accentColor: '#1a1a2e', backgroundColor: '#1a1a2e', textColor: '#ffffff', fontFamily: 'Montserrat', borderRadius: 'none', animation: 'expressive' },
  },
  {
    id: 'photographer-bold',
    name: 'Photographer Bold',
    category: 'photographer',
    purposes: ['photography-studio', 'event-wedding'],
    thumbnail: '/templates/photographer-bold.jpg',
    description: 'Full-screen gallery-first layout for photographers',
    defaultSections: ['hero', 'gallery', 'about', 'services', 'testimonials', 'contact'],
    defaultTheme: { ...defaultTheme, primaryColor: '#f97316', backgroundColor: '#111111', textColor: '#ffffff', borderRadius: 'none' },
  },
  {
    id: 'photographer-light',
    name: 'Photographer Light',
    category: 'photographer',
    purposes: ['photography-studio', 'event-wedding'],
    thumbnail: '/templates/photographer-light.jpg',
    description: 'Airy light theme for wedding and portrait photographers',
    defaultSections: ['hero', 'gallery', 'about', 'services', 'contact'],
    defaultTheme: { ...defaultTheme, primaryColor: '#b08d57', secondaryColor: '#d4b896', accentColor: '#8b6914', backgroundColor: '#fdf8f3', textColor: '#2c1810', fontFamily: 'Playfair Display', borderRadius: 'sm', animation: 'subtle' },
  },
  {
    id: 'model-glamour',
    name: 'Model Glamour',
    category: 'model',
    purposes: ['personal-portfolio', 'music-artist'],
    thumbnail: '/templates/model-glamour.jpg',
    description: 'Elegant and bold layout for models and influencers',
    defaultSections: ['hero', 'gallery', 'about', 'videos', 'contact'],
    defaultTheme: { ...defaultTheme, primaryColor: '#d4af37', secondaryColor: '#c0a030', backgroundColor: '#0d0d0d', textColor: '#f5f5f5', fontFamily: 'Playfair Display' },
  },
  {
    id: 'agency-corporate',
    name: 'Agency Corporate',
    category: 'agency',
    purposes: ['agency-studio', 'business-company'],
    thumbnail: '/templates/agency-corporate.jpg',
    description: 'Professional multi-section layout for agencies and studios',
    defaultSections: ['hero', 'about', 'services', 'team', 'projects', 'stats', 'testimonials', 'contact'],
    defaultTheme: { ...defaultTheme, primaryColor: '#0ea5e9', backgroundColor: '#ffffff', textColor: '#0f172a', spacing: 'relaxed' },
    defaultLayoutPreset: 'business-corporate',
  },
  {
    id: 'startup-modern',
    name: 'Startup Modern',
    category: 'agency',
    purposes: ['saas-startup', 'agency-studio', 'business-company'],
    thumbnail: '/templates/startup-modern.jpg',
    description: 'High-energy startup landing page with bold sections',
    defaultSections: ['hero', 'stats', 'services', 'team', 'pricing', 'testimonials', 'contact'],
    defaultTheme: { ...defaultTheme, primaryColor: '#7c3aed', secondaryColor: '#4f46e5', accentColor: '#f59e0b', backgroundColor: '#0f0a1e', textColor: '#f8fafc', fontFamily: 'Poppins', borderRadius: 'lg', animation: 'expressive' },
    defaultLayoutPreset: 'one-page',
  },
  {
    id: 'creative-vibrant',
    name: 'Creative Vibrant',
    category: 'creative',
    purposes: ['personal-portfolio', 'music-artist', 'blog-writer'],
    thumbnail: '/templates/creative-vibrant.jpg',
    description: 'Colorful and expressive layout for artists and creatives',
    defaultSections: ['hero', 'about', 'projects', 'gallery', 'skills', 'contact'],
    defaultTheme: { ...defaultTheme, primaryColor: '#a855f7', secondaryColor: '#ec4899', accentColor: '#06b6d4', backgroundColor: '#fdf4ff', textColor: '#1e1b4b', animation: 'expressive' },
  },
  {
    id: 'freelancer-pro',
    name: 'Freelancer Pro',
    category: 'minimal',
    purposes: ['freelancer-services', 'business-company', 'fitness-coach'],
    thumbnail: '/templates/freelancer-pro.jpg',
    description: 'Clean professional layout for freelancers and consultants',
    defaultSections: ['hero', 'about', 'services', 'skills', 'pricing', 'testimonials', 'contact'],
    defaultTheme: { ...defaultTheme, primaryColor: '#059669', secondaryColor: '#10b981', accentColor: '#f59e0b', backgroundColor: '#f8fafc', textColor: '#0f172a', fontFamily: 'DM Sans', borderRadius: 'lg', animation: 'subtle' },
  },
  {
    id: 'resume-classic',
    name: 'Resume Classic',
    category: 'minimal',
    purposes: ['resume-cv', 'personal-portfolio'],
    thumbnail: '/templates/resume-classic.jpg',
    description: 'Clean resume-style layout for job seekers',
    defaultSections: ['hero', 'about', 'experience', 'skills', 'projects', 'contact'],
    defaultTheme: { ...defaultTheme, primaryColor: '#1e40af', secondaryColor: '#3b82f6', accentColor: '#f59e0b', backgroundColor: '#ffffff', textColor: '#1e293b', fontFamily: 'Inter', borderRadius: 'sm', animation: 'subtle', spacing: 'compact' },
  },
  {
    id: 'minimal-clean',
    name: 'Minimal Clean',
    category: 'minimal',
    purposes: ['resume-cv', 'business-company', 'blog-writer'],
    thumbnail: '/templates/minimal-clean.jpg',
    description: 'Ultra-minimal typography-focused layout',
    defaultSections: ['hero', 'about', 'experience', 'projects', 'contact'],
    defaultTheme: { ...defaultTheme, primaryColor: '#18181b', secondaryColor: '#3f3f46', backgroundColor: '#ffffff', textColor: '#18181b', animation: 'none', borderRadius: 'none' },
  },
  {
    id: 'music-artist',
    name: 'Music Artist',
    category: 'creative',
    purposes: ['music-artist', 'event-wedding'],
    thumbnail: '/templates/music-artist.jpg',
    description: 'Dark immersive layout for musicians and bands',
    defaultSections: ['hero', 'about', 'videos', 'gallery', 'contact'],
    defaultTheme: { ...defaultTheme, primaryColor: '#e11d48', secondaryColor: '#be123c', accentColor: '#fbbf24', backgroundColor: '#09090b', textColor: '#fafafa', fontFamily: 'Raleway', borderRadius: 'md', animation: 'expressive' },
  },
];

export const TEMPLATES: Template[] = [...BASE_TEMPLATES, ...EXTRA_TEMPLATES, ...PROFESSIONAL_TEMPLATES, ...V2_TEMPLATES];

/** Legacy template ids mapped to current ids */
const TEMPLATE_ID_ALIASES: Record<string, string> = {
  'webquro-pro': 'site99-pro',
};

export function resolveTemplateId(templateId: string) {
  return TEMPLATE_ID_ALIASES[templateId] || templateId;
}

export function findTemplate(templateId: string) {
  const id = resolveTemplateId(templateId);
  return TEMPLATES.find(t => t.id === id);
}

export function getTemplatesForPurpose(purpose: WebsitePurpose): Template[] {
  const fromPurpose = TEMPLATES.filter(t => t.purposes.includes(purpose));
  return fromPurpose.length ? fromPurpose : TEMPLATES;
}

export const SECTION_DEFAULTS: Record<string, { title: string; fields: Array<{ id: string; label: string; type: any; value: any; options?: string[] }> }> = {
  hero: {
    title: 'Hero',
    fields: [
      { id: 'heroLayout', label: 'Layout Style', type: 'select', value: 'image-right', options: ['text-only', 'image-right', 'image-left', 'banner', 'slideshow', 'split'] },
      { id: 'headline', label: 'Headline', type: 'text', value: "Hi, I'm John Doe" },
      { id: 'subheadline', label: 'Subheadline', type: 'text', value: 'Full Stack Developer & Designer' },
      { id: 'description', label: 'Description', type: 'textarea', value: 'I build beautiful, performant web experiences.' },
      { id: 'avatar', label: 'Profile / Hero Image', type: 'image', value: '' },
      { id: 'bannerImages', label: 'Banner / Slideshow Images', type: 'images', value: [] },
      { id: 'ctaText', label: 'CTA Button Text', type: 'text', value: 'View My Work' },
      { id: 'ctaLink', label: 'CTA Button Link', type: 'url', value: '#projects' },
      { id: 'ctaSecondaryText', label: 'Secondary CTA Text', type: 'text', value: 'Contact Me' },
      { id: 'ctaSecondaryLink', label: 'Secondary CTA Link', type: 'url', value: '#contact' },
    ],
  },
  about: {
    title: 'About',
    fields: [
      { id: 'aboutLayout', label: 'Layout Style', type: 'select', value: 'split', options: ['split', 'centered', 'wide'] },
      { id: 'imageStyle', label: 'Photo Style', type: 'select', value: 'default', options: ['default', 'rotate', 'rotate-hover', 'floating', 'circle-glow', 'tilt-3d', 'morph-border'] },
      { id: 'title', label: 'Section Title', type: 'text', value: 'About Me' },
      { id: 'subtitle', label: 'Tagline', type: 'text', value: 'Turning ideas into elegant digital experiences' },
      { id: 'role', label: 'Professional Title', type: 'text', value: 'Full Stack Developer & UI Designer' },
      { id: 'bio', label: 'Bio / Story', type: 'richtext', value: 'I am a passionate developer with 5+ years of experience building modern web applications. I love crafting clean, user-focused products that solve real problems and delight users.' },
      { id: 'image', label: 'Profile Photo', type: 'image', value: '' },
      { id: 'highlights', label: 'Key Highlights', type: 'list', value: ['5+ Years Experience', '50+ Projects Delivered', '20+ Happy Clients'] },
      { id: 'location', label: 'Location', type: 'text', value: 'New York, USA' },
      { id: 'email', label: 'Email', type: 'email', value: 'hello@example.com' },
      { id: 'phone', label: 'Phone', type: 'text', value: '+1 (555) 123-4567' },
      { id: 'website', label: 'Website', type: 'url', value: 'https://yoursite.com' },
      { id: 'availability', label: 'Availability', type: 'text', value: 'Open to freelance & full-time opportunities' },
    ],
  },
  skills: {
    title: 'Skills',
    fields: [
      { id: 'title', label: 'Section Title', type: 'text', value: 'Skills & Expertise' },
      { id: 'skills', label: 'Skills (one per line)', type: 'list', value: ['React', 'TypeScript', 'Node.js', 'Python', 'AWS', 'Docker'] },
    ],
  },
  experience: {
    title: 'Experience',
    fields: [
      { id: 'title', label: 'Section Title', type: 'text', value: 'Work Experience' },
      { id: 'jobs', label: 'Jobs', type: 'list', value: ['Senior Developer @ TechCorp (2022-Present)', 'Frontend Dev @ StartupXYZ (2020-2022)'] },
    ],
  },
  projects: {
    title: 'Projects',
    fields: [
      { id: 'projectsLayout', label: 'Layout Style', type: 'select', value: 'cards', options: ['cards', 'list'] },
      { id: 'title', label: 'Section Title', type: 'text', value: 'Featured Projects' },
      { id: 'projects', label: 'Projects', type: 'list', value: ['Project Alpha - A SaaS platform', 'Project Beta - Mobile app'] },
    ],
  },
  gallery: {
    title: 'Gallery',
    fields: [
      { id: 'galleryLayout', label: 'Layout Style', type: 'select', value: 'masonry', options: ['masonry', 'grid', 'carousel'] },
      { id: 'title', label: 'Section Title', type: 'text', value: 'Gallery' },
      { id: 'images', label: 'Gallery Images', type: 'images', value: [] },
    ],
  },
  testimonials: {
    title: 'Testimonials',
    fields: [
      { id: 'testimonialsLayout', label: 'Layout Style', type: 'select', value: 'cards', options: ['cards', 'carousel'] },
      { id: 'title', label: 'Section Title', type: 'text', value: 'What People Say' },
      { id: 'subtitle', label: 'Subtitle', type: 'text', value: 'What clients and colleagues say about working with me' },
      { id: 'testimonialitems', label: 'Testimonials', type: 'testimonialitems', value: [
        { id: 't1', quote: 'Amazing work! Delivered exactly what we needed on time and with great attention to detail.', author: 'Sarah Johnson', role: 'CEO', company: 'TechStart Inc.', rating: 5, image: '' },
        { id: 't2', quote: 'Highly recommended! Professional, creative, and a pleasure to work with.', author: 'Michael Chen', role: 'Product Manager', company: 'DesignCo', rating: 5, image: '' },
      ]},
    ],
  },
  contact: {
    title: 'Contact',
    fields: [
      { id: 'contactLayout', label: 'Layout Style', type: 'select', value: 'split', options: ['split', 'centered', 'minimal'] },
      { id: 'title', label: 'Section Title', type: 'text', value: 'Get In Touch' },
      { id: 'subtitle', label: 'Subtitle', type: 'text', value: "Let's build something amazing together" },
      { id: 'message', label: 'Intro Message', type: 'textarea', value: "Have a project in mind or want to collaborate? I'd love to hear from you. Fill out the form and I'll respond as soon as possible." },
      { id: 'email', label: 'Email Address', type: 'email', value: 'hello@example.com' },
      { id: 'phone', label: 'Phone Number', type: 'text', value: '+1 (555) 123-4567' },
      { id: 'location', label: 'Location', type: 'text', value: 'New York, USA' },
      { id: 'address', label: 'Office Address', type: 'text', value: '123 Creative Street, Manhattan, NY 10001' },
      { id: 'hours', label: 'Working Hours', type: 'text', value: 'Mon – Fri, 9:00 AM – 6:00 PM' },
      { id: 'responseTime', label: 'Response Time', type: 'text', value: 'Usually replies within 24 hours' },
    ],
  },
  videos: {
    title: 'Videos',
    fields: [
      { id: 'title', label: 'Section Title', type: 'text', value: 'Video Showcase' },
      { id: 'videos', label: 'Video URLs (YouTube/Vimeo)', type: 'list', value: ['https://youtube.com/watch?v=dQw4w9WgXcQ'] },
    ],
  },
  services: {
    title: 'Services',
    fields: [
      { id: 'servicesLayout', label: 'Layout Style', type: 'select', value: 'cards', options: ['cards', 'list'] },
      { id: 'title', label: 'Section Title', type: 'text', value: 'Services' },
      { id: 'services', label: 'Services', type: 'list', value: ['Web Design', 'Development', 'Consulting'] },
    ],
  },
  team: {
    title: 'Team',
    fields: [
      { id: 'title', label: 'Section Title', type: 'text', value: 'Our Team' },
      { id: 'subtitle', label: 'Subtitle', type: 'text', value: 'The people behind the work' },
      { id: 'teamitems', label: 'Team Members', type: 'teamitems', value: [
        { id: 'm1', name: 'Alice Morgan', role: 'CEO & Founder', bio: 'Leading vision and strategy with 15+ years in tech.', image: '', linkedin: '', twitter: '', email: '' },
        { id: 'm2', name: 'Bob Chen', role: 'CTO', bio: 'Full-stack engineer passionate about scalable architecture.', image: '', linkedin: '', twitter: '', email: '' },
        { id: 'm3', name: 'Carol Design', role: 'Lead Designer', bio: 'Crafting beautiful, user-centered digital experiences.', image: '', linkedin: '', twitter: '', email: '' },
      ]},
    ],
  },
  stats: {
    title: 'Stats',
    fields: [
      { id: 'title', label: 'Section Title', type: 'text', value: 'By The Numbers' },
      { id: 'stats', label: 'Stats', type: 'list', value: ['50+ Projects', '100+ Clients', '5 Years Experience'] },
    ],
  },
  custom: {
    title: 'Custom Section',
    fields: [
      { id: 'title', label: 'Section Title', type: 'text', value: 'Custom Section' },
      { id: 'content', label: 'Content', type: 'richtext', value: 'Add your custom content here.' },
    ],
  },
  social: {
    title: 'Social Links',
    fields: [
      { id: 'title', label: 'Section Title', type: 'text', value: 'Find Me Online' },
      { id: 'github', label: 'GitHub URL', type: 'url', value: '' },
      { id: 'linkedin', label: 'LinkedIn URL', type: 'url', value: '' },
      { id: 'twitter', label: 'Twitter / X URL', type: 'url', value: '' },
      { id: 'instagram', label: 'Instagram URL', type: 'url', value: '' },
      { id: 'youtube', label: 'YouTube URL', type: 'url', value: '' },
      { id: 'dribbble', label: 'Dribbble URL', type: 'url', value: '' },
      { id: 'behance', label: 'Behance URL', type: 'url', value: '' },
    ],
  },
  pricing: {
    title: 'Pricing',
    fields: [
      { id: 'pricingLayout', label: 'Layout Style', type: 'select', value: 'columns-3', options: ['columns-3', 'columns-2', 'featured'] },
      { id: 'title', label: 'Section Title', type: 'text', value: 'Pricing Plans' },
      { id: 'subtitle', label: 'Subtitle', type: 'text', value: 'Simple, transparent pricing' },
      { id: 'pricingplans', label: 'Pricing Plans', type: 'pricingplans', value: [
        {
          id: 'p1', name: 'Starter', price: '$99', period: '/project', description: 'Perfect for small projects',
          features: ['1 Page', 'Basic Design', '1 Revision', 'Email Support'],
          ctaText: 'Get Started', ctaLink: '', featured: false,
        },
        {
          id: 'p2', name: 'Pro', price: '$299', period: '/project', description: 'Best for growing businesses',
          features: ['5 Pages', 'Custom Design', 'Unlimited Revisions', 'SEO Setup', 'Priority Support'],
          ctaText: 'Get Started', ctaLink: '', featured: true,
        },
        {
          id: 'p3', name: 'Agency', price: '$799', period: '/project', description: 'Full-service solution',
          features: ['10+ Pages', 'Full Custom Build', 'Analytics Dashboard', 'Dedicated Manager', 'SLA Support'],
          ctaText: 'Contact Us', ctaLink: '', featured: false,
        },
      ]},
    ],
  },
  faq: {
    title: 'FAQ',
    fields: [
      { id: 'title', label: 'Section Title', type: 'text', value: 'Frequently Asked Questions' },
      { id: 'subtitle', label: 'Subtitle', type: 'text', value: 'Common questions answered' },
      { id: 'faqitems', label: 'Questions & Answers', type: 'faqitems', value: [
        { id: 'f1', question: 'What services do you offer?', answer: 'I offer web design, development, and consulting services tailored to your needs.' },
        { id: 'f2', question: 'How long does a project take?', answer: 'Typically 2–6 weeks depending on complexity, scope, and revision rounds.' },
        { id: 'f3', question: 'Do you offer revisions?', answer: 'Yes — I offer revisions until you are fully satisfied with the final result.' },
      ]},
    ],
  },
  blog: {
    title: 'Blog',
    fields: [
      { id: 'title', label: 'Section Title', type: 'text', value: 'Latest Posts' },
      { id: 'subtitle', label: 'Subtitle', type: 'text', value: 'Thoughts, tutorials, and updates from my work' },
      { id: 'blogposts', label: 'Blog Posts', type: 'blogposts', value: [
        {
          id: 'bp1', title: 'Getting Started with React', date: 'Jan 2025',
          summary: 'A beginner guide to React development.',
          body: 'React is one of the most popular libraries for building modern user interfaces. In this article, we cover components, hooks, state management, and best practices.\n\nStart with Vite, learn JSX syntax, and build small projects to reinforce your skills.',
          image: '', link: '', linkLabel: 'View tutorial', list: ['React', 'JavaScript', 'Frontend'],
        },
        {
          id: 'bp2', title: 'Design Systems in 2025', date: 'Feb 2025',
          summary: 'How to build scalable design systems.',
          body: 'Design systems help teams ship consistent UI faster. We explore tokens, component libraries, documentation, and how to align design and engineering workflows.',
          image: '', link: '', linkLabel: 'Learn more', list: ['Design', 'UI/UX', 'Figma'],
        },
      ]},
    ],
  },
};
