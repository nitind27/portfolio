'use client';

import { useState } from 'react';
import { HexColorPicker } from 'react-colorful';
import { Layout, Paintbrush } from 'lucide-react';
import { useBuilderStore } from '@/lib/store';
import type { HeroBackgroundSettings, HeroBgType, HeroLayoutId, HeroTextMode } from '@/lib/types';
import {
  buildHeroGradient,
  DEFAULT_HERO_BACKGROUND,
  getHeroBackground,
  HERO_BG_TYPE_OPTIONS,
  HERO_LAYOUT_OPTIONS,
} from '@/lib/hero-background';

interface Props { sectionId: string; }

function LayoutThumb({ id }: { id: HeroLayoutId }) {
  const box = 'rounded-[3px] bg-blue-500/70';
  const dim = 'rounded-[2px] bg-white/25';

  switch (id) {
    case 'text-only':
      return (
        <div className="flex flex-col gap-1 h-full p-1.5 justify-center">
          <div className={`h-1.5 w-3/4 ${dim}`} /><div className={`h-1 w-full ${dim}`} /><div className={`h-1 w-2/3 ${dim}`} />
        </div>
      );
    case 'image-right':
      return (
        <div className="flex gap-1 h-full p-1.5">
          <div className="flex-1 flex flex-col gap-0.5 justify-center"><div className={`h-1 w-full ${dim}`} /><div className={`h-1 w-4/5 ${dim}`} /></div>
          <div className={`w-[38%] ${box}`} />
        </div>
      );
    case 'image-left':
      return (
        <div className="flex gap-1 h-full p-1.5">
          <div className={`w-[38%] ${box}`} />
          <div className="flex-1 flex flex-col gap-0.5 justify-center"><div className={`h-1 w-full ${dim}`} /><div className={`h-1 w-4/5 ${dim}`} /></div>
        </div>
      );
    case 'banner':
      return (
        <div className="relative h-full p-1">
          <div className={`h-full rounded ${box}`} />
          <div className="absolute bottom-1.5 left-1.5 right-1.5"><div className={`h-1 w-2/3 ${dim}`} /></div>
        </div>
      );
    case 'slideshow':
      return (
        <div className="flex flex-col h-full p-1 gap-0.5">
          <div className={`flex-1 ${box} opacity-90`} />
          <div className="flex gap-0.5 justify-center">{[1, 2, 3].map(i => <div key={i} className="w-1 h-1 rounded-full bg-white/40" />)}</div>
        </div>
      );
    case 'split':
      return <div className="grid grid-cols-2 h-full p-1 gap-0.5"><div className={box} /><div className={`${box} opacity-75`} /></div>;
    default:
      return null;
  }
}

function ColorField({ label, value, onChange, presets }: {
  label: string; value: string; onChange: (v: string) => void; presets?: string[];
}) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">{label}</p>
      <div className="flex items-center gap-2">
        <button type="button" onClick={() => setOpen(o => !o)}
          className="w-8 h-8 rounded-lg border border-white/20 shrink-0"
          style={{ background: value }} />
        <input value={value} onChange={e => onChange(e.target.value)}
          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs text-white font-mono focus:outline-none focus:border-blue-500" />
      </div>
      {presets && presets.length > 0 && (
        <div className="flex gap-1 mt-1.5 flex-wrap">
          {presets.map(c => (
            <button key={c} type="button" onClick={() => onChange(c)}
              className="w-5 h-5 rounded-md border border-white/15" style={{ background: c }} title={c} />
          ))}
        </div>
      )}
      {open && (
        <div className="mt-2">
          <HexColorPicker color={value || '#6366f1'} onChange={onChange} style={{ width: '100%' }} />
        </div>
      )}
    </div>
  );
}

