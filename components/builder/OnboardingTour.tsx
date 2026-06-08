'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, Sparkles } from 'lucide-react';

export interface TourStep {
  target?: string;
  title: string;
  description: string;
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  mobilePanel?: 'preview' | 'sections' | 'settings';
}

interface Props {
  steps: TourStep[];
  onComplete: () => void;
  onStepChange?: (step: TourStep, index: number) => void;
}

interface Rect { top: number; left: number; width: number; height: number; }

interface TooltipPos {
  top: number;
  left: number;
  arrowSide: 'top' | 'bottom' | 'left' | 'right';
  arrowOffset: number;
}

const PAD = 8;
const GAP = 14;
const VIEWPORT_PAD = 16;

function getTargetRect(selector: string): Rect | null {
  const el = document.querySelector(`[data-tour="${selector}"]`);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return { top: r.top - PAD, left: r.left - PAD, width: r.width + PAD * 2, height: r.height + PAD * 2 };
}

function isOversized(rect: Rect): boolean {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  return rect.width > vw * 0.55 || rect.height > vh * 0.45;
}

function computePosition(
  rect: Rect,
  preferred: 'top' | 'bottom' | 'left' | 'right',
  tw: number,
  th: number,
): TooltipPos {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;

  if (isOversized(rect)) {
    const top = Math.min(vh - th - VIEWPORT_PAD, rect.top + rect.height + GAP);
    const left = Math.max(VIEWPORT_PAD, Math.min(cx - tw / 2, vw - tw - VIEWPORT_PAD));
    const clampedTop = Math.max(VIEWPORT_PAD, Math.min(top, vh - th - VIEWPORT_PAD));
    return {
      top: clampedTop,
      left,
      arrowSide: 'top',
      arrowOffset: Math.max(24, Math.min(tw - 24, cx - left)),
    };
  }

  const placements: Array<'top' | 'bottom' | 'left' | 'right'> = [preferred, 'bottom', 'top', 'right', 'left'];

  for (const p of placements) {
    let top = 0;
    let left = 0;
    let fits = true;

    switch (p) {
      case 'top':
        top = rect.top - th - GAP;
        left = cx - tw / 2;
        if (top < VIEWPORT_PAD) fits = false;
        break;
      case 'bottom':
        top = rect.top + rect.height + GAP;
        left = cx - tw / 2;
        if (top + th > vh - VIEWPORT_PAD) fits = false;
        break;
      case 'left':
        top = cy - th / 2;
        left = rect.left - tw - GAP;
        if (left < VIEWPORT_PAD) fits = false;
        break;
      case 'right':
        top = cy - th / 2;
        left = rect.left + rect.width + GAP;
        if (left + tw > vw - VIEWPORT_PAD) fits = false;
        break;
    }

    if (!fits) continue;

    left = Math.max(VIEWPORT_PAD, Math.min(left, vw - tw - VIEWPORT_PAD));
    top = Math.max(VIEWPORT_PAD, Math.min(top, vh - th - VIEWPORT_PAD));

    const arrowSide = p === 'top' ? 'bottom' : p === 'bottom' ? 'top' : p === 'left' ? 'right' : 'left';
    const arrowOffset = (p === 'top' || p === 'bottom')
      ? Math.max(24, Math.min(tw - 24, cx - left))
      : Math.max(24, Math.min(th - 24, cy - top));

    return { top, left, arrowSide, arrowOffset };
  }

  return {
    top: Math.max(VIEWPORT_PAD, (vh - th) / 2),
    left: Math.max(VIEWPORT_PAD, (vw - tw) / 2),
    arrowSide: 'top',
    arrowOffset: tw / 2,
  };
}

