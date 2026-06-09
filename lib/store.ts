'use client';
import { create } from 'zustand';
import {
  fetchProjectsFromServer,
  scheduleSaveProjectsToServer,
  flushProjectSave,
  shouldSkipProjectSync,
  type PersistedSlice,
} from './projects-storage';
import { broadcastPreviewUpdate } from './preview-tab';
import {
  Portfolio, PortfolioSection, ThemeConfig, SEOConfig, SMTPConfig,
  PopupConfig, NavbarConfig, FooterConfig, SocialLinks, SectionStyle, DeviceView, SectionType, SectionField, AuthUser,
  CreatePortfolioOptions, PortfolioHosting,
} from './types';
import { TEMPLATES, SECTION_DEFAULTS, findTemplate, resolveTemplateId } from './templates';
import { applyPortfolioMeta } from './apply-portfolio-meta';
import { applyPurposeSectionContent } from './purpose-section-content';
import { applyLayoutPreset, getDefaultLayoutPresetId, LayoutPresetId } from './purpose-layouts';
import { purgeExpiredPortfolios } from './project-expiry';

function genId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function slugify(name: string) {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').slice(0, 40) + '-' + Math.random().toString(36).slice(2, 6);
}

const defaultPopup: PopupConfig = {
  enabled: false, type: 'message', title: 'Welcome!',
  message: 'Thanks for visiting my portfolio. Feel free to reach out!',
  buttonText: 'Got it!', delay: 2, bgColor: '#1a1a2e', textColor: '#ffffff', showOnce: true,
};

const defaultSMTP: SMTPConfig = {
  host: '', port: 587, secure: false, user: '', password: '', fromName: '', toEmail: '', provider: 'custom',
};

const defaultSocial: SocialLinks = {};

const defaultFooter: FooterConfig = {
  enabled: true,
  layout: 'standard',
  style: 'gradient',
  showAccentBar: true,
  columnGap: 'normal',
  showCta: true,
  ctaTitle: 'Ready to work together?',
  ctaSubtitle: "Let's create something great. Reach out anytime.",
  ctaButtonText: 'Get In Touch',
  showBrand: true,
  showDescription: true,
  customDescription: '',
  showLiveBadge: true,
  showNavigation: true,
  navHeading: 'Navigation',
  navLayout: 'list',
  navMaxItems: 0,
  syncNavWithNavbar: true,
  hiddenNavSections: [],
  customNavLabels: {},
  showContact: true,
  contactHeading: 'Contact',
  showSocial: true,
  socialHeading: 'Follow Me',
  showCopyright: true,
  copyrightText: '',
  showBackToTop: true,
  showBuiltWith: true,
};

const defaultNavbar: NavbarConfig = {
  brandName: '',
  tagline: '',
  logoImage: '',
  style: 'glass',
  layout: 'standard',
  showLogo: true,
  showTagline: false,
  showCta: true,
  ctaText: 'Contact Me',
  ctaLink: '#contact',
  showSocial: false,
  linkStyle: 'minimal',
  linkGap: 14,
  linkPaddingX: 10,
  sticky: true,
  desktopMenu: 'links',
  desktopMenuStyle: 'drawer-right',
  mobileMenu: 'drawer-right',
  menuIcon: 'dots',
  scrollBehavior: 'none',
  scrollAnimation: 'smooth',
};

function createDefaultPortfolio(templateId: string, options?: CreatePortfolioOptions): Portfolio {
  const template = findTemplate(templateId) || TEMPLATES[0];
  const sectionTypes = options?.sections?.length ? options.sections : template.defaultSections;
  const sections: PortfolioSection[] = sectionTypes.map((type, i) => {
    const def = SECTION_DEFAULTS[type];
    return {
      id: genId(),
      type,
      title: def.title,
      visible: true,
      // Keep the semantic field id (e.g. 'avatar', 'bannerImages') as-is so the
      // preview can reliably look them up. Only the section id gets a fresh genId.
      fields: def.fields.map(f => ({ ...f })),
      order: i,
    };
  });
  const name = options?.meta?.businessName?.trim() || 'My Website';
  let portfolio: Portfolio = {
    id: genId(), name, templateId, sections,
    theme: { ...template.defaultTheme },
    seo: { title: name, description: options?.meta?.tagline || '', keywords: '', ogImage: '', favicon: '', twitterHandle: '', canonicalUrl: '' },
    smtp: { ...defaultSMTP },
    popup: { ...defaultPopup },
    navbar: { ...defaultNavbar },
    footer: { ...defaultFooter },
    social: { ...defaultSocial },
    language: 'en',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    published: false,
    slug: slugify(name),
    meta: options?.meta,
  };
  if (options?.meta) {
    portfolio = applyPortfolioMeta(portfolio, options.meta);
    portfolio = applyPurposeSectionContent(portfolio);
  }
  const layoutId = (
    options?.layoutPreset ||
    template.defaultLayoutPreset ||
    (options?.meta?.purpose ? getDefaultLayoutPresetId(options.meta.purpose) : null)
  ) as LayoutPresetId | null;
  if (layoutId) portfolio = applyLayoutPreset(portfolio, layoutId);
  return portfolio;
}

