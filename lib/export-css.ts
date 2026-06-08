import { Portfolio } from './types';

export function generateExportCSS(portfolio: Portfolio): string {
  const { theme } = portfolio;
  const radii: Record<string, string> = { none: '0', sm: '4px', md: '8px', lg: '16px', full: '9999px' };
  const spacing: Record<string, string> = { compact: '3rem', normal: '5rem', relaxed: '8rem' };
  const mSpacing: Record<string, string> = { compact: '2rem', normal: '2.5rem', relaxed: '3.25rem' };
  const radius = radii[theme.borderRadius] || '8px';
  const pad = spacing[theme.spacing] || '5rem';
  const mPad = mSpacing[theme.spacing] || '2.5rem';
  const custom = theme.customCSS || '';

  return `/* Portfolio export styles */
:root {
  --primary: ${theme.primaryColor};
  --secondary: ${theme.secondaryColor};
  --accent: ${theme.accentColor};
  --bg: ${theme.backgroundColor};
  --text: ${theme.textColor};
  --radius: ${radius};
  --pad: ${pad};
  --m-pad: ${mPad};
  --font: '${theme.fontFamily}', system-ui, sans-serif;
  --nav-offset: 80px;
}
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; }
body {
  font-family: var(--font);
  background: var(--bg);
  color: var(--text);
  line-height: 1.6;
  overflow-x: clip;
}
img { max-width: 100%; display: block; }
a { color: inherit; }
.container { max-width: 1200px; margin: 0 auto; padding: 0 clamp(0.85rem, 4vw, 1.5rem); width: 100%; }
section[id] { scroll-margin-top: var(--nav-offset); }

/* Animations */
.fade-in, .sec-anim { opacity: 0; transition-property: opacity, transform, filter; transition-timing-function: cubic-bezier(0.22, 1, 0.36, 1); }
.fade-in.visible, .sec-anim.visible, .anim-on-load { opacity: 1; transform: none; filter: none; }
.sec-anim-hover:hover { transition: transform 0.25s ease, box-shadow 0.25s ease; }
.anim-on-load { animation-fill-mode: both; }

/* Navbar */
.navbar { position: sticky; top: 0; z-index: 50; width: 100%; }
.navbar-inner {
  background: color-mix(in srgb, var(--bg) 80%, transparent);
  backdrop-filter: blur(16px);
  border-bottom: 1px solid color-mix(in srgb, var(--primary) 15%, transparent);
  transition: box-shadow 0.3s, background 0.3s;
}
.navbar-inner.scrolled { box-shadow: 0 4px 24px color-mix(in srgb, var(--primary) 12%, transparent); }
.navbar-row {
  display: flex; align-items: center; justify-content: space-between;
  min-height: 64px; gap: 1rem;
}
.nav-brand { display: flex; align-items: center; gap: 0.7rem; text-decoration: none; color: inherit; flex-shrink: 0; }
.nav-brand-logo {
  width: 38px; height: 38px; border-radius: var(--radius); object-fit: cover;
}
.nav-brand-initial {
  width: 38px; height: 38px; border-radius: var(--radius); flex-shrink: 0;
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  display: flex; align-items: center; justify-content: center;
  font-weight: 800; font-size: 1rem; color: #fff;
  box-shadow: 0 4px 14px color-mix(in srgb, var(--primary) 25%, transparent);
}
.nav-brand-name { font-weight: 800; font-size: 1.05rem; color: var(--primary); line-height: 1.2; }
.nav-brand-tag { opacity: 0.5; font-size: 0.68rem; margin-top: 2px; }
.nav-links { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; list-style: none; }
.nav-links a {
  text-decoration: none; font-size: 0.875rem; font-weight: 500;
  opacity: 0.78; padding: 9px 10px; transition: color 0.2s, opacity 0.2s; white-space: nowrap;
}
.nav-links a:hover { opacity: 1; color: var(--primary); }
.nav-cta {
  padding: 0.5rem 1.15rem; border-radius: var(--radius); font-size: 0.82rem; font-weight: 700;
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  color: #fff !important; text-decoration: none; white-space: nowrap;
  box-shadow: 0 4px 16px color-mix(in srgb, var(--primary) 22%, transparent);
}
.nav-actions { display: flex; align-items: center; gap: 0.85rem; }
.menu-btn {
  width: 40px; height: 40px; border-radius: 11px; cursor: pointer; flex-shrink: 0;
  border: 1px solid color-mix(in srgb, var(--primary) 40%, transparent);
  background: linear-gradient(135deg, color-mix(in srgb, var(--primary) 10%, transparent), color-mix(in srgb, var(--secondary) 6%, transparent));
  color: var(--text); display: none; align-items: center; justify-content: center; font-size: 1.1rem;
}

/* Mobile menu */
.mobile-menu-overlay {
  position: fixed; inset: 0; z-index: 9998; background: rgba(0,0,0,0.55);
  backdrop-filter: blur(5px); display: none; align-items: stretch; justify-content: flex-end;
}
.mobile-menu-overlay.open { display: flex; }
.mobile-menu-panel {
  width: min(320px, 88vw); background: var(--bg); height: 100%;
  display: flex; flex-direction: column; box-shadow: -8px 0 40px rgba(0,0,0,0.3);
  animation: slideIn 0.3s ease;
}
@keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
.mobile-menu-header {
  padding: 1rem 0.9rem; background: linear-gradient(135deg, var(--primary), var(--secondary)); color: #fff;
  display: flex; align-items: center; justify-content: space-between;
}
.mobile-menu-close {
  width: 32px; height: 32px; border-radius: 50%; border: none; cursor: pointer;
  background: rgba(255,255,255,0.2); color: #fff; font-size: 1.1rem;
}
.mobile-menu-links { flex: 1; overflow-y: auto; padding: 0.75rem 0.65rem; }
.mobile-menu-links a {
  display: flex; align-items: center; gap: 0.65rem; padding: 0.7rem 0.75rem;
  border-radius: 10px; margin-bottom: 6px; text-decoration: none; color: var(--text);
  background: color-mix(in srgb, var(--primary) 5%, transparent);
  border: 1px solid color-mix(in srgb, var(--primary) 10%, transparent); font-weight: 600; font-size: 0.82rem;
}

/* Section shell */
.section-shell { padding: var(--pad) clamp(0.85rem, 4vw, 2.5rem); width: 100%; overflow: hidden; }
.section-shell.alt { background: color-mix(in srgb, var(--primary) 4%, transparent); }
.section-header { margin-bottom: 2.75rem; }
.section-header.center { text-align: center; }
.section-badge {
  display: inline-block; font-size: 0.72rem; font-weight: 700; letter-spacing: 0.14em;
  text-transform: uppercase; color: var(--primary); margin-bottom: 0.85rem;
  padding: 0.35rem 0.85rem; border-radius: 999px;
  background: color-mix(in srgb, var(--primary) 8%, transparent);
  border: 1px solid color-mix(in srgb, var(--primary) 16%, transparent);
}
.section-accent {
  width: 52px; height: 4px; border-radius: 2px; margin-bottom: 1rem;
  background: linear-gradient(90deg, var(--primary), var(--secondary));
}
.section-header.center .section-accent { margin-left: auto; margin-right: auto; }
.section-title {
  font-size: clamp(1.65rem, 4vw, 2.35rem); font-weight: 800; color: var(--primary);
  line-height: 1.15; letter-spacing: -0.02em; word-break: break-word;
}
.section-subtitle {
  opacity: 0.58; margin-top: 0.75rem; font-size: 1.02rem; line-height: 1.7; max-width: 620px;
}
.section-header.center .section-subtitle { margin-left: auto; margin-right: auto; max-width: 540px; }

/* Cards */
.glass-card {
  padding: clamp(1rem, 3vw, 1.5rem); border-radius: var(--radius);
  background: linear-gradient(135deg, color-mix(in srgb, var(--primary) 6%, transparent), color-mix(in srgb, var(--secondary) 4%, transparent));
  border: 1px solid color-mix(in srgb, var(--primary) 13%, transparent);
  transition: transform 0.25s, border-color 0.25s, box-shadow 0.25s;
}
.glass-card:hover {
  transform: translateY(-4px);
  border-color: color-mix(in srgb, var(--primary) 27%, transparent);
  box-shadow: 0 16px 40px color-mix(in srgb, var(--primary) 10%, transparent);
}
.grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; }
.grid-auto { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 1rem; }
.grid-projects { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem; }

/* Hero */
.hero-section { padding: var(--pad) clamp(0.85rem, 4vw, 1.5rem); min-height: 62vh; display: flex; align-items: center; }
.hero-inner { display: flex; align-items: center; gap: 3rem; flex-wrap: wrap; }
.hero-inner.reverse { flex-direction: row-reverse; }
.hero-inner.col { flex-direction: column; }
.hero-welcome { color: var(--primary); font-weight: 600; margin-bottom: 0.5rem; font-size: 0.8rem; letter-spacing: 0.14em; text-transform: uppercase; }
.hero-headline { font-size: clamp(1.8rem, 4vw, 3.2rem); font-weight: 800; line-height: 1.1; margin-bottom: 1rem; }
.hero-sub { font-size: 1.15rem; opacity: 0.7; margin-bottom: 0.75rem; }
.hero-desc { opacity: 0.6; max-width: 520px; margin-bottom: 1.75rem; line-height: 1.75; }
.hero-btns { display: flex; gap: 1rem; flex-wrap: wrap; }
.btn-primary {
  display: inline-block; background: var(--primary); color: #fff; padding: 0.75rem 2rem;
  border-radius: var(--radius); font-weight: 600; text-decoration: none; font-size: 0.95rem;
}
.btn-outline {
  display: inline-block; border: 2px solid var(--primary); color: var(--primary);
  padding: 0.75rem 2rem; border-radius: var(--radius); font-weight: 600; text-decoration: none; font-size: 0.95rem;
}
.hero-img-wrap { flex: 0 0 auto; width: clamp(180px, 32%, 360px); }
.hero-img { width: 100%; aspect-ratio: 1; object-fit: cover; border-radius: var(--radius); box-shadow: 0 24px 64px color-mix(in srgb, var(--primary) 19%, transparent); }
.hero-banner { position: relative; min-height: 72vh; display: flex; align-items: center; overflow: hidden; }
.hero-banner img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.hero-banner-overlay { position: absolute; inset: 0; background: linear-gradient(135deg, rgba(0,0,0,0.78), rgba(0,0,0,0.28)); }
.hero-banner-content { position: relative; z-index: 1; padding: var(--pad) 1.5rem; color: #fff; width: 100%; }
.hero-split { display: grid; grid-template-columns: 1fr 1fr; min-height: 72vh; }
.hero-split-text { padding: var(--pad) 3rem; display: flex; align-items: center; }
.hero-split-img { overflow: hidden; }
.hero-split-img img { width: 100%; height: 100%; object-fit: cover; min-height: 260px; }

/* Slideshow */
.slideshow { position: relative; height: 520px; overflow: hidden; }
.slide { position: absolute; inset: 0; opacity: 0; transition: opacity 0.7s; }
.slide.active { opacity: 1; z-index: 1; }
.slide img { width: 100%; height: 100%; object-fit: cover; }
.slide-overlay { position: absolute; inset: 0; background: linear-gradient(to bottom, transparent 30%, rgba(0,0,0,0.65)); z-index: 2; }
.slide-content { position: absolute; inset: 0; display: flex; align-items: center; z-index: 3; padding: 0 1.5rem; }
.slide-dots { position: absolute; bottom: 14px; left: 50%; transform: translateX(-50%); display: flex; gap: 7px; z-index: 4; }
.slide-dot { width: 8px; height: 8px; border-radius: 4px; border: none; cursor: pointer; background: rgba(255,255,255,0.45); padding: 0; transition: all 0.35s; }
.slide-dot.active { width: 22px; background: var(--primary); }
.slide-nav {
  position: absolute; top: 50%; transform: translateY(-50%); z-index: 4;
  background: rgba(0,0,0,0.55); border: none; border-radius: 50%; width: 40px; height: 40px;
  cursor: pointer; color: #fff; font-size: 1.2rem;
}
.slide-prev { left: 14px; }
.slide-next { right: 14px; }

/* About */
.about-grid { display: grid; grid-template-columns: minmax(240px, 340px) 1fr; gap: 4rem; align-items: start; }
.about-grid.about-centered { grid-template-columns: 1fr; max-width: 720px; margin: 0 auto; text-align: center; }
.about-grid.about-centered .about-photo-wrap { max-width: 300px; margin: 0 auto; }
.about-grid.about-wide { grid-template-columns: 1fr 1.35fr; }
.about-grid.about-wide .about-photo { aspect-ratio: 16/10; max-height: 380px; }
.about-photo-wrap { position: relative; }
.about-photo-bg {
  position: absolute; inset: -12px; border-radius: calc(var(--radius) + 8px);
  background: linear-gradient(135deg, color-mix(in srgb, var(--primary) 33%, transparent), color-mix(in srgb, var(--secondary) 27%, transparent));
  transform: rotate(-3deg); z-index: 0;
}
.about-photo { position: relative; z-index: 1; border-radius: var(--radius); overflow: hidden; aspect-ratio: 4/5; max-height: 460px; box-shadow: 0 24px 64px color-mix(in srgb, var(--primary) 19%, transparent); }
.about-photo img { width: 100%; height: 100%; object-fit: cover; }
.about-role-badge {
  position: absolute; bottom: -18px; left: 50%; transform: translateX(-50%);
  background: var(--primary); color: #fff; padding: 0.5rem 1.25rem; border-radius: var(--radius);
  font-size: 0.78rem; font-weight: 700; white-space: nowrap; z-index: 2;
  box-shadow: 0 8px 24px color-mix(in srgb, var(--primary) 31%, transparent);
}
.about-bio { padding: 1.5rem; border-radius: var(--radius); background: color-mix(in srgb, var(--primary) 4%, transparent); border: 1px solid color-mix(in srgb, var(--primary) 8%, transparent); margin-bottom: 2rem; }
.info-card {
  display: flex; align-items: center; gap: 0.85rem; padding: 1rem 1.15rem; border-radius: var(--radius);
  background: color-mix(in srgb, var(--primary) 5%, transparent); border: 1px solid color-mix(in srgb, var(--primary) 10%, transparent);
  text-decoration: none; color: inherit; transition: border-color 0.2s, background 0.2s;
}
.info-card:hover { border-color: color-mix(in srgb, var(--primary) 27%, transparent); background: color-mix(in srgb, var(--primary) 8%, transparent); }
.info-icon { width: 40px; height: 40px; border-radius: var(--radius); background: color-mix(in srgb, var(--primary) 10%, transparent); display: flex; align-items: center; justify-content: center; font-size: 1.1rem; flex-shrink: 0; }
.stat-pill { padding: 1.1rem 1.25rem; border-radius: var(--radius); text-align: center; background: linear-gradient(135deg, color-mix(in srgb, var(--primary) 8%, transparent), color-mix(in srgb, var(--secondary) 6%, transparent)); border: 1px solid color-mix(in srgb, var(--primary) 13%, transparent); }
.stat-num { font-size: 1.5rem; font-weight: 800; color: var(--primary); line-height: 1; }
.stat-label { font-size: 0.78rem; opacity: 0.6; margin-top: 0.35rem; }
.tag { padding: 0.45rem 1rem; border-radius: var(--radius); background: color-mix(in srgb, var(--primary) 7%, transparent); border: 1px solid color-mix(in srgb, var(--primary) 15%, transparent); font-size: 0.85rem; display: inline-block; }

/* Skills */
.skill-bar { height: 6px; border-radius: 99px; background: color-mix(in srgb, var(--primary) 10%, transparent); overflow: hidden; }
.skill-fill { height: 100%; border-radius: 99px; background: linear-gradient(90deg, var(--primary), var(--secondary)); }

/* Experience timeline */
.timeline { position: relative; max-width: 800px; margin: 0 auto; }
.timeline-line { position: absolute; left: 23px; top: 8px; bottom: 8px; width: 2px; background: linear-gradient(180deg, var(--primary), color-mix(in srgb, var(--secondary) 27%, transparent)); }
.timeline-item { display: flex; gap: 1.25rem; padding-left: 3.5rem; position: relative; margin-bottom: 1.5rem; }
.timeline-dot {
  position: absolute; left: 16px; top: 20px; width: 16px; height: 16px; border-radius: 50%;
  background: var(--primary); border: 3px solid var(--bg); box-shadow: 0 0 0 3px color-mix(in srgb, var(--primary) 27%, transparent);
}

/* Projects */
.project-card { border-radius: var(--radius); overflow: hidden; border: 1px solid color-mix(in srgb, var(--primary) 13%, transparent); background: color-mix(in srgb, var(--primary) 2%, transparent); transition: transform 0.25s, box-shadow 0.25s; }
.project-card:hover { transform: translateY(-6px); box-shadow: 0 20px 50px color-mix(in srgb, var(--primary) 13%, transparent); }
.project-thumb { height: 120px; display: flex; align-items: flex-end; padding: 1.25rem; position: relative; }
.project-body { padding: 1.5rem; }

/* Gallery */
.gallery-grid { display: grid; grid-template-columns: repeat(4, 1fr); grid-auto-rows: 180px; gap: 0.85rem; }
.gallery-grid.gallery-grid-uniform { grid-template-columns: repeat(3, 1fr); grid-auto-rows: 200px; }
.gallery-carousel { display: flex; gap: 1rem; overflow-x: auto; padding-bottom: 0.5rem; scroll-snap-type: x mandatory; }
.gallery-carousel-item { flex: 0 0 auto; width: min(320px, 75vw); scroll-snap-align: start; border-radius: var(--radius); overflow: hidden; aspect-ratio: 4/3; }
.gallery-carousel-item img { width: 100%; height: 100%; object-fit: cover; }
.gallery-item { border-radius: var(--radius); overflow: hidden; position: relative; background: color-mix(in srgb, var(--primary) 7%, transparent); }
.gallery-item img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.45s; }
.gallery-item:hover img { transform: scale(1.08); }
.gallery-hero { grid-column: span 2; grid-row: span 2; }

/* Videos */
.video-grid { display: grid; gap: 1.25rem; }
.video-grid.has-side { grid-template-columns: 1.6fr 1fr; }
.video-wrap { border-radius: var(--radius); overflow: hidden; background: #000; box-shadow: 0 16px 48px color-mix(in srgb, var(--primary) 13%, transparent); }
.video-aspect { position: relative; padding-bottom: 56.25%; height: 0; }
.video-aspect iframe { position: absolute; inset: 0; width: 100%; height: 100%; border: none; }

/* Social bar */
.social-bar { display: flex; gap: 0.5rem; flex-wrap: wrap; margin-top: 1.5rem; }
.social-btn {
  display: inline-flex; align-items: center; justify-content: center; width: 36px; height: 36px;
  border-radius: 8px; border: 1px solid color-mix(in srgb, var(--primary) 33%, transparent);
  color: var(--primary); font-size: 0.7rem; font-weight: 700; text-decoration: none; transition: all 0.2s;
}
.social-btn:hover { background: var(--primary); color: #fff; border-color: var(--primary); }

/* Testimonials */
.stars { color: var(--primary); font-size: 0.95rem; margin-bottom: 0.75rem; letter-spacing: 1px; }
.testimonial-quote { opacity: 0.82; line-height: 1.8; font-style: italic; font-size: 0.95rem; flex: 1; }
.testimonial-author { display: flex; align-items: center; gap: 0.75rem; margin-top: 1.25rem; padding-top: 1.1rem; border-top: 1px solid color-mix(in srgb, var(--primary) 10%, transparent); }
.avatar { width: 42px; height: 42px; border-radius: 50%; object-fit: cover; flex-shrink: 0; }
.avatar-initial { width: 42px; height: 42px; border-radius: 50%; background: linear-gradient(135deg, var(--primary), var(--secondary)); display: flex; align-items: center; justify-content: center; font-weight: 800; color: #fff; font-size: 0.9rem; }

/* Stats section */
.stats-section {
  padding: var(--pad) clamp(0.85rem, 4vw, 2.5rem);
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  position: relative; overflow: hidden;
}
.stats-section .section-title, .stats-section .section-subtitle { color: #fff; }
.stat-box { text-align: center; padding: 1.75rem 1rem; border-radius: 16px; background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.2); }
.stat-box-num { font-size: clamp(2rem, 5vw, 2.75rem); font-weight: 900; color: #fff; line-height: 1; }
.stat-box-label { color: rgba(255,255,255,0.8); font-size: 0.88rem; margin-top: 0.5rem; font-weight: 500; }

/* Team */
.team-avatar { width: 96px; height: 96px; border-radius: 50%; object-fit: cover; margin: 0 auto 1.1rem; border: 3px solid color-mix(in srgb, var(--primary) 27%, transparent); box-shadow: 0 8px 28px color-mix(in srgb, var(--primary) 21%, transparent); }
.team-card { text-align: center; padding: 2rem 1.5rem; height: 100%; display: flex; flex-direction: column; align-items: center; }

/* Pricing */
.pricing-card { padding: 2rem 1.75rem; border-radius: var(--radius); position: relative; display: flex; flex-direction: column; height: 100%; border: 1px solid color-mix(in srgb, var(--primary) 16%, transparent); background: color-mix(in srgb, var(--primary) 4%, transparent); }
.pricing-card.featured { border: 2px solid var(--primary); background: linear-gradient(180deg, color-mix(in srgb, var(--primary) 10%, transparent), color-mix(in srgb, var(--primary) 2%, transparent)); box-shadow: 0 20px 50px color-mix(in srgb, var(--primary) 15%, transparent); }
.pricing-badge { position: absolute; top: -13px; left: 50%; transform: translateX(-50%); background: linear-gradient(90deg, var(--primary), var(--secondary)); color: #fff; font-size: 0.68rem; font-weight: 800; padding: 4px 14px; border-radius: 20px; letter-spacing: 0.06em; }
.pricing-price { font-size: 2.25rem; font-weight: 900; color: var(--primary); margin-bottom: 1.5rem; line-height: 1; }
.pricing-features { list-style: none; padding: 0; margin: 0 0 1.5rem; flex: 1; display: flex; flex-direction: column; gap: 0.6rem; }
.pricing-features li { font-size: 0.875rem; opacity: 0.78; display: flex; align-items: center; gap: 0.55rem; }
.pricing-cta { width: 100%; padding: 0.85rem; border-radius: var(--radius); font-weight: 700; font-size: 0.9rem; display: block; text-align: center; text-decoration: none; cursor: pointer; border: none; }
.pricing-cta.featured { background: var(--primary); color: #fff; }
.pricing-cta:not(.featured) { background: transparent; color: var(--primary); border: 2px solid var(--primary); }

/* FAQ */
.faq-item { border-radius: var(--radius); overflow: hidden; border: 1px solid color-mix(in srgb, var(--primary) 13%, transparent); background: color-mix(in srgb, var(--primary) 2%, transparent); margin-bottom: 0.75rem; }
.faq-item.open { border-color: var(--primary); background: color-mix(in srgb, var(--primary) 5%, transparent); }
.faq-q { width: 100%; display: flex; align-items: center; justify-content: space-between; padding: 1.15rem 1.35rem; background: transparent; border: none; cursor: pointer; color: inherit; text-align: left; font-weight: 700; font-size: 0.95rem; }
.faq-toggle { color: var(--primary); font-size: 1.5rem; line-height: 1; flex-shrink: 0; transition: transform 0.25s; }
.faq-item.open .faq-toggle { transform: rotate(45deg); }
.faq-a { display: none; padding: 0 1.35rem 1.15rem; opacity: 0.72; line-height: 1.75; font-size: 0.9rem; }
.faq-item.open .faq-a { display: block; }

/* Blog */
.blog-card { overflow: hidden; padding: 0; }
.blog-card-inner { display: flex; }
.blog-thumb { flex-shrink: 0; width: 200px; min-height: 160px; }
.blog-thumb img { width: 100%; height: 100%; object-fit: cover; }
.blog-body { flex: 1; padding: 1.25rem 1.35rem; display: flex; flex-direction: column; gap: 0.5rem; min-width: 0; }
.blog-tag { font-size: 0.62rem; font-weight: 600; padding: 0.15rem 0.5rem; border-radius: 999px; background: color-mix(in srgb, var(--primary) 7%, transparent); color: var(--primary); border: 1px solid color-mix(in srgb, var(--primary) 13%, transparent); }
.blog-read-btn { color: var(--primary); font-weight: 700; font-size: 0.82rem; background: color-mix(in srgb, var(--primary) 8%, transparent); border: 1px solid color-mix(in srgb, var(--primary) 20%, transparent); padding: 0.45rem 0.9rem; border-radius: var(--radius); cursor: pointer; display: inline-block; }

/* Contact */
.contact-grid { display: grid; grid-template-columns: 1fr 1.15fr; gap: 2.5rem; align-items: start; max-width: 1040px; margin: 0 auto; }
.contact-grid.contact-centered { grid-template-columns: 1fr; max-width: 640px; }
.contact-grid.contact-minimal { grid-template-columns: 1fr; max-width: 560px; }
.contact-chips { display: flex; flex-wrap: wrap; gap: 0.5rem; justify-content: center; margin-bottom: 1.5rem; }
.contact-chip { font-size: 0.78rem; padding: 0.4rem 0.85rem; border-radius: 999px; background: color-mix(in srgb, var(--primary) 8%, transparent); border: 1px solid color-mix(in srgb, var(--primary) 14%, transparent); text-decoration: none; color: inherit; }
.contact-intro { padding: 1.35rem 1.5rem; border-radius: var(--radius); background: color-mix(in srgb, var(--primary) 5%, transparent); border: 1px solid color-mix(in srgb, var(--primary) 10%, transparent); border-left: 4px solid var(--primary); }
.contact-form-wrap { position: relative; }
.contact-form-glow { position: absolute; inset: -1px; border-radius: calc(var(--radius) + 4px); background: linear-gradient(135deg, color-mix(in srgb, var(--primary) 27%, transparent), color-mix(in srgb, var(--secondary) 20%, transparent)); z-index: 0; }
.contact-form { position: relative; z-index: 1; padding: 2rem; border-radius: var(--radius); background: var(--bg); box-shadow: 0 20px 60px color-mix(in srgb, var(--primary) 8%, transparent); }
.form-label { display: block; font-size: 0.78rem; font-weight: 600; opacity: 0.55; margin-bottom: 0.45rem; }
.form-input {
  width: 100%; padding: 0.85rem 1rem; border-radius: var(--radius);
  border: 1.5px solid color-mix(in srgb, var(--primary) 16%, transparent);
  background: color-mix(in srgb, var(--primary) 4%, transparent);
  color: var(--text); font-size: 0.92rem; outline: none; font-family: inherit;
}
.form-input:focus { border-color: var(--primary); background: color-mix(in srgb, var(--primary) 6%, transparent); }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.form-group { margin-bottom: 1.1rem; }
.form-submit {
  width: 100%; background: linear-gradient(135deg, var(--primary), var(--secondary));
  color: #fff; padding: 1rem 2rem; border-radius: var(--radius); font-weight: 700; border: none;
  cursor: pointer; font-size: 0.95rem; font-family: inherit;
  box-shadow: 0 8px 24px color-mix(in srgb, var(--primary) 25%, transparent);
}

/* Footer */
.site-footer { position: relative; margin-top: 2rem; overflow: hidden; border-top: 1px solid color-mix(in srgb, var(--primary) 13%, transparent); background: linear-gradient(180deg, color-mix(in srgb, var(--primary) 2%, transparent) 0%, var(--bg) 40%); }
.footer-accent { height: 3px; background: linear-gradient(90deg, var(--primary), var(--secondary), var(--accent), var(--primary)); }
.footer-inner { max-width: 1200px; margin: 0 auto; padding: 4rem clamp(1rem, 5vw, 2.5rem) 0; }
.footer-cta { display: flex; align-items: center; justify-content: space-between; gap: 1.25rem; padding: 1.5rem 1.75rem; border-radius: var(--radius); margin-bottom: 3rem; background: linear-gradient(135deg, color-mix(in srgb, var(--primary) 10%, transparent), color-mix(in srgb, var(--secondary) 7%, transparent)); border: 1px solid color-mix(in srgb, var(--primary) 16%, transparent); }
.footer-grid { display: grid; gap: 2rem; margin-bottom: 2rem; }
.footer-heading { font-weight: 700; font-size: 0.75rem; letter-spacing: 0.12em; text-transform: uppercase; opacity: 0.4; margin-bottom: 1.1rem; }
.footer-bottom { border-top: 1px solid color-mix(in srgb, var(--primary) 10%, transparent); padding: 1.5rem 0 2rem; display: flex; align-items: center; justify-content: space-between; gap: 1rem; flex-wrap: wrap; }
.footer-bottom p { opacity: 0.38; font-size: 0.82rem; }
.back-to-top { color: var(--primary); background: none; border: none; cursor: pointer; font-size: 0.78rem; font-weight: 600; opacity: 0.7; font-family: inherit; }

/* Popup & modal */
.popup-overlay {
  position: fixed; inset: 0; z-index: 9999; display: none; align-items: center; justify-content: center;
  padding: 1rem; background: rgba(0,0,0,0.75); backdrop-filter: blur(6px);
}
.popup-overlay.open { display: flex; }
.popup-card { max-width: 460px; width: 100%; padding: 2rem; border-radius: var(--radius); position: relative; }
.modal-overlay {
  position: fixed; inset: 0; z-index: 9999; display: none; align-items: center; justify-content: center;
  padding: 1rem; background: rgba(0,0,0,0.75); backdrop-filter: blur(6px);
}
.modal-overlay.open { display: flex; }
.modal-card { max-width: 720px; width: 100%; max-height: 85vh; overflow-y: auto; padding: 2rem; border-radius: var(--radius); background: var(--bg); position: relative; }
.modal-close { position: absolute; top: 1rem; right: 1rem; width: 36px; height: 36px; border-radius: 50%; border: none; cursor: pointer; background: color-mix(in srgb, var(--primary) 10%, transparent); color: var(--text); font-size: 1.2rem; }

/* Dynamic fields */
.field-img { width: 100%; border-radius: var(--radius); box-shadow: 0 12px 32px color-mix(in srgb, var(--primary) 10%, transparent); }
.field-list { list-style: none; display: flex; flex-direction: column; gap: 0.5rem; }
.field-list li { display: flex; align-items: flex-start; gap: 0.55rem; opacity: 0.85; line-height: 1.6; }
.field-list li::before { content: '•'; color: var(--primary); font-weight: 800; flex-shrink: 0; }
.field-label { font-size: 0.72rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; opacity: 0.45; margin-bottom: 0.65rem; }
.field-link { display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.65rem 1.15rem; border-radius: var(--radius); text-decoration: none; background: var(--primary); color: #fff; font-weight: 600; font-size: 0.88rem; }

/* Responsive */
@media (max-width: 768px) {
  .section-shell { padding: var(--m-pad) clamp(0.85rem, 4vw, 1rem); }
  .nav-links, .nav-cta { display: none; }
  .menu-btn { display: flex; }
  .hero-inner { flex-direction: column; gap: 2rem; }
  .hero-inner.reverse { flex-direction: column; }
  .hero-split { grid-template-columns: 1fr; min-height: auto; }
  .hero-split-text { padding: var(--m-pad) 1.25rem; }
  .about-grid { grid-template-columns: 1fr; gap: 2.5rem; }
  .grid-2, .form-row, .contact-grid, .video-grid.has-side { grid-template-columns: 1fr; }
  .gallery-grid { grid-template-columns: repeat(2, 1fr); grid-auto-rows: 140px; }
  .gallery-hero { grid-column: span 1; grid-row: span 1; }
  .blog-card-inner { flex-direction: column; }
  .blog-thumb { width: 100%; height: 160px; }
  .slideshow { height: 360px; }
  .hero-banner { min-height: 58vh; }
  .footer-cta { flex-direction: column; align-items: flex-start; }
  .timeline-line { left: 15px; }
  .timeline-item { padding-left: 2.5rem; }
  .timeline-dot { left: 8px; }
  .section-header { margin-bottom: 1.75rem; }
  .section-title { font-size: clamp(1.35rem, 5vw, 1.85rem); }
}
${custom}`;
}
