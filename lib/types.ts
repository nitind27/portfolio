export type SectionType =
  | 'hero'
  | 'about'
  | 'skills'
  | 'experience'
  | 'projects'
  | 'gallery'
  | 'testimonials'
  | 'contact'
  | 'videos'
  | 'services'
  | 'team'
  | 'stats'
  | 'social'
  | 'pricing'
  | 'faq'
  | 'blog'
  | 'custom';

export interface BlogPostBlock {
  id: string;
  title: string;
  date: string;
  summary: string;
  body: string;
  image: string;
  link: string;
  linkLabel: string;
  list: string[];
}

export interface TestimonialBlock {
  id: string;
  quote: string;
  author: string;
  role: string;
  company: string;
  rating: number;
  image: string;
}

export interface TeamMemberBlock {
  id: string;
  name: string;
  role: string;
  bio: string;
  image: string;
  linkedin: string;
  twitter: string;
  email: string;
}

export interface PricingPlanBlock {
  id: string;
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  ctaText: string;
  ctaLink: string;
  featured: boolean;
}

export interface FAQItemBlock {
  id: string;
  question: string;
  answer: string;
}

export interface SectionField {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'image' | 'images' | 'video' | 'url' | 'email' | 'list' | 'richtext' | 'select' | 'number' | 'color' | 'blogposts' | 'testimonialitems' | 'teamitems' | 'pricingplans' | 'faqitems';
  value: string | string[] | BlogPostBlock[] | TestimonialBlock[] | TeamMemberBlock[] | PricingPlanBlock[] | FAQItemBlock[];
  options?: string[];
}

export type SectionEntranceType =
  | 'inherit'
  | 'none'
  | 'fade'
  | 'slide-up'
  | 'slide-down'
  | 'slide-left'
  | 'slide-right'
  | 'scale'
  | 'zoom-in'
  | 'zoom-out'
  | 'flip'
  | 'blur'
  | 'rotate'
  | 'bounce-in'
  | 'elastic'
  | 'pop'
  | 'swing'
  | 'reveal';

export type HeroBlockId = 'badge' | 'headline' | 'subheadline' | 'description' | 'cta' | 'social';
export type HeroAlignH = 'left' | 'center' | 'right';
export type HeroAlignV = 'top' | 'center' | 'bottom';

export interface HeroBlockSettings {
  visible?: boolean;
  entrance?: SectionEntranceType;
  delay?: number;
  duration?: number;
}

export interface HeroContentSettings {
  alignH?: HeroAlignH;
  alignV?: HeroAlignV;
  maxWidth?: number;
  badgeText?: string;
  showBadge?: boolean;
  staggerBlocks?: boolean;
  blockOrder?: HeroBlockId[];
  blocks?: Partial<Record<HeroBlockId, HeroBlockSettings>>;
}

export type SectionAnimTrigger = 'scroll' | 'load';
export type SectionAnimEasing = 'smooth' | 'snappy' | 'bounce' | 'spring' | 'linear';

export interface SectionAnimation {
  custom?: boolean;
  entrance?: SectionEntranceType;
  trigger?: SectionAnimTrigger;
  duration?: number;
  delay?: number;
  distance?: number;
  scaleFrom?: number;
  opacityFrom?: number;
  easing?: SectionAnimEasing;
  staggerChildren?: boolean;
  staggerDelay?: number;
  hoverEnabled?: boolean;
  hoverScale?: number;
  hoverLift?: number;
}

export interface SectionStyle {
  bgColor?: string;
  bgImage?: string;
  bgOverlay?: number;
  paddingTop?: number;
  paddingBottom?: number;
  textAlign?: 'left' | 'center' | 'right';
  maxWidth?: number;
  animation?: SectionAnimation;
  heroContent?: HeroContentSettings;
}

export interface PortfolioSection {
  id: string;
  type: SectionType;
  title: string;
  visible: boolean;
  fields: SectionField[];
  order: number;
  style?: SectionStyle;
  heroLayout?: 'text-only' | 'image-right' | 'image-left' | 'banner' | 'slideshow' | 'split';
}

export interface PopupConfig {
  enabled: boolean;
  type: 'message' | 'email-capture' | 'announcement';
  title: string;
  message: string;
  buttonText: string;
  delay: number;
  bgColor: string;
  textColor: string;
  showOnce: boolean;
}

export interface ThemeConfig {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  fontFamily: string;
  fontSize: 'sm' | 'md' | 'lg';
  borderRadius: 'none' | 'sm' | 'md' | 'lg' | 'full';
  spacing: 'compact' | 'normal' | 'relaxed';
  animation: 'none' | 'subtle' | 'moderate' | 'expressive';
  customCSS?: string;
}

export interface SEOConfig {
  title: string;
  description: string;
  keywords: string;
  ogImage: string;
  favicon: string;
  twitterHandle?: string;
  canonicalUrl?: string;
}

export interface SMTPConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  password: string;
  fromName: string;
  toEmail: string;
  provider: 'custom' | 'gmail' | 'outlook' | 'sendgrid' | 'mailgun';
}

export type NavbarDesktopMenu = 'links' | 'menu' | 'floating';
export type NavbarMenuStyle = 'drawer-right' | 'drawer-left' | 'fullscreen' | 'bottom-popup';
export type NavbarMenuIcon = 'dots' | 'hamburger';
export type NavbarScrollBehavior = 'none' | 'float-on-scroll' | 'compact-on-scroll';
export type NavbarScrollAnimation = 'smooth' | 'fade' | 'slide' | 'scale' | 'spring';

