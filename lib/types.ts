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

export interface SectionField {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'image' | 'images' | 'video' | 'url' | 'email' | 'list' | 'richtext' | 'select' | 'number' | 'color';
  value: string | string[];
  options?: string[];
}

export interface SectionStyle {
  bgColor?: string;
  bgImage?: string;
  bgOverlay?: number;
  paddingTop?: number;
  paddingBottom?: number;
  textAlign?: 'left' | 'center' | 'right';
  maxWidth?: number;
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

export interface Portfolio {
  id: string;
  name: string;
  templateId: string;
  sections: PortfolioSection[];
  theme: ThemeConfig;
  seo: SEOConfig;
  smtp: SMTPConfig;
  popup: PopupConfig;
  social: SocialLinks;
  language: string;
  createdAt: string;
  updatedAt: string;
  published: boolean;
  slug: string;
}

export interface Template {
  id: string;
  name: string;
  category: 'developer' | 'designer' | 'photographer' | 'model' | 'agency' | 'minimal' | 'creative';
  thumbnail: string;
  description: string;
  defaultSections: SectionType[];
  defaultTheme: ThemeConfig;
}

export type DeviceView = 'desktop' | 'tablet' | 'mobile';
export type ExportFormat = 'html' | 'react' | 'nextjs';

