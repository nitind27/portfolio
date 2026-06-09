import type { SectionType, WebsitePurpose } from './types';
import { getPurposeConfig, PURPOSE_SECTION_HINTS, getSectionLabel } from './website-purposes';

export interface WizardPurposeCategory {
  id: string;
  label: string;
  description: string;
  icon: string;
  purposes: WebsitePurpose[];
}

export interface PurposeDetailsConfig {
  brandLabel: string;
  brandPlaceholder: string;
  industryLabel: string;
  taglineLabel: string;
  taglinePlaceholder: string;
  showLocation?: boolean;
  locationLabel?: string;
  locationPlaceholder?: string;
}

/** Grouped categories for the purpose picker */
export const WIZARD_PURPOSE_CATEGORIES: WizardPurposeCategory[] = [
  {
    id: 'personal',
    label: 'Personal & Creative',
    description: 'Portfolios, photography, music, writing',
    icon: '🎨',
    purposes: ['personal-portfolio', 'photography-studio', 'music-artist', 'blog-writer', 'resume-cv'],
  },
  {
    id: 'business',
    label: 'Business & Professional',
    description: 'Companies, agencies, freelancers, consulting',
    icon: '🏢',
    purposes: ['business-company', 'agency-studio', 'freelancer-services', 'law-consulting', 'construction-trades'],
  },
  {
    id: 'commerce',
    label: 'Commerce & Property',
    description: 'Shops, restaurants, real estate',
    icon: '🛒',
    purposes: ['online-store', 'restaurant-food', 'real-estate'],
  },
  {
    id: 'tech',
    label: 'Tech & SaaS',
    description: 'Startups, apps, product landing pages',
    icon: '🚀',
    purposes: ['saas-startup'],
  },
  {
    id: 'services',
    label: 'Services & Community',
    description: 'Health, education, fitness, events, travel',
    icon: '💼',
    purposes: ['healthcare-clinic', 'education-course', 'fitness-coach', 'event-wedding', 'nonprofit-charity', 'travel-hospitality'],
  },
];

/** Extra advanced sections per purpose (shown in dedicated group, not pre-selected) */
export const PURPOSE_ADVANCED_SECTIONS: Record<WebsitePurpose, SectionType[]> = {
  'personal-portfolio': ['experience', 'gallery', 'videos', 'blog', 'stats', 'social', 'custom'],
  'freelancer-services': ['projects', 'stats', 'blog', 'videos', 'team', 'social', 'custom'],
  'business-company': ['projects', 'pricing', 'blog', 'videos', 'gallery', 'faq', 'custom'],
  'agency-studio': ['pricing', 'gallery', 'faq', 'blog', 'videos', 'social', 'custom'],
  'online-store': ['blog', 'stats', 'videos', 'team', 'social', 'custom'],
  'restaurant-food': ['stats', 'pricing', 'blog', 'videos', 'team', 'social', 'custom'],
  'real-estate': ['projects', 'team', 'pricing', 'blog', 'faq', 'videos', 'custom'],
  'saas-startup': ['projects', 'team', 'blog', 'videos', 'gallery', 'social', 'custom'],
  'event-wedding': ['services', 'videos', 'team', 'testimonials', 'pricing', 'blog', 'custom'],
  'nonprofit-charity': ['projects', 'blog', 'videos', 'gallery', 'pricing', 'social', 'custom'],
  'education-course': ['stats', 'team', 'projects', 'blog', 'videos', 'gallery', 'custom'],
  'healthcare-clinic': ['stats', 'gallery', 'pricing', 'blog', 'videos', 'social', 'custom'],
  'photography-studio': ['projects', 'stats', 'blog', 'videos', 'faq', 'team', 'custom'],
  'resume-cv': ['testimonials', 'stats', 'blog', 'social', 'gallery', 'custom'],
  'blog-writer': ['projects', 'testimonials', 'videos', 'stats', 'pricing', 'gallery', 'custom'],
  'music-artist': ['projects', 'stats', 'testimonials', 'pricing', 'blog', 'faq', 'custom'],
  'fitness-coach': ['stats', 'gallery', 'videos', 'blog', 'team', 'social', 'custom'],
  'law-consulting': ['projects', 'stats', 'pricing', 'gallery', 'blog', 'videos', 'custom'],
  'construction-trades': ['projects', 'stats', 'pricing', 'faq', 'team', 'blog', 'custom'],
  'travel-hospitality': ['stats', 'faq', 'blog', 'videos', 'team', 'social', 'custom'],
};

