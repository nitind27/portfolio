import { Portfolio, SectionType } from './types';
import { shouldUseDeveloperContent } from './purpose-wizard';
import { getPurposeConfig } from './website-purposes';

function setField(portfolio: Portfolio, sectionType: SectionType, fieldId: string, value: string | string[]) {
  const sec = portfolio.sections.find(s => s.type === sectionType);
  const field = sec?.fields.find(f => f.id === fieldId);
  if (field && (typeof value === 'string' || Array.isArray(value))) field.value = value;
}

type ContentPack = Partial<Record<SectionType, Record<string, string | string[]>>>;

function buildContentPack(
  name: string,
  tagline: string,
  industry: string,
  location: string,
  purposeTitle: string,
): ContentPack {
  const loc = location || 'Your City';
  const role = industry || purposeTitle;

  return {
    hero: {
      headline: tagline ? name : `Welcome to ${name}`,
      subheadline: tagline || `Quality ${purposeTitle.toLowerCase()} you can trust`,
      description: tagline
        ? `${name} — ${tagline}. Explore what we offer and get in touch today.`
        : `Discover ${name} — dedicated to delivering exceptional ${purposeTitle.toLowerCase()} experiences.`,
    },
    about: {
      title: `About ${name}`,
      subtitle: tagline,
      role,
      bio: `${name} is a trusted ${purposeTitle.toLowerCase()} serving clients with care, quality, and professionalism. ${tagline ? tagline + '.' : 'We look forward to welcoming you.'}`,
      location: loc,
      highlights: ['Experienced Team', 'Quality Service', 'Customer Focused'],
      availability: 'Open for inquiries',
    },
    contact: {
      subtitle: `We'd love to hear from you — reach out to ${name} today.`,
      message: `Have a question or want to learn more? Contact ${name} and our team will get back to you shortly.`,
      location: loc,
      hours: 'Mon – Sat, 9:00 AM – 6:00 PM',
      responseTime: 'We typically respond within 24 hours',
    },
    skills: {
      title: 'What We Offer',
      skills: ['Quality Service', 'Expert Team', 'Fast Response', 'Trusted Brand', 'Great Value'],
    },
    services: {
      title: 'Our Services',
      services: ['Consultation', 'Core Service', 'Premium Package', 'Support & Follow-up'],
    },
    projects: {
      title: 'Our Work',
      projects: [`Featured work from ${name}`, 'Recent project highlight', 'Client success story'],
    },
    stats: {
      title: 'By The Numbers',
      stats: ['100+ Happy Clients', '5+ Years Experience', '98% Satisfaction'],
    },
    testimonials: {
      subtitle: `What customers say about ${name}`,
    },
    gallery: {
      title: 'Gallery',
    },
    pricing: {
      subtitle: 'Simple, transparent pricing',
    },
    faq: {
      subtitle: 'Common questions answered',
    },
    team: {
      subtitle: `Meet the people behind ${name}`,
    },
    social: {
      title: 'Connect With Us',
      github: '',
    },
    experience: {
      title: 'Experience',
      jobs: [`Current Role — ${role}`, 'Previous Position — Relevant experience'],
    },
  };
}