export default function OnboardingTour({ steps, onComplete, onStepChange }: Props) {
  const [step, setStep] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);
  const [tooltipPos, setTooltipPos] = useState<TooltipPos | null>(null);
  const [mounted, setMounted] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const current = steps[step];
  const isLast = step === steps.length - 1;
  const isCenter = !current.target || current.placement === 'center';

  const updateLayout = useCallback(() => {
    if (isCenter || !current.target) {
      setRect(null);
      setTooltipPos(null);
      return;
    }

    const el = document.querySelector(`[data-tour="${current.target}"]`);
    if (el) el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });

    const r = getTargetRect(current.target);
    setRect(r);

    if (!r) { setTooltipPos(null); return; }

    const tw = tooltipRef.current?.offsetWidth || Math.min(340, window.innerWidth - 32);
    const th = tooltipRef.current?.offsetHeight || 260;
    const placement = current.placement === 'center' ? 'bottom' : (current.placement || 'bottom');
    setTooltipPos(computePosition(r, placement, tw, th));
  }, [current.target, current.placement, isCenter]);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    onStepChange?.(current, step);
    const t1 = setTimeout(updateLayout, 80);
    const t2 = setTimeout(updateLayout, 300);
    window.addEventListener('resize', updateLayout);
    window.addEventListener('scroll', updateLayout, true);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener('resize', updateLayout);
      window.removeEventListener('scroll', updateLayout, true);
    };
  }, [step, current, onStepChange, updateLayout]);

  useEffect(() => {
    if (!tooltipRef.current) return;
    const ro = new ResizeObserver(updateLayout);
    ro.observe(tooltipRef.current);
    return () => ro.disconnect();
  }, [updateLayout, step]);

  const handleNext = () => {
    if (isLast) onComplete();
    else setStep(s => s + 1);
  };

  const handleSkip = () => onComplete();

  if (!mounted) return null;

  const arrowStyle: React.CSSProperties = (() => {
    if (!tooltipPos || isCenter) return { display: 'none' };
    const size = 10;
    const base: React.CSSProperties = { position: 'absolute', width: 0, height: 0, borderStyle: 'solid', borderColor: 'transparent' };
    const { arrowSide, arrowOffset } = tooltipPos;

    if (arrowSide === 'top') {
      return { ...base, top: -size, left: arrowOffset - size, borderWidth: `0 ${size}px ${size}px ${size}px`, borderBottomColor: 'rgba(99,102,241,0.5)' };
    }
    if (arrowSide === 'bottom') {
      return { ...base, bottom: -size, left: arrowOffset - size, borderWidth: `${size}px ${size}px 0 ${size}px`, borderTopColor: 'rgba(99,102,241,0.5)' };
    }
    if (arrowSide === 'left') {
      return { ...base, left: -size, top: arrowOffset - size, borderWidth: `${size}px ${size}px ${size}px 0`, borderRightColor: 'rgba(99,102,241,0.5)' };
    }
    return { ...base, right: -size, top: arrowOffset - size, borderWidth: `${size}px 0 ${size}px ${size}px`, borderLeftColor: 'rgba(99,102,241,0.5)' };
  })();

  const tooltipStyle: React.CSSProperties = isCenter
    ? { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }
    : tooltipPos
      ? { top: tooltipPos.top, left: tooltipPos.left }
      : { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };

  return createPortal(
    <div className="fixed inset-0 z-[10000] pointer-events-auto">
      {rect ? (
        <div
          className="absolute rounded-xl transition-all duration-300 pointer-events-none"
          style={{
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
            boxShadow: '0 0 0 9999px rgba(0,0,0,0.78)',
          }}
        />
      ) : (
        <div className="absolute inset-0 bg-black/78" />
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          ref={tooltipRef}
          initial={{ opacity: 0, y: 8, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -4, scale: 0.97 }}
          transition={{ duration: 0.2 }}
          className="fixed z-[10001] w-[min(340px,calc(100vw-32px))]"
          style={tooltipStyle}
        >
          <div style={arrowStyle} />

          <div className="bg-[#1a1a1a] border border-blue-500/40 rounded-2xl shadow-2xl shadow-blue-500/10 overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-blue-600 via-blue-400 to-blue-600" />

            <div className="p-5">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-blue-600/20 flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-blue-400 font-medium">Step {step + 1} of {steps.length}</p>
                    <h3 className="text-base font-bold text-white leading-tight">{current.title}</h3>
                  </div>
                </div>
                <button onClick={handleSkip} className="p-1 text-gray-500 hover:text-white transition shrink-0" aria-label="Skip tour">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-sm text-gray-400 leading-relaxed mb-5">{current.description}</p>

              <div className="flex items-center gap-1.5 mb-4">
                {steps.map((_, i) => (
                  <div key={i} className={`h-1.5 rounded-full transition-all ${i === step ? 'w-6 bg-blue-500' : i < step ? 'w-1.5 bg-blue-500/50' : 'w-1.5 bg-white/15'}`} />
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleSkip}
                  className="flex-1 py-2.5 rounded-xl border border-white/10 text-sm text-gray-400 hover:text-white hover:bg-white/5 transition"
                >
                  Skip
                </button>
                <button
                  onClick={handleNext}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-sm font-semibold text-white transition"
                >
                  {isLast ? 'Got it!' : 'Next'}
                  {!isLast && <ChevronRight className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>,
    document.body
  );
}