export default function HeroLayoutEditor({ sectionId }: Props) {
  const { getActivePortfolio, updateField, updateSectionStyle } = useBuilderStore();
  const portfolio = getActivePortfolio();
  const section = portfolio?.sections.find(s => s.id === sectionId);
  if (!section || !portfolio) return null;

  const theme = portfolio.theme;
  const layout = (section.fields.find(f => f.id === 'heroLayout')?.value as string) || 'image-right';
  const bg = getHeroBackground(section);
  const bgType = bg.type || 'theme';
  const themePresets = [theme.primaryColor, theme.secondaryColor, theme.accentColor, theme.backgroundColor, theme.textColor];

  const patchBg = (patch: Partial<HeroBackgroundSettings>) => {
    updateSectionStyle(sectionId, {
      heroContent: {
        ...section.style?.heroContent,
        background: { ...bg, ...patch },
      },
    });
  };

  const setLayout = (id: HeroLayoutId) => updateField(sectionId, 'heroLayout', id);
  const setBgType = (type: HeroBgType) => patchBg({ ...DEFAULT_HERO_BACKGROUND, ...bg, type });

  const previewGradient = buildHeroGradient(bg, theme);

  return (
    <div className="mb-4 space-y-4">
      <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-3 space-y-3">
        <div className="flex items-center gap-2">
          <Layout className="w-4 h-4 text-blue-400 shrink-0" />
          <div>
            <p className="text-xs font-semibold text-white">Layout Style</p>
            <p className="text-[10px] text-gray-500">Hero structure — text only, image, banner & more</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {HERO_LAYOUT_OPTIONS.map(opt => {
            const active = layout === opt.id;
            return (
              <button key={opt.id} type="button" onClick={() => setLayout(opt.id)}
                className={`rounded-xl border text-left overflow-hidden transition ${
                  active ? 'border-blue-500 bg-blue-600/15 ring-1 ring-blue-500/40' : 'border-white/10 bg-white/[0.03] hover:border-white/20'
                }`}>
                <div className="h-[44px] bg-[#0a0a0a]/80 border-b border-white/5"><LayoutThumb id={opt.id} /></div>
                <div className="px-2 py-1.5">
                  <p className={`text-[10px] font-semibold ${active ? 'text-white' : 'text-gray-300'}`}>{opt.label}</p>
                  <p className="text-[9px] text-gray-500 leading-tight">{opt.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 space-y-3">
        <div className="flex items-center gap-2">
          <Paintbrush className="w-4 h-4 text-emerald-400 shrink-0" />
          <div>
            <p className="text-xs font-semibold text-white">Background</p>
            <p className="text-[10px] text-gray-500">Solid, gradient or image — great for text-only hero</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-1">
          {HERO_BG_TYPE_OPTIONS.map(opt => (
            <button key={opt.id} type="button" onClick={() => setBgType(opt.id!)}
              className={`text-[10px] px-2.5 py-1.5 rounded-lg border transition ${
                bgType === opt.id ? 'border-emerald-500 bg-emerald-500/15 text-white' : 'border-white/10 text-gray-400 hover:text-white'
              }`}>{opt.label}</button>
          ))}
        </div>

        <div className="h-14 rounded-xl border border-white/10 overflow-hidden relative"
          style={{
            background: bgType === 'solid' ? (bg.solidColor || theme.primaryColor)
              : bgType === 'gradient' ? previewGradient
              : bgType === 'image' && bg.imageUrl ? `url(${bg.imageUrl}) center/cover`
              : bgType === 'theme' ? theme.backgroundColor : previewGradient,
          }}>
          <div className="absolute inset-0 flex items-center justify-center text-[10px] text-white/70 bg-black/20">Preview</div>
        </div>

        {bgType === 'solid' && (
          <ColorField label="Background color" value={bg.solidColor || theme.primaryColor}
            onChange={v => patchBg({ solidColor: v })} presets={themePresets} />
        )}

        {bgType === 'gradient' && (
          <div className="space-y-3">
            <ColorField label="Gradient start" value={bg.gradientFrom || theme.primaryColor}
              onChange={v => patchBg({ gradientFrom: v })} presets={themePresets} />
            <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer">
              <input type="checkbox" checked={bg.useThreeColor === true}
                onChange={e => patchBg({ useThreeColor: e.target.checked })}
                className="rounded accent-emerald-500" />
              3-color mix (middle tone)
            </label>
            {bg.useThreeColor && (
              <ColorField label="Middle color" value={bg.gradientVia || theme.accentColor}
                onChange={v => patchBg({ gradientVia: v })} presets={themePresets} />
            )}
            <ColorField label="Gradient end" value={bg.gradientTo || theme.secondaryColor}
              onChange={v => patchBg({ gradientTo: v })} presets={themePresets} />
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-[10px] text-gray-500">Angle</span>
                <span className="text-[10px] text-emerald-300 font-mono">{bg.gradientAngle ?? 135}°</span>
              </div>
              <input type="range" min={0} max={360} step={5} value={bg.gradientAngle ?? 135}
                onChange={e => patchBg({ gradientAngle: parseInt(e.target.value, 10) })}
                className="w-full h-1.5 rounded-full appearance-none bg-white/10 accent-emerald-500 cursor-pointer" />
            </div>
            <div className="flex flex-wrap gap-1">
              {[
                { label: 'Theme mix', from: theme.primaryColor, to: theme.secondaryColor },
                { label: 'Sunset', from: '#f97316', to: '#ec4899' },
                { label: 'Ocean', from: '#0ea5e9', to: '#6366f1' },
                { label: 'Forest', from: '#059669', to: '#14b8a6' },
              ].map(p => (
                <button key={p.label} type="button"
                  onClick={() => patchBg({ gradientFrom: p.from, gradientTo: p.to, useThreeColor: false })}
                  className="text-[9px] px-2 py-1 rounded-md border border-white/10 text-gray-400 hover:text-white hover:border-emerald-500/30">
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {bgType === 'image' && (
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer">
              <input type="checkbox" checked={bg.useBannerImage !== false}
                onChange={e => patchBg({ useBannerImage: e.target.checked })}
                className="rounded accent-emerald-500" />
              Use banner / avatar image when set
            </label>
            <div>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Custom image URL</p>
              <input value={bg.imageUrl || ''} onChange={e => patchBg({ imageUrl: e.target.value, useBannerImage: false })}
                placeholder="https://..."
                className="w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500" />
            </div>
          </div>
        )}

        {(bgType === 'gradient' || bgType === 'image') && (
          <div className="grid grid-cols-2 gap-3 pt-1 border-t border-white/5">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-[10px] text-gray-500">Overlay</span>
                <span className="text-[10px] text-emerald-300 font-mono">{bg.overlayOpacity ?? 45}%</span>
              </div>
              <input type="range" min={0} max={90} step={5} value={bg.overlayOpacity ?? 45}
                onChange={e => patchBg({ overlayOpacity: parseInt(e.target.value, 10) })}
                className="w-full h-1.5 rounded-full appearance-none bg-white/10 accent-emerald-500 cursor-pointer" />
            </div>
            <ColorField label="Overlay tint" value={bg.overlayColor || '#000000'}
              onChange={v => patchBg({ overlayColor: v })} />
          </div>
        )}

        <div>
          <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1.5">Text color on background</p>
          <div className="flex gap-1">
            {([
              { id: 'auto' as HeroTextMode, label: 'Auto' },
              { id: 'light' as HeroTextMode, label: 'Light' },
              { id: 'dark' as HeroTextMode, label: 'Dark' },
            ]).map(opt => (
              <button key={opt.id} type="button" onClick={() => patchBg({ textMode: opt.id })}
                className={`text-[10px] px-2.5 py-1.5 rounded-lg border transition ${
                  (bg.textMode || 'auto') === opt.id ? 'border-emerald-500 bg-emerald-500/15 text-white' : 'border-white/10 text-gray-400'
                }`}>{opt.label}</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
