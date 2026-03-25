'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { Portfolio, PortfolioSection, ThemeConfig, PopupConfig, SocialLinks } from '@/lib/types';
import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Mail, ChevronLeft, ChevronRight, Menu } from 'lucide-react';

interface Props { portfolio: Portfolio; }

// ── Animation variants ───────────────────────────────────────────────────────
function getAnimVariants(animation: string) {
  switch (animation) {
    case 'none': return { hidden: {}, visible: {} };
    case 'subtle':
      return { hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } } };
    case 'moderate':
      return { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } } };
    case 'expressive':
      return { hidden: { opacity: 0, y: 48, scale: 0.96 }, visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } } };
    default:
      return { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } };
  }
}

function getThemeStyles(theme: ThemeConfig): React.CSSProperties {
  const radii: Record<string, string> = { none: '0', sm: '4px', md: '8px', lg: '16px', full: '9999px' };
  const spacing: Record<string, string> = { compact: '3rem', normal: '5rem', relaxed: '8rem' };
  return {
    '--primary': theme.primaryColor,
    '--secondary': theme.secondaryColor,
    '--accent': theme.accentColor,
    '--bg': theme.backgroundColor,
    '--text': theme.textColor,
    '--radius': radii[theme.borderRadius],
    '--spacing': spacing[theme.spacing],
    fontFamily: `'${theme.fontFamily}', sans-serif`,
    background: theme.backgroundColor,
    color: theme.textColor,
  } as React.CSSProperties;
}

// ── Social bar ───────────────────────────────────────────────────────────────
const SOCIAL_LABELS: Record<string, string> = {
  github: 'GH', linkedin: 'in', twitter: 'X', instagram: 'IG',
  youtube: 'YT', dribbble: 'Dr', behance: 'Be', website: '🌐',
};

function SocialBar({ social, color }: { social: SocialLinks; color: string }) {
  const links = Object.entries(social).filter(([, v]) => v);
  if (!links.length) return null;
  return (
    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '1.5rem' }}>
      {links.map(([key, url]) => (
        <a key={key} href={url as string} target="_blank" rel="noopener noreferrer"
          style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: 8, border: `1px solid ${color}55`, color, fontSize: '0.7rem', fontWeight: 700, textDecoration: 'none', transition: 'all 0.2s', background: 'transparent' }}
          onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = color; el.style.color = '#fff'; el.style.borderColor = color; }}
          onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'transparent'; el.style.color = color; el.style.borderColor = `${color}55`; }}>
          {SOCIAL_LABELS[key] || key.slice(0, 2).toUpperCase()}
        </a>
      ))}
    </div>
  );
}

