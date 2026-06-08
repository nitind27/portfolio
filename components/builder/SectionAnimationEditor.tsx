'use client';
import { useState } from 'react';
import { useBuilderStore } from '@/lib/store';
import { SectionAnimation, SectionEntranceType } from '@/lib/types';
import {
  DEFAULT_SECTION_ANIMATION, ENTRANCE_PRESETS, getSectionAnimation, resolveSectionAnimation,
} from '@/lib/section-animation';
import { Sparkles, RotateCcw, Play, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props { sectionId: string; }

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
  if (entrance === 'fade') hidden.opacity = 0;
  else if (entrance === 'slide-up') { hidden.y = distance * 0.4; hidden.opacity = 0; }
  else if (entrance === 'slide-down') { hidden.y = -distance * 0.4; hidden.opacity = 0; }
  else if (entrance === 'slide-left') { hidden.x = distance * 0.4; hidden.opacity = 0; }
  else if (entrance === 'slide-right') { hidden.x = -distance * 0.4; hidden.opacity = 0; }
  else if (entrance === 'scale' || entrance === 'zoom-in') { hidden.scale = scaleFrom; hidden.opacity = 0; }
  else if (entrance === 'zoom-out') { hidden.scale = 1.1; hidden.opacity = 0; }
  else if (entrance === 'flip') { hidden.rotateX = 20; hidden.opacity = 0; }
  else if (entrance === 'blur') { hidden.filter = 'blur(8px)'; hidden.opacity = 0; }
  else if (entrance === 'rotate') { hidden.rotate = -8; hidden.scale = scaleFrom; hidden.opacity = 0; }
  else if (entrance === 'none' || entrance === 'inherit') hidden.opacity = 1;

  return (
    <div className="relative rounded-xl border border-white/10 bg-white/3 overflow-hidden h-24 flex items-center justify-center">
      <button type="button" onClick={() => setKey(k => k + 1)}
        className="absolute top-2 right-2 p-1 rounded-md bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition z-10"
        title="Replay preview">
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

export default function SectionAnimationEditor({ sectionId }: Props) {
  const { getActivePortfolio, updateSectionStyle } = useBuilderStore();
  const portfolio = getActivePortfolio();
  const section = portfolio?.sections.find(s => s.id === sectionId);
  const [advancedOpen, setAdvancedOpen] = useState(true);

  if (!section || !portfolio) return null;

  const anim = getSectionAnimation(section);
  const resolved = resolveSectionAnimation(section, portfolio.theme);
  const entrance = anim.custom ? (anim.entrance || 'slide-up') : 'inherit';

  const patch = (updates: Partial<SectionAnimation>) => {
    updateSectionStyle(sectionId, {
      animation: { ...anim, ...updates, custom: true },
    });
  };

  const reset = () => {
    updateSectionStyle(sectionId, { animation: { ...DEFAULT_SECTION_ANIMATION } });
  };

  const useCustom = anim.custom ?? false;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-blue-400" />
          <p className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Animation & Effects</p>
        </div>
        <button type="button" onClick={reset} className="flex items-center gap-1 text-[10px] text-gray-500 hover:text-gray-300 transition">
          <RotateCcw className="w-3 h-3" /> Reset
        </button>
      </div>

      {/* Custom override toggle */}
      <div className="flex items-center justify-between p-3 rounded-xl bg-white/3 border border-white/10">
        <div>
          <p className="text-sm text-white font-medium">Custom animation</p>
          <p className="text-[10px] text-gray-500 mt-0.5">Override global theme for this section</p>
        </div>
        <button type="button" onClick={() => patch({ custom: !useCustom, entrance: useCustom ? 'inherit' : 'slide-up' })}
          className={`w-10 h-5 rounded-full transition relative shrink-0 ${useCustom ? 'bg-blue-600' : 'bg-white/10'}`}>
          <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${useCustom ? 'left-5' : 'left-0.5'}`} />
        </button>
      </div>

      {!useCustom && (
        <p className="text-xs text-gray-500 px-1">
          Using theme default: <span className="text-blue-300 capitalize">{portfolio.theme.animation}</span>
          {' → '}
          <span className="text-gray-400">{resolved.resolvedEntrance.replace(/-/g, ' ')}</span>
        </p>
      )}

      <AnimatePresence>
        {useCustom && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="space-y-4 overflow-hidden">

            <MiniPreview
              entrance={entrance === 'inherit' ? resolved.resolvedEntrance : entrance}
              duration={anim.duration ?? 0.55}
              distance={anim.distance ?? 40}
              scaleFrom={anim.scaleFrom ?? 0.92}
              easing={anim.easing || 'smooth'}
            />

            {/* Entrance presets */}
            <div>
              <p className="text-[11px] text-gray-400 mb-2">Entrance style</p>
              <div className="grid grid-cols-3 gap-1.5 max-h-48 overflow-y-auto pr-0.5">
                {ENTRANCE_PRESETS.filter(p => p.id !== 'inherit').map(p => (
                  <button key={p.id} type="button" onClick={() => patch({ entrance: p.id })}
                    className={`p-2 rounded-lg border text-left transition ${
                      entrance === p.id
                        ? 'border-blue-500 bg-blue-500/15'
                        : 'border-white/10 hover:border-white/20 hover:bg-white/5'
                    }`}>
                    <span className="text-base leading-none">{p.icon}</span>
                    <p className="text-[10px] font-medium text-white mt-1">{p.label}</p>
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
                  <p className="text-[11px] text-white font-medium">Stagger children</p>
                  <p className="text-[9px] text-gray-500">Animate cards/items one by one</p>
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

            {/* Hover effects */}
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
  );
}
