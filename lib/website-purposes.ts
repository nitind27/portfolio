import { SectionType, TemplateCategory, WebsitePurpose } from './types';

export interface PurposeConfig {
  id: WebsitePurpose;
  title: string;
  subtitle: string;
  icon: string;
  examples: string;
  recommendedSections: SectionType[];
  /** Extra sections users can optionally add (not pre-selected) */
  optionalSections: SectionType[];
  templateCategories: TemplateCategory[];
  industries: string[];
}

/**
 * Context-aware section labels per purpose.
 * Falls back to SECTION_LABELS for any not listed here.
 */
export const PURPOSE_SECTION_LABELS: Partial<Record<WebsitePurpose, Partial<Record<SectionType, string>>>> = {
  'online-store': {
    projects: 'Products',
    gallery: 'Product Gallery',
    pricing: 'Pricing / Offers',
    services: 'Categories',
    blog: 'News & Updates',
    stats: 'Store Stats',
  },
  'restaurant-food': {
    services: 'Menu / Specials',
    gallery: 'Food Gallery',
    faq: 'FAQs & Hours',
    stats: 'About in Numbers',
    pricing: 'Packages / Catering',
    blog: 'Our Story / News',
  },
  'real-estate': {
    projects: 'Listings',
    gallery: 'Property Gallery',
    services: 'Services Offered',
    stats: 'Key Numbers',
    blog: 'Market News',
    pricing: 'Fee Structure',
  },
  'photography-studio': {
    projects: 'Portfolio',
    gallery: 'Photo Gallery',
    services: 'Packages',
    pricing: 'Pricing',
    blog: 'Behind the Lens',
    stats: 'Experience & Reach',
  },
  'agency-studio': {
    projects: 'Case Studies',
    services: 'What We Do',
    stats: 'Results & Numbers',
    blog: 'Insights & Articles',
    pricing: 'Packages',
  },
  'saas-startup': {
    services: 'Features',
    projects: 'Use Cases',
    stats: 'Growth & Impact',
    blog: 'Blog & Updates',
    videos: 'Product Demo',
  },
  'business-company': {
    services: 'Services',
    projects: 'Our Work',
    stats: 'Company Stats',
    blog: 'News & Insights',
    pricing: 'Plans',
  },
  'education-course': {
    services: 'Courses & Programs',
    pricing: 'Enrollment Plans',
    projects: 'Student Work',
    stats: 'Success Numbers',
    blog: 'Learning Resources',
    videos: 'Preview Lessons',
  },
  'healthcare-clinic': {
    services: 'Treatments & Services',
    team: 'Our Doctors',
    stats: 'Patient Stats',
    blog: 'Health Tips',
    pricing: 'Fee Structure',
    gallery: 'Clinic Gallery',
  },
  'event-wedding': {
    gallery: 'Photos & Moments',
    services: 'Schedule / Programme',
    faq: 'FAQs & RSVP Info',
    blog: 'Our Story',
    pricing: 'Packages',
    videos: 'Highlight Reel',
  },
  'music-artist': {
    projects: 'Discography',
    gallery: 'Photos',
    videos: 'Music Videos',
    blog: 'News & Updates',
    pricing: 'Booking Rates',
    stats: 'Streams & Reach',
  },
  'fitness-coach': {
    services: 'Programs & Plans',
    pricing: 'Coaching Plans',
    stats: 'Client Results',
    blog: 'Fitness Tips',
    gallery: 'Transformation Gallery',
    videos: 'Workout Videos',
  },
  'nonprofit-charity': {
    services: 'Our Programs',
    projects: 'Impact Stories',
    stats: 'Impact Numbers',
    blog: 'Stories & News',
    pricing: 'Donation Tiers',
    videos: 'Mission Videos',
  },
  'law-consulting': {
    services: 'Practice Areas',
    projects: 'Case Results',
    stats: 'Track Record',
    blog: 'Legal Insights',
    pricing: 'Fee Structure',
    gallery: 'Office Gallery',
  },
  'construction-trades': {
    projects: 'Past Projects',
    gallery: 'Work Gallery',
    services: 'Services Offered',
    stats: 'Experience & Reach',
    blog: 'Tips & Updates',
    pricing: 'Quote / Packages',
  },
  'travel-hospitality': {
    services: 'Tours & Packages',
    gallery: 'Destination Gallery',
    pricing: 'Package Pricing',
    blog: 'Travel Stories',
    stats: 'By the Numbers',
    videos: 'Destination Videos',
  },
  'resume-cv': {
    skills: 'Skills',
    experience: 'Work Experience',
    projects: 'Projects & Work',
    stats: 'Career Stats',
    blog: 'Articles & Writing',
    social: 'Social & Links',
  },
  'blog-writer': {
    blog: 'Articles & Posts',
    social: 'Social & Newsletter',
    projects: 'Featured Work',
    videos: 'Video Content',
    stats: 'Reach & Numbers',
    pricing: 'Work With Me',
  },
  'freelancer-services': {
    services: 'Services Offered',
    projects: 'Portfolio / Work',
    pricing: 'Rates & Packages',
    stats: 'Years & Clients',
    blog: 'Articles & Tips',
    videos: 'Work Process',
  },
  'personal-portfolio': {
    skills: 'Skills & Tools',
    experience: 'Experience',
    projects: 'Projects & Work',
    gallery: 'Creative Gallery',
    blog: 'Articles & Posts',
    videos: 'Show Reel',
  },
};