// ── Popup — rendered via portal so fixed positioning always works ─────────────
function LandingPopup({ popup, theme }: { popup: PopupConfig; theme: ThemeConfig }) {
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!popup.enabled) return;
    const storageKey = `popup_${popup.title}`;
    if (popup.showOnce) {
      try { if (sessionStorage.getItem(storageKey)) return; } catch {}
    }
    const t = setTimeout(() => setVisible(true), Math.max(0, (popup.delay ?? 2)) * 1000);
    return () => clearTimeout(t);
  }, [popup.enabled, popup.delay, popup.showOnce, popup.title]);

  const dismiss = () => {
    setVisible(false);
    if (popup.showOnce) {
      try { sessionStorage.setItem(`popup_${popup.title}`, '1'); } catch {}
    }
  };

  if (!mounted || !visible) return null;

  const modal = (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="popup-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
          onClick={e => { if (e.target === e.currentTarget) dismiss(); }}
        >
          <motion.div
            key="popup-card"
            initial={{ scale: 0.88, opacity: 0, y: 24 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.88, opacity: 0, y: 24 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            style={{ background: popup.bgColor, color: popup.textColor, borderRadius: 20, maxWidth: 460, width: '100%', padding: '2.5rem 2rem', position: 'relative', boxShadow: '0 32px 80px rgba(0,0,0,0.5)' }}
          >
            <button onClick={dismiss}
              style={{ position: 'absolute', top: 14, right: 14, background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: popup.textColor, transition: 'background 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.2)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}>
              <X size={16} />
            </button>

            {popup.type === 'email-capture' && (
              <div style={{ width: 52, height: 52, borderRadius: '50%', background: theme.primaryColor, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
                <Mail size={24} color="#fff" />
              </div>
            )}
            {popup.type === 'announcement' && (
              <div style={{ fontSize: '2rem', textAlign: 'center', marginBottom: '1rem' }}>📢</div>
            )}

            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.75rem', textAlign: popup.type !== 'message' ? 'center' : 'left' }}>{popup.title}</h3>
            <p style={{ opacity: 0.8, lineHeight: 1.65, marginBottom: '1.75rem', textAlign: popup.type !== 'message' ? 'center' : 'left' }}>{popup.message}</p>

            {popup.type === 'email-capture' && !submitted ? (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)}
                  style={{ flex: 1, padding: '0.65rem 1rem', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.08)', color: popup.textColor, outline: 'none', fontSize: '0.9rem' }} />
                <button onClick={() => { if (email) setSubmitted(true); }}
                  style={{ background: theme.primaryColor, color: '#fff', padding: '0.65rem 1.25rem', borderRadius: 10, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem', whiteSpace: 'nowrap' }}>
                  Subscribe
                </button>
              </div>
            ) : popup.type === 'email-capture' && submitted ? (
              <p style={{ textAlign: 'center', color: theme.primaryColor, fontWeight: 600, fontSize: '1rem' }}>🎉 Thanks for subscribing!</p>
            ) : (
              <button onClick={dismiss}
                style={{ width: '100%', background: theme.primaryColor, color: '#fff', padding: '0.85rem', borderRadius: 12, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '1rem', transition: 'opacity 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '0.9')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
                {popup.buttonText || 'Got it!'}
              </button>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return createPortal(modal, document.body);
}

// ── Slideshow ────────────────────────────────────────────────────────────────
function Slideshow({ images, height = 480, theme }: { images: string[]; height?: number; theme: ThemeConfig }) {
  const [idx, setIdx] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (images.length <= 1) return;
    timer.current = setInterval(() => setIdx(i => (i + 1) % images.length), 4500);
    return () => { if (timer.current) clearInterval(timer.current); };
  }, [images.length]);

  if (!images.length) return (
    <div style={{ height, background: `${theme.primaryColor}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.primaryColor, opacity: 0.5, fontSize: '0.9rem' }}>
      No images — add some in the Hero section editor
    </div>
  );

  return (
    <div style={{ position: 'relative', height, overflow: 'hidden' }}>
      <AnimatePresence mode="wait">
        <motion.img key={idx} src={images[idx]} alt=""
          initial={{ opacity: 0, scale: 1.05 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.7 }}
          style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} />
      </AnimatePresence>
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 30%, rgba(0,0,0,0.65))' }} />
      {images.length > 1 && (
        <>
          {[{ dir: -1, side: 'left', Icon: ChevronLeft }, { dir: 1, side: 'right', Icon: ChevronRight }].map(({ dir, side, Icon }) => (
            <button key={side} onClick={() => setIdx(i => (i + dir + images.length) % images.length)}
              style={{ position: 'absolute', [side]: 14, top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.55)', border: 'none', borderRadius: '50%', width: 40, height: 40, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', zIndex: 2 }}>
              <Icon size={20} />
            </button>
          ))}
          <div style={{ position: 'absolute', bottom: 14, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 7, zIndex: 2 }}>
            {images.map((_, i) => (
              <button key={i} onClick={() => setIdx(i)}
                style={{ width: i === idx ? 22 : 8, height: 8, borderRadius: 4, background: i === idx ? theme.primaryColor : 'rgba(255,255,255,0.45)', border: 'none', cursor: 'pointer', transition: 'all 0.35s', padding: 0 }} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── Mobile nav drawer ────────────────────────────────────────────────────────
function MobileNav({ sections, name, theme }: { sections: PortfolioSection[]; name: string; theme: ThemeConfig }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    if (open) window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open]);

  return (
    <>
      {/* Hamburger button */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Open navigation menu"
        style={{
          background: `${theme.primaryColor}18`,
          border: `1px solid ${theme.primaryColor}44`,
          borderRadius: 10, cursor: 'pointer',
          color: theme.textColor, padding: '7px 12px',
          display: 'flex', alignItems: 'center', gap: 8,
          transition: 'background 0.2s',
        }}
        onMouseEnter={e => (e.currentTarget.style.background = `${theme.primaryColor}30`)}
        onMouseLeave={e => (e.currentTarget.style.background = `${theme.primaryColor}18`)}
      >
        <Menu size={18} />
        <span style={{ fontSize: '0.82rem', fontWeight: 600, letterSpacing: '0.02em' }}>Menu</span>
      </button>

      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              key="mob-backdrop"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setOpen(false)}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 998, backdropFilter: 'blur(5px)' }}
            />

            {/* Slide-in drawer */}
            <motion.div
              key="mob-drawer"
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 340, damping: 34 }}
              style={{
                position: 'fixed', top: 0, right: 0, bottom: 0, width: 290,
                background: theme.backgroundColor,
                borderLeft: `1px solid ${theme.primaryColor}33`,
                zIndex: 999, display: 'flex', flexDirection: 'column',
                boxShadow: '-12px 0 48px rgba(0,0,0,0.45)',
              }}
            >
              {/* Drawer header */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '1.25rem 1.5rem',
                borderBottom: `1px solid ${theme.primaryColor}22`,
              }}>
                <span style={{ fontWeight: 700, color: theme.primaryColor, fontSize: '1.1rem' }}>{name}</span>
                <button
                  onClick={() => setOpen(false)}
                  style={{
                    background: `${theme.primaryColor}18`, border: 'none', borderRadius: '50%',
                    width: 36, height: 36, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: theme.textColor, transition: 'background 0.2s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = `${theme.primaryColor}35`)}
                  onMouseLeave={e => (e.currentTarget.style.background = `${theme.primaryColor}18`)}
                >
                  <X size={16} />
                </button>
              </div>

              {/* Nav links */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                {sections.map((s, i) => (
                  <motion.a
                    key={s.id}
                    href={`#${s.id}`}
                    initial={{ opacity: 0, x: 28 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.045 + 0.06, type: 'spring', stiffness: 300, damping: 28 }}
                    onClick={() => setOpen(false)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.85rem',
                      padding: '0.8rem 1rem', borderRadius: 10,
                      color: theme.textColor, textDecoration: 'none',
                      fontSize: '0.95rem', fontWeight: 500,
                      transition: 'background 0.15s, color 0.15s',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = `${theme.primaryColor}18`;
                      e.currentTarget.style.color = theme.primaryColor;
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = theme.textColor;
                    }}
                  >
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: theme.primaryColor, flexShrink: 0, opacity: 0.7 }} />
                    {s.title}
                  </motion.a>
                ))}
              </div>

              {/* Drawer footer */}
              <div style={{ padding: '1rem 1.5rem', borderTop: `1px solid ${theme.primaryColor}22`, textAlign: 'center', fontSize: '0.75rem', opacity: 0.35 }}>
                {name} · Portfolio
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

// ── Main export ──────────────────────────────────────────────────────────────
export default function PortfolioPreview({ portfolio }: Props) {
  const { sections, theme, popup } = portfolio;
  const social = portfolio.social || {};
  const visibleSections = sections.filter(s => s.visible).sort((a, b) => a.order - b.order);
  const variants = getAnimVariants(theme.animation);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  return (
    <div style={getThemeStyles(theme)} className="min-h-screen relative">
      {theme.customCSS && <style dangerouslySetInnerHTML={{ __html: theme.customCSS }} />}
      {popup && <LandingPopup popup={popup} theme={theme} />}

      {/* Navbar */}
      <nav style={{ background: theme.backgroundColor + 'f0', borderBottom: `1px solid ${theme.primaryColor}22`, position: 'sticky', top: 0, zIndex: 50, backdropFilter: 'blur(10px)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 58 }}>
          <span style={{ fontWeight: 700, fontSize: '1.1rem', color: theme.primaryColor }}>{portfolio.name}</span>
          {isMobile ? (
            <MobileNav sections={visibleSections} name={portfolio.name} theme={theme} />
          ) : (
            <div style={{ display: 'flex', gap: '1.75rem', alignItems: 'center' }}>
              {visibleSections.slice(0, 7).map(s => (
                <a key={s.id} href={`#${s.id}`}
                  style={{ color: theme.textColor, textDecoration: 'none', fontSize: '0.875rem', opacity: 0.75, transition: 'all 0.2s', fontWeight: 500 }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.opacity = '1'; el.style.color = theme.primaryColor; }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.opacity = '0.75'; el.style.color = theme.textColor; }}>
                  {s.title}
                </a>
              ))}
            </div>
          )}
        </div>
      </nav>

      {visibleSections.map((section, i) => (
        <SectionRenderer key={section.id} section={section} theme={theme} variants={variants} index={i} social={social} />
      ))}

      <footer style={{ borderTop: `1px solid ${theme.primaryColor}22`, padding: '3rem 1.5rem' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
          <SocialBar social={social} color={theme.primaryColor} />
          <p style={{ opacity: 0.35, fontSize: '0.85rem' }}>© {new Date().getFullYear()} {portfolio.name}. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

// ── Section renderer ─────────────────────────────────────────────────────────
function SectionRenderer({ section, theme, variants, index, social }: {
  section: PortfolioSection; theme: ThemeConfig; variants: any; index: number; social: SocialLinks;
}) {
  const spacing: Record<string, string> = { compact: '3rem', normal: '5rem', relaxed: '8rem' };
  const pad = spacing[theme.spacing] || '5rem';
  const radii: Record<string, string> = { none: '0', sm: '4px', md: '8px', lg: '16px', full: '9999px' };
  const radius = radii[theme.borderRadius] || '8px';
  const altBg = index % 2 !== 0 ? `${theme.primaryColor}07` : 'transparent';

  // Match by exact id first, then by label substring as fallback
  const fv = (id: string): string => {
    const f = section.fields.find(f => f.id === id)
           ?? section.fields.find(f => f.label.toLowerCase().includes(id.toLowerCase()));
    const v = f?.value;
    return typeof v === 'string' ? v : '';
  };
  const fa = (id: string): string[] => {
    const f = section.fields.find(f => f.id === id)
           ?? section.fields.find(f => f.label.toLowerCase().includes(id.toLowerCase()));
    return Array.isArray(f?.value) ? f!.value as string[] : [];
  };

  const containerStyle: React.CSSProperties = { padding: `${pad} 1.5rem`, maxWidth: 1200, margin: '0 auto' };
  const titleStyle: React.CSSProperties = { fontSize: '2rem', fontWeight: 700, marginBottom: '2rem', color: theme.primaryColor };

  // ── HERO ──
  if (section.type === 'hero') {
    const layout = fv('heroLayout') || 'image-right';
    const headline = fv('headline') || 'Hello World';
    const sub = fv('subheadline') || '';
    const desc = fv('description') || '';
    const ctaText = fv('ctaText') || 'View Work';
    const ctaLink = fv('ctaLink') || '#';
    const ctaSecText = fv('ctaSecondaryText') || '';
    const ctaSecLink = fv('ctaSecondaryLink') || '#';
    const avatar = fv('avatar') || '';
    const bannerImgs = fa('bannerImages');

    const textBlock = (
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ color: theme.primaryColor, fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.8rem', letterSpacing: '0.14em', textTransform: 'uppercase' }}>Welcome</p>
        <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 3.2rem)', fontWeight: 800, lineHeight: 1.1, marginBottom: '1rem' }}>{headline}</h1>
        {sub && <p style={{ fontSize: '1.15rem', opacity: 0.7, marginBottom: '0.75rem' }}>{sub}</p>}
        {desc && <p style={{ opacity: 0.6, maxWidth: 520, marginBottom: '1.75rem', lineHeight: 1.75 }}>{desc}</p>}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <a href={ctaLink} style={{ display: 'inline-block', background: theme.primaryColor, color: '#fff', padding: '0.75rem 2rem', borderRadius: radius, fontWeight: 600, textDecoration: 'none', fontSize: '0.95rem' }}>{ctaText}</a>
          {ctaSecText && <a href={ctaSecLink} style={{ display: 'inline-block', border: `2px solid ${theme.primaryColor}`, color: theme.primaryColor, padding: '0.75rem 2rem', borderRadius: radius, fontWeight: 600, textDecoration: 'none', fontSize: '0.95rem' }}>{ctaSecText}</a>}
        </div>
        <SocialBar social={social} color={theme.primaryColor} />
      </div>
    );

    const imageBlock = avatar ? (
      <div style={{ flex: '0 0 auto', width: 'clamp(180px, 32%, 360px)' }}>
        <img src={avatar} alt="hero" style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: layout === 'split' ? 0 : radius, boxShadow: `0 24px 64px ${theme.primaryColor}30` }} />
      </div>
    ) : null;

    if (layout === 'banner') {
      const bgImg = bannerImgs[0] || avatar;
      return (
        <motion.section id={section.id} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={variants}
          style={{ position: 'relative', minHeight: '72vh', display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
          {bgImg && <img src={bgImg} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.28) 100%)' }} />
          <div style={{ position: 'relative', zIndex: 1, padding: `${pad} 1.5rem`, maxWidth: 1200, margin: '0 auto', width: '100%', color: '#fff' }}>
            <p style={{ color: theme.primaryColor, fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.8rem', letterSpacing: '0.14em', textTransform: 'uppercase' }}>Welcome</p>
            <h1 style={{ fontSize: 'clamp(2rem, 5vw, 4rem)', fontWeight: 800, lineHeight: 1.1, marginBottom: '1rem', color: '#fff' }}>{headline}</h1>
            {sub && <p style={{ fontSize: '1.2rem', opacity: 0.85, marginBottom: '0.75rem' }}>{sub}</p>}
            {desc && <p style={{ opacity: 0.7, maxWidth: 560, marginBottom: '2rem', lineHeight: 1.75 }}>{desc}</p>}
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <a href={ctaLink} style={{ display: 'inline-block', background: theme.primaryColor, color: '#fff', padding: '0.75rem 2rem', borderRadius: radius, fontWeight: 600, textDecoration: 'none' }}>{ctaText}</a>
              {ctaSecText && <a href={ctaSecLink} style={{ display: 'inline-block', border: '2px solid rgba(255,255,255,0.6)', color: '#fff', padding: '0.75rem 2rem', borderRadius: radius, fontWeight: 600, textDecoration: 'none' }}>{ctaSecText}</a>}
            </div>
          </div>
        </motion.section>
      );
    }

    if (layout === 'slideshow') {
      return (
        <motion.section id={section.id} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={variants} style={{ position: 'relative' }}>
          <Slideshow images={bannerImgs.length ? bannerImgs : (avatar ? [avatar] : [])} height={520} theme={theme} />
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', zIndex: 3, padding: '0 1.5rem', pointerEvents: 'none' }}>
            <div style={{ maxWidth: 1200, margin: '0 auto', width: '100%', pointerEvents: 'auto' }}>
              <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 800, color: '#fff', textShadow: '0 2px 24px rgba(0,0,0,0.6)', marginBottom: '0.75rem' }}>{headline}</h1>
              {sub && <p style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.85)', marginBottom: '1.5rem' }}>{sub}</p>}
              <a href={ctaLink} style={{ display: 'inline-block', background: theme.primaryColor, color: '#fff', padding: '0.75rem 2rem', borderRadius: radius, fontWeight: 600, textDecoration: 'none' }}>{ctaText}</a>
            </div>
          </div>
        </motion.section>
      );
    }

    if (layout === 'split') {
      return (
        <motion.section id={section.id} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={variants}
          style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: '72vh' }}>
          <div style={{ padding: `${pad} 3rem`, display: 'flex', alignItems: 'center', background: theme.backgroundColor }}>{textBlock}</div>
          <div style={{ overflow: 'hidden' }}>
            {avatar ? <img src={avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', background: `${theme.primaryColor}22` }} />}
          </div>
        </motion.section>
      );
    }

    return (
      <motion.section id={section.id} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={variants}
        style={{ padding: `${pad} 1.5rem`, minHeight: '62vh', display: 'flex', alignItems: 'center' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', width: '100%', display: 'flex', alignItems: 'center', gap: '3rem', flexDirection: layout === 'image-left' ? 'row-reverse' : 'row', flexWrap: 'wrap' }}>
          {textBlock}
          {layout !== 'text-only' && imageBlock}
        </div>
      </motion.section>
    );
  }

  // ── GALLERY ──
  if (section.type === 'gallery') {
    const images = fa('images');
    return (
      <motion.section id={section.id} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={variants}
        style={{ padding: `${pad} 1.5rem`, background: altBg }}>
        <div style={containerStyle}>
          <h2 style={titleStyle}>{section.title}</h2>
          {images.length > 0 ? (
            <div style={{ columns: '3 180px', gap: '0.75rem' }}>
              {images.map((src, i) => (
                <div key={i} style={{ breakInside: 'avoid', marginBottom: '0.75rem', borderRadius: radius, overflow: 'hidden' }}>
                  <img src={src} alt="" style={{ width: '100%', display: 'block', transition: 'transform 0.35s' }}
                    onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.04)')}
                    onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')} />
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '3rem', textAlign: 'center', border: `2px dashed ${theme.primaryColor}33`, borderRadius: radius, opacity: 0.5 }}>
              Upload images in the Gallery section editor
            </div>
          )}
        </div>
      </motion.section>
    );
  }

  // ── SKILLS ──
  if (section.type === 'skills') {
    const items = fa('skills') || fa('Skills');
    return (
      <motion.section id={section.id} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={variants}
        style={{ padding: `${pad} 1.5rem`, background: `${theme.primaryColor}09` }}>
        <div style={containerStyle}>
          <h2 style={titleStyle}>{section.title}</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
            {items.map((skill, i) => (
              <motion.span key={i} initial={{ opacity: 0, scale: 0.85 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.04 }}
                style={{ padding: '0.5rem 1.25rem', borderRadius: radius, border: `1px solid ${theme.primaryColor}44`, color: theme.primaryColor, fontSize: '0.9rem', fontWeight: 500 }}>
                {skill}
              </motion.span>
            ))}
          </div>
        </div>
      </motion.section>
    );
  }

  // ── STATS ──
  if (section.type === 'stats') {
    const items = fa('stats') || fa('Stats');
    return (
      <motion.section id={section.id} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={variants}
        style={{ padding: `${pad} 1.5rem`, background: theme.primaryColor }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: `repeat(${Math.min(items.length, 4)}, 1fr)`, gap: '2rem', textAlign: 'center' }}>
          {items.map((stat, i) => {
            const [num, ...rest] = stat.split(' ');
            return (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#fff' }}>{num}</div>
                <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.9rem', marginTop: '0.25rem' }}>{rest.join(' ')}</div>
              </motion.div>
            );
          })}
        </div>
      </motion.section>
    );
  }

  // ── TESTIMONIALS ──
  if (section.type === 'testimonials') {
    const items = fa('testimonials') || fa('Testimonials');
    return (
      <motion.section id={section.id} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={variants}
        style={{ padding: `${pad} 1.5rem`, background: altBg }}>
        <div style={containerStyle}>
          <h2 style={titleStyle}>{section.title}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {items.map((t, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                style={{ padding: '1.75rem', border: `1px solid ${theme.primaryColor}22`, borderRadius: radius, background: `${theme.primaryColor}08` }}>
                <p style={{ opacity: 0.8, lineHeight: 1.75, fontStyle: 'italic' }}>"{t}"</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>
    );
  }

  // ── VIDEOS ──
  if (section.type === 'videos') {
    const items = fa('videos') || fa('Video');
    const embed = (url: string) => {
      const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
      if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
      const vm = url.match(/vimeo\.com\/(\d+)/);
      if (vm) return `https://player.vimeo.com/video/${vm[1]}`;
      return url;
    };
    return (
      <motion.section id={section.id} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={variants}
        style={{ padding: `${pad} 1.5rem`, background: altBg }}>
        <div style={containerStyle}>
          <h2 style={titleStyle}>{section.title}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {items.map((url, i) => (
              <div key={i} style={{ borderRadius: radius, overflow: 'hidden', aspectRatio: '16/9', background: '#000' }}>
                <iframe src={embed(url)} style={{ width: '100%', height: '100%', border: 'none' }} allowFullScreen title={`video-${i}`} />
              </div>
            ))}
          </div>
        </div>
      </motion.section>
    );
  }

  // ── PRICING ──
  if (section.type === 'pricing') {
    const plans = fa('plans') || fa('Plans');
    return (
      <motion.section id={section.id} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={variants}
        style={{ padding: `${pad} 1.5rem`, background: altBg }}>
        <div style={containerStyle}>
          <h2 style={titleStyle}>{section.title}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
            {plans.map((plan, i) => {
              const parts = plan.split('|').map(p => p.trim());
              const [name, price, ...features] = parts;
              const isFeatured = i === Math.floor(plans.length / 2);
              return (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                  style={{ padding: '2rem', border: `${isFeatured ? 2 : 1}px solid ${isFeatured ? theme.primaryColor : theme.primaryColor + '33'}`, borderRadius: radius, background: isFeatured ? `${theme.primaryColor}12` : 'transparent', position: 'relative' }}>
                  {isFeatured && <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: theme.primaryColor, color: '#fff', fontSize: '0.7rem', fontWeight: 700, padding: '3px 12px', borderRadius: 20 }}>POPULAR</div>}
                  <p style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.5rem' }}>{name}</p>
                  <p style={{ fontSize: '2rem', fontWeight: 800, color: theme.primaryColor, marginBottom: '1.25rem' }}>{price}</p>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {features.map((f, j) => <li key={j} style={{ fontSize: '0.875rem', opacity: 0.8, display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span style={{ color: theme.primaryColor }}>✓</span>{f}</li>)}
                  </ul>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.section>
    );
  }

  // ── FAQ ──
  if (section.type === 'faq') {
    const faqs = fa('faqs') || fa('FAQ');
    return (
      <motion.section id={section.id} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={variants}
        style={{ padding: `${pad} 1.5rem`, background: altBg }}>
        <div style={{ ...containerStyle, maxWidth: 760 }}>
          <h2 style={titleStyle}>{section.title}</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {faqs.map((faq, i) => {
              const [q, a] = faq.split('|').map(s => s.trim());
              return (
                <FAQItem key={i} q={q} a={a} theme={theme} radius={radius} index={i} />
              );
            })}
          </div>
        </div>
      </motion.section>
    );
  }

  // ── CONTACT ──
  if (section.type === 'contact') {
    return (
      <motion.section id={section.id} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={variants}
        style={{ padding: `${pad} 1.5rem`, background: altBg }}>
        <div style={containerStyle}>
          <h2 style={titleStyle}>{section.title}</h2>
          <ContactForm theme={theme} section={section} radius={radius} />
        </div>
      </motion.section>
    );
  }

  // ── GENERIC ──
  return (
    <motion.section id={section.id} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={variants}
      style={{ padding: `${pad} 1.5rem`, background: altBg }}>
      <div style={containerStyle}>
        <h2 style={titleStyle}>{section.title}</h2>
        <div style={{ display: 'grid', gap: '1rem' }}>
          {section.fields.map(field => {
            if (field.type === 'select') return null;
            if (field.type === 'image' && field.value) return <img key={field.id} src={field.value as string} alt="" style={{ maxWidth: 400, borderRadius: radius, marginBottom: '1rem' }} />;
            if (field.type === 'images') {
              const imgs = Array.isArray(field.value) ? field.value as string[] : [];
              return <div key={field.id} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.75rem' }}>
                {imgs.map((src, i) => <img key={i} src={src} alt="" style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: radius }} />)}
              </div>;
            }
            if (Array.isArray(field.value)) {
              const items = field.value as string[];
              return <div key={field.id} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                {items.map((item, i) => <div key={i} style={{ padding: '1rem', border: `1px solid ${theme.primaryColor}22`, borderRadius: radius }}><p style={{ opacity: 0.85, lineHeight: 1.65 }}>{item}</p></div>)}
              </div>;
            }
            if (!field.value) return null;
            return <p key={field.id} style={{ opacity: 0.8, lineHeight: 1.75 }}>{field.value as string}</p>;
          })}
        </div>
      </div>
    </motion.section>
  );
}

// ── FAQ accordion item ───────────────────────────────────────────────────────
function FAQItem({ q, a, theme, radius, index }: { q: string; a: string; theme: ThemeConfig; radius: string; index: number }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.06 }}
      style={{ border: `1px solid ${theme.primaryColor}${open ? '55' : '22'}`, borderRadius: radius, overflow: 'hidden', transition: 'border-color 0.2s' }}>
      <button onClick={() => setOpen(!open)}
        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.1rem 1.25rem', background: open ? `${theme.primaryColor}10` : 'transparent', border: 'none', cursor: 'pointer', color: 'inherit', textAlign: 'left', transition: 'background 0.2s' }}>
        <span style={{ fontWeight: 600, fontSize: '0.95rem', flex: 1 }}>{q}</span>
        <motion.span animate={{ rotate: open ? 45 : 0 }} transition={{ duration: 0.2 }}
          style={{ color: theme.primaryColor, fontSize: '1.4rem', lineHeight: 1, marginLeft: '1rem', flexShrink: 0 }}>+</motion.span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}>
            <p style={{ padding: '0 1.25rem 1.1rem', opacity: 0.75, lineHeight: 1.7, fontSize: '0.9rem' }}>{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Contact form ─────────────────────────────────────────────────────────────
function ContactForm({ theme, section, radius }: { theme: ThemeConfig; section: PortfolioSection; radius: string }) {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, smtp: {} }),
      });
      setStatus(res.ok ? 'sent' : 'error');
    } catch { setStatus('error'); }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '0.8rem 1rem', borderRadius: radius,
    border: `1px solid ${theme.primaryColor}33`, background: `${theme.primaryColor}08`,
    color: theme.textColor, fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box',
  };

  const introMsg = section.fields.find(f => f.type === 'textarea');
  const emailField = section.fields.find(f => f.type === 'email');
  const phoneField = section.fields.find(f => f.label.toLowerCase().includes('phone'));

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '3rem' }}>
      {/* Info side */}
      <div>
        {introMsg?.value && <p style={{ opacity: 0.7, marginBottom: '1.5rem', lineHeight: 1.75 }}>{introMsg.value as string}</p>}
        {emailField?.value && <p style={{ marginBottom: '0.75rem', opacity: 0.8 }}>📧 {emailField.value as string}</p>}
        {phoneField?.value && <p style={{ opacity: 0.8 }}>📞 {phoneField.value as string}</p>}
      </div>
      {/* Form side */}
      <div>
        {status === 'sent' ? (
          <div style={{ padding: '2rem', background: `${theme.primaryColor}18`, borderRadius: radius, textAlign: 'center' }}>
            <p style={{ color: theme.primaryColor, fontWeight: 600, fontSize: '1.1rem' }}>✅ Message sent!</p>
            <p style={{ opacity: 0.6, marginTop: '0.5rem', fontSize: '0.9rem' }}>I'll get back to you soon.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input style={inputStyle} placeholder="Your Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
            <input style={inputStyle} type="email" placeholder="Your Email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
            <textarea style={{ ...inputStyle, resize: 'none' }} rows={5} placeholder="Your Message" value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} required />
            <button type="submit" disabled={status === 'sending'}
              style={{ background: theme.primaryColor, color: '#fff', padding: '0.85rem 2rem', borderRadius: radius, fontWeight: 600, border: 'none', cursor: 'pointer', fontSize: '0.95rem', opacity: status === 'sending' ? 0.7 : 1 }}>
              {status === 'sending' ? 'Sending…' : 'Send Message'}
            </button>
            {status === 'error' && <p style={{ color: '#ef4444', fontSize: '0.85rem' }}>Failed to send. Check SMTP settings.</p>}
          </form>
        )}
      </div>
    </div>
  );
}
