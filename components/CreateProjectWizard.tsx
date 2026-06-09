'use client';
import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBuilderStore } from '@/lib/store';
import { TEMPLATES, getTemplatesForPurpose } from '@/lib/templates';
import { WebsitePurpose, SectionType, CreatePortfolioOptions } from '@/lib/types';
import { getPurposeConfig, getSectionLabel } from '@/lib/website-purposes';
import {
  WIZARD_PURPOSE_CATEGORIES, getPurposeDetailsConfig, getWizardSectionGroups, getSectionHint,
} from '@/lib/purpose-wizard';
import {
  getLayoutPresetsForPurpose, getDefaultLayoutPresetId, LayoutPresetId, LAYOUT_PRESETS,
} from '@/lib/purpose-layouts';
import BrandLogo from './BrandLogo';
import LayoutWireframe from './LayoutWireframe';
import TemplatesGallery from './shared/TemplatesGallery';
import { ChevronLeft, ChevronRight, Check, X, LayoutTemplate, Crown } from 'lucide-react';
import { fetchPlansConfig, type PlansConfigResponse, featureEnabled } from '@/lib/plans-client';
import type { PlanFeatures } from '@/lib/plans-types';

interface Props {
  open: boolean;
  onClose: () => void;
}

const STEPS = ['Purpose', 'Details', 'Sections', 'Layout', 'Template', 'Name'] as const;

