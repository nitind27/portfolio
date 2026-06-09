'use client';
import { useBuilderStore } from '@/lib/store';
import { TEMPLATES } from '@/lib/templates';
import { HexColorPicker } from 'react-colorful';
import { useState, useMemo } from 'react';
import { ThemeConfig, SMTPConfig, PopupConfig, NavbarConfig, NavbarMenuStyle, NavbarScrollBehavior, NavbarScrollAnimation, NavbarCtaStyle, FooterConfig, SocialLinks, PortfolioSection } from '@/lib/types';
import { RightTab } from '../Builder';
import { Check, TestTube, Loader, ExternalLink, Eye } from 'lucide-react';
import { APP_NAME } from '@/lib/brand';
import PopupCard from '../shared/PopupCard';
import TemplatesGallery from '../shared/TemplatesGallery';
import SectionEditor from './SectionEditor';
import BuilderHelpPanel from './BuilderHelpPanel';

interface Props { tab: RightTab; setTab: (t: RightTab) => void; onShowTour?: () => void; }

export default function BuilderRightPanel({ tab, setTab, onShowTour }: Props) {
  const {
    getActivePortfolio, updateTheme, switchTemplate, updateSEO, updateSMTP, updatePopup,
    updateNavbar, updateFooter, updateSocial, activeSection, previewMode,
  } = useBuilderStore();
  const portfolio = getActivePortfolio();
  if (!portfolio) return null;

  const showSectionEditor = tab === 'sections' && Boolean(activeSection && !previewMode);

  return (
    <aside
      data-tour="settings-panel"
      className="w-full h-full border-l border-white/10 bg-[#0d0d0d] overflow-hidden flex flex-col min-w-0"
    >
      {showSectionEditor ? (
        <SectionEditor key={activeSection} sectionId={activeSection!} variant="sidebar" />
      ) : (
        <div className="flex-1 overflow-y-auto">
          {tab === 'theme' && <ThemePanel theme={portfolio.theme} onUpdate={updateTheme} />}
          {tab === 'navbar' && portfolio.navbar && <NavbarPanel navbar={portfolio.navbar} onUpdate={updateNavbar} portfolioName={portfolio.name} sections={portfolio.sections} />}
          {tab === 'footer' && portfolio.footer && (
            <FooterPanel
              footer={portfolio.footer}
              onUpdate={updateFooter}
              sections={portfolio.sections}
              navbar={portfolio.navbar}
            />
          )}
          {tab === 'templates' && <TemplatesPanel current={portfolio.templateId} onSwitch={switchTemplate} />}
          {tab === 'seo' && <SEOPanel seo={portfolio.seo} onUpdate={updateSEO} />}
          {tab === 'smtp' && <SMTPPanel smtp={portfolio.smtp} onUpdate={updateSMTP} />}
          {tab === 'popup' && <PopupPanel popup={portfolio.popup} theme={portfolio.theme} onUpdate={updatePopup} />}
          {tab === 'social' && <SocialPanel social={portfolio.social} onUpdate={updateSocial} />}
          {tab === 'analytics' && <AnalyticsPanel portfolio={portfolio} />}
          {tab === 'css' && <CSSPanel theme={portfolio.theme} onUpdate={updateTheme} />}
          {tab === 'sections' && (
            <BuilderHelpPanel
              variant="inline"
              rightTab={tab}
              previewMode={previewMode}
              sectionCount={portfolio.sections.length}
              onShowTour={onShowTour}
              onNavigateTab={setTab}
            />
          )}
        </div>
      )}
    </aside>
  );
}

const MENU_STYLE_OPTIONS: { id: NavbarMenuStyle; label: string }[] = [
  { id: 'drawer-right', label: 'Side Drawer' },
  { id: 'drawer-left', label: 'Left Drawer' },
  { id: 'fullscreen', label: 'Full Screen' },
  { id: 'bottom-popup', label: 'Bottom Popup' },
];

