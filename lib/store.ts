'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  Portfolio, PortfolioSection, ThemeConfig, SEOConfig, SMTPConfig,
  PopupConfig, SocialLinks, SectionStyle, DeviceView, SectionType, SectionField
} from './types';
import { TEMPLATES, SECTION_DEFAULTS } from './templates';

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

function createDefaultPortfolio(templateId: string): Portfolio {
  const template = TEMPLATES.find(t => t.id === templateId) || TEMPLATES[0];
  const sections: PortfolioSection[] = template.defaultSections.map((type, i) => {
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
  const name = 'My Portfolio';
  return {
    id: genId(), name, templateId, sections,
    theme: { ...template.defaultTheme, customCSS: '' },
    seo: { title: name, description: '', keywords: '', ogImage: '', favicon: '', twitterHandle: '', canonicalUrl: '' },
    smtp: { ...defaultSMTP },
    popup: { ...defaultPopup },
    social: { ...defaultSocial },
    language: 'en',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    published: false,
    slug: slugify(name),
  };
}

const MAX_HISTORY = 30;

interface BuilderState {
  portfolios: Portfolio[];
  activePortfolioId: string | null;
  deviceView: DeviceView;
  previewMode: boolean;
  activeSection: string | null;
  isAuthenticated: boolean;
  canvasZoom: number;
  history: Portfolio[][];
  historyIndex: number;

  login: (password: string) => boolean;
  logout: () => void;

  createPortfolio: (templateId: string, name: string) => string;
  deletePortfolio: (id: string) => void;
  duplicatePortfolio: (id: string) => void;
  setActivePortfolio: (id: string) => void;
  updatePortfolioName: (id: string, name: string) => void;
  togglePublished: (id: string) => void;

  addSection: (type: SectionType) => void;
  removeSection: (sectionId: string) => void;
  updateSection: (sectionId: string, updates: Partial<PortfolioSection>) => void;
  reorderSections: (sections: PortfolioSection[]) => void;
  toggleSectionVisibility: (sectionId: string) => void;
  updateSectionStyle: (sectionId: string, style: Partial<SectionStyle>) => void;
  updateField: (sectionId: string, fieldId: string, value: any) => void;
  addField: (sectionId: string, field?: Partial<SectionField>) => void;
  removeField: (sectionId: string, fieldId: string) => void;
  reorderFields: (sectionId: string, fields: SectionField[]) => void;

  updateTheme: (updates: Partial<ThemeConfig>) => void;
  switchTemplate: (templateId: string) => void;
  updateSEO: (updates: Partial<SEOConfig>) => void;
  updateSMTP: (updates: Partial<SMTPConfig>) => void;
  updatePopup: (updates: Partial<PopupConfig>) => void;
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

export const useBuilderStore = create<BuilderState>()(
  persist(
    (set, get) => ({
      portfolios: [],
      activePortfolioId: null,
      deviceView: 'desktop',
      previewMode: false,
      activeSection: null,
      isAuthenticated: false,
      canvasZoom: 100,
      history: [],
      historyIndex: -1,

      login: (password) => {
        const valid = password === (process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin123');
        if (valid) set({ isAuthenticated: true });
        return valid;
      },
      logout: () => set({ isAuthenticated: false }),

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

      createPortfolio: (templateId, name) => {
        const p = createDefaultPortfolio(templateId);
        p.name = name;
        p.slug = slugify(name);
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
        const template = TEMPLATES.find(t => t.id === templateId);
        if (!template) return;
        get().pushHistory();
        set(s => ({
          portfolios: updatePortfolios(s.portfolios, s.activePortfolioId, p => ({
            ...p, templateId, theme: { ...template.defaultTheme, customCSS: p.theme.customCSS }, updatedAt: new Date().toISOString(),
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
    { name: 'portfolio-builder-store', partialize: (s) => ({ portfolios: s.portfolios, isAuthenticated: s.isAuthenticated }),
      onRehydrateStorage: () => (state) => {
        // Migrate: repair any hero section fields that had their semantic ids replaced with random ids
        if (!state) return;
        state.portfolios = state.portfolios.map(portfolio => ({
          ...portfolio,
          sections: portfolio.sections.map(section => {
            if (section.type !== 'hero') return section;
            const def = SECTION_DEFAULTS['hero'];
            // For each default field, if the section has a field with matching label but wrong id, fix the id
            const repairedFields = section.fields.map(field => {
              const match = def.fields.find(d => d.label === field.label && d.id !== field.id);
              if (match) return { ...field, id: match.id };
              return field;
            });
            return { ...section, fields: repairedFields };
          }),
        }));
      },
    }
  )
);