export interface NavbarConfig {
  brandName: string;
  tagline: string;
  logoImage: string;
  style: 'glass' | 'solid' | 'gradient' | 'transparent';
  layout: 'standard' | 'centered' | 'minimal';
  showLogo: boolean;
  showTagline: boolean;
  showCta: boolean;
  ctaText: string;
  ctaLink: string;
  showSocial: boolean;
  linkStyle: 'underline' | 'pill' | 'minimal';
  linkGap: number;
  linkPaddingX: number;
  sticky: boolean;
  desktopMenu: NavbarDesktopMenu;
  desktopMenuStyle: NavbarMenuStyle;
  mobileMenu: NavbarMenuStyle;
  menuIcon: NavbarMenuIcon;
  scrollBehavior: NavbarScrollBehavior;
  scrollAnimation: NavbarScrollAnimation;
}

export interface FooterConfig {
  enabled: boolean;
  showCta: boolean;
  ctaTitle: string;
  ctaSubtitle: string;
  ctaButtonText: string;
  showBrand: boolean;
  showDescription: boolean;
  customDescription: string;
  showLiveBadge: boolean;
  showNavigation: boolean;
  navHeading: string;
  showContact: boolean;
  contactHeading: string;
  showSocial: boolean;
  socialHeading: string;
  showCopyright: boolean;
  copyrightText: string;
  showBackToTop: boolean;
  showBuiltWith: boolean;
}

export interface SocialLinks {
  github?: string;
  linkedin?: string;
  twitter?: string;
  instagram?: string;
  youtube?: string;
  dribbble?: string;
  behance?: string;
  website?: string;
}

export interface AnalyticsData {
  views: number[];
  visitors: number[];
  labels: string[];
}

export type WebsitePurpose =
  | 'personal-portfolio'
  | 'freelancer-services'
  | 'business-company'
  | 'agency-studio'
  | 'online-store'
  | 'restaurant-food'
  | 'real-estate'
  | 'saas-startup'
  | 'event-wedding'
  | 'nonprofit-charity'
  | 'education-course'
  | 'healthcare-clinic'
  | 'photography-studio'
  | 'resume-cv'
  | 'blog-writer'
  | 'music-artist'
  | 'fitness-coach'
  | 'law-consulting'
  | 'construction-trades'
  | 'travel-hospitality';

export interface PortfolioMeta {
  purpose: WebsitePurpose;
  businessName?: string;
  industry?: string;
  tagline?: string;
  layoutPreset?: string;
}

export interface Portfolio {
  id: string;
  name: string;
  templateId: string;
  sections: PortfolioSection[];
  theme: ThemeConfig;
  seo: SEOConfig;
  smtp: SMTPConfig;
  popup: PopupConfig;
  navbar: NavbarConfig;
  footer: FooterConfig;
  social: SocialLinks;
  language: string;
  createdAt: string;
  updatedAt: string;
  published: boolean;
  slug: string;
  meta?: PortfolioMeta;
  hosting?: PortfolioHosting;
}

export interface PortfolioHosting {
  provider: 'hostinger';
  domain: string;
  liveUrl: string;
  status: 'idle' | 'deploying' | 'live' | 'failed';
  lastDeployedAt?: string;
  error?: string;
}

export type TemplateCategory =
  | 'developer'
  | 'designer'
  | 'photographer'
  | 'model'
  | 'agency'
  | 'minimal'
  | 'creative'
  | 'business'
  | 'ecommerce'
  | 'restaurant'
  | 'realestate'
  | 'saas'
  | 'event'
  | 'nonprofit'
  | 'education'
  | 'healthcare'
  | 'fitness'
  | 'legal'
  | 'travel'
  | 'construction'
  | 'blog'
  | 'landing'
  | 'marketplace';

export interface Template {
  id: string;
  name: string;
  category: TemplateCategory;
  purposes: WebsitePurpose[];
  thumbnail: string;
  description: string;
  defaultSections: SectionType[];
  defaultTheme: ThemeConfig;
  /** Recommended layout preset — auto-applied when this template is chosen */
  defaultLayoutPreset?: string;
  layoutTags?: string[];
  /** Mini preview layout in template picker */
  previewVariant?: 'split' | 'banner' | 'center' | 'cards' | 'magazine';
}

export interface CreatePortfolioOptions {
  sections?: SectionType[];
  meta?: PortfolioMeta;
  layoutPreset?: string;
}

export type DeviceView = 'desktop' | 'tablet' | 'mobile';
export type ExportFormat = 'html' | 'react' | 'nextjs';

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: 'user' | 'admin';
  isPremium: boolean;
  premiumPurchasedAt: string | null;
  premiumPortfolioId: string | null;
  planId: number | null;
  planSlug?: string | null;
  planName?: string | null;
  authProvider?: 'local' | 'google';
  hasPassword?: boolean;
  avatarUrl?: string | null;
}

export interface UserProfile extends AuthUser {
  memberSince: string;
  googleLinked: boolean;
}

export type PortfolioAccessStatus = 'needs_payment' | 'allowed' | 'bind_on_action' | 'wrong_portfolio';
export type PortfolioAccessAction = 'export' | 'share' | 'publish' | 'deploy';