const MAX_HISTORY = 30;

export type MobilePanel = 'preview' | 'sections' | 'settings';

interface BuilderState {
  portfolios: Portfolio[];
  activePortfolioId: string | null;
  deviceView: DeviceView;
  previewMode: boolean;
  activeSection: string | null;
  isAuthenticated: boolean;
  user: AuthUser | null;
  authLoading: boolean;
  canvasZoom: number;
  history: Portfolio[][];
  historyIndex: number;
  hasSeenDashboardTour: boolean;
  hasSeenBuilderTour: boolean;
  projectsLoaded: boolean;
  mobilePanel: MobilePanel;
  popupPreviewNonce: number;

  login: (email: string, password: string, rememberMe?: boolean, adminOnly?: boolean) => Promise<{ ok: boolean; error?: string }>;
  register: (data: { name: string; email: string; phone: string; password: string }) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
  initAuth: () => Promise<void>;
  completeDashboardTour: () => void;
  completeBuilderTour: () => void;
  setMobilePanel: (panel: MobilePanel) => void;
  triggerPopupPreview: () => void;

  createPortfolio: (templateId: string, name: string, options?: CreatePortfolioOptions) => string;
  deletePortfolio: (id: string) => void;
  duplicatePortfolio: (id: string) => void;
  setActivePortfolio: (id: string) => void;
  updatePortfolioName: (id: string, name: string) => void;
  togglePublished: (id: string) => void;
  updatePortfolioHosting: (id: string, hosting: PortfolioHosting | undefined) => void;
  purgeExpiredProjects: () => number;

  addSection: (type: SectionType) => void;
  removeSection: (sectionId: string) => void;
  updateSection: (sectionId: string, updates: Partial<PortfolioSection>) => void;
  reorderSections: (sections: PortfolioSection[]) => void;
  toggleSectionVisibility: (sectionId: string) => void;
  updateSectionStyle: (sectionId: string, style: Partial<SectionStyle>) => void;
  updateField: (sectionId: string, fieldId: string, value: any) => void;
  updateFieldLabel: (sectionId: string, fieldId: string, label: string) => void;
  addField: (sectionId: string, field?: Partial<SectionField>) => void;
  removeField: (sectionId: string, fieldId: string) => void;
  reorderFields: (sectionId: string, fields: SectionField[]) => void;

  updateTheme: (updates: Partial<ThemeConfig>) => void;
  switchTemplate: (templateId: string) => void;
  updateSEO: (updates: Partial<SEOConfig>) => void;
  updateSMTP: (updates: Partial<SMTPConfig>) => void;
  updatePopup: (updates: Partial<PopupConfig>) => void;
  updateNavbar: (updates: Partial<NavbarConfig>) => void;
  updateFooter: (updates: Partial<FooterConfig>) => void;
  updateSocial: (updates: Partial<SocialLinks>) => void;
  updateLanguage: (lang: string) => void;

  setDeviceView: (view: DeviceView) => void;
  setPreviewMode: (val: boolean) => void;
  setActiveSection: (id: string | null) => void;
  setCanvasZoom: (zoom: number) => void;

  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  pushHistory: () => void;

  getActivePortfolio: () => Portfolio | null;
}

function updatePortfolios(portfolios: Portfolio[], activeId: string | null, updater: (p: Portfolio) => Portfolio): Portfolio[] {
  return portfolios.map(p => p.id === activeId ? updater(p) : p);
}

function getPersistSlice(state: BuilderState): PersistedSlice {
  return {
    portfolios: state.portfolios,
    hasSeenDashboardTour: state.hasSeenDashboardTour,
    hasSeenBuilderTour: state.hasSeenBuilderTour,
  };
}