function MenuStylePicker({ label, value, onChange }: { label: string; value: NavbarMenuStyle; onChange: (v: NavbarMenuStyle) => void }) {
  return (
    <div>
      <p className="text-xs text-gray-400 mb-1.5">{label}</p>
      <div className="grid grid-cols-2 gap-1">
        {MENU_STYLE_OPTIONS.map(o => (
          <button key={o.id} onClick={() => onChange(o.id)}
            className={`py-1.5 text-[10px] rounded transition ${value === o.id ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Navbar Panel ─────────────────────────────────────────────────────────────
const SCROLL_BEHAVIOR_OPTIONS: { id: NavbarScrollBehavior; label: string }[] = [
  { id: 'none', label: 'None' },
  { id: 'float-on-scroll', label: 'Float on Scroll' },
  { id: 'compact-on-scroll', label: 'Compact' },
];

const SCROLL_ANIMATION_OPTIONS: { id: NavbarScrollAnimation; label: string }[] = [
  { id: 'smooth', label: 'Smooth' },
  { id: 'fade', label: 'Fade' },
  { id: 'slide', label: 'Slide' },
  { id: 'scale', label: 'Scale' },
  { id: 'spring', label: 'Spring' },
];

function NavbarPanel({ navbar, onUpdate, portfolioName, sections }: {
  navbar: NavbarConfig; onUpdate: (u: Partial<NavbarConfig>) => void;
  portfolioName: string; sections: PortfolioSection[];
}) {
  const inputCls = 'w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500';
  const desktopMenu = navbar.desktopMenu ?? 'links';
  const scrollBehavior = navbar.scrollBehavior ?? 'none';
  const [activeTab, setActiveTab] = useState<'general' | 'links' | 'cta' | 'colors'>('general');

  const Toggle = ({ label, val, onClick, hint }: { label: string; val: boolean; onClick: () => void; hint?: string }) => (
    <label className="flex items-center justify-between cursor-pointer p-2 bg-white/5 rounded-lg gap-2">
      <div className="min-w-0">
        <span className="text-xs text-gray-300">{label}</span>
        {hint && <p className="text-[10px] text-gray-600 mt-0.5">{hint}</p>}
      </div>
      <div onClick={onClick} className={`w-9 h-5 rounded-full transition relative shrink-0 ${val ? 'bg-blue-600' : 'bg-white/10'}`}>
        <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${val ? 'left-4' : 'left-0.5'}`} />
      </div>
    </label>
  );

  const Slider = ({ label, value, min, max, step, unit, onChange }: {
    label: string; value: number; min: number; max: number; step: number; unit?: string; onChange: (v: number) => void;
  }) => (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-[11px] text-gray-400">{label}</span>
        <span className="text-[11px] text-blue-300 font-mono">{value}{unit}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none bg-white/10 accent-blue-500 cursor-pointer" />
    </div>
  );

  const ColorRow = ({ label, value, onChange, hint }: { label: string; value: string; onChange: (v: string) => void; hint?: string }) => {
    const [open, setOpen] = useState(false);
    return (
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] text-gray-400">{label}</span>
          {value && <button type="button" onClick={() => onChange('')} className="text-[10px] text-gray-600 hover:text-gray-300">reset</button>}
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setOpen(o => !o)}
            className="w-8 h-7 rounded-lg border border-white/20 shrink-0 flex items-center justify-center"
            style={{ background: value || 'transparent' }}>
            {!value && <span className="text-gray-600 text-[10px]">auto</span>}
          </button>
          <input value={value} onChange={e => onChange(e.target.value)} placeholder="auto (uses theme)"
            className={`${inputCls} flex-1`} />
        </div>
        {hint && <p className="text-[10px] text-gray-600 mt-0.5">{hint}</p>}
        {open && (
          <div className="mt-2">
            <HexColorPicker color={value || '#ffffff'} onChange={onChange} style={{ width: '100%' }} />
          </div>
        )}
      </div>
    );
  };

  // Section visibility helpers
  const hiddenSections = navbar.hiddenSections ?? [];
  const customLabels = navbar.customLabels ?? {};

  const toggleSection = (id: string) => {
    const next = hiddenSections.includes(id)
      ? hiddenSections.filter(s => s !== id)
      : [...hiddenSections, id];
    onUpdate({ hiddenSections: next });
  };

  const setCustomLabel = (id: string, label: string) => {
    const next = { ...customLabels };
    if (label.trim()) next[id] = label.trim();
    else delete next[id];
    onUpdate({ customLabels: next });
  };

  const SECTION_ICONS: Record<string, string> = {
    hero: '🏠', about: '👤', skills: '⚡', experience: '💼', projects: '🚀',
    gallery: '🖼️', testimonials: '💬', contact: '📧', videos: '🎬',
    services: '🛠️', team: '👥', stats: '📊', social: '🔗',
    pricing: '💰', faq: '❓', blog: '📝', custom: '✏️',
  };

  return (
    <div className="flex flex-col h-full">
      {/* Tab bar */}
      <div className="flex border-b border-white/10 shrink-0">
        {([
          { id: 'general' as const, label: 'General' },
          { id: 'links' as const, label: 'Links' },
          { id: 'cta' as const, label: 'CTA' },
          { id: 'colors' as const, label: 'Colors' },
        ]).map(t => (
          <button key={t.id} type="button" onClick={() => setActiveTab(t.id)}
            className={`flex-1 py-2.5 text-[11px] font-medium transition border-b-2 ${
              activeTab === t.id ? 'border-blue-500 text-white' : 'border-transparent text-gray-500 hover:text-gray-300'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-4">

        {/* ── GENERAL TAB ── */}
        {activeTab === 'general' && <>
          <div>
            <label className="text-xs text-gray-400 block mb-1">Brand Name</label>
            <input value={navbar.brandName} onChange={e => onUpdate({ brandName: e.target.value })} placeholder={portfolioName} className={inputCls} />
            <p className="text-[10px] text-gray-600 mt-1">Leave empty to use portfolio name</p>
          </div>

          <Toggle label="Show Logo" val={navbar.showLogo} onClick={() => onUpdate({ showLogo: !navbar.showLogo })} />
          {navbar.showLogo && (
            <div className="space-y-2">
              <div>
                <label className="text-xs text-gray-400 block mb-1">Logo Image URL</label>
                <input value={navbar.logoImage} onChange={e => onUpdate({ logoImage: e.target.value })} placeholder="https://..." className={inputCls} />
                <p className="text-[10px] text-gray-600 mt-1">PNG with transparent background recommended</p>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <label className="text-[11px] text-gray-400">Logo size</label>
                  <span className="text-[11px] text-blue-300 font-mono">{navbar.logoSize ?? 38}px</span>
                </div>
                <input type="range" min={24} max={80} step={2}
                  value={navbar.logoSize ?? 38}
                  onChange={e => onUpdate({ logoSize: Number(e.target.value) })}
                  className="w-full h-1.5 rounded-full appearance-none bg-white/10 accent-blue-500 cursor-pointer" />
                <div className="flex gap-1 mt-1.5">
                  {([{ l: 'S', v: 28 }, { l: 'M', v: 38 }, { l: 'L', v: 52 }, { l: 'XL', v: 64 }]).map(p => (
                    <button key={p.v} onClick={() => onUpdate({ logoSize: p.v })}
                      className={`flex-1 py-1 text-[10px] rounded transition ${(navbar.logoSize ?? 38) === p.v ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-500 hover:bg-white/10'}`}>
                      {p.l}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[11px] text-gray-400 mb-1.5">Background removal</p>
                <div className="grid grid-cols-3 gap-1">
                  {([
                    { id: 'normal' as const, label: 'None', hint: 'Original' },
                    { id: 'multiply' as const, label: 'Multiply', hint: 'Remove white bg' },
                    { id: 'screen' as const, label: 'Screen', hint: 'Remove dark bg' },
                    { id: 'lighten' as const, label: 'Lighten', hint: 'For dark logos' },
                    { id: 'darken' as const, label: 'Darken', hint: 'For light logos' },
                  ]).map(o => (
                    <button key={o.id} type="button" onClick={() => onUpdate({ logoBlend: o.id })}
                      title={o.hint}
                      className={`py-1.5 text-[10px] rounded transition ${(navbar.logoBlend ?? 'multiply') === o.id ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
                      {o.label}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-gray-600 mt-1">Use &quot;Multiply&quot; to remove white background from logo images</p>
              </div>
            </div>
          )}

          <Toggle label="Show Tagline" val={navbar.showTagline} onClick={() => onUpdate({ showTagline: !navbar.showTagline })} />
          {navbar.showTagline && (
            <div>
              <label className="text-xs text-gray-400 block mb-1">Tagline</label>
              <input value={navbar.tagline} onChange={e => onUpdate({ tagline: e.target.value })} placeholder="Designer & Developer" className={inputCls} />
            </div>
          )}

          <div>
            <p className="text-xs text-gray-400 mb-1.5">Navbar Style</p>
            <div className="grid grid-cols-2 gap-1">
              {(['glass', 'solid', 'gradient', 'transparent'] as const).map(s => (
                <button key={s} onClick={() => onUpdate({ style: s })}
                  className={`py-1.5 text-xs rounded capitalize transition ${navbar.style === s ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs text-gray-400 mb-1.5">Layout</p>
            <div className="grid grid-cols-3 gap-1">
              {(['standard', 'centered', 'minimal'] as const).map(l => (
                <button key={l} onClick={() => onUpdate({ layout: l })}
                  className={`py-1.5 text-xs rounded capitalize transition ${navbar.layout === l ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
                  {l}
                </button>
              ))}
            </div>
          </div>

          <div className="p-2.5 bg-white/[0.03] border border-white/10 rounded-xl space-y-3">
            <p className="text-xs font-semibold text-gray-300">Desktop Menu</p>
            <div className="grid grid-cols-3 gap-1">
              {([{ id: 'links' as const, label: 'Links Bar' }, { id: 'menu' as const, label: 'Menu Btn' }, { id: 'floating' as const, label: 'Floating' }]).map(o => (
                <button key={o.id} onClick={() => onUpdate({ desktopMenu: o.id })}
                  className={`py-1.5 text-[10px] rounded transition ${desktopMenu === o.id ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
                  {o.label}
                </button>
              ))}
            </div>
            {desktopMenu === 'menu' && (
              <MenuStylePicker label="Desktop popup style" value={navbar.desktopMenuStyle ?? 'drawer-right'} onChange={v => onUpdate({ desktopMenuStyle: v })} />
            )}
          </div>

          <div className="p-2.5 bg-white/[0.03] border border-white/10 rounded-xl space-y-3">
            <p className="text-xs font-semibold text-gray-300">Mobile Menu</p>
            <MenuStylePicker label="Mobile menu style" value={navbar.mobileMenu ?? 'drawer-right'} onChange={v => onUpdate({ mobileMenu: v })} />
            <div>
              <p className="text-xs text-gray-400 mb-1.5">Menu Icon</p>
              <div className="grid grid-cols-3 gap-1">
                {([
                  { id: 'dots' as const, label: '⋮ Dots' },
                  { id: 'hamburger' as const, label: '☰ Burger' },
                  { id: 'close-x' as const, label: '✕ X' },
                ]).map(o => (
                  <button key={o.id} onClick={() => onUpdate({ menuIcon: o.id })}
                    className={`py-1.5 text-xs rounded transition ${(navbar.menuIcon ?? 'dots') === o.id ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
                    {o.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="p-2.5 bg-white/[0.03] border border-white/10 rounded-xl space-y-3">
            <p className="text-xs font-semibold text-gray-300">Scroll Effect</p>
            <div className="grid grid-cols-3 gap-1">
              {SCROLL_BEHAVIOR_OPTIONS.map(o => (
                <button key={o.id} onClick={() => onUpdate({ scrollBehavior: o.id, ...(o.id !== 'none' && !navbar.sticky ? { sticky: true } : {}) })}
                  className={`py-1.5 text-[10px] rounded transition ${scrollBehavior === o.id ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
                  {o.label}
                </button>
              ))}
            </div>
            {scrollBehavior !== 'none' && (
              <div>
                <p className="text-xs text-gray-400 mb-1.5">Scroll Animation</p>
                <div className="grid grid-cols-3 gap-1">
                  {SCROLL_ANIMATION_OPTIONS.map(o => (
                    <button key={o.id} onClick={() => onUpdate({ scrollAnimation: o.id })}
                      className={`py-1.5 text-[10px] rounded transition ${(navbar.scrollAnimation ?? 'smooth') === o.id ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Toggle label="Sticky Navbar" val={navbar.sticky} onClick={() => onUpdate({ sticky: !navbar.sticky })} hint="Stays at top when scrolling" />
          <Toggle label="Show Social Icons" val={navbar.showSocial} onClick={() => onUpdate({ showSocial: !navbar.showSocial })} />
        </>}

        {/* ── LINKS TAB ── */}
        {activeTab === 'links' && <>
          <div>
            <p className="text-xs font-semibold text-gray-300 mb-0.5">Nav Menu Items</p>
            <p className="text-[10px] text-gray-500 mb-3">Toggle visibility and rename each link. Hidden items won't show in navbar or mobile menu.</p>
            <div className="space-y-1.5">
              {sections.map(s => {
                const isHidden = hiddenSections.includes(s.id);
                const customLabel = customLabels[s.id] ?? '';
                const icon = SECTION_ICONS[s.type] || '📄';
                return (
                  <div key={s.id} className={`rounded-xl border transition ${isHidden ? 'border-white/5 bg-white/2 opacity-50' : 'border-white/10 bg-white/3'}`}>
                    <div className="flex items-center gap-2 px-3 py-2">
                      <span className="text-sm shrink-0">{icon}</span>
                      <span className="flex-1 text-xs font-medium text-gray-300 truncate">{s.title}</span>
                      <button type="button" onClick={() => toggleSection(s.id)}
                        className={`w-8 h-4 rounded-full transition relative shrink-0 ${!isHidden ? 'bg-blue-600' : 'bg-white/10'}`}>
                        <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${!isHidden ? 'left-4' : 'left-0.5'}`} />
                      </button>
                    </div>
                    {!isHidden && (
                      <div className="px-3 pb-2">
                        <input
                          value={customLabel}
                          onChange={e => setCustomLabel(s.id, e.target.value)}
                          placeholder={`Custom label (default: "${s.title}")`}
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1 text-[11px] text-white placeholder-gray-600 focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <p className="text-xs text-gray-400 mb-1.5">Link Style</p>
            <div className="grid grid-cols-3 gap-1">
              {(['minimal', 'underline', 'pill'] as const).map(l => (
                <button key={l} onClick={() => onUpdate({ linkStyle: l })}
                  className={`py-1.5 text-xs rounded capitalize transition ${navbar.linkStyle === l ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
                  {l}
                </button>
              ))}
            </div>
          </div>

          <div className="p-2.5 bg-white/5 rounded-xl space-y-3">
            <p className="text-xs font-medium text-gray-300">Link Sizing</p>
            <Slider label="Font size" value={navbar.linkFontSize ?? 14} min={10} max={20} step={1} unit="px" onChange={v => onUpdate({ linkFontSize: v })} />
            <div>
              <p className="text-[11px] text-gray-400 mb-1.5">Font weight</p>
              <div className="grid grid-cols-4 gap-1">
                {([{ v: 400, l: 'Regular' }, { v: 500, l: 'Medium' }, { v: 600, l: 'Semi' }, { v: 700, l: 'Bold' }]).map(w => (
                  <button key={w.v} onClick={() => onUpdate({ linkFontWeight: w.v })}
                    className={`py-1 text-[10px] rounded transition ${(navbar.linkFontWeight ?? 500) === w.v ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
                    {w.l}
                  </button>
                ))}
              </div>
            </div>
            <Slider label="Gap between links" value={navbar.linkGap ?? 14} min={4} max={40} step={1} unit="px" onChange={v => onUpdate({ linkGap: v })} />
            <Slider label="Link padding (H)" value={navbar.linkPaddingX ?? 10} min={0} max={24} step={1} unit="px" onChange={v => onUpdate({ linkPaddingX: v })} />
          </div>
        </>}

        {/* ── CTA TAB ── */}
        {activeTab === 'cta' && <>
          <Toggle label="Show CTA Button" val={navbar.showCta} onClick={() => onUpdate({ showCta: !navbar.showCta })} />
          {navbar.showCta && (
            <>
              <div>
                <label className="text-xs text-gray-400 block mb-1">Button Text</label>
                <input value={navbar.ctaText} onChange={e => onUpdate({ ctaText: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">Button Link</label>
                <input value={navbar.ctaLink} onChange={e => onUpdate({ ctaLink: e.target.value })} placeholder="#contact" className={inputCls} />
              </div>

              <div>
                <p className="text-xs text-gray-400 mb-1.5">Button Style</p>
                <div className="grid grid-cols-2 gap-1.5">
                  {([
                    { id: 'filled' as NavbarCtaStyle, label: 'Filled', desc: 'Solid gradient background' },
                    { id: 'outline' as NavbarCtaStyle, label: 'Outline', desc: 'Transparent with border' },
                    { id: 'ghost' as NavbarCtaStyle, label: 'Ghost', desc: 'Subtle tinted background' },
                    { id: 'pill' as NavbarCtaStyle, label: 'Pill', desc: 'Rounded pill shape' },
                  ]).map(opt => (
                    <button key={opt.id} type="button" onClick={() => onUpdate({ ctaStyle: opt.id })}
                      className={`p-2.5 rounded-xl border text-left transition ${
                        (navbar.ctaStyle ?? 'filled') === opt.id
                          ? 'border-blue-500 bg-blue-500/15 text-white'
                          : 'border-white/10 hover:bg-white/5 text-gray-400'
                      }`}>
                      <p className="text-xs font-semibold">{opt.label}</p>
                      <p className="text-[10px] opacity-60 mt-0.5">{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3 p-2.5 bg-white/[0.03] border border-white/10 rounded-xl">
                <p className="text-xs font-semibold text-gray-300">Custom Colors</p>
                <ColorRow label="Background / Accent color" value={navbar.ctaBgColor ?? ''} onChange={v => onUpdate({ ctaBgColor: v })} hint="Leave empty to use primary theme color" />
                <ColorRow label="Text color" value={navbar.ctaTextColor ?? ''} onChange={v => onUpdate({ ctaTextColor: v })} hint="Leave empty for white" />
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <label className="text-[11px] text-gray-400">Border radius</label>
                  <span className="text-[11px] text-blue-300 font-mono">{navbar.ctaBorderRadius ?? 8}px</span>
                </div>
                <input type="range" min={0} max={24} step={1}
                  value={navbar.ctaBorderRadius ?? 8}
                  onChange={e => onUpdate({ ctaBorderRadius: Number(e.target.value) })}
                  className="w-full h-1.5 rounded-full appearance-none bg-white/10 accent-blue-500 cursor-pointer" />
              </div>
            </>
          )}
        </>}

        {/* ── COLORS TAB ── */}
        {activeTab === 'colors' && (
          <div className="space-y-4">
            <p className="text-[11px] text-gray-500 leading-relaxed">
              Override navbar colors independently from your theme. Leave blank to use theme defaults.
            </p>
            <ColorRow label="Background color" value={navbar.bgColor ?? ''} onChange={v => onUpdate({ bgColor: v })} hint="Overrides the style setting above" />
            <ColorRow label="Border / divider color" value={navbar.borderColor ?? ''} onChange={v => onUpdate({ borderColor: v })} />
            <ColorRow label="Link & text color" value={navbar.textColor ?? ''} onChange={v => onUpdate({ textColor: v })} hint="Overrides link text color globally" />
            <button type="button"
              onClick={() => onUpdate({ bgColor: '', borderColor: '', textColor: '', ctaBgColor: '', ctaTextColor: '' })}
              className="w-full py-2 text-xs text-gray-500 hover:text-gray-300 bg-white/5 rounded-lg transition">
              Reset all color overrides
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

// ── Footer Panel ───────────────────────────────────────────────────────────────
function FooterPanel({
  footer, onUpdate, sections, navbar,
}: {
  footer: FooterConfig;
  onUpdate: (u: Partial<FooterConfig>) => void;
  sections: PortfolioSection[];
  navbar?: NavbarConfig;
}) {
  const [activeTab, setActiveTab] = useState<'layout' | 'content' | 'navigation' | 'colors'>('layout');
  const inputCls = 'w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500';

  const hiddenNav = footer.hiddenNavSections ?? [];
  const customNavLabels = footer.customNavLabels ?? {};
  const visibleSections = useMemo(
    () => sections.filter(s => s.visible).sort((a, b) => a.order - b.order),
    [sections],
  );

  const SECTION_ICONS: Record<string, string> = {
    hero: '🏠', about: '👤', skills: '⚡', experience: '💼', projects: '🚀',
    gallery: '🖼️', testimonials: '💬', contact: '📧', videos: '🎬',
    services: '🛠️', team: '👥', stats: '📊', social: '🔗',
    pricing: '💰', faq: '❓', blog: '📝', custom: '✏️',
  };

  const Toggle = ({ label, val, onClick, hint }: { label: string; val: boolean; onClick: () => void; hint?: string }) => (
    <label className="flex items-center justify-between cursor-pointer p-2 bg-white/5 rounded-lg gap-2">
      <div>
        <span className="text-xs text-gray-300">{label}</span>
        {hint && <p className="text-[10px] text-gray-600 mt-0.5">{hint}</p>}
      </div>
      <div onClick={onClick}
        className={`w-9 h-5 rounded-full transition relative shrink-0 ${val ? 'bg-blue-600' : 'bg-white/10'}`}>
        <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${val ? 'left-4' : 'left-0.5'}`} />
      </div>
    </label>
  );

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="p-2.5 bg-white/5 rounded-lg space-y-2">
      <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">{title}</p>
      {children}
    </div>
  );

  const ColorRow = ({ label, value, onChange, hint }: { label: string; value: string; onChange: (v: string) => void; hint?: string }) => {
    const [open, setOpen] = useState(false);
    return (
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] text-gray-400">{label}</span>
          {value && <button type="button" onClick={() => onChange('')} className="text-[10px] text-gray-600 hover:text-gray-300">reset</button>}
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setOpen(o => !o)}
            className="w-8 h-7 rounded-lg border border-white/20 shrink-0 flex items-center justify-center"
            style={{ background: value || 'transparent' }}>
            {!value && <span className="text-gray-600 text-[10px]">auto</span>}
          </button>
          <input value={value} onChange={e => onChange(e.target.value)} placeholder="auto (uses theme)"
            className={`${inputCls} flex-1`} />
        </div>
        {hint && <p className="text-[10px] text-gray-600 mt-0.5">{hint}</p>}
        {open && (
          <div className="mt-2">
            <HexColorPicker color={value || '#ffffff'} onChange={onChange} style={{ width: '100%' }} />
          </div>
        )}
      </div>
    );
  };

  const toggleNavSection = (id: string) => {
    const next = hiddenNav.includes(id) ? hiddenNav.filter(s => s !== id) : [...hiddenNav, id];
    onUpdate({ hiddenNavSections: next });
  };

  const setNavLabel = (id: string, label: string) => {
    const next = { ...customNavLabels };
    if (label.trim()) next[id] = label.trim();
    else delete next[id];
    onUpdate({ customNavLabels: next });
  };

  const navMax = footer.navMaxItems ?? 0;
  const shownCount = navMax > 0 ? Math.min(navMax, visibleSections.length) : visibleSections.length;

  const tabs = [
    { id: 'layout' as const, label: 'Layout' },
    { id: 'content' as const, label: 'Content' },
    { id: 'navigation' as const, label: 'Navigation' },
    { id: 'colors' as const, label: 'Colors' },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 pt-3 pb-2 border-b border-white/10 shrink-0">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Footer</p>
        <p className="text-[11px] text-gray-600 mt-0.5">Layout, columns, navigation links & colors</p>
      </div>

      <div className="flex gap-1 px-3 pt-2 shrink-0">
        {tabs.map(t => (
          <button key={t.id} type="button" onClick={() => setActiveTab(t.id)}
            className={`flex-1 py-1.5 text-[10px] font-medium rounded-lg transition ${
              activeTab === t.id ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-500 hover:bg-white/10'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        <Toggle label="Enable Footer" val={footer.enabled} onClick={() => onUpdate({ enabled: !footer.enabled })} />

        {footer.enabled && activeTab === 'layout' && (
          <>
            <Section title="Footer Layout">
              <div>
                <p className="text-xs text-gray-400 mb-1.5">Column arrangement</p>
                <div className="grid grid-cols-3 gap-1">
                  {(['standard', 'centered', 'minimal'] as const).map(l => (
                    <button key={l} type="button" onClick={() => onUpdate({ layout: l })}
                      className={`py-1.5 text-[10px] rounded capitalize transition ${(footer.layout ?? 'standard') === l ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
                      {l}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-gray-600 mt-1">Standard = multi-column grid · Centered = aligned center · Minimal = compact single block</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1.5">Background style</p>
                <div className="grid grid-cols-2 gap-1">
                  {(['gradient', 'solid', 'minimal', 'accent'] as const).map(s => (
                    <button key={s} type="button" onClick={() => onUpdate({ style: s })}
                      className={`py-1.5 text-[10px] rounded capitalize transition ${(footer.style ?? 'gradient') === s ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <Toggle label="Top accent gradient bar" val={footer.showAccentBar !== false} onClick={() => onUpdate({ showAccentBar: footer.showAccentBar === false })} />
              <div>
                <p className="text-xs text-gray-400 mb-1.5">Column spacing</p>
                <div className="grid grid-cols-3 gap-1">
                  {(['compact', 'normal', 'wide'] as const).map(g => (
                    <button key={g} type="button" onClick={() => onUpdate({ columnGap: g })}
                      className={`py-1.5 text-[10px] rounded capitalize transition ${(footer.columnGap ?? 'normal') === g ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
                      {g}
                    </button>
                  ))}
                </div>
              </div>
            </Section>
          </>
        )}

        {footer.enabled && activeTab === 'content' && (
          <>
            <Section title="CTA Strip">
              <Toggle label="Show CTA Banner" val={footer.showCta} onClick={() => onUpdate({ showCta: !footer.showCta })} />
              {footer.showCta && (
                <>
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">Title</label>
                    <input value={footer.ctaTitle} onChange={e => onUpdate({ ctaTitle: e.target.value })} className={inputCls} />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">Subtitle</label>
                    <input value={footer.ctaSubtitle} onChange={e => onUpdate({ ctaSubtitle: e.target.value })} className={inputCls} />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">Button Text</label>
                    <input value={footer.ctaButtonText} onChange={e => onUpdate({ ctaButtonText: e.target.value })} className={inputCls} />
                  </div>
                </>
              )}
            </Section>

            <Section title="Brand Column">
              <Toggle label="Show Brand / Logo" val={footer.showBrand} onClick={() => onUpdate({ showBrand: !footer.showBrand })} />
              <Toggle label="Show Description" val={footer.showDescription} onClick={() => onUpdate({ showDescription: !footer.showDescription })} hint="Uses SEO description if custom text is empty" />
              {footer.showDescription && (
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Custom Description</label>
                  <textarea value={footer.customDescription} onChange={e => onUpdate({ customDescription: e.target.value })} rows={3}
                    placeholder="Leave empty to use SEO description"
                    className={`${inputCls} resize-none`} />
                </div>
              )}
              <Toggle label="Show Live Badge" val={footer.showLiveBadge} onClick={() => onUpdate({ showLiveBadge: !footer.showLiveBadge })} hint="Only when portfolio is published" />
            </Section>

            <Section title="Contact Column">
              <Toggle label="Show Contact Info" val={footer.showContact} onClick={() => onUpdate({ showContact: !footer.showContact })} hint="From Contact section fields" />
              {footer.showContact && (
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Column Heading</label>
                  <input value={footer.contactHeading} onChange={e => onUpdate({ contactHeading: e.target.value })} className={inputCls} />
                </div>
              )}
            </Section>

            <Section title="Social Column">
              <Toggle label="Show Social Links" val={footer.showSocial} onClick={() => onUpdate({ showSocial: !footer.showSocial })} hint="From Social panel" />
              {footer.showSocial && (
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Column Heading</label>
                  <input value={footer.socialHeading} onChange={e => onUpdate({ socialHeading: e.target.value })} className={inputCls} />
                </div>
              )}
            </Section>

            <Section title="Bottom Bar">
              <Toggle label="Show Copyright" val={footer.showCopyright} onClick={() => onUpdate({ showCopyright: !footer.showCopyright })} />
              {footer.showCopyright && (
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Custom Copyright Text</label>
                  <input value={footer.copyrightText} onChange={e => onUpdate({ copyrightText: e.target.value })} placeholder="Leave empty for default"
                    className={inputCls} />
                </div>
              )}
              <Toggle label="Show Back to Top" val={footer.showBackToTop} onClick={() => onUpdate({ showBackToTop: !footer.showBackToTop })} />
              <Toggle label="Show Built With Credit" val={footer.showBuiltWith} onClick={() => onUpdate({ showBuiltWith: !footer.showBuiltWith })} />
            </Section>
          </>
        )}

        {footer.enabled && activeTab === 'navigation' && (
          <>
            <Toggle label="Show Navigation Column" val={footer.showNavigation} onClick={() => onUpdate({ showNavigation: !footer.showNavigation })} />

            {footer.showNavigation && (
              <>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Column Heading</label>
                  <input value={footer.navHeading} onChange={e => onUpdate({ navHeading: e.target.value })} className={inputCls} />
                </div>

                <Toggle
                  label="Sync with navbar visibility"
                  val={footer.syncNavWithNavbar !== false}
                  onClick={() => onUpdate({ syncNavWithNavbar: footer.syncNavWithNavbar === false })}
                  hint="Hide links in footer when hidden in Navbar → Links tab"
                />

                <div className="p-2.5 bg-white/[0.03] border border-white/10 rounded-xl space-y-2">
                  <div className="flex justify-between items-center">
                    <p className="text-xs font-medium text-gray-300">Max links to show</p>
                    <span className="text-[11px] text-blue-300 font-mono">{navMax === 0 ? 'All' : navMax}</span>
                  </div>
                  <input type="range" min={0} max={12} step={1} value={navMax}
                    onChange={e => onUpdate({ navMaxItems: Number(e.target.value) })}
                    className="w-full h-1.5 rounded-full appearance-none bg-white/10 accent-blue-500 cursor-pointer" />
                  <p className="text-[10px] text-gray-600">
                    {navMax === 0
                      ? `Showing all ${visibleSections.length} visible sections`
                      : `Showing first ${shownCount} of ${visibleSections.length} sections`}
                  </p>
                  <div className="flex gap-1">
                    {[0, 4, 6, 8].map(n => (
                      <button key={n} type="button" onClick={() => onUpdate({ navMaxItems: n })}
                        className={`flex-1 py-1 text-[10px] rounded transition ${navMax === n ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-500 hover:bg-white/10'}`}>
                        {n === 0 ? 'All' : n}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs text-gray-400 mb-1.5">Link display style</p>
                  <div className="grid grid-cols-3 gap-1">
                    {([
                      { id: 'list' as const, label: 'List' },
                      { id: 'inline' as const, label: 'Inline' },
                      { id: 'columns' as const, label: '2 Columns' },
                    ]).map(o => (
                      <button key={o.id} type="button" onClick={() => onUpdate({ navLayout: o.id })}
                        className={`py-1.5 text-[10px] rounded transition ${(footer.navLayout ?? 'list') === o.id ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
                        {o.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold text-gray-300 mb-0.5">Footer nav links</p>
                  <p className="text-[10px] text-gray-500 mb-3">Toggle which sections appear in footer navigation. Rename labels independently from navbar.</p>
                  <div className="space-y-1.5">
                    {visibleSections.map(s => {
                      const navbarHidden = navbar?.hiddenSections?.includes(s.id);
                      const footerHidden = hiddenNav.includes(s.id);
                      const isHidden = footerHidden || (footer.syncNavWithNavbar !== false && navbarHidden);
                      const icon = SECTION_ICONS[s.type] || '📄';
                      return (
                        <div key={s.id} className={`rounded-xl border transition ${isHidden ? 'border-white/5 bg-white/2 opacity-50' : 'border-white/10 bg-white/3'}`}>
                          <div className="flex items-center gap-2 px-3 py-2">
                            <span className="text-sm shrink-0">{icon}</span>
                            <div className="flex-1 min-w-0">
                              <span className="text-xs font-medium text-gray-300 truncate block">{s.title}</span>
                              {footer.syncNavWithNavbar !== false && navbarHidden && !footerHidden && (
                                <span className="text-[9px] text-amber-500/80">Hidden via navbar</span>
                              )}
                            </div>
                            <button type="button" onClick={() => toggleNavSection(s.id)}
                              className={`w-8 h-4 rounded-full transition relative shrink-0 ${!footerHidden ? 'bg-blue-600' : 'bg-white/10'}`}>
                              <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${!footerHidden ? 'left-4' : 'left-0.5'}`} />
                            </button>
                          </div>
                          {!footerHidden && (
                            <div className="px-3 pb-2">
                              <input
                                value={customNavLabels[s.id] ?? ''}
                                onChange={e => setNavLabel(s.id, e.target.value)}
                                placeholder={`Footer label (default: "${s.title}")`}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1 text-[11px] text-white placeholder-gray-600 focus:outline-none focus:border-blue-500"
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </>
        )}

        {footer.enabled && activeTab === 'colors' && (
          <div className="space-y-4">
            <p className="text-[11px] text-gray-500 leading-relaxed">
              Override footer colors independently from your theme. Leave blank to use theme defaults.
            </p>
            <ColorRow label="Background color" value={footer.bgColor ?? ''} onChange={v => onUpdate({ bgColor: v })} />
            <ColorRow label="Text color" value={footer.textColor ?? ''} onChange={v => onUpdate({ textColor: v })} />
            <ColorRow label="Border color" value={footer.borderColor ?? ''} onChange={v => onUpdate({ borderColor: v })} />
            <button type="button"
              onClick={() => onUpdate({ bgColor: '', textColor: '', borderColor: '' })}
              className="w-full py-2 text-xs text-gray-500 hover:text-gray-300 bg-white/5 rounded-lg transition">
              Reset all color overrides
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Color palette presets ────────────────────────────────────────────────────
const PALETTES = [
  { name: 'Indigo Night', primary: '#6366f1', secondary: '#8b5cf6', accent: '#f59e0b', bg: '#0a0a0a', text: '#f1f5f9' },
  { name: 'Rose Gold', primary: '#f43f5e', secondary: '#ec4899', accent: '#fbbf24', bg: '#0f0a0a', text: '#fdf2f8' },
  { name: 'Ocean Blue', primary: '#0ea5e9', secondary: '#06b6d4', accent: '#f97316', bg: '#020f1a', text: '#e0f2fe' },
  { name: 'Forest', primary: '#22c55e', secondary: '#16a34a', accent: '#eab308', bg: '#030a05', text: '#f0fdf4' },
  { name: 'Sunset', primary: '#f97316', secondary: '#ef4444', accent: '#a855f7', bg: '#0f0805', text: '#fff7ed' },
  { name: 'Minimal Light', primary: '#18181b', secondary: '#3f3f46', accent: '#6366f1', bg: '#ffffff', text: '#18181b' },
  { name: 'Purple Haze', primary: '#a855f7', secondary: '#7c3aed', accent: '#06b6d4', bg: '#0d0014', text: '#faf5ff' },
  { name: 'Gold Luxury', primary: '#d4af37', secondary: '#b8960c', accent: '#e2e8f0', bg: '#0a0800', text: '#fefce8' },
];

function ThemePanel({ theme, onUpdate }: { theme: ThemeConfig; onUpdate: (u: Partial<ThemeConfig>) => void }) {
  const [activePicker, setActivePicker] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'colors' | 'typography' | 'layout'>('colors');

  const colorFields: { key: keyof ThemeConfig; label: string }[] = [
    { key: 'primaryColor', label: 'Primary' },
    { key: 'secondaryColor', label: 'Secondary' },
    { key: 'accentColor', label: 'Accent' },
    { key: 'backgroundColor', label: 'Background' },
    { key: 'textColor', label: 'Text' },
  ];

  const fonts = ['Inter', 'Playfair Display', 'Roboto', 'Poppins', 'Montserrat', 'Raleway', 'Space Grotesk', 'DM Sans', 'Lato', 'Nunito', 'Josefin Sans', 'Bebas Neue'];

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-white/10">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Theme</p>
        <div className="flex gap-1">
          {(['colors', 'typography', 'layout'] as const).map(t => (
            <button key={t} onClick={() => setActiveTab(t)}
              className={`flex-1 py-1 text-xs rounded transition capitalize ${activeTab === t ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {activeTab === 'colors' && (
          <>
            {/* Palette presets */}
            <div>
              <p className="text-xs text-gray-500 mb-2">Presets</p>
              <div className="grid grid-cols-2 gap-1.5">
                {PALETTES.map(p => (
                  <button key={p.name} onClick={() => onUpdate({ primaryColor: p.primary, secondaryColor: p.secondary, accentColor: p.accent, backgroundColor: p.bg, textColor: p.text })}
                    className="flex items-center gap-2 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition text-left border border-white/5 hover:border-white/20">
                    <div className="flex gap-0.5 shrink-0">
                      {[p.primary, p.secondary, p.accent].map((c, i) => (
                        <div key={i} className="w-3 h-3 rounded-full" style={{ background: c }} />
                      ))}
                    </div>
                    <span className="text-xs text-gray-400 truncate">{p.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Individual color pickers */}
            <div>
              <p className="text-xs text-gray-500 mb-2">Custom Colors</p>
              <div className="space-y-1.5">
                {colorFields.map(({ key, label }) => (
                  <div key={key} className="relative">
                    <button onClick={() => setActivePicker(activePicker === key ? null : key)}
                      className="w-full flex items-center gap-2 px-2.5 py-2 bg-white/5 rounded-lg hover:bg-white/10 transition">
                      <div className="w-5 h-5 rounded border border-white/20 shrink-0" style={{ background: theme[key] as string }} />
                      <span className="text-xs text-gray-300 flex-1 text-left">{label}</span>
                      <span className="text-xs text-gray-600 font-mono">{(theme[key] as string).toUpperCase()}</span>
                    </button>
                    {activePicker === key && (
                      <div className="absolute right-0 top-full mt-1 z-50 bg-[#1a1a1a] border border-white/10 rounded-xl p-3 shadow-2xl">
                        <HexColorPicker color={theme[key] as string} onChange={v => onUpdate({ [key]: v })} />
                        <input value={theme[key] as string} onChange={e => onUpdate({ [key]: e.target.value })}
                          className="mt-2 w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-white font-mono focus:outline-none" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {activeTab === 'typography' && (
          <>
            <div>
              <p className="text-xs text-gray-500 mb-2">Font Family</p>
              <select value={theme.fontFamily} onChange={e => onUpdate({ fontFamily: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none">
                {fonts.map(f => <option key={f} value={f} className="bg-[#1a1a1a]">{f}</option>)}
              </select>
              <p className="text-xs text-gray-600 mt-1" style={{ fontFamily: theme.fontFamily }}>The quick brown fox jumps over the lazy dog</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-2">Font Size</p>
              <div className="flex gap-1">
                {(['sm', 'md', 'lg'] as const).map(s => (
                  <button key={s} onClick={() => onUpdate({ fontSize: s })}
                    className={`flex-1 py-1.5 text-xs rounded transition uppercase ${theme.fontSize === s ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {activeTab === 'layout' && (
          <>
            <div>
              <p className="text-xs text-gray-500 mb-2">Border Radius</p>
              <div className="grid grid-cols-5 gap-1">
                {([
                  { v: 'none', preview: 'rounded-none', label: 'None' },
                  { v: 'sm', preview: 'rounded', label: 'SM' },
                  { v: 'md', preview: 'rounded-lg', label: 'MD' },
                  { v: 'lg', preview: 'rounded-2xl', label: 'LG' },
                  { v: 'full', preview: 'rounded-full', label: 'Full' },
                ] as const).map(({ v, preview, label }) => (
                  <button key={v} onClick={() => onUpdate({ borderRadius: v })}
                    className={`flex flex-col items-center gap-1 py-2 px-1 rounded-lg border transition ${theme.borderRadius === v ? 'border-blue-500 bg-blue-500/15' : 'border-white/10 hover:bg-white/5'}`}>
                    <div className={`w-5 h-5 border-2 ${theme.borderRadius === v ? 'border-blue-400' : 'border-gray-500'} ${preview}`} />
                    <span className="text-xs text-gray-400">{label}</span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-2">Section Spacing</p>
              <div className="grid grid-cols-3 gap-1">
                {([
                  { v: 'compact', label: 'Compact', bars: 2 },
                  { v: 'normal', label: 'Normal', bars: 3 },
                  { v: 'relaxed', label: 'Relaxed', bars: 5 },
                ] as const).map(({ v, label, bars }) => (
                  <button key={v} onClick={() => onUpdate({ spacing: v })}
                    className={`flex flex-col items-center gap-1.5 py-2.5 rounded-xl border transition ${theme.spacing === v ? 'border-blue-500 bg-blue-500/15' : 'border-white/10 hover:bg-white/5'}`}>
                    <div className="flex flex-col gap-0.5 w-6">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className={`h-1 rounded-full ${theme.spacing === v ? 'bg-blue-400' : 'bg-gray-600'}`} style={{ marginBottom: i < 2 ? bars * 1.5 : 0 }} />
                      ))}
                    </div>
                    <span className="text-xs text-gray-400">{label}</span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-2">Animation Style</p>
              <div className="grid grid-cols-2 gap-2">
                {([
                  { v: 'none', label: 'None', icon: '⏹', desc: 'No animation' },
                  { v: 'subtle', label: 'Subtle', icon: '🌊', desc: 'Gentle fade up' },
                  { v: 'moderate', label: 'Moderate', icon: '✨', desc: 'Smooth slide' },
                  { v: 'expressive', label: 'Expressive', icon: '🚀', desc: 'Bold spring' },
                ] as const).map(({ v, label, icon, desc }) => (
                  <button key={v} onClick={() => onUpdate({ animation: v })}
                    className={`p-2.5 rounded-xl border text-left transition ${theme.animation === v ? 'border-blue-500 bg-blue-500/15' : 'border-white/10 hover:border-white/20 hover:bg-white/5'}`}>
                    <div className="text-xl mb-1">{icon}</div>
                    <p className="text-xs font-semibold text-white">{label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Templates Panel ──────────────────────────────────────────────────────────
function TemplatesPanel({ current, onSwitch }: { current: string; onSwitch: (id: string) => void }) {
  return (
    <div className="p-3 space-y-3">
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Templates</p>
        <p className="text-[11px] text-gray-600 mt-1">Switch design — colors, fonts & layout update instantly.</p>
      </div>
      <TemplatesGallery
        templates={TEMPLATES}
        selectedId={current}
        onSelect={onSwitch}
        compact
        showSearch
        showCategories
      />
    </div>
  );
}

// ── SEO Panel ────────────────────────────────────────────────────────────────
function SEOPanel({ seo, onUpdate }: { seo: any; onUpdate: (u: any) => void }) {
  const charCount = (seo.description || '').length;
  return (
    <div className="p-3 space-y-3">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">SEO Settings</p>

      {/* Preview card */}
      <div className="bg-white/5 rounded-xl p-3 border border-white/10">
        <p className="text-xs text-blue-400 truncate">{seo.canonicalUrl || 'https://yoursite.com'}</p>
        <p className="text-sm text-blue-300 font-medium mt-0.5 truncate">{seo.title || 'Page Title'}</p>
        <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{seo.description || 'Meta description will appear here...'}</p>
      </div>

      {[
        { key: 'title', label: 'Page Title', type: 'text', placeholder: 'John Doe - Portfolio', max: 60 },
        { key: 'description', label: 'Meta Description', type: 'textarea', placeholder: 'Full stack developer...', max: 160 },
        { key: 'keywords', label: 'Keywords', type: 'text', placeholder: 'developer, react, portfolio' },
        { key: 'canonicalUrl', label: 'Canonical URL', type: 'url', placeholder: 'https://yoursite.com' },
        { key: 'twitterHandle', label: 'Twitter Handle', type: 'text', placeholder: '@yourhandle' },
        { key: 'ogImage', label: 'OG Image URL', type: 'url', placeholder: 'https://...' },
      ].map(f => (
        <div key={f.key}>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs text-gray-400">{f.label}</label>
            {f.max && f.key === 'description' && (
              <span className={`text-xs ${charCount > f.max ? 'text-red-400' : 'text-gray-600'}`}>{charCount}/{f.max}</span>
            )}
          </div>
          {f.type === 'textarea' ? (
            <textarea value={seo[f.key] || ''} onChange={e => onUpdate({ [f.key]: e.target.value })} rows={3} placeholder={f.placeholder}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 resize-none" />
          ) : (
            <input type={f.type} value={seo[f.key] || ''} onChange={e => onUpdate({ [f.key]: e.target.value })} placeholder={f.placeholder}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-blue-500" />
          )}
        </div>
      ))}
    </div>
  );
}

// ── SMTP Panel ───────────────────────────────────────────────────────────────
const SMTP_PRESETS: Record<string, Partial<SMTPConfig>> = {
  gmail:    { host: 'smtp.gmail.com',     port: 587, secure: false },
  outlook:  { host: 'smtp.office365.com', port: 587, secure: false },
  sendgrid: { host: 'smtp.sendgrid.net',  port: 587, secure: false },
  mailgun:  { host: 'smtp.mailgun.org',   port: 587, secure: false },
  custom:   { host: '',                   port: 587, secure: false },
};

function isSMTPConfigured(smtp: SMTPConfig) {
  return Boolean(smtp.host?.trim() && smtp.user?.trim() && smtp.password?.trim());
}

const SMTP_PROVIDER_HINTS: Partial<Record<SMTPConfig['provider'], string>> = {
  gmail: 'Gmail: use an App Password (2FA → Google Account → Security → App Passwords).',
  outlook: 'Outlook / Microsoft 365: use your email and app password if 2FA is enabled.',
  sendgrid: 'SendGrid: username must be apikey and password is your SendGrid API key.',
  mailgun: 'Mailgun: use SMTP credentials from your Mailgun domain settings.',
};

function SMTPPanel({ smtp, onUpdate }: { smtp: SMTPConfig; onUpdate: (u: Partial<SMTPConfig>) => void }) {
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<'idle' | 'ok' | 'fail'>('idle');
  const [testError, setTestError] = useState('');
  const configured = isSMTPConfigured(smtp);

  const testConnection = async () => {
    setTesting(true); setTestResult('idle'); setTestError('');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Test', email: smtp.user, message: `SMTP test from ${APP_NAME}`, smtp }),
      });
      if (res.ok) {
        setTestResult('ok');
      } else {
        const data = await res.json().catch(() => ({}));
        setTestError(data.error || 'Connection failed');
        setTestResult('fail');
      }
    } catch {
      setTestError('Network error');
      setTestResult('fail');
    } finally { setTesting(false); }
  };

  return (
    <div className="p-3 space-y-3">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Email / SMTP</p>
      <p className="text-xs text-gray-500">Connect your email to receive contact form submissions.</p>

      <div className={`rounded-lg px-3 py-2 text-xs border ${configured ? 'bg-green-500/10 border-green-500/25 text-green-300' : 'bg-amber-500/10 border-amber-500/25 text-amber-300'}`}>
        {configured ? '✓ SMTP configured — contact form can send emails' : '⚠ Fill host, username & password to enable the contact form'}
      </div>

      <div>
        <p className="text-xs text-gray-400 mb-1.5">Provider Preset</p>
        <div className="grid grid-cols-3 gap-1">
          {(['gmail', 'outlook', 'sendgrid', 'mailgun', 'custom'] as const).map(p => (
            <button key={p} onClick={() => onUpdate({ ...SMTP_PRESETS[p], provider: p })}
              className={`py-1.5 text-xs rounded transition capitalize ${smtp.provider === p ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
              {p}
            </button>
          ))}
        </div>
      </div>

      {SMTP_PROVIDER_HINTS[smtp.provider] && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-2.5 text-xs text-amber-300 leading-relaxed">
          {SMTP_PROVIDER_HINTS[smtp.provider]}
        </div>
      )}

      {[
        { key: 'host', label: 'SMTP Host', placeholder: 'smtp.gmail.com', type: 'text' },
        { key: 'port', label: 'Port', placeholder: '587', type: 'number' },
        { key: 'user', label: 'Username / Email', placeholder: 'you@gmail.com', type: 'text' },
        { key: 'password', label: 'Password / API Key', placeholder: '••••••••', type: 'password' },
        { key: 'fromName', label: 'From Name', placeholder: 'My Portfolio', type: 'text' },
        { key: 'toEmail', label: 'Deliver To', placeholder: 'you@gmail.com', type: 'email' },
      ].map(f => (
        <div key={f.key}>
          <label className="text-xs text-gray-400 block mb-1">{f.label}</label>
          <input type={f.type} value={(smtp as any)[f.key] || ''} placeholder={f.placeholder}
            onChange={e => onUpdate({ [f.key]: f.key === 'port' ? Number(e.target.value) : e.target.value } as any)}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-blue-500" />
        </div>
      ))}

      <label className="flex items-center gap-2 cursor-pointer">
        <div onClick={() => onUpdate({ secure: !smtp.secure })}
          className={`w-9 h-5 rounded-full transition relative shrink-0 ${smtp.secure ? 'bg-blue-600' : 'bg-white/10'}`}>
          <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${smtp.secure ? 'left-4' : 'left-0.5'}`} />
        </div>
        <span className="text-xs text-gray-400">Use SSL/TLS (port 465)</span>
      </label>

      <button onClick={testConnection} disabled={testing || !smtp.host || !smtp.user}
        className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition text-sm">
        {testing ? <Loader className="w-4 h-4 animate-spin" /> : <TestTube className="w-4 h-4" />}
        {testing ? 'Testing...' : 'Send Test Email'}
      </button>
      {testResult === 'ok' && <p className="text-xs text-green-400 text-center">✅ Test email sent!</p>}
      {testResult === 'fail' && (
        <p className="text-xs text-red-400 text-center">
          ❌ Failed{testError ? `: ${testError}` : '. Check credentials.'}
        </p>
      )}
    </div>
  );
}

// ── Popup Panel ──────────────────────────────────────────────────────────────
function PopupPanel({ popup, theme, onUpdate }: { popup: PopupConfig; theme: ThemeConfig; onUpdate: (u: Partial<PopupConfig>) => void }) {
  const { triggerPopupPreview, setMobilePanel } = useBuilderStore();
  const [bgPicker, setBgPicker] = useState(false);
  const [txtPicker, setTxtPicker] = useState(false);
  const [showInlinePreview, setShowInlinePreview] = useState(false);

  const handleShowPreview = () => {
    setShowInlinePreview(true);
    triggerPopupPreview();
    setMobilePanel('preview');
  };

  return (
    <div className="p-3 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Landing Popup</p>
        <button
          type="button"
          onClick={handleShowPreview}
          className="flex items-center gap-1.5 text-[10px] font-semibold text-blue-300 bg-blue-500/15 hover:bg-blue-500/25 border border-blue-500/30 px-2.5 py-1 rounded-lg transition"
        >
          <Eye className="w-3 h-3" /> Show
        </button>
      </div>

      {showInlinePreview && (
        <div className="rounded-xl border border-blue-500/30 bg-black/30 p-3 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-[10px] text-blue-400 uppercase tracking-wider font-medium">Live Preview</p>
            <button type="button" onClick={() => setShowInlinePreview(false)} className="text-[10px] text-gray-500 hover:text-gray-300 transition">
              Hide
            </button>
          </div>
          <PopupCard popup={popup} theme={theme} compact showClose={false} />
          <p className="text-[10px] text-gray-600">Updates as you edit. Click Show again to open full preview on canvas.</p>
        </div>
      )}

      <label className="flex items-center justify-between cursor-pointer p-2 bg-white/5 rounded-lg">
        <span className="text-sm text-gray-300">Enable Popup</span>
        <div onClick={() => onUpdate({ enabled: !popup.enabled })}
          className={`w-10 h-5 rounded-full transition relative shrink-0 ${popup.enabled ? 'bg-blue-600' : 'bg-white/10'}`}>
          <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${popup.enabled ? 'left-5' : 'left-0.5'}`} />
        </div>
      </label>

      <>
          <div>
            <p className="text-xs text-gray-400 mb-1.5">Type</p>
            <div className="space-y-1">
              {([
                { v: 'message', label: '💬 Message', desc: 'Simple welcome message' },
                { v: 'email-capture', label: '📧 Email Capture', desc: 'Collect email addresses' },
                { v: 'announcement', label: '📢 Announcement', desc: 'Important notice' },
              ] as const).map(({ v, label, desc }) => (
                <button key={v} onClick={() => onUpdate({ type: v })}
                  className={`w-full text-left p-2.5 rounded-lg border transition ${popup.type === v ? 'border-blue-500 bg-blue-500/10' : 'border-white/10 hover:bg-white/5'}`}>
                  <p className="text-xs font-medium">{label}</p>
                  <p className="text-xs text-gray-500">{desc}</p>
                </button>
              ))}
            </div>
          </div>

          {[
            { key: 'title', label: 'Title' },
            { key: 'message', label: 'Message', textarea: true },
            ...(popup.type !== 'email-capture' ? [{ key: 'buttonText', label: 'Button Text' }] : []),
          ].map((f: any) => (
            <div key={f.key}>
              <label className="text-xs text-gray-400 block mb-1">{f.label}</label>
              {f.textarea ? (
                <textarea value={(popup as any)[f.key]} onChange={e => onUpdate({ [f.key]: e.target.value })} rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 resize-none" />
              ) : (
                <input value={(popup as any)[f.key]} onChange={e => onUpdate({ [f.key]: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500" />
              )}
            </div>
          ))}

          <div>
            <label className="text-xs text-gray-400 block mb-1">Delay (seconds)</label>
            <input type="range" min={0} max={15} value={popup.delay} onChange={e => onUpdate({ delay: Number(e.target.value) })}
              className="w-full accent-blue-500" />
            <p className="text-xs text-gray-600 text-right">{popup.delay}s</p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Background', key: 'bgColor', open: bgPicker, setOpen: setBgPicker, closeOther: () => setTxtPicker(false) },
              { label: 'Text', key: 'textColor', open: txtPicker, setOpen: setTxtPicker, closeOther: () => setBgPicker(false) },
            ].map(({ label, key, open, setOpen, closeOther }) => (
              <div key={key} className="relative">
                <p className="text-xs text-gray-400 mb-1">{label}</p>
                <button onClick={() => { setOpen(!open); closeOther(); }}
                  className="w-full h-8 rounded-lg border border-white/10 transition hover:border-white/30" style={{ background: (popup as any)[key] }} />
                {open && (
                  <div className="absolute left-0 top-full mt-1 z-50 bg-[#1a1a1a] border border-white/10 rounded-xl p-3 shadow-2xl">
                    <HexColorPicker color={(popup as any)[key]} onChange={v => onUpdate({ [key]: v })} />
                  </div>
                )}
              </div>
            ))}
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <div onClick={() => onUpdate({ showOnce: !popup.showOnce })}
              className={`w-9 h-5 rounded-full transition relative shrink-0 ${popup.showOnce ? 'bg-blue-600' : 'bg-white/10'}`}>
              <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${popup.showOnce ? 'left-4' : 'left-0.5'}`} />
            </div>
            <span className="text-xs text-gray-400">Show once per session</span>
          </label>

          <button
            type="button"
            onClick={handleShowPreview}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition"
          >
            <Eye className="w-3.5 h-3.5" /> Show Popup Preview
          </button>
      </>
    </div>
  );
}

// ── Social Panel ─────────────────────────────────────────────────────────────
const SOCIAL_FIELDS: { key: keyof SocialLinks; label: string; placeholder: string; icon: string }[] = [
  { key: 'github', label: 'GitHub', placeholder: 'https://github.com/username', icon: '🐙' },
  { key: 'linkedin', label: 'LinkedIn', placeholder: 'https://linkedin.com/in/username', icon: '💼' },
  { key: 'twitter', label: 'Twitter / X', placeholder: 'https://twitter.com/username', icon: '🐦' },
  { key: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/username', icon: '📸' },
  { key: 'youtube', label: 'YouTube', placeholder: 'https://youtube.com/@channel', icon: '▶️' },
  { key: 'dribbble', label: 'Dribbble', placeholder: 'https://dribbble.com/username', icon: '🏀' },
  { key: 'behance', label: 'Behance', placeholder: 'https://behance.net/username', icon: '🎨' },
  { key: 'website', label: 'Website', placeholder: 'https://yourwebsite.com', icon: '🌐' },
];

function SocialPanel({ social, onUpdate }: { social: SocialLinks; onUpdate: (u: Partial<SocialLinks>) => void }) {
  return (
    <div className="p-3 space-y-3">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Social Links</p>
      <p className="text-xs text-gray-500">These appear in the hero section and footer.</p>
      {SOCIAL_FIELDS.map(f => (
        <div key={f.key}>
          <label className="text-xs text-gray-400 flex items-center gap-1.5 mb-1">
            <span>{f.icon}</span>{f.label}
          </label>
          <div className="flex gap-1.5">
            <input type="url" value={(social as any)[f.key] || ''} placeholder={f.placeholder}
              onChange={e => onUpdate({ [f.key]: e.target.value })}
              className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-blue-500" />
            {(social as any)[f.key] && (
              <a href={(social as any)[f.key]} target="_blank" rel="noopener noreferrer"
                className="p-1.5 bg-white/5 rounded-lg hover:bg-white/10 transition text-gray-400 hover:text-white">
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Analytics Panel ──────────────────────────────────────────────────────────
function AnalyticsPanel({ portfolio }: { portfolio: any }) {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const views = useMemo(() => days.map(() => Math.floor(Math.random() * 80 + 20)), []);
  const maxV = Math.max(...views);
  const totalViews = views.reduce((a, b) => a + b, 0);
  const totalSections = portfolio.sections.filter((s: any) => s.visible).length;

  return (
    <div className="p-3 space-y-4">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Analytics</p>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-2">
        {[
          { label: 'Total Views', value: totalViews, color: 'text-blue-400' },
          { label: 'Unique Visitors', value: Math.floor(totalViews * 0.7), color: 'text-green-400' },
          { label: 'Sections', value: totalSections, color: 'text-blue-400' },
          { label: 'Avg. Time', value: '2m 34s', color: 'text-blue-400' },
        ].map((s, i) => (
          <div key={i} className="bg-white/5 rounded-xl p-3 border border-white/5">
            <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Bar chart */}
      <div>
        <p className="text-xs text-gray-500 mb-2">Views this week</p>
        <div className="flex items-end gap-1 h-20">
          {views.map((v, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full rounded-t transition-all" style={{ height: `${(v / maxV) * 64}px`, background: `linear-gradient(to top, #6366f1, #8b5cf6)` }} />
              <span className="text-xs text-gray-600">{days[i]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Portfolio info */}
      <div className="space-y-2 border-t border-white/10 pt-3">
        <div className="flex justify-between text-xs">
          <span className="text-gray-500">Status</span>
          <span className={portfolio.published ? 'text-green-400' : 'text-gray-400'}>{portfolio.published ? '🟢 Live' : '⚫ Draft'}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-gray-500">Template</span>
          <span className="text-gray-300">{portfolio.templateId}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-gray-500">Sections</span>
          <span className="text-gray-300">{portfolio.sections.length} total</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-gray-500">Language</span>
          <span className="text-gray-300 uppercase">{portfolio.language}</span>
        </div>
      </div>

      <p className="text-xs text-gray-600 text-center">Analytics are simulated. Connect a real analytics service via custom code.</p>
    </div>
  );
}

// ── Custom CSS Panel ─────────────────────────────────────────────────────────
function CSSPanel({ theme, onUpdate }: { theme: ThemeConfig; onUpdate: (u: Partial<ThemeConfig>) => void }) {
  const placeholder = `/* Custom CSS — applied globally */

/* Example: style the hero section */
.section-hero h1 {
  letter-spacing: -0.02em;
}

/* Example: custom button hover */
a[href] {
  transition: all 0.3s ease;
}`;

  return (
    <div className="p-3 space-y-3 flex flex-col h-full">
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Custom CSS</p>
        <p className="text-xs text-gray-500 mt-1">Injected into the portfolio preview and exports.</p>
      </div>

      <textarea
        value={theme.customCSS || ''}
        onChange={e => onUpdate({ customCSS: e.target.value })}
        placeholder={placeholder}
        spellCheck={false}
        className="flex-1 w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-3 py-3 text-xs text-green-300 font-mono focus:outline-none focus:border-blue-500 resize-none leading-relaxed"
        style={{ minHeight: 300 }}
      />

      <div className="space-y-1.5">
        <p className="text-xs text-gray-500">Quick snippets</p>
        {[
          { label: 'Hide nav', css: 'nav { display: none; }' },
          { label: 'Full-width sections', css: '.section .container { max-width: 100%; }' },
          { label: 'Glassmorphism cards', css: '.card { backdrop-filter: blur(10px); background: rgba(255,255,255,0.05); }' },
        ].map(s => (
          <button key={s.label} onClick={() => onUpdate({ customCSS: (theme.customCSS || '') + '\n' + s.css })}
            className="w-full text-left px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs text-gray-400 hover:text-white transition font-mono">
            + {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}
