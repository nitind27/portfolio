import { TourStep } from '@/components/builder/OnboardingTour';

export const DASHBOARD_TOUR_STEPS: TourStep[] = [
  {
    placement: 'center',
    title: 'Welcome to Webquro!',
    description: 'Create stunning portfolios in minutes. Let us walk you through the basics — it only takes a minute.',
  },
  {
    target: 'new-portfolio',
    placement: 'bottom',
    title: 'Create Your First Portfolio',
    description: 'Click "New Portfolio" to start. Pick a template, give it a name, and you are ready to customize.',
  },
  {
    target: 'stats',
    placement: 'bottom',
    title: 'Track Your Work',
    description: 'See all your portfolios, published sites, and drafts at a glance from this dashboard.',
  },
];

export const BUILDER_TOUR_STEPS: TourStep[] = [
  {
    placement: 'center',
    title: 'Welcome to the Builder!',
    description: 'This is where you design your portfolio. Follow the steps to learn what each area does.',
  },
  {
    target: 'sections-panel',
    placement: 'right',
    mobilePanel: 'sections',
    title: 'Sections Panel',
    description: 'All your page sections live here. Click a section to edit it, drag the handle to reorder, or add new sections.',
  },
  {
    target: 'canvas-preview',
    placement: 'bottom',
    mobilePanel: 'preview',
    title: 'Live Preview',
    description: 'See changes instantly as you edit. This is exactly how your portfolio will look to visitors.',
  },
  {
    target: 'device-view',
    placement: 'bottom',
    mobilePanel: 'preview',
    title: 'Device Preview',
    description: 'Switch between Desktop, Tablet, and Mobile views to check how your site looks on every screen.',
  },
  {
    target: 'panel-tabs',
    placement: 'bottom',
    mobilePanel: 'preview',
    title: 'Customize Everything',
    description: 'Use these tabs to change theme colors, pick templates, set SEO, configure email, and more.',
  },
  {
    target: 'settings-panel',
    placement: 'left',
    mobilePanel: 'settings',
    title: 'Settings Panel',
    description: 'The active tab opens here. Adjust colors, fonts, spacing, and all portfolio settings in real time.',
  },
  {
    target: 'export-share',
    placement: 'bottom',
    mobilePanel: 'preview',
    title: 'Share & Export',
    description: 'Publish your portfolio with a shareable link, or export as HTML, React, or Next.js ZIP file.',
  },
];