async function hydrateProjectsFromServer(
  set: (partial: Partial<BuilderState> | ((s: BuilderState) => Partial<BuilderState>)) => void,
  get: () => BuilderState,
) {
  try {
    const data = await fetchProjectsFromServer();
    if (!data) {
      set({ portfolios: [], activePortfolioId: null, projectsLoaded: false });
      return;
    }
    const activeId = get().activePortfolioId;
    set({
      portfolios: data.portfolios,
      hasSeenDashboardTour: data.hasSeenDashboardTour,
      hasSeenBuilderTour: data.hasSeenBuilderTour,
      projectsLoaded: true,
      activePortfolioId: activeId && data.portfolios.some(p => p.id === activeId) ? activeId : null,
    });
  } catch (e) {
    console.error('Failed to load projects:', e);
    set({ projectsLoaded: false });
  }
}

export const useBuilderStore = create<BuilderState>()(
    (set, get) => ({
      portfolios: [],
      activePortfolioId: null,
      deviceView: 'desktop',
      previewMode: false,
      activeSection: null,
      isAuthenticated: false,
      user: null,
      authLoading: true,
      canvasZoom: 100,
      history: [],
      historyIndex: -1,
      hasSeenDashboardTour: false,
      hasSeenBuilderTour: false,
      projectsLoaded: false,
      mobilePanel: 'preview',
      popupPreviewNonce: 0,

      initAuth: async () => {
        set({ authLoading: true });
        try {
          const res = await fetch('/api/auth/me');
          if (res.ok) {
            const data = await res.json();
            set({ user: data.user, isAuthenticated: true, authLoading: false });
            await hydrateProjectsFromServer(set, get);
          } else {
            set({ user: null, isAuthenticated: false, authLoading: false, portfolios: [], activePortfolioId: null, projectsLoaded: false });
          }
        } catch {
          set({ user: null, isAuthenticated: false, authLoading: false, portfolios: [], activePortfolioId: null, projectsLoaded: false });
        }
      },
      refreshSession: async () => {
        try {
          const res = await fetch('/api/auth/me');
          if (res.ok) {
            const data = await res.json();
            set({ user: data.user, isAuthenticated: true });
            return data.user;
          }
        } catch { /* ignore */ }
        return null;
      },
      login: async (email, password, rememberMe = false, adminOnly = false) => {
        try {
          const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, rememberMe, adminOnly }),
          });
          const data = await res.json();
          if (!res.ok) return { ok: false, error: data.error || 'Login failed' };
          set({ user: data.user, isAuthenticated: true });
          await hydrateProjectsFromServer(set, get);
          return { ok: true };
        } catch {
          return { ok: false, error: 'Network error. Is the server running?' };
        }
      },
      register: async (payload) => {
        try {
          const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
          const data = await res.json();
          if (!res.ok) return { ok: false, error: data.error || 'Registration failed' };
          set({ user: data.user, isAuthenticated: true });
          await hydrateProjectsFromServer(set, get);
          return { ok: true };
        } catch {
          return { ok: false, error: 'Network error. Check MySQL connection.' };
        }
      },
      logout: async () => {
        if (get().isAuthenticated && get().projectsLoaded) {
          try { await flushProjectSave(); } catch { /* ignore */ }
        }
        try { await fetch('/api/auth/logout', { method: 'POST' }); } catch { /* ignore */ }
        set({
          isAuthenticated: false, user: null, portfolios: [], activePortfolioId: null,
          projectsLoaded: false, hasSeenDashboardTour: false, hasSeenBuilderTour: false,
        });
      },
      completeDashboardTour: () => set({ hasSeenDashboardTour: true }),
      completeBuilderTour: () => set({ hasSeenBuilderTour: true }),
      setMobilePanel: (panel) => set({ mobilePanel: panel }),
      triggerPopupPreview: () => set({ popupPreviewNonce: Date.now() }),

      pushHistory: () => {
        const s = get();
        const newHistory = s.history.slice(0, s.historyIndex + 1);
        newHistory.push([...s.portfolios]);
        if (newHistory.length > MAX_HISTORY) newHistory.shift();
        set({ history: newHistory, historyIndex: newHistory.length - 1 });
      },

      undo: () => {
        const s = get();
        if (s.historyIndex <= 0) return;
        const newIndex = s.historyIndex - 1;
        set({ portfolios: s.history[newIndex], historyIndex: newIndex });
      },
      redo: () => {
        const s = get();
        if (s.historyIndex >= s.history.length - 1) return;
        const newIndex = s.historyIndex + 1;
        set({ portfolios: s.history[newIndex], historyIndex: newIndex });
      },
      canUndo: () => get().historyIndex > 0,
      canRedo: () => get().historyIndex < get().history.length - 1,

      createPortfolio: (templateId, name, options) => {
        const p = createDefaultPortfolio(templateId, { ...options, meta: options?.meta });
        p.name = name;
        p.slug = slugify(name);
        if (p.seo) p.seo.title = name;
        set(s => ({ portfolios: [...s.portfolios, p], activePortfolioId: p.id }));
        return p.id;
      },
      deletePortfolio: (id) => set(s => ({
        portfolios: s.portfolios.filter(p => p.id !== id),
        activePortfolioId: s.activePortfolioId === id ? null : s.activePortfolioId,
      })),
      duplicatePortfolio: (id) => {
        const p = get().portfolios.find(p => p.id === id);
        if (!p) return;
        const copy = { ...p, id: genId(), name: p.name + ' (Copy)', slug: slugify(p.name + '-copy'), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
        set(s => ({ portfolios: [...s.portfolios, copy] }));
      },
      setActivePortfolio: (id) => set({ activePortfolioId: id }),
      updatePortfolioName: (id, name) => set(s => ({
        portfolios: s.portfolios.map(p => p.id === id ? { ...p, name, updatedAt: new Date().toISOString() } : p),
      })),
      togglePublished: (id) => set(s => ({
        portfolios: s.portfolios.map(p => p.id === id ? { ...p, published: !p.published, updatedAt: new Date().toISOString() } : p),
      })),
      updatePortfolioHosting: (id, hosting) => set(s => ({
        portfolios: s.portfolios.map(p => p.id === id ? { ...p, hosting, updatedAt: new Date().toISOString() } : p),
      })),
      purgeExpiredProjects: () => {
        const before = get().portfolios.length;
        const kept = purgeExpiredPortfolios(get().portfolios);
        const removed = before - kept.length;
        if (removed > 0) {
          const activeStillExists = kept.some(p => p.id === get().activePortfolioId);
          set({
            portfolios: kept,
            activePortfolioId: activeStillExists ? get().activePortfolioId : '',
          });
        }
        return removed;
      },

      addSection: (type) => {
        get().pushHistory();
        const def = SECTION_DEFAULTS[type];
        const newSection: PortfolioSection = {
          id: genId(), type, title: def.title, visible: true,
          // Keep semantic field ids intact
          fields: def.fields.map(f => ({ ...f })), order: 999,
        };
        set(s => ({
          portfolios: updatePortfolios(s.portfolios, s.activePortfolioId, p => ({
            ...p, sections: [...p.sections, newSection], updatedAt: new Date().toISOString(),
          })),
        }));
      },
      removeSection: (sectionId) => {
        get().pushHistory();
        set(s => ({
          portfolios: updatePortfolios(s.portfolios, s.activePortfolioId, p => ({
            ...p, sections: p.sections.filter(sec => sec.id !== sectionId), updatedAt: new Date().toISOString(),
          })),
        }));
      },
      updateSection: (sectionId, updates) => set(s => ({
        portfolios: updatePortfolios(s.portfolios, s.activePortfolioId, p => ({
          ...p, sections: p.sections.map(sec => sec.id === sectionId ? { ...sec, ...updates } : sec), updatedAt: new Date().toISOString(),
        })),
      })),
      reorderSections: (sections) => set(s => ({
        portfolios: updatePortfolios(s.portfolios, s.activePortfolioId, p => ({ ...p, sections, updatedAt: new Date().toISOString() })),
      })),
      toggleSectionVisibility: (sectionId) => set(s => ({
        portfolios: updatePortfolios(s.portfolios, s.activePortfolioId, p => ({
          ...p, sections: p.sections.map(sec => sec.id === sectionId ? { ...sec, visible: !sec.visible } : sec),
        })),
      })),
      updateSectionStyle: (sectionId, style) => set(s => ({
        portfolios: updatePortfolios(s.portfolios, s.activePortfolioId, p => ({
          ...p, sections: p.sections.map(sec => sec.id === sectionId ? { ...sec, style: { ...sec.style, ...style } } : sec),
          updatedAt: new Date().toISOString(),
        })),
      })),
      updateField: (sectionId, fieldId, value) => set(s => ({
        portfolios: updatePortfolios(s.portfolios, s.activePortfolioId, p => ({
          ...p,
          sections: p.sections.map(sec => sec.id === sectionId
            ? { ...sec, fields: sec.fields.map(f => f.id === fieldId ? { ...f, value } : f) }
            : sec),
          updatedAt: new Date().toISOString(),
        })),
      })),
      updateFieldLabel: (sectionId, fieldId, label) => set(s => ({
        portfolios: updatePortfolios(s.portfolios, s.activePortfolioId, p => ({
          ...p,
          sections: p.sections.map(sec => sec.id === sectionId
            ? { ...sec, fields: sec.fields.map(f => f.id === fieldId ? { ...f, label } : f) }
            : sec),
          updatedAt: new Date().toISOString(),
        })),
      })),
      addField: (sectionId, field) => set(s => ({
        portfolios: updatePortfolios(s.portfolios, s.activePortfolioId, p => ({
          ...p, sections: p.sections.map(sec => sec.id === sectionId
            ? { ...sec, fields: [...sec.fields, { id: 'custom_' + genId(), label: 'New Field', type: 'text', value: '', ...field }] }
            : sec),
        })),
      })),
      removeField: (sectionId, fieldId) => set(s => ({
        portfolios: updatePortfolios(s.portfolios, s.activePortfolioId, p => ({
          ...p, sections: p.sections.map(sec => sec.id === sectionId
            ? { ...sec, fields: sec.fields.filter(f => f.id !== fieldId) }
            : sec),
        })),
      })),
      reorderFields: (sectionId, fields) => set(s => ({
        portfolios: updatePortfolios(s.portfolios, s.activePortfolioId, p => ({
          ...p, sections: p.sections.map(sec => sec.id === sectionId ? { ...sec, fields } : sec),
          updatedAt: new Date().toISOString(),
        })),
      })),

      updateTheme: (updates) => set(s => ({
        portfolios: updatePortfolios(s.portfolios, s.activePortfolioId, p => ({
          ...p, theme: { ...p.theme, ...updates }, updatedAt: new Date().toISOString(),
        })),
      })),
      switchTemplate: (templateId) => {
        const template = findTemplate(templateId);
        if (!template) return;
        get().pushHistory();
        set(s => ({
          portfolios: updatePortfolios(s.portfolios, s.activePortfolioId, p => ({
            ...p, templateId: resolveTemplateId(templateId), theme: { ...template.defaultTheme, customCSS: p.theme.customCSS }, updatedAt: new Date().toISOString(),
          })),
        }));
      },
      updateSEO: (updates) => set(s => ({
        portfolios: updatePortfolios(s.portfolios, s.activePortfolioId, p => ({ ...p, seo: { ...p.seo, ...updates } })),
      })),
      updateSMTP: (updates) => set(s => ({
        portfolios: updatePortfolios(s.portfolios, s.activePortfolioId, p => ({ ...p, smtp: { ...p.smtp, ...updates } })),
      })),
      updatePopup: (updates) => set(s => ({
        portfolios: updatePortfolios(s.portfolios, s.activePortfolioId, p => ({ ...p, popup: { ...p.popup, ...updates } })),
      })),
      updateNavbar: (updates) => set(s => ({
        portfolios: updatePortfolios(s.portfolios, s.activePortfolioId, p => ({
          ...p, navbar: { ...(p.navbar || defaultNavbar), ...updates }, updatedAt: new Date().toISOString(),
        })),
      })),
      updateFooter: (updates) => set(s => ({
        portfolios: updatePortfolios(s.portfolios, s.activePortfolioId, p => ({
          ...p, footer: { ...(p.footer || defaultFooter), ...updates }, updatedAt: new Date().toISOString(),
        })),
      })),
      updateSocial: (updates) => set(s => ({
        portfolios: updatePortfolios(s.portfolios, s.activePortfolioId, p => ({ ...p, social: { ...p.social, ...updates } })),
      })),
      updateLanguage: (lang) => set(s => ({
        portfolios: updatePortfolios(s.portfolios, s.activePortfolioId, p => ({ ...p, language: lang })),
      })),

      setDeviceView: (view) => set({ deviceView: view }),
      setPreviewMode: (val) => set({ previewMode: val }),
      setActiveSection: (id) => set({ activeSection: id }),
      setCanvasZoom: (zoom) => set({ canvasZoom: Math.min(150, Math.max(50, zoom)) }),

      getActivePortfolio: () => {
        const s = get();
        return s.portfolios.find(p => p.id === s.activePortfolioId) || null;
      },
    }),
);

if (typeof window !== 'undefined') {
  useBuilderStore.subscribe((state, prev) => {
    if (state.isAuthenticated && state.projectsLoaded && !shouldSkipProjectSync()) {
      const changed =
        state.portfolios !== prev.portfolios ||
        state.hasSeenDashboardTour !== prev.hasSeenDashboardTour ||
        state.hasSeenBuilderTour !== prev.hasSeenBuilderTour;
      if (changed) scheduleSaveProjectsToServer(getPersistSlice(state));
    }

    if (state.portfolios !== prev.portfolios && state.activePortfolioId) {
      const portfolio = state.portfolios.find(p => p.id === state.activePortfolioId);
      if (portfolio) broadcastPreviewUpdate(portfolio);
    }
  });
}
