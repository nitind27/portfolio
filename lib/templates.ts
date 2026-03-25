import { Template, ThemeConfig } from './types';

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

export const TEMPLATES: Template[] = [
  {
    id: 'developer-dark',
    name: 'Dev Dark',
    category: 'developer',
    thumbnail: '/templates/dev-dark.jpg',
    description: 'Sleek dark theme for software developers with code aesthetics',
    defaultSections: ['hero', 'about', 'skills', 'experience', 'projects', 'contact'],
    defaultTheme: { ...defaultTheme, primaryColor: '#6366f1', backgroundColor: '#0a0a0a', textColor: '#e2e8f0' },
  },
  {
    id: 'developer-neon',
    name: 'Dev Neon',
    category: 'developer',
    thumbnail: '/templates/dev-neon.jpg',
    description: 'Cyberpunk neon glow theme for modern developers',
    defaultSections: ['hero', 'skills', 'projects', 'experience', 'contact'],
    defaultTheme: { ...defaultTheme, primaryColor: '#00ff88', secondaryColor: '#00ccff', accentColor: '#ff00aa', backgroundColor: '#050510', textColor: '#e0ffe0', fontFamily: 'Space Grotesk', borderRadius: 'sm' },
  },
  {
    id: 'designer-minimal',
    name: 'Designer Minimal',
    category: 'designer',
    thumbnail: '/templates/designer-minimal.jpg',
    description: 'Clean minimal layout for UI/UX designers and creatives',
    defaultSections: ['hero', 'about', 'projects', 'gallery', 'testimonials', 'contact'],
    defaultTheme: { ...defaultTheme, primaryColor: '#ec4899', backgroundColor: '#fafafa', textColor: '#1a1a1a', animation: 'subtle' },
  },
  {
    id: 'designer-bold',
    name: 'Designer Bold',
    category: 'designer',
    thumbnail: '/templates/designer-bold.jpg',
    description: 'Bold typographic layout for senior designers',
    defaultSections: ['hero', 'about', 'projects', 'gallery', 'contact'],
    defaultTheme: { ...defaultTheme, primaryColor: '#ff6b35', secondaryColor: '#f7c59f', accentColor: '#1a1a2e', backgroundColor: '#1a1a2e', textColor: '#ffffff', fontFamily: 'Montserrat', borderRadius: 'none', animation: 'expressive' },
  },
  {
    id: 'photographer-bold',
    name: 'Photographer Bold',
    category: 'photographer',
    thumbnail: '/templates/photographer-bold.jpg',
    description: 'Full-screen gallery-first layout for photographers',
    defaultSections: ['hero', 'gallery', 'about', 'services', 'testimonials', 'contact'],
    defaultTheme: { ...defaultTheme, primaryColor: '#f97316', backgroundColor: '#111111', textColor: '#ffffff', borderRadius: 'none' },
  },
  {
    id: 'photographer-light',
    name: 'Photographer Light',
    category: 'photographer',
    thumbnail: '/templates/photographer-light.jpg',
    description: 'Airy light theme for wedding and portrait photographers',
    defaultSections: ['hero', 'gallery', 'about', 'services', 'contact'],
    defaultTheme: { ...defaultTheme, primaryColor: '#b08d57', secondaryColor: '#d4b896', accentColor: '#8b6914', backgroundColor: '#fdf8f3', textColor: '#2c1810', fontFamily: 'Playfair Display', borderRadius: 'sm', animation: 'subtle' },
  },
  {
    id: 'model-glamour',
    name: 'Model Glamour',
    category: 'model',
    thumbnail: '/templates/model-glamour.jpg',
    description: 'Elegant and bold layout for models and influencers',
    defaultSections: ['hero', 'gallery', 'about', 'videos', 'contact'],
    defaultTheme: { ...defaultTheme, primaryColor: '#d4af37', secondaryColor: '#c0a030', backgroundColor: '#0d0d0d', textColor: '#f5f5f5', fontFamily: 'Playfair Display' },
  },
  {
    id: 'agency-corporate',
    name: 'Agency Corporate',
    category: 'agency',
    thumbnail: '/templates/agency-corporate.jpg',
    description: 'Professional multi-section layout for agencies and studios',
    defaultSections: ['hero', 'about', 'services', 'team', 'projects', 'stats', 'testimonials', 'contact'],
    defaultTheme: { ...defaultTheme, primaryColor: '#0ea5e9', backgroundColor: '#ffffff', textColor: '#0f172a', spacing: 'relaxed' },
  },
  {
    id: 'startup-modern',
    name: 'Startup Modern',
    category: 'agency',
    thumbnail: '/templates/startup-modern.jpg',
    description: 'High-energy startup landing page with bold sections',
    defaultSections: ['hero', 'stats', 'services', 'team', 'pricing', 'testimonials', 'contact'],
    defaultTheme: { ...defaultTheme, primaryColor: '#7c3aed', secondaryColor: '#4f46e5', accentColor: '#f59e0b', backgroundColor: '#0f0a1e', textColor: '#f8fafc', fontFamily: 'Poppins', borderRadius: 'lg', animation: 'expressive' },
  },
  {
    id: 'creative-vibrant',
    name: 'Creative Vibrant',
    category: 'creative',
    thumbnail: '/templates/creative-vibrant.jpg',
    description: 'Colorful and expressive layout for artists and creatives',
    defaultSections: ['hero', 'about', 'projects', 'gallery', 'skills', 'contact'],
    defaultTheme: { ...defaultTheme, primaryColor: '#a855f7', secondaryColor: '#ec4899', accentColor: '#06b6d4', backgroundColor: '#fdf4ff', textColor: '#1e1b4b', animation: 'expressive' },
  },
  {
    id: 'freelancer-pro',
    name: 'Freelancer Pro',
    category: 'minimal',
    thumbnail: '/templates/freelancer-pro.jpg',
    description: 'Clean professional layout for freelancers and consultants',
    defaultSections: ['hero', 'about', 'services', 'skills', 'pricing', 'testimonials', 'contact'],
    defaultTheme: { ...defaultTheme, primaryColor: '#059669', secondaryColor: '#10b981', accentColor: '#f59e0b', backgroundColor: '#f8fafc', textColor: '#0f172a', fontFamily: 'DM Sans', borderRadius: 'lg', animation: 'subtle' },
  },
  {
    id: 'resume-classic',
    name: 'Resume Classic',
    category: 'minimal',
    thumbnail: '/templates/resume-classic.jpg',
    description: 'Clean resume-style layout for job seekers',
    defaultSections: ['hero', 'about', 'experience', 'skills', 'projects', 'contact'],
    defaultTheme: { ...defaultTheme, primaryColor: '#1e40af', secondaryColor: '#3b82f6', accentColor: '#f59e0b', backgroundColor: '#ffffff', textColor: '#1e293b', fontFamily: 'Inter', borderRadius: 'sm', animation: 'subtle', spacing: 'compact' },
  },
  {
    id: 'minimal-clean',
    name: 'Minimal Clean',
    category: 'minimal',
    thumbnail: '/templates/minimal-clean.jpg',
    description: 'Ultra-minimal typography-focused layout',
    defaultSections: ['hero', 'about', 'experience', 'projects', 'contact'],
    defaultTheme: { ...defaultTheme, primaryColor: '#18181b', secondaryColor: '#3f3f46', backgroundColor: '#ffffff', textColor: '#18181b', animation: 'none', borderRadius: 'none' },
  },
  {
    id: 'music-artist',
    name: 'Music Artist',
    category: 'creative',
    thumbnail: '/templates/music-artist.jpg',
    description: 'Dark immersive layout for musicians and bands',
    defaultSections: ['hero', 'about', 'videos', 'gallery', 'contact'],
    defaultTheme: { ...defaultTheme, primaryColor: '#e11d48', secondaryColor: '#be123c', accentColor: '#fbbf24', backgroundColor: '#09090b', textColor: '#fafafa', fontFamily: 'Raleway', borderRadius: 'md', animation: 'expressive' },
  },
];

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
      { id: 'title', label: 'Section Title', type: 'text', value: 'About Me' },
      { id: 'bio', label: 'Bio', type: 'richtext', value: 'I am a passionate developer with 5+ years of experience building modern web applications.' },
      { id: 'image', label: 'About Image', type: 'image', value: '' },
      { id: 'location', label: 'Location', type: 'text', value: 'New York, USA' },
      { id: 'email', label: 'Email', type: 'email', value: 'hello@example.com' },
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
      { id: 'title', label: 'Section Title', type: 'text', value: 'Featured Projects' },
      { id: 'projects', label: 'Projects', type: 'list', value: ['Project Alpha - A SaaS platform', 'Project Beta - Mobile app'] },
    ],
  },
  gallery: {
    title: 'Gallery',
    fields: [
      { id: 'title', label: 'Section Title', type: 'text', value: 'Gallery' },
      { id: 'images', label: 'Gallery Images', type: 'images', value: [] },
    ],
  },
  testimonials: {
    title: 'Testimonials',
    fields: [
      { id: 'title', label: 'Section Title', type: 'text', value: 'What People Say' },
      { id: 'testimonials', label: 'Testimonials', type: 'list', value: ['"Amazing work!" - Client A', '"Highly recommended!" - Client B'] },
    ],
  },
  contact: {
    title: 'Contact',
    fields: [
      { id: 'title', label: 'Section Title', type: 'text', value: 'Get In Touch' },
      { id: 'email', label: 'Contact Email', type: 'email', value: 'hello@example.com' },
      { id: 'phone', label: 'Phone', type: 'text', value: '+1 (555) 000-0000' },
      { id: 'message', label: 'Intro Message', type: 'textarea', value: "Have a project in mind? Let's talk!" },
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
      { id: 'title', label: 'Section Title', type: 'text', value: 'Services' },
      { id: 'services', label: 'Services', type: 'list', value: ['Web Design', 'Development', 'Consulting'] },
    ],
  },
  team: {
    title: 'Team',
    fields: [
      { id: 'title', label: 'Section Title', type: 'text', value: 'Our Team' },
      { id: 'members', label: 'Team Members', type: 'list', value: ['Alice - CEO', 'Bob - CTO', 'Carol - Designer'] },
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
      { id: 'title', label: 'Section Title', type: 'text', value: 'Pricing Plans' },
      { id: 'subtitle', label: 'Subtitle', type: 'text', value: 'Simple, transparent pricing' },
      { id: 'plans', label: 'Plans (Name | Price | Features...)', type: 'list', value: [
        'Starter | $99 | 1 Page | Basic Design | 1 Revision',
        'Pro | $299 | 5 Pages | Custom Design | Unlimited Revisions | SEO',
        'Agency | $799 | 10+ Pages | Full Custom | Priority Support | Analytics',
      ]},
    ],
  },
  faq: {
    title: 'FAQ',
    fields: [
      { id: 'title', label: 'Section Title', type: 'text', value: 'Frequently Asked Questions' },
      { id: 'faqs', label: 'Q&A (Question | Answer)', type: 'list', value: [
        'What services do you offer? | I offer web design, development, and consulting services.',
        'How long does a project take? | Typically 2-6 weeks depending on complexity.',
        'Do you offer revisions? | Yes, I offer unlimited revisions until you are satisfied.',
      ]},
    ],
  },
  blog: {
    title: 'Blog',
    fields: [
      { id: 'title', label: 'Section Title', type: 'text', value: 'Latest Posts' },
      { id: 'posts', label: 'Posts (Title | Date | Summary)', type: 'list', value: [
        'Getting Started with React | Jan 2025 | A beginner guide to React development.',
        'Design Systems in 2025 | Feb 2025 | How to build scalable design systems.',
      ]},
    ],
  },
};
