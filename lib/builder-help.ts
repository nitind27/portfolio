import type { RightTab } from '@/components/Builder';
import type { SectionType } from '@/lib/types';

export interface HelpTip {
  icon: string;
  title: string;
  description: string;
}

export interface BuilderHelpContext {
  rightTab: RightTab;
  activeSectionType?: SectionType;
  activeSectionTitle?: string;
  previewMode: boolean;
  sectionCount: number;
}

const SECTION_HELP: Record<SectionType, { summary: string; tips: HelpTip[]; questions: string[] }> = {
  hero: {
    summary: 'Your first impression — headline, photo, and call-to-action button.',
    tips: [
      { icon: '✏️', title: 'Edit headline & subheadline', description: 'Change the big title and subtitle in the fields below.' },
      { icon: '🖼️', title: 'Upload your photo', description: 'Drop an image on the avatar/banner area or click to browse.' },
      { icon: '🔘', title: 'CTA button', description: 'Set button text (e.g. "Contact Me") and link (e.g. #contact).' },
      { icon: '✨', title: 'Animations', description: 'Open the Animation tab — scroll the preview to see entrance effects play.' },
    ],
    questions: ['How do I change the hero layout?', 'How to upload images in sections?'],
  },
  about: {
    summary: 'Tell visitors who you are — bio, photo, and highlights.',
    tips: [
      { icon: '📝', title: 'Write your bio', description: 'Use the description field for your story. Long text is supported.' },
      { icon: '🖼️', title: 'Profile photo', description: 'Upload a clear headshot — it appears in the About section.' },
      { icon: '➕', title: 'Add custom fields', description: 'Scroll down to add extra text, links, or lists.' },
    ],
    questions: ['How does the section editor work?', 'Can I add custom fields to a section?'],
  },
  skills: {
    summary: 'Show tools, languages, or abilities as a list or grid.',
    tips: [
      { icon: '📋', title: 'Skill list', description: 'Each item is one skill — click "Add item" to add more.' },
      { icon: '⠿', title: 'Reorder', description: 'Drag the handle on the left of any field to reorder.' },
    ],
    questions: ['How to reorder section fields?', 'What sections are available?'],
  },
  experience: {
    summary: 'Work history — jobs, roles, dates, and descriptions.',
    tips: [
      { icon: '💼', title: 'Job entries', description: 'Fill company, role, dates, and description for each position.' },
      { icon: '➕', title: 'Add more jobs', description: 'Use list fields or add custom text fields for extra roles.' },
    ],
    questions: ['How does the section editor work?'],
  },
  projects: {
    summary: 'Showcase your work with titles, images, links, and tags.',
    tips: [
      { icon: '🚀', title: 'Project cards', description: 'Each project has title, image, description, and link fields.' },
      { icon: '🔗', title: 'Live links', description: 'Add GitHub, demo, or portfolio URLs so visitors can click through.' },
    ],
    questions: ['How to upload images in sections?'],
  },
  gallery: {
    summary: 'Photo grid — upload multiple images at once.',
    tips: [
      { icon: '🖼️', title: 'Multi-upload', description: 'Drop multiple images or click to select — they appear as a gallery.' },
      { icon: '👁️', title: 'Preview', description: 'Click thumbnails in the editor to preview full size.' },
    ],
    questions: ['How to upload images in sections?'],
  },
  testimonials: {
    summary: 'Client quotes — name, role, photo, and star rating.',
    tips: [
      { icon: '💬', title: 'Quote & name', description: 'Only quote and name are required. Role and photo are optional.' },
      { icon: '➕', title: 'Add testimonials', description: 'Click "Add testimonial" to insert more review cards.' },
    ],
    questions: ['How does the testimonials section work?'],
  },
  contact: {
    summary: 'Let visitors reach you — email form, phone, address.',
    tips: [
      { icon: '📧', title: 'Contact form', description: 'Visitors fill the form on your live site. Set up SMTP tab to receive emails.' },
      { icon: '📞', title: 'Contact details', description: 'Add phone, email, and address fields that display on the page.' },
    ],
    questions: ['How does SMTP contact form work?', 'How to set up email for contact form?'],
  },
  videos: {
    summary: 'Embed YouTube or Vimeo videos on your page.',
    tips: [
      { icon: '▶️', title: 'Video URL', description: 'Paste a YouTube or Vimeo link — it embeds automatically.' },
      { icon: '➕', title: 'Multiple videos', description: 'Add more video fields or use a list for several embeds.' },
    ],
    questions: ['How to add videos to my site?'],
  },
  services: {
    summary: 'List services or offerings with icons, titles, and descriptions.',
    tips: [
      { icon: '🛠️', title: 'Service items', description: 'Each service has a title and description — edit them in the fields below.' },
      { icon: '➕', title: 'Add services', description: 'Use list fields or add custom fields for more offerings.' },
    ],
    questions: ['What sections are available?'],
  },
  team: {
    summary: 'Introduce team members with photo, role, and social links.',
    tips: [
      { icon: '👥', title: 'Team cards', description: 'Only name is required. Role, bio, photo & social links are optional.' },
      { icon: '➕', title: 'Add members', description: 'Click "Add member" to add more people to the grid.' },
    ],
    questions: ['How does the team section work?'],
  },
  stats: {
    summary: 'Highlight numbers — clients, projects, years of experience.',
    tips: [
      { icon: '📊', title: 'Stat blocks', description: 'Each stat has a number and label (e.g. "50+ Projects").' },
      { icon: '✏️', title: 'Customize labels', description: 'Click any field label to rename it for your brand.' },
    ],
    questions: ['How does the section editor work?'],
  },
  social: {
    summary: 'Social media links displayed as icons on your page.',
    tips: [
      { icon: '🔗', title: 'Social URLs', description: 'For full control, use the Social tab in the top bar.' },
      { icon: '👁️', title: 'Also in hero/footer', description: 'Social links also appear in navbar and footer when enabled.' },
    ],
    questions: ['Where do I add social media links?'],
  },
  pricing: {
    summary: 'Pricing plans with features, prices, and CTA buttons.',
    tips: [
      { icon: '💰', title: 'Plans', description: 'Name and price are required. Features list and button text are optional.' },
      { icon: '⭐', title: 'Highlight a plan', description: 'Mark one plan as "popular" to emphasize it visually.' },
    ],
    questions: ['How does the pricing section work?'],
  },
  faq: {
    summary: 'Questions & answers — great for reducing support emails.',
    tips: [
      { icon: '❓', title: 'FAQ pairs', description: 'Each item has a question and answer — add as many as you need.' },
      { icon: '➕', title: 'Add more', description: 'Click "Add FAQ" to insert another question block.' },
    ],
    questions: ['How does the FAQ section work?'],
  },
  blog: {
    summary: 'Blog posts with title, image, excerpt, and link.',
    tips: [
      { icon: '📝', title: 'Blog cards', description: 'Each post has title, image, article text, link, and tags in one block.' },
      { icon: '➕', title: 'Add posts', description: 'Click "Add post" to publish more articles on your page.' },
    ],
    questions: ['How does the blog section work?'],
  },
  custom: {
    summary: 'Blank section — build your own with custom fields.',
    tips: [
      { icon: '✏️', title: 'Custom fields', description: 'Add Text, Long Text, Image, List, or Link fields at the bottom.' },
      { icon: '🏷️', title: 'Rename labels', description: 'Click any blue field label to change what visitors see.' },
    ],
    questions: ['Can I add custom fields to a section?'],
  },
};