export const WEBSITE_PURPOSES: PurposeConfig[] = [
  {
    id: 'personal-portfolio',
    title: 'Personal Portfolio',
    subtitle: 'Showcase your work, skills, and personality',
    icon: '👤',
    examples: 'Designer, developer, artist, student',
    recommendedSections: ['hero', 'about', 'skills', 'projects', 'testimonials', 'contact'],
    optionalSections: ['experience', 'gallery', 'blog', 'videos', 'social', 'stats', 'custom'],
    templateCategories: ['developer', 'designer', 'creative', 'minimal', 'photographer'],
    industries: ['Creative', 'Technology', 'Student', 'Other'],
  },
  {
    id: 'freelancer-services',
    title: 'Freelancer / Services',
    subtitle: 'Sell your services with pricing and client proof',
    icon: '💼',
    examples: 'Consultant, writer, marketer, virtual assistant',
    recommendedSections: ['hero', 'about', 'services', 'pricing', 'testimonials', 'faq', 'contact'],
    optionalSections: ['projects', 'stats', 'blog', 'videos', 'social', 'custom'],
    templateCategories: ['minimal', 'business', 'agency', 'creative'],
    industries: ['Consulting', 'Marketing', 'Writing', 'Design', 'Development', 'Other'],
  },
  {
    id: 'business-company',
    title: 'Business Website',
    subtitle: 'Professional site for your company or brand',
    icon: '🏢',
    examples: 'Local business, startup, B2B company',
    recommendedSections: ['hero', 'about', 'services', 'stats', 'team', 'testimonials', 'contact'],
    optionalSections: ['projects', 'pricing', 'faq', 'gallery', 'blog', 'videos', 'custom'],
    templateCategories: ['business', 'agency', 'minimal', 'saas', 'landing'],
    industries: ['Technology', 'Manufacturing', 'Retail', 'Professional Services', 'Other'],
  },
  {
    id: 'agency-studio',
    title: 'Agency / Studio',
    subtitle: 'Present your team, case studies, and expertise',
    icon: '🎯',
    examples: 'Digital agency, design studio, marketing firm',
    recommendedSections: ['hero', 'about', 'services', 'projects', 'team', 'stats', 'testimonials', 'contact'],
    optionalSections: ['pricing', 'gallery', 'faq', 'blog', 'videos', 'custom'],
    templateCategories: ['agency', 'creative', 'designer', 'business'],
    industries: ['Digital Agency', 'Design Studio', 'Marketing', 'Branding', 'Other'],
  },
  {
    id: 'online-store',
    title: 'Online Shop / Store',
    subtitle: 'Product showcase with pricing and FAQs',
    icon: '🛒',
    examples: 'Boutique, handmade goods, digital products',
    recommendedSections: ['hero', 'about', 'gallery', 'pricing', 'testimonials', 'faq', 'contact'],
    optionalSections: ['services', 'stats', 'blog', 'videos', 'social', 'custom'],
    templateCategories: ['ecommerce', 'marketplace', 'business', 'creative', 'minimal', 'landing'],
    industries: ['Fashion', 'Handmade', 'Electronics', 'Food & Beverage', 'Digital Products', 'Other'],
  },
  {
    id: 'restaurant-food',
    title: 'Restaurant / Café',
    subtitle: 'Menu vibes, gallery, hours, and reservations',
    icon: '🍽️',
    examples: 'Restaurant, café, bakery, food truck',
    recommendedSections: ['hero', 'about', 'gallery', 'services', 'testimonials', 'faq', 'contact'],
    optionalSections: ['stats', 'pricing', 'blog', 'videos', 'social', 'team', 'custom'],
    templateCategories: ['restaurant', 'business', 'creative'],
    industries: ['Restaurant', 'Café', 'Bakery', 'Catering', 'Bar & Lounge', 'Other'],
  },
  {
    id: 'real-estate',
    title: 'Real Estate',
    subtitle: 'Listings, agent profile, and lead capture',
    icon: '🏠',
    examples: 'Realtor, property manager, developer',
    recommendedSections: ['hero', 'about', 'gallery', 'services', 'stats', 'testimonials', 'contact'],
    optionalSections: ['projects', 'team', 'pricing', 'faq', 'blog', 'custom'],
    templateCategories: ['realestate', 'business', 'minimal'],
    industries: ['Residential', 'Commercial', 'Luxury', 'Property Management', 'Other'],
  },
  {
    id: 'saas-startup',
    title: 'SaaS / Startup',
    subtitle: 'Product landing with features, pricing, and social proof',
    icon: '🚀',
    examples: 'SaaS app, mobile app, tech startup',
    recommendedSections: ['hero', 'about', 'services', 'stats', 'pricing', 'faq', 'testimonials', 'contact'],
    optionalSections: ['projects', 'team', 'blog', 'videos', 'gallery', 'custom'],
    templateCategories: ['saas', 'agency', 'developer', 'business', 'landing'],
    industries: ['B2B SaaS', 'B2C App', 'Fintech', 'AI / ML', 'Other'],
  },
  {
    id: 'event-wedding',
    title: 'Event / Wedding',
    subtitle: 'Dates, gallery, schedule, and RSVP info',
    icon: '💒',
    examples: 'Wedding, conference, festival, party',
    recommendedSections: ['hero', 'about', 'gallery', 'faq', 'contact'],
    optionalSections: ['services', 'videos', 'team', 'testimonials', 'pricing', 'blog', 'custom'],
    templateCategories: ['event', 'creative', 'photographer'],
    industries: ['Wedding', 'Corporate Event', 'Festival', 'Private Party', 'Other'],
  },
  {
    id: 'nonprofit-charity',
    title: 'Nonprofit / Charity',
    subtitle: 'Mission, impact stats, team, and donations CTA',
    icon: '❤️',
    examples: 'NGO, charity, community organization',
    recommendedSections: ['hero', 'about', 'stats', 'team', 'testimonials', 'faq', 'contact'],
    optionalSections: ['services', 'projects', 'blog', 'videos', 'gallery', 'pricing', 'custom'],
    templateCategories: ['nonprofit', 'business', 'minimal'],
    industries: ['Education', 'Health', 'Environment', 'Community', 'Other'],
  },
  {
    id: 'education-course',
    title: 'Education / Course',
    subtitle: 'Courses, instructor bio, pricing, and FAQ',
    icon: '🎓',
    examples: 'Tutor, coaching, online course, school',
    recommendedSections: ['hero', 'about', 'services', 'pricing', 'faq', 'testimonials', 'contact'],
    optionalSections: ['stats', 'team', 'projects', 'blog', 'videos', 'gallery', 'custom'],
    templateCategories: ['education', 'business', 'minimal', 'saas'],
    industries: ['Online Course', 'Tutoring', 'School', 'Corporate Training', 'Other'],
  },
  {
    id: 'healthcare-clinic',
    title: 'Healthcare / Clinic',
    subtitle: 'Services, team, trust signals, and appointments',
    icon: '🏥',
    examples: 'Clinic, dentist, therapist, wellness center',
    recommendedSections: ['hero', 'about', 'services', 'team', 'faq', 'testimonials', 'contact'],
    optionalSections: ['stats', 'gallery', 'pricing', 'blog', 'videos', 'custom'],
    templateCategories: ['healthcare', 'business', 'minimal'],
    industries: ['General Practice', 'Dental', 'Mental Health', 'Wellness', 'Other'],
  },
  {
    id: 'photography-studio',
    title: 'Photography Studio',
    subtitle: 'Gallery-first layout for visual portfolios',
    icon: '📷',
    examples: 'Wedding photographer, portrait, commercial',
    recommendedSections: ['hero', 'gallery', 'about', 'services', 'pricing', 'testimonials', 'contact'],
    optionalSections: ['stats', 'blog', 'videos', 'faq', 'team', 'social', 'custom'],
    templateCategories: ['photographer', 'creative', 'event'],
    industries: ['Wedding', 'Portrait', 'Commercial', 'Fashion', 'Other'],
  },
  {
    id: 'resume-cv',
    title: 'Resume / CV',
    subtitle: 'Clean one-page professional profile',
    icon: '📄',
    examples: 'Job seeker, graduate, career change',
    recommendedSections: ['hero', 'about', 'experience', 'skills', 'projects', 'contact'],
    optionalSections: ['testimonials', 'stats', 'blog', 'social', 'gallery', 'custom'],
    templateCategories: ['minimal', 'developer', 'business'],
    industries: ['Technology', 'Finance', 'Healthcare', 'Education', 'Other'],
  },
  {
    id: 'blog-writer',
    title: 'Blog / Writer',
    subtitle: 'Articles, about page, and newsletter signup',
    icon: '✍️',
    examples: 'Blogger, journalist, content creator',
    recommendedSections: ['hero', 'about', 'blog', 'social', 'contact'],
    optionalSections: ['projects', 'testimonials', 'videos', 'stats', 'pricing', 'gallery', 'custom'],
    templateCategories: ['minimal', 'creative', 'business', 'blog'],
    industries: ['Lifestyle', 'Tech', 'Travel', 'Business', 'Other'],
  },
  {
    id: 'music-artist',
    title: 'Music / Artist',
    subtitle: 'Videos, gallery, tour dates, and fan contact',
    icon: '🎵',
    examples: 'Musician, band, DJ, producer',
    recommendedSections: ['hero', 'about', 'videos', 'gallery', 'social', 'contact'],
    optionalSections: ['projects', 'stats', 'testimonials', 'pricing', 'blog', 'custom'],
    templateCategories: ['creative', 'event'],
    industries: ['Solo Artist', 'Band', 'DJ', 'Producer', 'Other'],
  },
  {
    id: 'fitness-coach',
    title: 'Fitness / Coach',
    subtitle: 'Programs, results, pricing, and booking',
    icon: '💪',
    examples: 'Personal trainer, yoga, nutrition coach',
    recommendedSections: ['hero', 'about', 'services', 'pricing', 'testimonials', 'faq', 'contact'],
    optionalSections: ['stats', 'gallery', 'videos', 'blog', 'team', 'social', 'custom'],
    templateCategories: ['fitness', 'business', 'creative'],
    industries: ['Personal Training', 'Yoga', 'Nutrition', 'CrossFit', 'Other'],
  },
  {
    id: 'law-consulting',
    title: 'Law / Consulting',
    subtitle: 'Credibility, practice areas, and consultations',
    icon: '⚖️',
    examples: 'Law firm, accountant, financial advisor',
    recommendedSections: ['hero', 'about', 'services', 'team', 'faq', 'testimonials', 'contact'],
    optionalSections: ['projects', 'stats', 'pricing', 'gallery', 'blog', 'custom'],
    templateCategories: ['legal', 'business', 'minimal'],
    industries: ['Legal', 'Accounting', 'Financial Advisory', 'Management Consulting', 'Other'],
  },
  {
    id: 'construction-trades',
    title: 'Construction / Trades',
    subtitle: 'Projects gallery, services, and quote requests',
    icon: '🔨',
    examples: 'Contractor, plumber, electrician, architect',
    recommendedSections: ['hero', 'about', 'services', 'gallery', 'testimonials', 'contact'],
    optionalSections: ['projects', 'stats', 'pricing', 'faq', 'team', 'blog', 'custom'],
    templateCategories: ['construction', 'business', 'realestate'],
    industries: ['General Contractor', 'Plumbing', 'Electrical', 'Architecture', 'Landscaping', 'Other'],
  },
  {
    id: 'travel-hospitality',
    title: 'Travel / Hospitality',
    subtitle: 'Destinations, packages, gallery, and bookings',
    icon: '✈️',
    examples: 'Hotel, tour operator, travel blogger',
    recommendedSections: ['hero', 'about', 'gallery', 'services', 'pricing', 'testimonials', 'contact'],
    optionalSections: ['stats', 'faq', 'blog', 'videos', 'team', 'social', 'custom'],
    templateCategories: ['travel', 'business', 'creative', 'restaurant'],
    industries: ['Hotel', 'Tour Operator', 'Travel Agency', 'Resort', 'Other'],
  },
];