const PURPOSE_OVERRIDES: Record<string, (name: string, tagline: string, industry: string, location: string) => ContentPack> = {
  'restaurant-food': (name, tagline, industry, location) => ({
    hero: {
      headline: name,
      subheadline: tagline || `Authentic ${industry || 'dining'} experience`,
      description: `Welcome to ${name}. ${tagline || 'Fresh ingredients, warm hospitality, and unforgettable flavours.'}`,
      ctaText: 'View Menu',
      ctaSecondaryText: 'Book a Table',
    },
    about: {
      title: `About ${name}`,
      role: industry || 'Restaurant',
      bio: `${name} brings together great food and a welcoming atmosphere. ${tagline || 'Join us for a memorable dining experience.'}`,
      highlights: ['Fresh Ingredients', 'Skilled Chefs', 'Warm Ambience'],
      location: location || 'Your neighbourhood',
    },
    services: {
      title: 'Menu Highlights',
      services: ['Starters & Appetizers', 'Main Courses', 'Desserts', 'Beverages', 'Chef Specials'],
    },
    gallery: { title: 'Food & Ambience' },
    contact: {
      subtitle: 'Reservations & enquiries',
      message: `Book a table or ask about catering at ${name}.`,
      hours: 'Tue – Sun, 11:00 AM – 11:00 PM',
    },
    faq: {
      subtitle: 'Hours, reservations & dietary options',
    },
  }),
  'online-store': (name, tagline, industry) => ({
    hero: {
      headline: name,
      subheadline: tagline || `Shop ${industry || 'quality products'}`,
      description: `Discover curated ${industry?.toLowerCase() || 'products'} at ${name}.`,
      ctaText: 'Shop Now',
      ctaSecondaryText: 'View Collection',
    },
    about: {
      role: industry || 'Online Store',
      bio: `${name} offers carefully selected products with fast delivery and easy returns.`,
      highlights: ['Fast Shipping', 'Quality Products', 'Easy Returns'],
    },
    gallery: { title: 'Product Gallery' },
    pricing: { title: 'Offers & Pricing', subtitle: 'Great value on every order' },
    services: { title: 'Shop by Category', services: ['New Arrivals', 'Best Sellers', 'Sale Items', 'Gift Sets'] },
  }),
  'healthcare-clinic': (name, tagline, industry, location) => ({
    hero: {
      headline: name,
      subheadline: tagline || `Compassionate ${industry || 'healthcare'}`,
      description: `Your health matters. ${name} provides expert care in a comfortable setting.`,
      ctaText: 'Book Appointment',
      ctaSecondaryText: 'Our Services',
    },
    about: {
      role: industry || 'Healthcare',
      bio: `${name} is committed to patient-centred care with experienced professionals.`,
      highlights: ['Licensed Professionals', 'Modern Facilities', 'Patient-First Care'],
      location: location || 'Your area',
    },
    services: {
      title: 'Treatments & Services',
      services: ['General Consultation', 'Specialist Care', 'Preventive Health', 'Follow-up Visits'],
    },
    contact: {
      message: `Schedule an appointment or ask about our services at ${name}.`,
      hours: 'Mon – Sat, 8:00 AM – 8:00 PM',
    },
  }),
  'real-estate': (name, tagline, industry, location) => ({
    hero: {
      headline: name,
      subheadline: tagline || `${industry || 'Property'} specialist`,
      description: `Find your perfect property with ${name}.`,
      ctaText: 'View Listings',
      ctaSecondaryText: 'Contact Agent',
    },
    about: {
      role: industry || 'Real Estate',
      bio: `${name} helps buyers and sellers navigate the property market with expertise and integrity.`,
      location: location || 'Your region',
    },
    projects: { title: 'Featured Listings', projects: ['3 BHK Apartment — Prime Location', 'Commercial Space — City Centre', 'Villa — Gated Community'] },
    gallery: { title: 'Property Gallery' },
    services: { title: 'Our Services', services: ['Buy Property', 'Sell Property', 'Rent & Lease', 'Property Valuation'] },
    stats: { stats: ['200+ Properties Sold', '10+ Years Experience', '500+ Happy Clients'] },
  }),
  'education-course': (name, tagline, industry) => ({
    hero: {
      headline: name,
      subheadline: tagline || `Learn ${industry || 'with experts'}`,
      ctaText: 'Enroll Now',
      ctaSecondaryText: 'View Courses',
    },
    about: {
      role: industry || 'Education',
      bio: `${name} empowers learners with structured programs and expert instructors.`,
      highlights: ['Expert Instructors', 'Flexible Learning', 'Certified Programs'],
    },
    services: {
      title: 'Courses & Programs',
      services: ['Beginner Course', 'Advanced Program', 'Workshops', 'Corporate Training'],
    },
    pricing: { title: 'Enrollment Plans' },
  }),
  'fitness-coach': (name, tagline, industry) => ({
    hero: {
      headline: name,
      subheadline: tagline || `Transform with ${industry || 'expert coaching'}`,
      ctaText: 'Start Training',
      ctaSecondaryText: 'View Programs',
    },
    about: {
      role: industry || 'Fitness Coach',
      bio: `${name} helps you build strength, confidence, and healthy habits with personalised coaching.`,
      highlights: ['Personalised Plans', 'Proven Results', 'Nutrition Guidance'],
    },
    services: {
      title: 'Training Programs',
      services: ['1-on-1 Coaching', 'Group Sessions', 'Online Training', 'Nutrition Plans'],
    },
    gallery: { title: 'Transformations' },
    stats: { stats: ['200+ Clients Coached', '95% Goal Achievement', '5+ Years Coaching'] },
  }),
  'event-wedding': (name, tagline, industry) => ({
    hero: {
      headline: name,
      subheadline: tagline || industry || 'Join us in celebration',
      description: tagline || `Celebrate with ${name} — an unforgettable occasion.`,
      ctaText: 'RSVP',
      ctaSecondaryText: 'Event Details',
    },
    about: {
      title: 'Our Story',
      role: industry || 'Event',
      bio: tagline || `We invite you to be part of this special celebration with ${name}.`,
    },
    gallery: { title: 'Moments & Memories' },
    faq: { subtitle: 'RSVP, dress code & directions' },
    services: { title: 'Schedule', services: ['Ceremony', 'Reception', 'Dinner', 'Entertainment'] },
  }),
  'photography-studio': (name, tagline, industry) => ({
    hero: {
      headline: name,
      subheadline: tagline || `${industry || 'Photography'} that tells your story`,
      ctaText: 'View Portfolio',
      ctaSecondaryText: 'Book a Session',
    },
    about: {
      role: industry || 'Photographer',
      bio: `${name} captures authentic moments with artistic vision and technical excellence.`,
      highlights: ['Award-Winning Work', 'Natural Style', 'Fast Delivery'],
    },
    gallery: { title: 'Portfolio' },
    services: {
      title: 'Shoot Packages',
      services: ['Portrait Session', 'Wedding Coverage', 'Commercial Shoot', 'Event Photography'],
    },
  }),
  'music-artist': (name, tagline, industry) => ({
    hero: {
      headline: name,
      subheadline: tagline || `${industry || 'Music'} from the heart`,
      ctaText: 'Listen Now',
      ctaSecondaryText: 'Book / Contact',
    },
    about: {
      role: industry || 'Artist',
      bio: `${name} — ${tagline || 'creating music that connects with audiences everywhere.'}`,
    },
    projects: { title: 'Discography', projects: ['Latest Album', 'Popular Single', 'Live EP'] },
    videos: { title: 'Music Videos' },
    social: { title: 'Stream & Follow' },
  }),
  'blog-writer': (name, tagline, industry) => ({
    hero: {
      headline: name,
      subheadline: tagline || `Stories on ${industry || 'life & culture'}`,
      ctaText: 'Read Latest',
      ctaSecondaryText: 'Subscribe',
    },
    about: {
      role: industry || 'Writer',
      bio: `${name} shares thoughtful articles, guides, and stories for curious readers.`,
    },
    blog: { title: 'Latest Articles', subtitle: tagline || 'Fresh posts and insights' },
    social: { title: 'Follow & Subscribe' },
  }),
  'nonprofit-charity': (name, tagline, industry) => ({
    hero: {
      headline: name,
      subheadline: tagline || `Making a difference in ${industry || 'our community'}`,
      ctaText: 'Donate',
      ctaSecondaryText: 'Our Mission',
    },
    about: {
      role: industry || 'Nonprofit',
      bio: `${name} works to create lasting positive change. ${tagline || 'Join us in our mission.'}`,
      highlights: ['Transparent Impact', 'Community Driven', 'Volunteer Friendly'],
    },
    stats: { title: 'Our Impact', stats: ['10,000+ Lives Impacted', '50+ Volunteers', '15+ Active Programs'] },
    services: { title: 'Our Programs', services: ['Education Initiative', 'Health Outreach', 'Community Support', 'Awareness Campaigns'] },
    pricing: { title: 'Ways to Give' },
  }),
  'law-consulting': (name, tagline, industry) => ({
    hero: {
      headline: name,
      subheadline: tagline || `Trusted ${industry || 'legal'} counsel`,
      ctaText: 'Book Consultation',
      ctaSecondaryText: 'Practice Areas',
    },
    about: {
      role: industry || 'Legal Practice',
      bio: `${name} provides clear, professional legal guidance for individuals and businesses.`,
      highlights: ['Experienced Attorneys', 'Confidential Service', 'Proven Track Record'],
    },
    services: {
      title: 'Practice Areas',
      services: ['Corporate Law', 'Family Law', 'Property Law', 'Litigation'],
    },
    projects: { title: 'Notable Outcomes' },
  }),
  'construction-trades': (name, tagline, industry, location) => ({
    hero: {
      headline: name,
      subheadline: tagline || `Quality ${industry || 'construction'} services`,
      ctaText: 'Get a Quote',
      ctaSecondaryText: 'Our Projects',
    },
    about: {
      role: industry || 'Contractor',
      bio: `${name} delivers reliable construction and renovation with skilled tradespeople.`,
      location: location || 'Your service area',
      highlights: ['Licensed & Insured', 'On-Time Delivery', 'Quality Materials'],
    },
    projects: { title: 'Completed Projects', projects: ['Residential Renovation', 'Commercial Build', 'Kitchen Remodel'] },
    gallery: { title: 'Work Gallery' },
    services: { title: 'Services', services: ['New Construction', 'Renovation', 'Repairs', 'Maintenance'] },
  }),
  'travel-hospitality': (name, tagline, industry, location) => ({
    hero: {
      headline: name,
      subheadline: tagline || `Unforgettable ${industry || 'travel'} experiences`,
      ctaText: 'Explore Packages',
      ctaSecondaryText: 'Contact Us',
    },
    about: {
      role: industry || 'Travel',
      bio: `${name} crafts memorable journeys across ${location || 'beautiful destinations'}.`,
      location: location || 'Multiple destinations',
    },
    gallery: { title: 'Destinations' },
    services: {
      title: 'Tours & Packages',
      services: ['Weekend Getaway', 'Adventure Tour', 'Luxury Escape', 'Group Packages'],
    },
  }),
  'agency-studio': (name, tagline, industry) => ({
    hero: {
      headline: name,
      subheadline: tagline || `Creative ${industry || 'agency'} that delivers results`,
      ctaText: 'View Work',
      ctaSecondaryText: 'Start a Project',
    },
    about: {
      role: industry || 'Creative Agency',
      bio: `${name} partners with brands to create bold campaigns and memorable experiences.`,
      highlights: ['Award-Winning Team', 'Data-Driven Strategy', 'End-to-End Delivery'],
    },
    projects: { title: 'Case Studies', projects: ['Brand Refresh — Retail Client', 'Campaign Launch — Tech Startup', 'Website Redesign — SaaS'] },
    services: { title: 'What We Do', services: ['Branding', 'Web Design', 'Marketing', 'Content Creation'] },
    stats: { stats: ['150+ Campaigns', '40+ Team Members', '12+ Industry Awards'] },
  }),
  'business-company': (name, tagline, industry, location) => ({
    hero: {
      headline: tagline ? `Welcome to ${name}` : name,
      subheadline: tagline || `Leading ${industry || 'business'} solutions`,
      ctaText: 'Our Services',
      ctaSecondaryText: 'Contact Us',
    },
    about: {
      role: industry || 'Business',
      bio: `${name} is a trusted company delivering quality products and services to clients worldwide.`,
      location: location || 'Global',
      highlights: ['Industry Leader', 'Customer Focused', 'Innovation Driven'],
    },
    services: { title: 'What We Offer', services: ['Core Service', 'Consulting', 'Support', 'Enterprise Solutions'] },
    stats: { stats: ['500+ Clients', '15+ Years', '24/7 Support'] },
  }),
  'freelancer-services': (name, tagline, industry) => ({
    hero: {
      headline: name,
      subheadline: tagline || `Professional ${industry || 'freelance'} services`,
      ctaText: 'Hire Me',
      ctaSecondaryText: 'View Work',
    },
    about: {
      role: industry || 'Freelancer',
      bio: `I help clients achieve their goals through expert ${industry?.toLowerCase() || 'services'}. ${tagline || ''}`,
      highlights: ['Fast Turnaround', 'Clear Communication', 'Satisfaction Guaranteed'],
    },
    services: {
      title: 'Services Offered',
      services: ['Strategy & Planning', 'Execution & Delivery', 'Ongoing Support', 'Custom Packages'],
    },
    pricing: { title: 'Rates & Packages' },
  }),
  'resume-cv': (name, tagline, industry) => ({
    hero: {
      headline: name,
      subheadline: tagline || `Experienced ${industry || 'professional'}`,
      ctaText: 'Download CV',
      ctaSecondaryText: 'Contact Me',
    },
    about: {
      title: 'Profile',
      role: industry || 'Professional',
      bio: tagline || `${name} — motivated professional with a track record of delivering results.`,
      highlights: ['Strong Communicator', 'Results Oriented', 'Team Player'],
    },
    experience: {
      title: 'Work Experience',
      jobs: [`Senior ${industry || 'Role'} — Current Company (2022–Present)`, `${industry || 'Role'} — Previous Company (2019–2022)`],
    },
    skills: {
      title: 'Core Skills',
      skills: ['Leadership', 'Communication', 'Problem Solving', 'Project Management', 'Analytics'],
    },
    projects: { title: 'Key Achievements' },
  }),
  'personal-portfolio': (name, tagline, industry) => ({
    hero: {
      headline: name,
      subheadline: tagline || `Creative ${industry || 'professional'}`,
      ctaText: 'View My Work',
      ctaSecondaryText: 'Contact Me',
    },
    about: {
      title: 'About Me',
      role: industry || 'Creative Professional',
      bio: tagline || `I'm ${name}, passionate about creating meaningful work in ${industry?.toLowerCase() || 'my field'}.`,
      highlights: ['Creative Thinker', 'Detail Oriented', 'Collaborative'],
    },
    skills: {
      title: 'Skills & Tools',
      skills: industry === 'Technology'
        ? ['React:90', 'TypeScript:85', 'Node.js:80', 'Design Systems:85', 'UI/UX:88']
        : ['Creative Direction', 'Visual Design', 'Brand Strategy', 'Client Communication', 'Project Delivery'],
    },
    projects: { title: 'Selected Work' },
  }),
};