const DETAILS_CONFIG: Record<WebsitePurpose, PurposeDetailsConfig> = {
  'personal-portfolio': {
    brandLabel: 'Your Name / Brand',
    brandPlaceholder: 'e.g. Priya Sharma, Studio Nova',
    industryLabel: 'Your field',
    taglineLabel: 'Professional headline',
    taglinePlaceholder: 'e.g. UI/UX Designer crafting memorable brands',
  },
  'freelancer-services': {
    brandLabel: 'Business / Freelancer Name',
    brandPlaceholder: 'e.g. Acme Consulting, Rahul Writes',
    industryLabel: 'Service type',
    taglineLabel: 'Value proposition',
    taglinePlaceholder: 'e.g. Marketing strategy that grows your revenue',
  },
  'business-company': {
    brandLabel: 'Company Name',
    brandPlaceholder: 'e.g. Bloom Technologies Pvt Ltd',
    industryLabel: 'Industry',
    taglineLabel: 'Company tagline',
    taglinePlaceholder: 'e.g. Trusted solutions for modern businesses',
    showLocation: true,
    locationLabel: 'City / Region',
    locationPlaceholder: 'e.g. Mumbai, India',
  },
  'agency-studio': {
    brandLabel: 'Agency Name',
    brandPlaceholder: 'e.g. Pixel Forge Studio',
    industryLabel: 'Agency focus',
    taglineLabel: 'Agency pitch',
    taglinePlaceholder: 'e.g. We design brands that people remember',
  },
  'online-store': {
    brandLabel: 'Store / Brand Name',
    brandPlaceholder: 'e.g. Crafted Goods Co.',
    industryLabel: 'Product category',
    taglineLabel: 'Store tagline',
    taglinePlaceholder: 'e.g. Handcrafted essentials delivered to your door',
  },
  'restaurant-food': {
    brandLabel: 'Restaurant / Café Name',
    brandPlaceholder: 'e.g. Spice Garden, Bloom Bakery',
    industryLabel: 'Cuisine type',
    taglineLabel: 'Dining experience',
    taglinePlaceholder: 'e.g. Authentic flavours, warm hospitality',
    showLocation: true,
    locationLabel: 'Location / Area',
    locationPlaceholder: 'e.g. Bandra West, Mumbai',
  },
  'real-estate': {
    brandLabel: 'Agency / Agent Name',
    brandPlaceholder: 'e.g. Horizon Realty, Jane Kapoor',
    industryLabel: 'Property focus',
    taglineLabel: 'Specialization',
    taglinePlaceholder: 'e.g. Luxury homes & commercial spaces',
    showLocation: true,
    locationLabel: 'Service area',
    locationPlaceholder: 'e.g. Pune & surrounding suburbs',
  },
  'saas-startup': {
    brandLabel: 'Product / Company Name',
    brandPlaceholder: 'e.g. FlowDesk, TaskPilot',
    industryLabel: 'Product category',
    taglineLabel: 'Product pitch',
    taglinePlaceholder: 'e.g. Automate workflows in minutes, not months',
  },
  'event-wedding': {
    brandLabel: 'Event / Couple Name',
    brandPlaceholder: 'e.g. Ananya & Rohit, TechSummit 2026',
    industryLabel: 'Event type',
    taglineLabel: 'Event date / theme',
    taglinePlaceholder: 'e.g. December 14, 2026 — A celebration of love',
  },
  'nonprofit-charity': {
    brandLabel: 'Organization Name',
    brandPlaceholder: 'e.g. Green Earth Foundation',
    industryLabel: 'Cause area',
    taglineLabel: 'Mission statement',
    taglinePlaceholder: 'e.g. Empowering communities through education',
  },
  'education-course': {
    brandLabel: 'School / Course Name',
    brandPlaceholder: 'e.g. CodePath Academy, Maths Mastery',
    industryLabel: 'Subject / niche',
    taglineLabel: 'Learning promise',
    taglinePlaceholder: 'e.g. Master skills with expert-led programs',
  },
  'healthcare-clinic': {
    brandLabel: 'Clinic / Practice Name',
    brandPlaceholder: 'e.g. Wellness Dental, MindCare Therapy',
    industryLabel: 'Specialty',
    taglineLabel: 'Care promise',
    taglinePlaceholder: 'e.g. Compassionate care for every patient',
    showLocation: true,
    locationLabel: 'Clinic location',
    locationPlaceholder: 'e.g. Koramangala, Bangalore',
  },
  'photography-studio': {
    brandLabel: 'Studio / Photographer Name',
    brandPlaceholder: 'e.g. Lens & Light Studio',
    industryLabel: 'Photography style',
    taglineLabel: 'Creative style',
    taglinePlaceholder: 'e.g. Capturing moments that last forever',
  },
  'resume-cv': {
    brandLabel: 'Full Name',
    brandPlaceholder: 'e.g. Amit Verma',
    industryLabel: 'Target role / field',
    taglineLabel: 'Professional summary',
    taglinePlaceholder: 'e.g. Marketing manager with 8+ years in B2B growth',
  },
  'blog-writer': {
    brandLabel: 'Blog / Author Name',
    brandPlaceholder: 'e.g. The Wandering Plate, Sarah Writes',
    industryLabel: 'Writing niche',
    taglineLabel: 'Blog focus',
    taglinePlaceholder: 'e.g. Stories on travel, food & culture',
  },
  'music-artist': {
    brandLabel: 'Artist / Band Name',
    brandPlaceholder: 'e.g. The Midnight Echo',
    industryLabel: 'Genre',
    taglineLabel: 'Artist bio line',
    taglinePlaceholder: 'e.g. Indie rock from the heart of Delhi',
  },
  'fitness-coach': {
    brandLabel: 'Coach / Gym Name',
    brandPlaceholder: 'e.g. FitLife with Priya',
    industryLabel: 'Training focus',
    taglineLabel: 'Transformation promise',
    taglinePlaceholder: 'e.g. Build strength, confidence & healthy habits',
  },
  'law-consulting': {
    brandLabel: 'Firm / Practice Name',
    brandPlaceholder: 'e.g. Kapoor & Associates',
    industryLabel: 'Practice area',
    taglineLabel: 'Expertise summary',
    taglinePlaceholder: 'e.g. Trusted legal counsel for businesses',
  },
  'construction-trades': {
    brandLabel: 'Business Name',
    brandPlaceholder: 'e.g. BuildRight Contractors',
    industryLabel: 'Trade / specialty',
    taglineLabel: 'Service promise',
    taglinePlaceholder: 'e.g. Quality construction, on time & on budget',
    showLocation: true,
    locationLabel: 'Service area',
    locationPlaceholder: 'e.g. Greater Noida & NCR',
  },
  'travel-hospitality': {
    brandLabel: 'Brand / Property Name',
    brandPlaceholder: 'e.g. Himalayan Trails, Oceanview Resort',
    industryLabel: 'Travel niche',
    taglineLabel: 'Experience promise',
    taglinePlaceholder: 'e.g. Unforgettable journeys across India',
    showLocation: true,
    locationLabel: 'Destination / region',
    locationPlaceholder: 'e.g. Kerala backwaters & hill stations',
  },
};