export const PURPOSE_MAP = Object.fromEntries(
  WEBSITE_PURPOSES.map(p => [p.id, p]),
) as Record<WebsitePurpose, PurposeConfig>;

export const CATEGORY_LABELS: Record<TemplateCategory, string> = {
  developer: 'Developer',
  designer: 'Designer',
  photographer: 'Photography',
  model: 'Model / Influencer',
  agency: 'Agency',
  minimal: 'Minimal',
  creative: 'Creative',
  business: 'Business',
  ecommerce: 'E-Commerce',
  restaurant: 'Restaurant',
  realestate: 'Real Estate',
  saas: 'SaaS / Startup',
  event: 'Event / Wedding',
  nonprofit: 'Nonprofit',
  education: 'Education',
  healthcare: 'Healthcare',
  fitness: 'Fitness',
  legal: 'Legal',
  travel: 'Travel',
  construction: 'Construction',
  blog: 'Blog / Magazine',
  landing: 'Landing Page',
  marketplace: 'Marketplace',
};

export const CATEGORY_EMOJI: Record<string, string> = {
  developer: '💻', designer: '🎨', photographer: '📷', model: '✨', agency: '🏢',
  minimal: '⬜', creative: '🌈', business: '💼', ecommerce: '🛒', restaurant: '🍽️',
  realestate: '🏠', saas: '🚀', event: '💒', nonprofit: '❤️', education: '🎓',
  healthcare: '🏥', fitness: '💪', legal: '⚖️', travel: '✈️', construction: '🔨',
  blog: '📰', landing: '🎯', marketplace: '🏪',
};