const DEV_CONTENT: ContentPack = {
  hero: {
    headline: "Hi, I'm John Doe",
    subheadline: 'Full Stack Developer & Designer',
    description: 'I build beautiful, performant web experiences.',
    ctaText: 'View My Work',
    ctaSecondaryText: 'Contact Me',
  },
  about: {
    title: 'About Me',
    subtitle: 'Turning ideas into elegant digital experiences',
    role: 'Full Stack Developer & UI Designer',
    bio: 'I am a passionate developer with 5+ years of experience building modern web applications. I love crafting clean, user-focused products that solve real problems and delight users.',
    highlights: ['5+ Years Experience', '50+ Projects Delivered', '20+ Happy Clients'],
    availability: 'Open to freelance & full-time opportunities',
  },
  skills: {
    title: 'Skills & Expertise',
    skills: ['React:90', 'TypeScript:85', 'Node.js:80', 'Python:75', 'AWS:70', 'Docker:72'],
  },
  projects: {
    title: 'Featured Projects',
    projects: ['Project Alpha - A SaaS platform', 'Project Beta - Mobile app'],
  },
  contact: {
    subtitle: "Let's build something amazing together",
    message: "Have a project in mind or want to collaborate? I'd love to hear from you.",
  },
  experience: {
    title: 'Work Experience',
    jobs: ['Senior Developer @ TechCorp (2022-Present)', 'Frontend Dev @ StartupXYZ (2020-2022)'],
  },
  social: { title: 'Find Me Online' },
};