export default function CreateProjectWizard({ open, onClose }: Props) {
  const { createPortfolio, setActivePortfolio } = useBuilderStore();
  const [step, setStep] = useState(0);
  const [purpose, setPurpose] = useState<WebsitePurpose | null>(null);
  const [businessName, setBusinessName] = useState('');
  const [industry, setIndustry] = useState('');
  const [tagline, setTagline] = useState('');
  const [location, setLocation] = useState('');
  const [activeCategory, setActiveCategory] = useState(WIZARD_PURPOSE_CATEGORIES[0].id);
  const [sections, setSections] = useState<SectionType[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [projectName, setProjectName] = useState('');
  const [purposeSearch, setPurposeSearch] = useState('');
  const [layoutPreset, setLayoutPreset] = useState<LayoutPresetId | ''>('');
  const [planConfig, setPlanConfig] = useState<PlansConfigResponse | null>(null);

  const sectionPlanKey: Partial<Record<SectionType, keyof PlanFeatures>> = {
    blog: 'sectionBlog', team: 'sectionTeam', pricing: 'sectionPricing',
    faq: 'sectionFaq', testimonials: 'sectionTestimonials',
  };

  const isTemplateLocked = (id: string) =>
    planConfig?.templates.find(t => t.id === id)?.locked ?? false;

  const isSectionLocked = (type: SectionType) => {
    const key = sectionPlanKey[type];
    if (!key) return false;
    return !featureEnabled(planConfig, key);
  };

  const purposeConfig = purpose ? getPurposeConfig(purpose) : null;

  useEffect(() => {
    if (open) fetchPlansConfig(true).then(setPlanConfig);
  }, [open]);

  const detailsConfig = purpose ? getPurposeDetailsConfig(purpose) : null;
  const sectionGroups = useMemo(
    () => (purpose ? getWizardSectionGroups(purpose) : null),
    [purpose],
  );

  const filteredCategories = useMemo(() => {
    const q = purposeSearch.toLowerCase().trim();
    if (!q) return WIZARD_PURPOSE_CATEGORIES;
    return WIZARD_PURPOSE_CATEGORIES.map(cat => ({
      ...cat,
      purposes: cat.purposes.filter(id => {
        const p = getPurposeConfig(id);
        return (
          p.title.toLowerCase().includes(q) ||
          p.subtitle.toLowerCase().includes(q) ||
          p.examples.toLowerCase().includes(q) ||
          cat.label.toLowerCase().includes(q)
        );
      }),
    })).filter(cat => cat.purposes.length > 0);
  }, [purposeSearch]);

  useEffect(() => {
    if (filteredCategories.length === 0) return;
    if (!filteredCategories.some(c => c.id === activeCategory)) {
      setActiveCategory(filteredCategories[0].id);
    }
  }, [filteredCategories, activeCategory]);

  const templates = useMemo(() => {
    if (!purpose) return TEMPLATES;
    return getTemplatesForPurpose(purpose);
  }, [purpose]);

  useEffect(() => {
    if (!open) return;
    setStep(0);
    setPurpose(null);
    setBusinessName('');
    setIndustry('');
    setTagline('');
    setLocation('');
    setActiveCategory(WIZARD_PURPOSE_CATEGORIES[0].id);
    setSections([]);
    setSelectedTemplate('');
    setProjectName('');
    setPurposeSearch('');
    setLayoutPreset('');
  }, [open]);

  useEffect(() => {
    if (!purpose) return;
    const cfg = getPurposeConfig(purpose);
    setSections([...cfg.recommendedSections]);
    const list = getTemplatesForPurpose(purpose);
    const first = list[0] || TEMPLATES[0];
    setSelectedTemplate(first.id);
    setLayoutPreset((first.defaultLayoutPreset as LayoutPresetId) || getDefaultLayoutPresetId(purpose));
  }, [purpose]);

  const layoutPresets = useMemo(() => (purpose ? getLayoutPresetsForPurpose(purpose) : []), [purpose]);

  useEffect(() => {
    if (businessName && !projectName) setProjectName(businessName);
  }, [businessName, projectName]);

  const toggleSection = (type: SectionType) => {
    setSections(prev => prev.includes(type) ? prev.filter(s => s !== type) : [...prev, type]);
  };

  const canNext = () => {
    if (step === 0) return Boolean(purpose);
    if (step === 1) return businessName.trim().length > 0;
    if (step === 2) return sections.length > 0;
    if (step === 3) return Boolean(layoutPreset);
    if (step === 4) return Boolean(selectedTemplate);
    if (step === 5) return projectName.trim().length > 0;
    return false;
  };

  const handleCreate = () => {
    if (!purpose || !selectedTemplate || !projectName.trim()) return;
    const options: CreatePortfolioOptions = {
      sections,
      layoutPreset: layoutPreset || undefined,
      meta: {
        purpose, businessName: businessName.trim(), industry: industry || undefined,
        tagline: tagline.trim() || undefined, location: location.trim() || undefined,
        layoutPreset: layoutPreset || undefined,
      },
    };
    const id = createPortfolio(selectedTemplate, projectName.trim(), options);
    setActivePortfolio(id);
    onClose();
  };

  if (!open) return null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ scale: 0.94, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="px-6 pt-5 pb-4 border-b border-white/10 shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <BrandLogo size="xs" />
                <h2 className="text-xl font-bold">Create New Website</h2>
              </div>
              <p className="text-sm text-gray-500">Tell us what you&apos;re building — we&apos;ll set up the right layout for you.</p>
            </div>
            <button type="button" onClick={onClose} className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex gap-1.5 mt-4">
            {STEPS.map((label, i) => (
              <div key={label} className="flex-1">
                <div className={`h-1 rounded-full transition ${i <= step ? 'bg-blue-500' : 'bg-white/10'}`} />
                <p className={`text-[10px] mt-1.5 truncate ${i === step ? 'text-blue-300' : 'text-gray-600'}`}>{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div key="s0" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}>
                <h3 className="text-lg font-semibold mb-1">What kind of website do you need?</h3>
                <p className="text-sm text-gray-500 mb-4">Pick a category, then choose the type that fits your goal. Sections and content adapt to your selection.</p>
                <input value={purposeSearch} onChange={e => setPurposeSearch(e.target.value)}
                  placeholder="Search: shop, restaurant, portfolio, SaaS…"
                  className="w-full mb-4 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500" />
                {filteredCategories.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-8">No matches — try a different search term.</p>
                ) : (
                  <>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {filteredCategories.map(cat => (
                        <button key={cat.id} type="button" onClick={() => setActiveCategory(cat.id)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                            activeCategory === cat.id
                              ? 'border-blue-500 bg-blue-500/15 text-blue-200'
                              : 'border-white/10 text-gray-400 hover:border-white/20 hover:text-gray-200'
                          }`}>
                          <span>{cat.icon}</span> {cat.label}
                        </button>
                      ))}
                    </div>
                    {filteredCategories.filter(c => c.id === activeCategory).map(cat => (
                      <div key={cat.id}>
                        <p className="text-xs text-gray-500 mb-3">{cat.description}</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[42vh] overflow-y-auto pr-1">
                          {cat.purposes.map(id => {
                            const p = getPurposeConfig(id);
                            return (
                              <button key={p.id} type="button" onClick={() => setPurpose(p.id)}
                                className={`text-left p-3.5 rounded-xl border transition ${
                                  purpose === p.id ? 'border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/10' : 'border-white/10 hover:border-white/20 hover:bg-white/5'
                                }`}>
                                <div className="flex items-start gap-3">
                                  <span className="text-2xl">{p.icon}</span>
                                  <div className="min-w-0">
                                    <p className="font-semibold text-sm text-white">{p.title}</p>
                                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{p.subtitle}</p>
                                    <p className="text-[10px] text-gray-600 mt-1">e.g. {p.examples}</p>
                                  </div>
                                  {purpose === p.id && <Check className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </motion.div>
            )}

            {step === 1 && purposeConfig && detailsConfig && (
              <motion.div key="s1" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-1">Tell us about you</h3>
                  <p className="text-sm text-gray-500">
                    Fields tailored for <span className="text-white font-medium">{purposeConfig.title}</span> — we&apos;ll pre-fill relevant content, not generic developer text.
                  </p>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">{detailsConfig.brandLabel} <span className="text-red-400">*</span></label>
                  <input value={businessName} onChange={e => setBusinessName(e.target.value)} placeholder={detailsConfig.brandPlaceholder}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500" autoFocus />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">{detailsConfig.industryLabel}</label>
                  <select value={industry} onChange={e => setIndustry(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500">
                    <option value="" className="bg-[#1a1a1a]">Select (optional)</option>
                    {purposeConfig.industries.map(ind => (
                      <option key={ind} value={ind} className="bg-[#1a1a1a]">{ind}</option>
                    ))}
                  </select>
                </div>
                {detailsConfig.showLocation && (
                  <div>
                    <label className="block text-sm text-gray-400 mb-1.5">{detailsConfig.locationLabel}</label>
                    <input value={location} onChange={e => setLocation(e.target.value)} placeholder={detailsConfig.locationPlaceholder}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500" />
                  </div>
                )}
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">{detailsConfig.taglineLabel}</label>
                  <input value={tagline} onChange={e => setTagline(e.target.value)} placeholder={detailsConfig.taglinePlaceholder}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500" />
                </div>
              </motion.div>
            )}

            {step === 2 && purposeConfig && sectionGroups && (
              <motion.div key="s2" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}>
                <h3 className="text-lg font-semibold mb-1">Which sections should your site include?</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Core sections for <span className="text-white font-medium">{purposeConfig.title}</span> are pre-selected. Add advanced sections for a richer site.
                </p>

                {([
                  { key: 'recommended', title: `Essential — ${purposeConfig.title}`, items: sectionGroups.recommended, accent: true },
                  { key: 'advanced', title: 'Advanced sections', items: sectionGroups.advanced, accent: false },
                  { key: 'optional', title: 'More add-ons', items: sectionGroups.optional, accent: false },
                ] as const).map(group => group.items.length > 0 && (
                  <div key={group.key} className="mb-5">
                    <p className={`text-xs font-semibold uppercase tracking-wider mb-2 ${
                      group.key === 'recommended' ? 'text-blue-300/80' : group.key === 'advanced' ? 'text-purple-300/70' : 'text-gray-500'
                    }`}>{group.title}</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {group.items.map(secType => {
                        const on = sections.includes(secType);
                        const locked = isSectionLocked(secType);
                        const label = getSectionLabel(secType, purpose);
                        const hint = getSectionHint(purpose!, secType);
                        const isRecommended = group.key === 'recommended';
                        return (
                          <button key={secType} type="button"
                            onClick={() => !locked && toggleSection(secType)}
                            disabled={locked}
                            className={`p-3 rounded-xl border text-left text-sm transition ${
                              locked ? 'border-amber-500/20 bg-amber-500/5 text-gray-500 cursor-not-allowed opacity-70'
                              : on && isRecommended ? 'border-blue-500 bg-blue-500/10 text-white'
                              : on ? 'border-purple-500/50 bg-purple-500/8 text-white'
                              : 'border-white/10 text-gray-400 hover:bg-white/5'
                            }`}>
                            <span className="flex items-center justify-between gap-2">
                              <span className="font-medium text-xs">{label}</span>
                              {locked ? <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                : on ? <Check className="w-3.5 h-3.5 text-blue-400 shrink-0" /> : null}
                            </span>
                            {hint && <span className="text-[10px] text-gray-600 mt-0.5 block leading-tight">{hint}</span>}
                            {locked && <span className="text-[9px] text-amber-400/80 mt-1 block">Premium plan</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}

                <p className="text-xs text-gray-600 mt-3">{sections.length} section{sections.length !== 1 ? 's' : ''} selected</p>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="s3" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}>
                <div className="flex items-center gap-2 mb-1">
                  <LayoutTemplate className="w-5 h-5 text-blue-400" />
                  <h3 className="text-lg font-semibold">Choose your page layout</h3>
                </div>
                <p className="text-sm text-gray-500 mb-4">
                  Controls hero style, navbar, section arrangement, and spacing — matched for {purposeConfig?.title}.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[55vh] overflow-y-auto pr-1">
                  {layoutPresets.map(preset => (
                    <button key={preset.id} type="button" onClick={() => setLayoutPreset(preset.id)}
                      className={`text-left p-3 rounded-xl border transition ${
                        layoutPreset === preset.id ? 'border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/10' : 'border-white/10 hover:border-white/20 hover:bg-white/5'
                      }`}>
                      <LayoutWireframe preset={preset} active={layoutPreset === preset.id} />
                      <div className="mt-3 flex items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold text-sm flex items-center gap-1.5">
                            <span>{preset.icon}</span> {preset.title}
                          </p>
                          <p className="text-[11px] text-gray-500 mt-1 line-clamp-2">{preset.subtitle}</p>
                        </div>
                        {layoutPreset === preset.id && <Check className="w-4 h-4 text-blue-400 shrink-0" />}
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-gray-500">Hero: {preset.heroLayout}</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-gray-500">Nav: {preset.navbar.layout}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div key="s4" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}>
                <h3 className="text-lg font-semibold mb-1">Pick a design template</h3>
                <p className="text-sm text-gray-500 mb-4">
                  {templates.length} professional templates for {purposeConfig?.title}. Each includes colors, fonts, and section layout.
                </p>
                <TemplatesGallery
                  templates={templates}
                  selectedId={selectedTemplate}
                  onSelect={id => {
                    setSelectedTemplate(id);
                    const t = templates.find(x => x.id === id);
                    if (t?.defaultLayoutPreset) setLayoutPreset(t.defaultLayoutPreset as LayoutPresetId);
                  }}
                  isLocked={isTemplateLocked}
                  getLockLabel={id => planConfig?.templates.find(x => x.id === id)?.minPlanName || 'Pro'}
                />
              </motion.div>
            )}

            {step === 5 && (
              <motion.div key="s5" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-1">Name your project</h3>
                  <p className="text-sm text-gray-500">This is the name shown in your dashboard. Your public site title can be edited in SEO settings.</p>
                </div>
                <input value={projectName} onChange={e => setProjectName(e.target.value)} placeholder="My Website"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 text-lg"
                  onKeyDown={e => e.key === 'Enter' && canNext() && handleCreate()} autoFocus />
                <div className="p-4 rounded-xl bg-white/3 border border-white/10 space-y-2 text-sm">
                  <p className="text-gray-400 font-medium">Summary</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <span className="text-gray-600">Purpose</span><span className="text-gray-300">{purposeConfig?.title}</span>
                    <span className="text-gray-600">Brand</span><span className="text-gray-300">{businessName}</span>
                    <span className="text-gray-600">Layout</span><span className="text-gray-300">{layoutPreset ? LAYOUT_PRESETS[layoutPreset]?.title : '—'}</span>
                    <span className="text-gray-600">Template</span><span className="text-gray-300">{templates.find(t => t.id === selectedTemplate)?.name}</span>
                    <span className="text-gray-600">Sections</span><span className="text-gray-300">{sections.length} included</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/10 flex items-center gap-3 shrink-0">
          <button type="button" onClick={() => step === 0 ? onClose() : setStep(s => s - 1)}
            className="flex items-center gap-1 px-4 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 transition text-sm">
            <ChevronLeft className="w-4 h-4" /> {step === 0 ? 'Cancel' : 'Back'}
          </button>
          <div className="flex-1" />
          {step < STEPS.length - 1 ? (
            <button type="button" disabled={!canNext()} onClick={() => setStep(s => s + 1)}
              className="flex items-center gap-1 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed font-semibold transition text-sm">
              Continue <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button type="button" disabled={!canNext()} onClick={handleCreate}
              className="flex items-center gap-1 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed font-semibold transition text-sm">
              <Check className="w-4 h-4" /> Create Website
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