export function getPurposeConfig(purpose: WebsitePurpose): PurposeConfig {
  return PURPOSE_MAP[purpose];
}

/** Returns the context-aware label for a section type given the current purpose */
export function getSectionLabel(type: SectionType, purpose?: WebsitePurpose | null): string {
  if (purpose) {
    const override = PURPOSE_SECTION_LABELS[purpose]?.[type];
    if (override) return override;
  }
  return SECTION_LABELS[type];
}

/** Returns section description hint for a given purpose */
export const PURPOSE_SECTION_HINTS: Partial<Record<WebsitePurpose, Partial<Record<SectionType, string>>>> = {
  'online-store': {
    gallery: 'Show your product photos',
    pricing: 'Display your pricing & offers',
    faq: 'Answer common buyer questions',
    services: 'Highlight product categories',
  },
  'restaurant-food': {
    services: 'List your menu & specials',
    gallery: 'Show mouth-watering photos',
    faq: 'Hours, reservations, allergies',
  },
  'real-estate': {
    projects: 'Show current listings',
    gallery: 'Property photos & tours',
    stats: 'Deals closed, years active',
  },
  'saas-startup': {
    services: 'Highlight key features',
    stats: 'Users, uptime, growth',
    videos: 'Product demo or walkthrough',
  },
  'resume-cv': {
    experience: 'Past jobs & roles',
    skills: 'Tools, languages, abilities',
    projects: 'Things you have built or done',
  },
  'fitness-coach': {
    services: 'Your coaching programs',
    stats: 'Client results & transformations',
    gallery: 'Before/after transformations',
  },
};

export function getAllSectionTypes(): SectionType[] {
  return [
    'hero', 'about', 'skills', 'experience', 'projects', 'gallery', 'testimonials',
    'contact', 'videos', 'services', 'team', 'stats', 'social', 'pricing', 'faq', 'blog', 'custom',
  ];
}

export const SECTION_LABELS: Record<SectionType, string> = {
  hero: 'Hero Banner',
  about: 'About',
  skills: 'Skills',
  experience: 'Experience',
  projects: 'Projects / Portfolio',
  gallery: 'Gallery',
  testimonials: 'Testimonials',
  contact: 'Contact',
  videos: 'Videos',
  services: 'Services',
  team: 'Team',
  stats: 'Stats / Numbers',
  social: 'Social Links',
  pricing: 'Pricing',
  faq: 'FAQ',
  blog: 'Blog',
  custom: 'Custom Section',
};