const TAB_HELP: Record<RightTab, { title: string; summary: string; tips: HelpTip[]; questions: string[] }> = {
  sections: {
    title: 'Edit page content',
    summary: 'Click any section to edit its text, images, and buttons here.',
    tips: [
      { icon: '👆', title: 'Select a section', description: 'Click in the left list, on the preview, or a navbar link.' },
      { icon: '➕', title: 'Add sections', description: 'Click "+ Add Section" in the left sidebar.' },
      { icon: '⠿', title: 'Reorder', description: 'Drag sections in the left list to change page order.' },
      { icon: '👁️', title: 'Hide sections', description: 'Click the eye icon to hide without deleting.' },
    ],
    questions: ['How do I add a new section?', 'How to reorder sections?'],
  },
  theme: {
    title: 'Colors & design',
    summary: 'Change colors, fonts, spacing, and animations for the whole site.',
    tips: [
      { icon: '🎨', title: 'Color presets', description: 'Pick a preset palette or customize each color individually.' },
      { icon: '🔤', title: 'Fonts', description: 'Switch font family and size scale under Typography.' },
      { icon: '✨', title: 'Animations', description: 'Set animation style under Layout — from subtle to expressive.' },
    ],
    questions: ['How do I change theme colors?', 'How to change fonts on my site?'],
  },
  navbar: {
    title: 'Top navigation',
    summary: 'Logo, menu style, nav links, and call-to-action button.',
    tips: [
      { icon: '🏷️', title: 'Brand name & logo', description: 'Upload a logo image or set your site name in General tab.' },
      { icon: '☰', title: 'Menu style', description: 'Choose drawer, fullscreen, or bottom popup for mobile menu.' },
      { icon: '🔗', title: 'Nav links', description: 'Toggle which sections appear in the menu and rename labels.' },
    ],
    questions: ['How to customize the navbar?', 'How to add logo to navbar?'],
  },
  footer: {
    title: 'Site footer',
    summary: 'Copyright, columns, contact info, and social links at the bottom.',
    tips: [
      { icon: '📋', title: 'Toggle columns', description: 'Enable/disable brand, navigation, contact, and social columns.' },
      { icon: '📢', title: 'CTA strip', description: 'Add a banner above the footer with title and button.' },
    ],
    questions: ['How to customize the footer?'],
  },
  templates: {
    title: 'Switch design',
    summary: 'Change the overall look — colors and layout update instantly.',
    tips: [
      { icon: '🖼️', title: 'Browse templates', description: 'Click any template to preview and apply it.' },
      { icon: '💾', title: 'Content preserved', description: 'Your text and images stay — only design changes.' },
    ],
    questions: ['How to switch templates?', 'Will I lose content when switching templates?'],
  },
  seo: {
    title: 'Search & sharing',
    summary: 'Page title, description, and social preview image for Google & social media.',
    tips: [
      { icon: '🔍', title: 'Meta title & description', description: 'These appear in Google search results and link previews.' },
      { icon: '🖼️', title: 'OG image', description: 'Set an image URL for when your link is shared on social media.' },
    ],
    questions: ['How does SEO panel work?', 'How to set social preview image?'],
  },
  smtp: {
    title: 'Contact form email',
    summary: 'Connect your email so contact form submissions reach your inbox.',
    tips: [
      { icon: '📧', title: 'Gmail / Outlook', description: 'Pick a provider preset and enter your email credentials.' },
      { icon: '🧪', title: 'Test email', description: 'Click "Send Test Email" to verify setup before publishing.' },
    ],
    questions: ['How does SMTP contact form work?', 'How to set up Gmail for contact form?'],
  },
  popup: {
    title: 'Welcome popup',
    summary: 'Show a message or email capture when visitors land on your site.',
    tips: [
      { icon: '💬', title: 'Popup types', description: 'Message, email capture, or announcement — pick what fits your goal.' },
      { icon: '⏱️', title: 'Delay', description: 'Set how many seconds after page load the popup appears.' },
      { icon: '👁️', title: 'Preview', description: 'Click "Show" to preview the popup on your canvas.' },
    ],
    questions: ['How does the Popup panel work?'],
  },
  social: {
    title: 'Social links',
    summary: 'GitHub, LinkedIn, Instagram, and more — shown in hero, navbar, and footer.',
    tips: [
      { icon: '🔗', title: 'Paste URLs', description: 'Add full URLs for each platform you use.' },
      { icon: '👁️', title: 'Where they show', description: 'Enable "Show Social" in Navbar and Footer panels too.' },
    ],
    questions: ['Where do I add social media links?'],
  },
  analytics: {
    title: 'Site stats',
    summary: 'Overview of views and portfolio info (simulated in builder).',
    tips: [
      { icon: '📊', title: 'View counts', description: 'Simulated analytics — connect real tracking via Custom CSS or export.' },
    ],
    questions: ['How to add Google Analytics?'],
  },
  css: {
    title: 'Custom CSS',
    summary: 'Advanced styling — inject your own CSS rules globally.',
    tips: [
      { icon: '💻', title: 'Write CSS', description: 'Add rules that apply to your entire portfolio preview and export.' },
      { icon: '⚡', title: 'Quick snippets', description: 'Click preset snippets at the bottom to get started fast.' },
    ],
    questions: ['How to add custom CSS?'],
  },
};