/** Extended hints for all purposes */
export const EXTENDED_SECTION_HINTS: Partial<Record<WebsitePurpose, Partial<Record<SectionType, string>>>> = {
  ...PURPOSE_SECTION_HINTS,
  'personal-portfolio': {
    skills: 'Tools & strengths you offer',
    projects: 'Best work samples',
    experience: 'Roles & career history',
    gallery: 'Visual work showcase',
    testimonials: 'Client or peer reviews',
    blog: 'Articles & case studies',
    videos: 'Demo reel or intro video',
    stats: 'Years active, projects done',
    social: 'LinkedIn, Instagram, etc.',
  },
  'freelancer-services': {
    services: 'What clients can hire you for',
    pricing: 'Packages & hourly rates',
    projects: 'Past client work',
    faq: 'Process, timelines, revisions',
    stats: 'Clients served, years experience',
    testimonials: 'Client success stories',
  },
  'business-company': {
    services: 'What your company offers',
    team: 'Leadership & staff',
    stats: 'Revenue, clients, years in business',
    projects: 'Case studies & success stories',
    pricing: 'Plans or service tiers',
    faq: 'Common client questions',
  },
  'agency-studio': {
    projects: 'Client case studies',
    services: 'Agency capabilities',
    team: 'Creatives & strategists',
    stats: 'Campaigns launched, ROI delivered',
    pricing: 'Retainer & project packages',
  },
  'online-store': {
    gallery: 'Product photos & lookbook',
    pricing: 'Price lists & offers',
    faq: 'Shipping, returns, sizing',
    services: 'Product categories',
    stats: 'Happy customers, products sold',
  },
  'restaurant-food': {
    services: 'Menu categories & specials',
    gallery: 'Food & ambience photos',
    faq: 'Hours, reservations, dietary info',
    pricing: 'Catering & party packages',
    stats: 'Years serving, dishes served',
    team: 'Chef & staff profiles',
  },
  'real-estate': {
    gallery: 'Property photos & tours',
    projects: 'Active listings',
    services: 'Buy, sell, rent services',
    stats: 'Properties sold, years active',
    team: 'Agent profiles',
    faq: 'Buying process, financing',
  },
  'healthcare-clinic': {
    services: 'Treatments & procedures',
    team: 'Doctors & specialists',
    faq: 'Appointments, insurance, hours',
    stats: 'Patients treated, years serving',
    gallery: 'Clinic facilities',
  },
  'education-course': {
    services: 'Courses & programs',
    pricing: 'Tuition & enrollment plans',
    faq: 'Admission, schedule, certification',
    stats: 'Students trained, pass rate',
    team: 'Instructors & mentors',
  },
  'fitness-coach': {
    services: 'Training programs',
    pricing: 'Coaching packages',
    gallery: 'Transformation photos',
    stats: 'Clients coached, success rate',
    faq: 'Session format, nutrition support',
  },
  'event-wedding': {
    gallery: 'Event photos & venue',
    faq: 'RSVP, dress code, directions',
    services: 'Schedule & programme',
    videos: 'Highlight reel',
    testimonials: 'Guest messages',
  },
  'nonprofit-charity': {
    stats: 'Impact numbers & reach',
    services: 'Programs & initiatives',
    projects: 'Success stories',
    pricing: 'Donation tiers',
    team: 'Volunteers & leadership',
  },
  'photography-studio': {
    gallery: 'Portfolio photos',
    services: 'Shoot packages',
    pricing: 'Session rates',
    faq: 'Booking, delivery, usage rights',
    videos: 'Behind the scenes reel',
  },
  'blog-writer': {
    blog: 'Latest articles',
    social: 'Newsletter & social links',
    projects: 'Featured publications',
    pricing: 'Sponsored content rates',
  },
  'music-artist': {
    videos: 'Music videos & live clips',
    gallery: 'Press & performance photos',
    social: 'Streaming & social links',
    projects: 'Albums & releases',
    pricing: 'Booking & appearance fees',
  },
  'law-consulting': {
    services: 'Practice areas',
    team: 'Attorneys & advisors',
    faq: 'Consultation process, fees',
    projects: 'Notable case outcomes',
    stats: 'Cases won, years practice',
  },
  'construction-trades': {
    gallery: 'Completed work photos',
    projects: 'Past builds & renovations',
    services: 'Trades & specialties',
    faq: 'Quotes, timelines, warranties',
    stats: 'Projects completed',
  },
  'travel-hospitality': {
    gallery: 'Destination photos',
    services: 'Tours & packages',
    pricing: 'Package pricing',
    faq: 'Booking, cancellation policy',
    stats: 'Happy travellers, destinations',
  },
  'resume-cv': {
    experience: 'Work history',
    skills: 'Core competencies',
    projects: 'Key achievements',
    stats: 'Career highlights',
    testimonials: 'References & recommendations',
  },
  'saas-startup': {
    services: 'Product features',
    stats: 'Users, uptime, growth metrics',
    pricing: 'Subscription plans',
    faq: 'Billing, integrations, support',
    videos: 'Product demo walkthrough',
  },
};