function applyPack(portfolio: Portfolio, pack: ContentPack) {
  for (const [sectionType, fields] of Object.entries(pack)) {
    for (const [fieldId, value] of Object.entries(fields)) {
      setField(portfolio, sectionType as SectionType, fieldId, value);
    }
  }
}

export function applyPurposeSectionContent(portfolio: Portfolio): Portfolio {
  const meta = portfolio.meta;
  if (!meta?.purpose) return portfolio;

  const name = meta.businessName?.trim() || portfolio.name;
  const tagline = meta.tagline?.trim() || '';
  const industry = meta.industry?.trim() || '';
  const location = meta.location?.trim() || '';
  const purpose = meta.purpose;
  const purposeCfg = getPurposeConfig(purpose);

  if (shouldUseDeveloperContent(purpose, industry)) {
    applyPack(portfolio, DEV_CONTENT);
    setField(portfolio, 'hero', 'headline', tagline ? name : (DEV_CONTENT.hero?.headline as string) || name);
    if (tagline) {
      setField(portfolio, 'hero', 'subheadline', tagline);
      setField(portfolio, 'about', 'subtitle', tagline);
    }
    setField(portfolio, 'about', 'title', `About ${name}`);
    setField(portfolio, 'about', 'role', industry || 'Full Stack Developer');
    if (location) {
      setField(portfolio, 'about', 'location', location);
      setField(portfolio, 'contact', 'location', location);
    }
    return portfolio;
  }

  const base = buildContentPack(name, tagline, industry, location, purposeCfg.title);
  const specific = PURPOSE_OVERRIDES[purpose]?.(name, tagline, industry, location) || {};

  const merged: ContentPack = { ...base };
  for (const [sec, fields] of Object.entries(specific)) {
    merged[sec as SectionType] = { ...merged[sec as SectionType], ...fields };
  }

  applyPack(portfolio, merged);
  return portfolio;
}