const QUICK_START: HelpTip[] = [
  { icon: '1️⃣', title: 'Pick a section', description: 'Click Hero, About, or any section in the left sidebar.' },
  { icon: '2️⃣', title: 'Edit on the right', description: 'Change text, upload images — preview updates instantly.' },
  { icon: '3️⃣', title: 'Style your site', description: 'Use Theme, Navbar, and Templates tabs in the top bar.' },
  { icon: '4️⃣', title: 'Share or export', description: 'Click Share for a live link, or Export for HTML/React ZIP.' },
];

export function getSectionHelp(type: SectionType) {
  return SECTION_HELP[type] ?? SECTION_HELP.custom;
}

export function getTabHelp(tab: RightTab) {
  return TAB_HELP[tab];
}

export function getBuilderHelp(context: BuilderHelpContext) {
  const { rightTab, activeSectionType, activeSectionTitle, previewMode, sectionCount } = context;

  if (previewMode) {
    return {
      headline: 'Preview mode',
      intro: 'You are viewing your site as visitors see it. Click "Edit" in the top bar to make changes.',
      tips: [
        { icon: '✏️', title: 'Switch to Edit', description: 'Click the Edit button (top right) to open section fields again.' },
        { icon: '📱', title: 'Check devices', description: 'Use Desktop / Tablet / Mobile icons to test responsive layout.' },
        { icon: '🔗', title: 'Open in new tab', description: 'Click "New tab" for a full-screen preview.' },
      ] as HelpTip[],
      suggestedQuestions: ['How to share my site for free?', 'How to export HTML ZIP?'],
      quickStart: QUICK_START,
    };
  }

  if (rightTab === 'sections' && activeSectionType) {
    const help = getSectionHelp(activeSectionType);
    return {
      headline: activeSectionTitle ? `Editing: ${activeSectionTitle}` : 'Section editor',
      intro: help.summary,
      tips: help.tips,
      suggestedQuestions: help.questions,
      quickStart: QUICK_START,
    };
  }

  const tabHelp = getTabHelp(rightTab);
  const extraTips: HelpTip[] = rightTab === 'sections' && sectionCount === 0
    ? [{ icon: '➕', title: 'Start here', description: 'Click "+ Add Section" in the left sidebar to build your page.' }]
    : [];

  return {
    headline: tabHelp.title,
    intro: tabHelp.summary,
    tips: [...extraTips, ...tabHelp.tips],
    suggestedQuestions: tabHelp.questions,
    quickStart: QUICK_START,
  };
}

export const BUILDER_FEATURE_MAP: { tab: RightTab; icon: string; label: string; desc: string }[] = [
  { tab: 'sections', icon: '📄', label: 'Sections', desc: 'Edit page content' },
  { tab: 'theme', icon: '🎨', label: 'Theme', desc: 'Colors & fonts' },
  { tab: 'navbar', icon: '🧭', label: 'Navbar', desc: 'Top menu & logo' },
  { tab: 'footer', icon: '⬇️', label: 'Footer', desc: 'Bottom of page' },
  { tab: 'templates', icon: '🖼️', label: 'Templates', desc: 'Switch design' },
  { tab: 'seo', icon: '🔍', label: 'SEO', desc: 'Google & social' },
  { tab: 'smtp', icon: '📧', label: 'SMTP', desc: 'Contact form email' },
  { tab: 'popup', icon: '💬', label: 'Popup', desc: 'Welcome message' },
  { tab: 'social', icon: '🔗', label: 'Social', desc: 'Social media links' },
  { tab: 'analytics', icon: '📊', label: 'Analytics', desc: 'Site stats' },
  { tab: 'css', icon: '💻', label: 'CSS', desc: 'Custom styling' },
];
