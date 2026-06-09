'use client';
import { useState } from 'react';
import { useBuilderStore } from '@/lib/store';
import {
  SectionAnimation, SectionEntranceType,
  ImageAnimStyle, HeadingAnimStyle, CardAnimStyle,
} from '@/lib/types';
import {
  DEFAULT_SECTION_ANIMATION, ENTRANCE_PRESETS, getSectionAnimation, resolveSectionAnimation,
  getAnimationStatus,
} from '@/lib/section-animation';
import { Sparkles, RotateCcw, Play, ChevronDown, ChevronUp, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props { sectionId: string; }

// ── Slider ────────────────────────────────────────────────────────────────────
function Slider({ label, value, min, max, step, unit, onChange }: {
  label: string; value: number; min: number; max: number; step: number; unit?: string;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-[11px] text-gray-400">{label}</span>
        <span className="text-[11px] text-blue-300 font-mono">{value}{unit}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none bg-white/10 accent-blue-500 cursor-pointer" />
    </div>
  );
}

// ── Section entrance mini preview ─────────────────────────────────────────────
function MiniPreview({ entrance, duration, distance, scaleFrom, easing }: {
  entrance: SectionEntranceType; duration: number; distance: number; scaleFrom: number; easing: string;
}) {
  const [key, setKey] = useState(0);
  const ease = easing === 'bounce' ? [0.34, 1.56, 0.64, 1] as const
    : easing === 'spring' ? undefined
    : easing === 'linear' ? 'linear' as const
    : easing === 'snappy' ? 'easeOut' as const
    : [0.22, 1, 0.36, 1] as const;

  const hidden: Record<string, number | string> = { opacity: 0 };
  if (entrance === 'slide-up') { hidden.y = distance * 0.4; }
  else if (entrance === 'slide-down') { hidden.y = -distance * 0.4; }
  else if (entrance === 'slide-left') { hidden.x = distance * 0.4; }
  else if (entrance === 'slide-right') { hidden.x = -distance * 0.4; }
  else if (entrance === 'scale' || entrance === 'zoom-in') { hidden.scale = scaleFrom; }
  else if (entrance === 'zoom-out') { hidden.scale = 1.1; }
  else if (entrance === 'flip') { hidden.rotateX = 20; }
  else if (entrance === 'blur') { hidden.filter = 'blur(8px)'; }
  else if (entrance === 'rotate') { hidden.rotate = -8; hidden.scale = scaleFrom; }
  else if (entrance === 'bounce-in') { hidden.y = distance * 0.5; hidden.scale = scaleFrom; }
  else if (entrance === 'elastic') { hidden.y = distance * 0.45; hidden.scale = scaleFrom; }
  else if (entrance === 'pop') { hidden.scale = 0.4; }
  else if (entrance === 'swing') { hidden.rotate = 12; hidden.y = distance * 0.2; }
  else if (entrance === 'reveal') { hidden.y = distance * 0.5; }
  else if (entrance === 'none' || entrance === 'inherit') { hidden.opacity = 1; }

  return (
    <div className="relative rounded-xl border border-white/10 bg-white/3 overflow-hidden h-24 flex items-center justify-center">
      <button type="button" onClick={() => setKey(k => k + 1)}
        className="absolute top-2 right-2 p-1 rounded-md bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition z-10"
        title="Replay">
        <Play className="w-3 h-3" />
      </button>
      <motion.div key={key}
        initial={entrance === 'none' || entrance === 'inherit' ? { opacity: 1 } : hidden}
        animate={{ opacity: 1, x: 0, y: 0, scale: 1, rotate: 0, rotateX: 0, filter: 'blur(0px)' }}
        transition={easing === 'spring'
          ? { type: 'spring', stiffness: 280, damping: 22 }
          : { duration: Math.max(0.2, duration), ease: ease as any }}
        className="w-16 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 shadow-lg shadow-blue-500/30"
      />
      <p className="absolute bottom-2 left-3 text-[9px] text-gray-600">Live preview</p>
    </div>
  );
}

// ── Image animation mini preview ──────────────────────────────────────────────
const IMAGE_ANIM_MAP: Record<ImageAnimStyle, object> = {
  none: {},
  'rotate-idle': { animate: { rotate: [-2, 2, -2] }, transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' } },
  'rotate-hover': { whileHover: { rotate: 5, scale: 1.05 }, transition: { duration: 0.3 } },
  float: { animate: { y: [0, -10, 0] }, transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' } },
  'pulse-glow': { animate: { scale: [1, 1.04, 1] }, transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' } },
  parallax: { animate: { y: [0, -6, 0] }, transition: { duration: 5, repeat: Infinity, ease: 'easeInOut' } },
  'tilt-3d': { whileHover: { rotateY: 12, rotateX: -8, scale: 1.04 }, transition: { duration: 0.4 } },
  'morph-border': { animate: { borderRadius: ['60% 40% 30% 70%/60% 30% 70% 40%', '30% 70% 70% 30%/30% 30% 70% 70%', '60% 40% 30% 70%/60% 30% 70% 40%'] }, transition: { duration: 6, repeat: Infinity, ease: 'easeInOut' } },
  'spin-slow': { animate: { rotate: 360 }, transition: { duration: 12, repeat: Infinity, ease: 'linear' } },
  'circle-glow': { animate: { scale: [1, 1.05, 1] }, transition: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' } },
};

function ImageAnimPreview({ style }: { style: ImageAnimStyle }) {
  const [key, setKey] = useState(0);
  const props = IMAGE_ANIM_MAP[style] ?? {};
  return (
    <div className="relative rounded-xl border border-white/10 bg-white/3 h-20 flex items-center justify-center overflow-hidden">
      <button type="button" onClick={() => setKey(k => k + 1)}
        className="absolute top-2 right-2 p-1 rounded-md bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition z-10">
        <Play className="w-3 h-3" />
      </button>
      <motion.div
        key={`${style}-${key}`}
        className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-lg"
        {...props as any}
      >
        👤
      </motion.div>
    </div>
  );
}

// ── Image anim options ────────────────────────────────────────────────────────
const IMAGE_ANIM_OPTIONS: { id: ImageAnimStyle; label: string; icon: string; desc: string }[] = [
  { id: 'none',         label: 'None',         icon: '⏹',  desc: 'Static — no motion' },
  { id: 'rotate-idle',  label: 'Rotate Idle',  icon: '🌀',  desc: 'Gentle constant sway' },
  { id: 'rotate-hover', label: 'Rotate Hover', icon: '🔄',  desc: 'Rotates on mouse hover' },
  { id: 'float',        label: 'Float',        icon: '🪄',  desc: 'Smooth up/down float' },
  { id: 'pulse-glow',   label: 'Pulse Glow',   icon: '✨',  desc: 'Subtle pulse scale' },
  { id: 'tilt-3d',      label: '3D Tilt',      icon: '📐',  desc: 'Depth tilt on hover' },
  { id: 'morph-border', label: 'Morph Border', icon: '🌊',  desc: 'Fluid shape border' },
  { id: 'parallax',     label: 'Parallax',     icon: '🏔',  desc: 'Slow scroll depth' },
  { id: 'circle-glow',  label: 'Circle Glow',  icon: '💫',  desc: 'Round crop + glow ring' },
  { id: 'spin-slow',    label: 'Slow Spin',    icon: '⚙️',  desc: 'Infinite slow rotation' },
];

// ── Heading anim options ──────────────────────────────────────────────────────
const HEADING_ANIM_OPTIONS: { id: HeadingAnimStyle; label: string; icon: string; desc: string }[] = [
  { id: 'none',           label: 'Default',        icon: '⏹',  desc: 'Normal fade-in' },
  { id: 'typewriter',     label: 'Typewriter',     icon: '⌨️',  desc: 'Types character by character' },
  { id: 'gradient-slide', label: 'Gradient Slide', icon: '🌈',  desc: 'Animated colour gradient' },
  { id: 'word-pop',       label: 'Word Pop',       icon: '💥',  desc: 'Each word pops in' },
  { id: 'blur-reveal',    label: 'Blur Reveal',    icon: '💫',  desc: 'Sharpens from blur' },
  { id: 'underline-draw', label: 'Underline Draw', icon: '✏️',  desc: 'Line draws under text' },
];

// ── Card anim options ─────────────────────────────────────────────────────────
const CARD_ANIM_OPTIONS: { id: CardAnimStyle; label: string; icon: string; desc: string }[] = [
  { id: 'none',          label: 'None',          icon: '⏹',  desc: 'No card animation' },
  { id: 'stagger-up',    label: 'Stagger Up',    icon: '⬆️',  desc: 'Cards rise one by one' },
  { id: 'stagger-left',  label: 'Stagger Left',  icon: '⬅️',  desc: 'Slide in from right' },
  { id: 'stagger-scale', label: 'Stagger Scale', icon: '◆',   desc: 'Scale in one by one' },
  { id: 'flip-in',       label: 'Flip In',       icon: '🔄',  desc: '3D flip on entrance' },
  { id: 'rubber-band',   label: 'Rubber Band',   icon: '🎯',  desc: 'Elastic overshoot' },
];

// ── Main component ────────────────────────────────────────────────────────────
type AnimTab = 'section' | 'elements';

export default function SectionAnimationEditor({ sectionId }: Props) {
  const { getActivePortfolio, updateSectionStyle } = useBuilderStore();
  const portfolio = getActivePortfolio();
  const section = portfolio?.sections.find(s => s.id === sectionId);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [animTab, setAnimTab] = useState<AnimTab>('section');

  if (!section || !portfolio) return null;

  const anim = getSectionAnimation(section);
  const resolved = resolveSectionAnimation(section, portfolio.theme);
  const status = getAnimationStatus(section, portfolio.theme);
  const entrance = anim.custom ? (anim.entrance || 'slide-up') : 'inherit';
  const previewEntrance = entrance === 'inherit' ? resolved.resolvedEntrance : entrance;

  const patch = (updates: Partial<SectionAnimation>) => {
    updateSectionStyle(sectionId, { animation: { ...anim, ...updates, custom: true } });
  };

  // Element-level patch — doesn't force custom: true (doesn't affect section entrance)
  const patchElement = (updates: Partial<SectionAnimation>) => {
    updateSectionStyle(sectionId, { animation: { ...anim, ...updates } });
  };

  const reset = () => updateSectionStyle(sectionId, { animation: { ...DEFAULT_SECTION_ANIMATION } });

  const useCustom = anim.custom ?? false;
  const sType = section.type;
  const hasImage = sType === 'about' || sType === 'hero';
  const hasCards = ['skills', 'services', 'projects', 'stats', 'team', 'gallery',
    'testimonials', 'pricing', 'faq', 'blog', 'experience'].includes(sType);

  const imageAnim: ImageAnimStyle = anim.imageAnim ?? 'none';
  const headingAnim: HeadingAnimStyle = anim.headingAnim ?? 'none';
  const cardAnim: CardAnimStyle = anim.cardAnim ?? 'stagger-up';

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-blue-400" />
          <p className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Animation & Effects</p>
        </div>
        <button type="button" onClick={reset}
          className="flex items-center gap-1 text-[10px] text-gray-500 hover:text-gray-300 transition">
          <RotateCcw className="w-3 h-3" /> Reset
        </button>
      </div>

      {/* Live status */}
      <div className="rounded-xl border border-blue-500/25 bg-blue-600/8 p-3 space-y-2">
        <p className="text-[11px] font-semibold text-blue-300">Currently active on this section</p>
        {status.isDisabled ? (
          <p className="text-xs text-gray-400">No entrance animation — section appears instantly.</p>
        ) : (
          <div className="space-y-1 text-[11px] text-gray-400">
            <p>
              <span className="text-white font-medium">Section:</span>{' '}
              {status.entranceLabel}
              <span className="text-gray-600"> · {status.source === 'theme' ? `from Theme (${status.themeAnimation})` : 'custom'}</span>
            </p>
            <p><span className="text-white font-medium">When:</span> {status.triggerLabel}</p>
            <p><span className="text-white font-medium">Heading:</span> {status.headingAnimLabel}</p>
            {hasCards && <p><span className="text-white font-medium">Cards/items:</span> {status.cardAnimLabel}</p>}
            {hasImage && status.imageAnim !== 'none' && <p><span className="text-white font-medium">Photo:</span> {status.imageAnim.replace(/-/g, ' ')}</p>}
          </div>
        )}
        <p className="text-[10px] text-amber-300/80 bg-amber-500/10 border border-amber-500/20 rounded-lg px-2.5 py-1.5">
          Scroll the preview (middle panel) to see animations play when each section enters view.
        </p>
      </div>

      <MiniPreview
        entrance={previewEntrance}
        duration={resolved.duration ?? 0.55}
        distance={resolved.distance ?? 40}
        scaleFrom={resolved.scaleFrom ?? 0.92}
        easing={resolved.easing || 'smooth'}
      />

      {/* Tab switcher */}
      <div className="flex gap-1 p-1 rounded-xl bg-white/3 border border-white/8">
        {([
          { id: 'section' as AnimTab, label: 'Whole section', icon: <Sparkles className="w-3 h-3" /> },
          { id: 'elements' as AnimTab, label: 'Inside section', icon: <Layers className="w-3 h-3" /> },
        ]).map(t => (
          <button key={t.id} type="button" onClick={() => setAnimTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-[11px] font-medium rounded-lg transition ${
              animTab === t.id ? 'bg-blue-600 text-white shadow' : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}>
            {t.icon}{t.label}
          </button>
        ))}
      </div>

      {/* ── SECTION TAB ── */}
      {animTab === 'section' && (
        <div className="space-y-4">
          <p className="text-[11px] text-gray-500 leading-relaxed px-0.5">
            Controls how the <strong className="text-gray-300">entire section</strong> appears (fade, slide, zoom, etc.). By default it follows your Theme tab setting.
          </p>

          {/* Custom toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-white/3 border border-white/10">
            <div>
              <p className="text-sm text-white font-medium">Custom section entrance</p>
              <p className="text-[10px] text-gray-500 mt-0.5">Turn on to pick a different style for only this section</p>
            </div>
            <button type="button"
              onClick={() => patch({ custom: !useCustom, entrance: useCustom ? 'inherit' : 'slide-up' })}
              className={`w-10 h-5 rounded-full transition relative shrink-0 ${useCustom ? 'bg-blue-600' : 'bg-white/10'}`}>
              <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${useCustom ? 'left-5' : 'left-0.5'}`} />
            </button>
          </div>

          {!useCustom && (
            <p className="text-xs text-gray-500 px-1">
              Using theme: <span className="text-blue-300 capitalize">{portfolio.theme.animation}</span>
              {' → '}<span className="text-gray-300">{status.entranceLabel}</span>
              <span className="text-gray-600"> ({status.triggerLabel.toLowerCase()})</span>
            </p>
          )}

          <AnimatePresence>
            {useCustom && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }} className="space-y-4 overflow-hidden">

                {/* Entrance presets */}
                <div>
                  <p className="text-[11px] text-gray-400 mb-2">Entrance style — what visitors see</p>
                  <div className="grid grid-cols-2 gap-1.5 max-h-64 overflow-y-auto pr-0.5">
                    {ENTRANCE_PRESETS.filter(p => p.id !== 'inherit').map(p => (
                      <button key={p.id} type="button" onClick={() => patch({ entrance: p.id })}
                        className={`p-2 rounded-lg border text-left transition ${
                          entrance === p.id ? 'border-blue-500 bg-blue-500/15' : 'border-white/10 hover:border-white/20 hover:bg-white/5'
                        }`}>
                        <span className="text-base leading-none">{p.icon}</span>
                        <p className="text-[10px] font-medium text-white mt-1">{p.label}</p>
                        <p className="text-[9px] text-gray-500 mt-0.5 leading-tight">{p.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Trigger */}
                <div>
                  <p className="text-[11px] text-gray-400 mb-1.5">Trigger</p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {([
                      { id: 'scroll' as const, label: 'On Scroll', desc: 'When section enters view' },
                      { id: 'load' as const, label: 'On Load', desc: 'When page loads' },
                    ]).map(t => (
                      <button key={t.id} type="button" onClick={() => patch({ trigger: t.id })}
                        className={`p-2 rounded-lg border text-left transition ${
                          (anim.trigger || 'scroll') === t.id ? 'border-blue-500 bg-blue-500/15' : 'border-white/10 hover:bg-white/5'
                        }`}>
                        <p className="text-[11px] font-medium text-white">{t.label}</p>
                        <p className="text-[9px] text-gray-500">{t.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Easing */}
                <div>
                  <p className="text-[11px] text-gray-400 mb-1.5">Easing</p>
                  <div className="grid grid-cols-3 gap-1">
                    {(['smooth', 'snappy', 'bounce', 'spring', 'linear'] as const).map(e => (
                      <button key={e} type="button" onClick={() => patch({ easing: e })}
                        className={`py-1.5 text-[10px] rounded capitalize transition ${
                          (anim.easing || 'smooth') === e ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'
                        }`}>{e}</button>
                    ))}
                  </div>
                </div>

                {/* Advanced sliders */}
                <button type="button" onClick={() => setAdvancedOpen(o => !o)}
                  className="flex items-center justify-between w-full text-[11px] text-gray-400 hover:text-gray-300 transition">
                  <span>Advanced timing & transform</span>
                  {advancedOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>

                {advancedOpen && (
                  <div className="space-y-3 p-3 rounded-xl bg-white/2 border border-white/8">
                    <Slider label="Duration" value={anim.duration ?? 0.55} min={0.15} max={2} step={0.05} unit="s" onChange={v => patch({ duration: v })} />
                    <Slider label="Delay" value={anim.delay ?? 0} min={0} max={1.5} step={0.05} unit="s" onChange={v => patch({ delay: v })} />
                    <Slider label="Distance" value={anim.distance ?? 40} min={8} max={120} step={4} unit="px" onChange={v => patch({ distance: v })} />
                    <Slider label="Start scale" value={anim.scaleFrom ?? 0.92} min={0.5} max={1.2} step={0.02} onChange={v => patch({ scaleFrom: v })} />
                    <Slider label="Start opacity" value={anim.opacityFrom ?? 0} min={0} max={1} step={0.05} onChange={v => patch({ opacityFrom: v })} />
                  </div>
                )}

                {/* Stagger */}
                <div className="p-3 rounded-xl bg-white/2 border border-white/8 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[11px] text-white font-medium">Stagger children (advanced)</p>
                      <p className="text-[9px] text-gray-500">For card-by-card motion, use the <strong>Inside section</strong> tab → Cards & Items</p>
                    </div>
                    <button type="button" onClick={() => patch({ staggerChildren: !anim.staggerChildren })}
                      className={`w-9 h-5 rounded-full transition relative ${anim.staggerChildren ? 'bg-blue-600' : 'bg-white/10'}`}>
                      <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${anim.staggerChildren ? 'left-4' : 'left-0.5'}`} />
                    </button>
                  </div>
                  {anim.staggerChildren && (
                    <Slider label="Stagger delay" value={anim.staggerDelay ?? 0.08} min={0.03} max={0.35} step={0.01} unit="s" onChange={v => patch({ staggerDelay: v })} />
                  )}
                </div>

                {/* Hover */}
                <div className="p-3 rounded-xl bg-white/2 border border-white/8 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[11px] text-white font-medium">Hover effect</p>
                      <p className="text-[9px] text-gray-500">Scale & lift on mouse hover</p>
                    </div>
                    <button type="button" onClick={() => patch({ hoverEnabled: !anim.hoverEnabled })}
                      className={`w-9 h-5 rounded-full transition relative ${anim.hoverEnabled ? 'bg-blue-600' : 'bg-white/10'}`}>
                      <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${anim.hoverEnabled ? 'left-4' : 'left-0.5'}`} />
                    </button>
                  </div>
                  {anim.hoverEnabled && (
                    <>
                      <Slider label="Hover scale" value={anim.hoverScale ?? 1.02} min={1} max={1.08} step={0.005} onChange={v => patch({ hoverScale: v })} />
                      <Slider label="Hover lift" value={anim.hoverLift ?? 6} min={0} max={20} step={1} unit="px" onChange={v => patch({ hoverLift: v })} />
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* ── ELEMENTS TAB ── */}
      {animTab === 'elements' && (
        <div className="space-y-5">
          <p className="text-[11px] text-gray-500 leading-relaxed">
            Animate <strong className="text-gray-300">parts inside</strong> this section — heading text, photos, and cards/items. These work together with the whole-section entrance above.
          </p>

          {/* Image / Photo */}
          {hasImage && (
            <div className="space-y-2.5">
              <p className="text-[11px] font-semibold text-gray-300 uppercase tracking-wider">
                {sType === 'about' ? '🖼 Profile Photo' : '🖼 Hero Image'}
              </p>
              <ImageAnimPreview style={imageAnim} />
              <div className="grid grid-cols-2 gap-1.5">
                {IMAGE_ANIM_OPTIONS.map(opt => (
                  <button key={opt.id} type="button" onClick={() => patchElement({ imageAnim: opt.id })}
                    className={`p-2 rounded-lg border text-left transition ${
                      imageAnim === opt.id
                        ? 'border-blue-500 bg-blue-500/15 text-white'
                        : 'border-white/10 hover:border-white/20 hover:bg-white/5 text-gray-400'
                    }`}>
                    <span className="text-sm">{opt.icon}</span>
                    <p className="text-[10px] font-semibold mt-0.5">{opt.label}</p>
                    <p className="text-[9px] opacity-50 leading-tight">{opt.desc}</p>
                  </button>
                ))}
              </div>
              {imageAnim === 'circle-glow' && (
                <p className="text-[10px] text-blue-400/80 bg-blue-500/8 border border-blue-500/20 rounded-lg px-3 py-2">
                  Also set <strong>Photo Style → circle-glow</strong> in the Content tab for the round crop.
                </p>
              )}
            </div>
          )}

          {/* Heading — all sections */}
          <div className="space-y-2.5">
            <p className="text-[11px] font-semibold text-gray-300 uppercase tracking-wider">✍️ Section title (heading)</p>
            <p className="text-[10px] text-gray-600 -mt-1">The big title at the top of this section. &quot;Default&quot; = gentle fade-in.</p>
            <div className="grid grid-cols-2 gap-1.5">
              {HEADING_ANIM_OPTIONS.map(opt => (
                <button key={opt.id} type="button" onClick={() => patchElement({ headingAnim: opt.id })}
                  className={`p-2 rounded-lg border text-left transition ${
                    headingAnim === opt.id
                      ? 'border-blue-500 bg-blue-500/15 text-white'
                      : 'border-white/10 hover:border-white/20 hover:bg-white/5 text-gray-400'
                  }`}>
                  <span className="text-sm">{opt.icon}</span>
                  <p className="text-[10px] font-semibold mt-0.5">{opt.label}</p>
                  <p className="text-[9px] opacity-50 leading-tight">{opt.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Cards */}
          {hasCards && (
            <div className="space-y-2.5">
              <p className="text-[11px] font-semibold text-gray-300 uppercase tracking-wider">🃏 Cards & Items</p>
              <div className="grid grid-cols-2 gap-1.5">
                {CARD_ANIM_OPTIONS.map(opt => (
                  <button key={opt.id} type="button" onClick={() => patchElement({ cardAnim: opt.id })}
                    className={`p-2 rounded-lg border text-left transition ${
                      cardAnim === opt.id
                        ? 'border-blue-500 bg-blue-500/15 text-white'
                        : 'border-white/10 hover:border-white/20 hover:bg-white/5 text-gray-400'
                    }`}>
                    <span className="text-sm">{opt.icon}</span>
                    <p className="text-[10px] font-semibold mt-0.5">{opt.label}</p>
                    <p className="text-[9px] opacity-50 leading-tight">{opt.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {!hasImage && !hasCards && (
            <p className="text-xs text-gray-500 text-center py-4 px-2 leading-relaxed">
              This section type uses <strong className="text-gray-300">heading animation</strong> only.
              Change the whole-section entrance in the <strong className="text-gray-300">Whole section</strong> tab, or turn on Custom section entrance.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
