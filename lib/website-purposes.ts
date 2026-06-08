import { SectionType, TemplateCategory, WebsitePurpose } from './types';

export interface PurposeConfig {
  id: WebsitePurpose;
  title: string;
  subtitle: string;
  icon: string;
  examples: string;
  recommendedSections: SectionType[];
  templateCategories: TemplateCategory[];
  industries: string[];
}

export const WEBSITE_PURPOSES: PurposeConfig[] = [
  {
    id: 'personal-portfolio',
    title: 'Personal Portfolio',
    subtitle: 'Showcase your work, skills, and personality',
    icon: '👤',
    examples: 'Designer, developer, artist, student',
    recommendedSections: ['hero', 'about', 'skills', 'projects', 'testimonials', 'contact'],
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