export function getPurposeDetailsConfig(purpose: WebsitePurpose): PurposeDetailsConfig {
  return DETAILS_CONFIG[purpose];
}

export function getSectionHint(purpose: WebsitePurpose, type: SectionType): string | undefined {
  return EXTENDED_SECTION_HINTS[purpose]?.[type] ?? PURPOSE_SECTION_HINTS[purpose]?.[type];
}

export function getWizardSectionGroups(purpose: WebsitePurpose) {
  const cfg = getPurposeConfig(purpose);
  const advanced = PURPOSE_ADVANCED_SECTIONS[purpose] || [];
  const recommendedSet = new Set(cfg.recommendedSections);
  const advancedSet = new Set(advanced);
  const optional = cfg.optionalSections.filter(s => !recommendedSet.has(s) && !advancedSet.has(s));

  return {
    recommended: cfg.recommendedSections,
    advanced,
    optional,
  };
}

export function getSectionDisplayLabel(type: SectionType, purpose: WebsitePurpose | null): string {
  return getSectionLabel(type, purpose);
}

const DEV_INDUSTRIES = new Set(['technology', 'development', 'b2b saas', 'b2c app', 'fintech', 'ai / ml']);

export function shouldUseDeveloperContent(purpose: WebsitePurpose, industry?: string): boolean {
  const ind = (industry || '').trim().toLowerCase();
  if (purpose === 'saas-startup') return true;
  if (DEV_INDUSTRIES.has(ind)) return true;
  if (purpose === 'personal-portfolio' && ind === 'technology') return true;
  if (purpose === 'freelancer-services' && ind === 'development') return true;
  if (purpose === 'resume-cv' && ind === 'technology') return true;
  return false;
}
