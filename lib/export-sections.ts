import { Portfolio, PortfolioSection, SectionField, SocialLinks } from './types';
import { escapeHtml } from './export-assets';
import { sectionAnimClassName, sectionAnimDataAttrs } from './section-animation';
import { getBlogPostsFromSection } from './blog-utils';
import { getTestimonialsFromSection } from './testimonial-utils';
import { getTeamMembersFromSection } from './team-utils';
import { getPricingPlansFromSection } from './pricing-utils';
import { getFAQItemsFromSection } from './faq-utils';

const SOCIAL_LABELS: Record<string, string> = {
  github: 'GH', linkedin: 'in', twitter: 'X', instagram: 'IG',
  youtube: 'YT', dribbble: 'Dr', behance: 'Be', website: '🌐',
};

function fv(section: PortfolioSection, id: string): string {
  const f = section.fields.find(fl => fl.id === id)
    ?? section.fields.find(fl => fl.label.toLowerCase().includes(id.toLowerCase()));
  const v = f?.value;
  return typeof v === 'string' ? v : '';
}

function fa(section: PortfolioSection, id: string): string[] {
  const f = section.fields.find(fl => fl.id === id)
    ?? section.fields.find(fl => fl.label.toLowerCase().includes(id.toLowerCase()));
  return Array.isArray(f?.value) && typeof f.value[0] === 'string' ? f.value as string[] : [];
}

function parseSplit(item: string, sep: string): [string, string] {
  const idx = item.indexOf(sep);
  if (idx === -1) return [item.trim(), ''];
  return [item.slice(0, idx).trim(), item.slice(idx + sep.length).trim()];
}

function sectionHeader(title: string, subtitle: string, centered: boolean, badge?: string): string {
  return `<div class="section-header${centered ? ' center' : ''}">
    ${badge ? `<span class="section-badge">${escapeHtml(badge)}</span>` : ''}
    <div class="section-accent"></div>
    <h2 class="section-title">${escapeHtml(title)}</h2>
    ${subtitle ? `<p class="section-subtitle">${escapeHtml(subtitle)}</p>` : ''}
  </div>`;
}

function shell(id: string, content: string, section: PortfolioSection, portfolio: Portfolio, alt = false, extraClass = ''): string {
  const animClass = sectionAnimClassName(section, portfolio.theme);
  const animAttrs = sectionAnimDataAttrs(section, portfolio.theme);
  const attrStr = Object.entries(animAttrs).map(([k, v]) => ` ${k}="${escapeHtml(v)}"`).join('');
  const triggerLoad = section.style?.animation?.custom && section.style?.animation?.trigger === 'load';
  return `<section id="${escapeHtml(id)}" class="section-shell${triggerLoad ? ' anim-on-load' : ' fade-in'}${alt ? ' alt' : ''}${animClass ? ` ${animClass}` : ''}${extraClass ? ` ${extraClass}` : ''}"${attrStr}><div class="container">${content}</div></section>`;
}

function socialBar(social: SocialLinks): string {
  const links = Object.entries(social).filter(([, v]) => v);
  if (!links.length) return '';
  return `<div class="social-bar">${links.map(([key, url]) =>
    `<a class="social-btn" href="${escapeHtml(url as string)}" target="_blank" rel="noopener noreferrer">${SOCIAL_LABELS[key] || key.slice(0, 2).toUpperCase()}</a>`
  ).join('')}</div>`;
}

function renderDynamicField(field: SectionField): string {
  const val = field.value;
  if (val == null) return '';
  const label = `<p class="field-label">${escapeHtml(field.label)}</p>`;

  if (field.type === 'image' && typeof val === 'string' && val) {
    return `<div>${label}<img class="field-img" src="${escapeHtml(val)}" alt="${escapeHtml(field.label)}"></div>`;
  }
  if (field.type === 'images' && Array.isArray(val)) {
    const imgs = (val as string[]).filter(Boolean);
    if (!imgs.length) return '';
    return `<div>${label}<div class="grid-auto">${imgs.map(src => `<img class="field-img" src="${escapeHtml(src)}" alt="">`).join('')}</div></div>`;
  }
  if (field.type === 'list' && Array.isArray(val)) {
    const items = (val as string[]).filter(i => i.trim());
    if (!items.length) return '';
    return `<div>${label}<ul class="field-list">${items.map(i => `<li>${escapeHtml(i)}</li>`).join('')}</ul></div>`;
  }
  if (field.type === 'url' && typeof val === 'string' && val) {
    return `<div>${label}<a class="field-link" href="${escapeHtml(val)}" target="_blank" rel="noopener noreferrer">${escapeHtml(field.label)} →</a></div>`;
  }
  if (field.type === 'email' && typeof val === 'string' && val) {
    return `<div>${label}<a href="mailto:${escapeHtml(val)}" style="color:var(--primary);font-weight:600;text-decoration:none">${escapeHtml(val)}</a></div>`;
  }
  if ((field.type === 'text' || field.type === 'textarea' || field.type === 'richtext') && typeof val === 'string' && val.trim()) {
    return `<div>${label}<p style="opacity:0.85;line-height:1.8;white-space:pre-wrap">${escapeHtml(val)}</p></div>`;
  }
  return '';
}

function videoEmbed(url: string): string {
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}?rel=0`;
  const vm = url.match(/vimeo\.com\/(\d+)/);
  if (vm) return `https://player.vimeo.com/video/${vm[1]}`;
  return url;
}

function heroSectionAttrs(section: PortfolioSection, portfolio: Portfolio): string {
  const animClass = sectionAnimClassName(section, portfolio.theme);
  const animAttrs = sectionAnimDataAttrs(section, portfolio.theme);
  const triggerLoad = section.style?.animation?.custom && section.style?.animation?.trigger === 'load';
  const attrStr = Object.entries(animAttrs).map(([k, v]) => ` ${k}="${escapeHtml(v)}"`).join('');
  return `class="${triggerLoad ? 'anim-on-load' : 'fade-in'}${animClass ? ` ${animClass}` : ''}"${attrStr}`;
}

function renderHero(section: PortfolioSection, portfolio: Portfolio, social: SocialLinks): string {
  const layout = fv(section, 'heroLayout') || 'image-right';
  const headline = fv(section, 'headline') || 'Hello World';
  const sub = fv(section, 'subheadline');
  const desc = fv(section, 'description');
  const ctaText = fv(section, 'ctaText') || 'View Work';
  const ctaLink = fv(section, 'ctaLink') || '#';
  const ctaSecText = fv(section, 'ctaSecondaryText');
  const ctaSecLink = fv(section, 'ctaSecondaryLink') || '#';
  const avatar = fv(section, 'avatar');
  const bannerImgs = fa(section, 'bannerImages');
  const id = escapeHtml(section.id);

  const btns = `<div class="hero-btns">
    <a class="btn-primary" href="${escapeHtml(ctaLink)}">${escapeHtml(ctaText)}</a>
    ${ctaSecText ? `<a class="btn-outline" href="${escapeHtml(ctaSecLink)}">${escapeHtml(ctaSecText)}</a>` : ''}
  </div>`;

  const textBlock = `<div style="flex:1;min-width:0">
    <p class="hero-welcome">Welcome</p>
    <h1 class="hero-headline">${escapeHtml(headline)}</h1>
    ${sub ? `<p class="hero-sub">${escapeHtml(sub)}</p>` : ''}
    ${desc ? `<p class="hero-desc">${escapeHtml(desc)}</p>` : ''}
    ${btns}${socialBar(social)}
  </div>`;

  if (layout === 'banner') {
    const bg = bannerImgs[0] || avatar;
    return `<section id="${id}" ${heroSectionAttrs(section, portfolio).replace('class="', 'class="hero-banner ')}>
      ${bg ? `<img src="${escapeHtml(bg)}" alt="">` : ''}
      <div class="hero-banner-overlay"></div>
      <div class="hero-banner-content container">
        <p class="hero-welcome">Welcome</p>
        <h1 class="hero-headline" style="color:#fff">${escapeHtml(headline)}</h1>
        ${sub ? `<p class="hero-sub" style="color:rgba(255,255,255,0.85)">${escapeHtml(sub)}</p>` : ''}
        ${desc ? `<p class="hero-desc" style="color:rgba(255,255,255,0.7)">${escapeHtml(desc)}</p>` : ''}
        ${btns}
      </div>
    </section>`;
  }

  if (layout === 'slideshow') {
    const imgs = bannerImgs.length ? bannerImgs : (avatar ? [avatar] : []);
    const slides = imgs.map((src, i) =>
      `<div class="slide${i === 0 ? ' active' : ''}" data-slide="${i}"><img src="${escapeHtml(src)}" alt=""></div>`
    ).join('');
    const dots = imgs.map((_, i) =>
      `<button class="slide-dot${i === 0 ? ' active' : ''}" data-slide-to="${i}" aria-label="Slide ${i + 1}"></button>`
    ).join('');
    return `<section id="${id}" ${heroSectionAttrs(section, portfolio)} style="position:relative">
      <div class="slideshow" data-slideshow>
        ${slides}<div class="slide-overlay"></div>
        ${imgs.length > 1 ? `<button class="slide-nav slide-prev" data-slide-prev aria-label="Previous">‹</button><button class="slide-nav slide-next" data-slide-next aria-label="Next">›</button><div class="slide-dots">${dots}</div>` : ''}
        <div class="slide-content"><div class="container">
          <h1 class="hero-headline" style="color:#fff;text-shadow:0 2px 24px rgba(0,0,0,0.6)">${escapeHtml(headline)}</h1>
          ${sub ? `<p style="font-size:1.2rem;color:rgba(255,255,255,0.85);margin-bottom:1.5rem">${escapeHtml(sub)}</p>` : ''}
          <a class="btn-primary" href="${escapeHtml(ctaLink)}">${escapeHtml(ctaText)}</a>
        </div></div>
      </div>
    </section>`;
  }

  if (layout === 'split') {
    return `<section id="${id}" ${heroSectionAttrs(section, portfolio).replace('class="', 'class="hero-split ')}>
      <div class="hero-split-text">${textBlock}</div>
      <div class="hero-split-img">${avatar ? `<img src="${escapeHtml(avatar)}" alt="">` : `<div style="width:100%;height:100%;min-height:260px;background:color-mix(in srgb,var(--primary) 13%,transparent)"></div>`}</div>
    </section>`;
  }

  const imgBlock = avatar ? `<div class="hero-img-wrap"><img class="hero-img" src="${escapeHtml(avatar)}" alt="hero"></div>` : '';
  const flexClass = layout === 'image-left' ? 'reverse' : '';
  return `<section id="${id}" ${heroSectionAttrs(section, portfolio).replace('class="', 'class="hero-section ')}><div class="container hero-inner ${flexClass}${layout === 'text-only' ? ' col' : ''}">
    ${textBlock}${layout !== 'text-only' ? imgBlock : ''}
  </div></section>`;
}

function renderAbout(section: PortfolioSection, portfolio: Portfolio, alt: boolean): string {
  const title = fv(section, 'title') || section.title;
  const subtitle = fv(section, 'subtitle');
  const role = fv(section, 'role');
  const bio = fv(section, 'bio');
  const image = fv(section, 'image');
  const highlights = fa(section, 'highlights');
  const infoFields = ['location', 'email', 'phone', 'website', 'availability'] as const;
  const icons: Record<string, string> = { location: '📍', email: '📧', phone: '📞', website: '🌐', availability: '💼' };

  const infoItems = infoFields.map(id => {
    const val = fv(section, id);
    if (!val) return '';
    const label = section.fields.find(f => f.id === id)?.label || id;
    let href = '';
    if (id === 'email') href = `mailto:${val}`;
    else if (id === 'phone') href = `tel:${val.replace(/\s/g, '')}`;
    else if (id === 'website') href = val.startsWith('http') ? val : `https://${val}`;
    const tag = href ? 'a' : 'div';
    return `<${tag} class="info-card"${href ? ` href="${escapeHtml(href)}"` : ''}${href?.startsWith('http') ? ' target="_blank" rel="noopener noreferrer"' : ''}>
      <div class="info-icon">${icons[id]}</div>
      <div><p style="font-size:0.72rem;opacity:0.45;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:2px">${escapeHtml(label)}</p>
      <p style="font-size:0.9rem;opacity:0.9;font-weight:500;word-break:break-word">${escapeHtml(id === 'website' ? val.replace(/^https?:\/\//, '') : val)}</p></div>
    </${tag}>`;
  }).join('');

  const highlightHtml = highlights.filter(Boolean).map(item => {
    const [num, ...rest] = item.split(' ');
    const isStat = /^\d/.test(num);
    return isStat
      ? `<div class="stat-pill"><p class="stat-num">${escapeHtml(num)}</p><p class="stat-label">${escapeHtml(rest.join(' '))}</p></div>`
      : `<div class="stat-pill"><p style="font-size:0.88rem;font-weight:600;opacity:0.85">${escapeHtml(item)}</p></div>`;
  }).join('');

  const aboutLayout = fv(section, 'aboutLayout') || 'split';
  const aboutClass = aboutLayout === 'centered' ? ' about-centered' : aboutLayout === 'wide' ? ' about-wide' : '';
  const known = new Set(['aboutLayout', 'title', 'subtitle', 'role', 'bio', 'image', 'highlights', 'location', 'email', 'phone', 'website', 'availability']);
  const custom = section.fields.filter(f => !known.has(f.id)).map(renderDynamicField).join('');

  const headerCentered = aboutLayout === 'centered';
  return shell(section.id, `${sectionHeader(title, subtitle, headerCentered)}
    <div class="about-grid${aboutClass}">
      <div class="about-photo-wrap">
        <div class="about-photo-bg"></div>
        <div class="about-photo">${image ? `<img src="${escapeHtml(image)}" alt="${escapeHtml(role || title)}">` : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;opacity:0.35;font-size:4rem">👤</div>`}</div>
        ${role ? `<div class="about-role-badge">${escapeHtml(role)}</div>` : ''}
      </div>
      <div>
        ${bio ? `<div class="about-bio"><p style="opacity:0.85;line-height:1.9;font-size:1.02rem;white-space:pre-wrap">${escapeHtml(bio)}</p></div>` : ''}
        ${highlights.length ? `<div class="grid-auto" style="margin-bottom:2rem">${highlightHtml}</div>` : ''}
        ${infoItems ? `<div class="grid-2">${infoItems}</div>` : ''}
      </div>
    </div>
    ${custom ? `<div style="margin-top:3rem;padding:1.75rem;border-radius:var(--radius);background:color-mix(in srgb,var(--primary) 3%,transparent);border:1px solid color-mix(in srgb,var(--primary) 7%,transparent)" class="grid-auto">${custom}</div>` : ''}
  `, section, portfolio, alt);
}

function renderSkills(section: PortfolioSection, portfolio: Portfolio, title: string, alt: boolean): string {
  const items = fa(section, 'skills') || fa(section, 'Skills');
  const subtitle = fv(section, 'subtitle') || 'Technologies and tools I work with daily';
  const cards = items.map((skill, i) => {
    const [name, levelStr] = parseSplit(skill, ':');
    const pct = levelStr ? Math.min(100, parseInt(levelStr) || 85) : 78 + (i % 5) * 4;
    return `<div class="glass-card"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.75rem">
      <span style="font-weight:700;font-size:0.95rem">${escapeHtml(name)}</span>
      <span style="font-size:0.75rem;font-weight:700;color:var(--primary);opacity:0.85">${pct}%</span>
    </div><div class="skill-bar"><div class="skill-fill" style="width:${pct}%"></div></div></div>`;
  }).join('');
  return shell(section.id, `${sectionHeader(title, subtitle, false, 'Expertise')}<div class="grid-auto">${cards}</div>`, section, portfolio, true);
}

function renderExperience(section: PortfolioSection, portfolio: Portfolio, title: string, alt: boolean): string {
  const jobs = fa(section, 'jobs');
  const subtitle = fv(section, 'subtitle') || 'My professional journey';
  const items = jobs.map(job => {
    const m = job.match(/^(.+?)\s*@\s*(.+?)\s*\((.+)\)$/);
    const [role, company, period] = m ? [m[1], m[2], m[3]] : [job, '', ''];
    return `<div class="timeline-item"><div class="timeline-dot"></div><div class="glass-card" style="flex:1">
      ${period ? `<span style="font-size:0.72rem;font-weight:700;color:var(--primary);letter-spacing:0.06em;text-transform:uppercase">${escapeHtml(period)}</span>` : ''}
      <p style="font-weight:800;font-size:1.05rem;margin-top:${period ? '0.35rem' : '0'};line-height:1.3">${escapeHtml(role || job)}</p>
      ${company ? `<p style="opacity:0.55;font-size:0.88rem;margin-top:0.3rem">${escapeHtml(company)}</p>` : ''}
    </div></div>`;
  }).join('');
  return shell(section.id, `${sectionHeader(title, subtitle, false, 'Career')}<div class="timeline"><div class="timeline-line"></div>${items}</div>`, section, portfolio, alt);
}

function renderProjects(section: PortfolioSection, portfolio: Portfolio, title: string, alt: boolean): string {
  const projects = fa(section, 'projects');
  const subtitle = fv(section, 'subtitle') || 'Selected work and case studies';
  const cards = projects.map((proj, i) => {
    const [name, ...desc] = proj.split(' - ');
    const grad = i % 3;
    return `<div class="project-card"><div class="project-thumb" style="background:linear-gradient(${grad === 0 ? '135deg' : grad === 1 ? '135deg' : '160deg'},var(--primary),var(--secondary))"><span style="font-size:1.75rem">🚀</span></div>
      <div class="project-body"><p style="font-weight:800;font-size:1.1rem;margin-bottom:0.5rem">${escapeHtml(name || proj)}</p>
      ${desc.length ? `<p style="opacity:0.62;line-height:1.7;font-size:0.9rem">${escapeHtml(desc.join(' - '))}</p>` : ''}</div></div>`;
  }).join('');
  return shell(section.id, `${sectionHeader(title, subtitle, true, 'Portfolio')}<div class="grid-projects">${cards}</div>`, section, portfolio, alt);
}

function renderServices(section: PortfolioSection, portfolio: Portfolio, title: string, alt: boolean): string {
  const services = fa(section, 'services');
  const icons = ['🎨', '💻', '📱', '⚡', '🚀', '🛡️', '📊', '🎯'];
  const subtitle = fv(section, 'subtitle') || 'What I can do for you';
  const cards = services.map((svc, i) => {
    const [t, desc] = parseSplit(svc, ' - ');
    return `<div class="glass-card" style="text-align:center;padding:2rem 1.5rem;height:100%">
      <div style="width:56px;height:56px;border-radius:var(--radius);margin:0 auto 1.1rem;background:linear-gradient(135deg,color-mix(in srgb,var(--primary) 16%,transparent),color-mix(in srgb,var(--secondary) 10%,transparent));display:flex;align-items:center;justify-content:center;font-size:1.6rem">${icons[i % icons.length]}</div>
      <p style="font-weight:800;font-size:1rem;margin-bottom:${desc ? '0.5rem' : '0'}">${escapeHtml(t || svc)}</p>
      ${desc ? `<p style="opacity:0.58;font-size:0.86rem;line-height:1.65">${escapeHtml(desc)}</p>` : ''}
    </div>`;
  }).join('');
  return shell(section.id, `${sectionHeader(title, subtitle, true, 'Services')}<div class="grid-auto">${cards}</div>`, section, portfolio, alt);
}

function renderBlog(section: PortfolioSection, portfolio: Portfolio, title: string, alt: boolean): string {
  const posts = getBlogPostsFromSection(section);
  const subtitle = fv(section, 'subtitle') || 'Thoughts, tutorials, and updates';
  const cards = posts.map((post, i) => {
    const tags = (post.list || []).filter(t => t.trim()).slice(0, 3);
    const bodyEsc = escapeHtml(post.body || post.summary || '');
    return `<div class="glass-card blog-card"><div class="blog-card-inner">
      ${post.image ? `<div class="blog-thumb"><img src="${escapeHtml(post.image)}" alt="${escapeHtml(post.title)}"></div>` : `<div class="blog-thumb" style="background:linear-gradient(135deg,color-mix(in srgb,var(--primary) 16%,transparent),color-mix(in srgb,var(--secondary) 10%,transparent));display:flex;align-items:center;justify-content:center;font-size:2rem">📝</div>`}
      <div class="blog-body">
        <div style="display:flex;align-items:center;gap:0.65rem;flex-wrap:wrap">
          ${post.date ? `<span style="font-size:0.68rem;font-weight:700;color:var(--primary);letter-spacing:0.06em;text-transform:uppercase">${escapeHtml(post.date)}</span>` : ''}
          ${tags.map(t => `<span class="blog-tag">${escapeHtml(t)}</span>`).join('')}
        </div>
        <p style="font-weight:800;font-size:1.08rem;line-height:1.3">${escapeHtml(post.title || 'Untitled')}</p>
        ${post.summary ? `<p style="opacity:0.58;line-height:1.6;font-size:0.88rem">${escapeHtml(post.summary)}</p>` : ''}
        <div style="display:flex;align-items:center;gap:0.75rem;margin-top:0.35rem;flex-wrap:wrap">
          <button type="button" class="blog-read-btn" data-blog-read="${i}">Read article →</button>
          ${post.link ? `<a href="${escapeHtml(post.link)}" target="_blank" rel="noopener noreferrer" style="font-size:0.78rem;opacity:0.55;text-decoration:none;font-weight:600">${escapeHtml(post.linkLabel || 'External link')} ↗</a>` : ''}
        </div>
      </div>
    </div>
    <template id="blog-body-${i}">${bodyEsc.replace(/\n/g, '<br>')}</template></div>`;
  }).join('');
  return shell(section.id, `${sectionHeader(title, subtitle, false, 'Blog')}<div style="display:flex;flex-direction:column;gap:1.25rem">${cards}</div>`, section, portfolio, alt);
}

function renderGallery(section: PortfolioSection, portfolio: Portfolio, title: string, alt: boolean): string {
  const images = fa(section, 'images');
  const subtitle = fv(section, 'subtitle') || 'A curated collection of my best work';
  const layout = fv(section, 'galleryLayout') || 'masonry';
  if (!images.length) {
    return shell(section.id, `${sectionHeader(title, '', true, 'Gallery')}<div style="padding:4rem 2rem;text-align:center;border:2px dashed color-mix(in srgb,var(--primary) 20%,transparent);border-radius:var(--radius);opacity:0.5"><p style="font-size:2.5rem;margin-bottom:0.75rem">🖼️</p><p>No gallery images</p></div>`, section, portfolio, alt);
  }
  if (layout === 'carousel') {
    const items = images.map((src, i) =>
      `<div class="gallery-carousel-item"><img src="${escapeHtml(src)}" alt="Gallery ${i + 1}"></div>`
    ).join('');
    return shell(section.id, `${sectionHeader(title, subtitle, true, 'Gallery')}<div class="gallery-carousel">${items}</div>`, section, portfolio, alt);
  }
  const gridClass = layout === 'grid' ? 'gallery-grid gallery-grid-uniform' : 'gallery-grid';
  const items = images.map((src, i) =>
    `<div class="gallery-item${layout === 'masonry' && i === 0 && images.length >= 3 ? ' gallery-hero' : ''}"><img src="${escapeHtml(src)}" alt="Gallery ${i + 1}"></div>`
  ).join('');
  return shell(section.id, `${sectionHeader(title, subtitle, true, 'Gallery')}<div class="${gridClass}">${items}</div>`, section, portfolio, alt);
}

function renderVideos(section: PortfolioSection, portfolio: Portfolio, title: string, alt: boolean): string {
  const items = fa(section, 'videos') || fa(section, 'Video');
  const subtitle = fv(section, 'subtitle') || 'Watch my latest work and creative projects';
  if (!items.length) {
    return shell(section.id, `${sectionHeader(title, '', true, 'Videos')}<div style="padding:4rem 2rem;text-align:center;border:2px dashed color-mix(in srgb,var(--primary) 20%,transparent);border-radius:var(--radius);opacity:0.5"><p style="font-size:2.5rem">🎬</p></div>`, section, portfolio, alt);
  }
  const [featured, ...rest] = items;
  const main = `<div class="video-wrap"><div class="video-aspect"><iframe src="${escapeHtml(videoEmbed(featured))}" allowfullscreen title="featured-video"></iframe></div></div>`;
  const side = rest.map((url, i) =>
    `<div class="video-wrap"><div class="video-aspect"><iframe src="${escapeHtml(videoEmbed(url))}" allowfullscreen title="video-${i}"></iframe></div></div>`
  ).join('');
  return shell(section.id, `${sectionHeader(title, subtitle, true, 'Videos')}
    <div class="video-grid${rest.length ? ' has-side' : ''}">${main}${rest.length ? `<div style="display:flex;flex-direction:column;gap:0.85rem">${side}</div>` : ''}</div>`, section, portfolio, alt);
}

function renderSocial(section: PortfolioSection, portfolio: Portfolio, title: string): string {
  const subtitle = fv(section, 'subtitle') || 'Connect with me across platforms';
  const meta: Record<string, { name: string; icon: string }> = {
    github: { name: 'GitHub', icon: '🐙' }, linkedin: { name: 'LinkedIn', icon: '💼' },
    twitter: { name: 'Twitter / X', icon: '𝕏' }, instagram: { name: 'Instagram', icon: '📸' },
    youtube: { name: 'YouTube', icon: '▶️' }, dribbble: { name: 'Dribbble', icon: '🏀' },
    behance: { name: 'Behance', icon: '🎨' }, website: { name: 'Website', icon: '🌐' },
  };
  const links = section.fields.filter(f => f.type === 'url' && f.value).map(f => {
    const m = meta[f.id] || { name: f.label, icon: '🔗' };
    return `<a href="${escapeHtml(f.value as string)}" target="_blank" rel="noopener noreferrer" class="glass-card" style="display:flex;flex-direction:column;align-items:center;gap:0.65rem;padding:1.5rem 1rem;text-decoration:none;text-align:center">
      <span style="font-size:1.75rem">${m.icon}</span><span style="font-weight:700;font-size:0.88rem">${escapeHtml(m.name)}</span>
      <span style="font-size:0.72rem;color:var(--primary);font-weight:600">Follow →</span></a>`;
  }).join('');
  return shell(section.id, `${sectionHeader(title, subtitle, true, 'Social')}<div class="grid-auto" style="max-width:720px;margin:0 auto">${links}</div>`, section, portfolio, true);
}

function renderTestimonials(section: PortfolioSection, portfolio: Portfolio, title: string, alt: boolean): string {
  const items = getTestimonialsFromSection(section).filter(t => t.quote?.trim() || t.author?.trim());
  const subtitle = fv(section, 'subtitle');
  const cards = items.map(item => {
    const stars = Math.min(5, Math.max(0, item.rating || 0));
    const roleLine = [item.role, item.company].filter(Boolean).join(' · ');
    const initial = (item.author || '?').charAt(0).toUpperCase();
    return `<div class="glass-card" style="height:100%;display:flex;flex-direction:column">
      ${stars > 0 ? `<div class="stars">${'★'.repeat(stars)}${'☆'.repeat(5 - stars)}</div>` : ''}
      ${item.quote ? `<p class="testimonial-quote">"${escapeHtml(item.quote)}"</p>` : ''}
      <div class="testimonial-author">
        ${item.image ? `<img class="avatar" src="${escapeHtml(item.image)}" alt="${escapeHtml(item.author)}">` : item.author ? `<div class="avatar-initial">${escapeHtml(initial)}</div>` : ''}
        <div>${item.author ? `<p style="font-weight:700;font-size:0.9rem">${escapeHtml(item.author)}</p>` : ''}${roleLine ? `<p style="opacity:0.5;font-size:0.78rem;margin-top:2px">${escapeHtml(roleLine)}</p>` : ''}</div>
      </div></div>`;
  }).join('');
  return shell(section.id, `${sectionHeader(title, subtitle, true, 'Reviews')}<div class="grid-auto">${cards}</div>`, section, portfolio, alt);
}

function renderStats(section: PortfolioSection, portfolio: Portfolio, title: string): string {
  const items = fa(section, 'stats') || fa(section, 'Stats');
  const subtitle = fv(section, 'subtitle');
  const cols = Math.min(items.length, 4) || 1;
  const boxes = items.map(stat => {
    const [num, ...rest] = stat.split(' ');
    return `<div class="stat-box"><div class="stat-box-num">${escapeHtml(num)}</div><div class="stat-box-label">${escapeHtml(rest.join(' '))}</div></div>`;
  }).join('');
  return `<section id="${escapeHtml(section.id)}" ${heroSectionAttrs(section, portfolio).replace('class="', 'class="stats-section ')}><div class="container">
    ${sectionHeader(title, subtitle, true, 'Impact')}
    <div style="display:grid;grid-template-columns:repeat(${cols},1fr);gap:1.25rem">${boxes}</div>
  </div></section>`;
}

function renderTeam(section: PortfolioSection, portfolio: Portfolio, title: string, alt: boolean): string {
  const members = getTeamMembersFromSection(section).filter(m => m.name?.trim());
  const subtitle = fv(section, 'subtitle') || 'The people behind the work';
  const cards = members.map(member => {
    const initial = (member.name || '?').charAt(0).toUpperCase();
    const socials = [
      member.linkedin && { href: member.linkedin, label: 'LinkedIn', icon: '💼' },
      member.twitter && { href: member.twitter, label: 'Twitter', icon: '𝕏' },
      member.email && { href: `mailto:${member.email}`, label: 'Email', icon: '✉️' },
    ].filter(Boolean) as { href: string; label: string; icon: string }[];
    return `<div class="glass-card team-card">
      ${member.image ? `<img class="team-avatar" src="${escapeHtml(member.image)}" alt="${escapeHtml(member.name)}">` : `<div class="team-avatar avatar-initial" style="display:flex;align-items:center;justify-content:center;font-size:2rem">${escapeHtml(initial)}</div>`}
      ${member.name ? `<p style="font-weight:800;font-size:1.05rem">${escapeHtml(member.name)}</p>` : ''}
      ${member.role ? `<p style="opacity:0.55;font-size:0.86rem;margin-top:0.35rem;color:var(--primary);font-weight:600">${escapeHtml(member.role)}</p>` : ''}
      ${member.bio ? `<p style="opacity:0.65;font-size:0.82rem;margin-top:0.75rem;line-height:1.65;flex:1">${escapeHtml(member.bio)}</p>` : ''}
      ${socials.length ? `<div style="display:flex;gap:0.5rem;margin-top:1.1rem;flex-wrap:wrap;justify-content:center">${socials.map(s =>
        `<a href="${escapeHtml(s.href)}" target="_blank" rel="noopener noreferrer" style="font-size:0.72rem;padding:0.35rem 0.65rem;border-radius:999px;background:color-mix(in srgb,var(--primary) 7%,transparent);color:var(--primary);text-decoration:none;font-weight:600">${s.icon} ${s.label}</a>`
      ).join('')}</div>` : ''}
    </div>`;
  }).join('');
  return shell(section.id, `${sectionHeader(title, subtitle, true, 'Team')}<div class="grid-auto">${cards}</div>`, section, portfolio, alt);
}

function renderPricing(section: PortfolioSection, portfolio: Portfolio, title: string, alt: boolean): string {
  const plans = getPricingPlansFromSection(section).filter(p => p.name?.trim() || p.price?.trim());
  const subtitle = fv(section, 'subtitle') || 'Simple, transparent pricing';
  const cards = plans.map(plan => {
    const features = (plan.features || []).filter(f => f?.trim());
    return `<div class="pricing-card${plan.featured ? ' featured' : ''}">
      ${plan.featured ? '<div class="pricing-badge">MOST POPULAR</div>' : ''}
      ${plan.name ? `<p style="font-weight:800;font-size:1.1rem;margin-bottom:0.35rem">${escapeHtml(plan.name)}</p>` : ''}
      ${plan.description ? `<p style="opacity:0.55;font-size:0.82rem;margin-bottom:0.75rem">${escapeHtml(plan.description)}</p>` : ''}
      ${plan.price || plan.period ? `<p class="pricing-price">${escapeHtml(plan.price)}${plan.period ? `<span style="font-size:0.95rem;font-weight:600;opacity:0.65">${escapeHtml(plan.period)}</span>` : ''}</p>` : ''}
      ${features.length ? `<ul class="pricing-features">${features.map(f => `<li><span style="color:var(--primary);font-weight:800">✓</span>${escapeHtml(f)}</li>`).join('')}</ul>` : ''}
      ${plan.ctaText?.trim() ? (plan.ctaLink?.trim()
        ? `<a class="pricing-cta${plan.featured ? ' featured' : ''}" href="${escapeHtml(plan.ctaLink)}">${escapeHtml(plan.ctaText)}</a>`
        : `<button type="button" class="pricing-cta${plan.featured ? ' featured' : ''}">${escapeHtml(plan.ctaText)}</button>`) : ''}
    </div>`;
  }).join('');
  return shell(section.id, `${sectionHeader(title, subtitle, true, 'Pricing')}<div class="grid-auto">${cards}</div>`, section, portfolio, alt);
}

function renderFAQ(section: PortfolioSection, portfolio: Portfolio, title: string, alt: boolean): string {
  const items = getFAQItemsFromSection(section).filter(f => f.question?.trim());
  const subtitle = fv(section, 'subtitle') || 'Common questions answered';
  const acc = items.map((item, i) =>
    `<div class="faq-item" data-faq="${i}"><button type="button" class="faq-q" aria-expanded="false">
      <span>${escapeHtml(item.question)}</span><span class="faq-toggle">+</span>
    </button><div class="faq-a">${escapeHtml(item.answer || '')}</div></div>`
  ).join('');
  return shell(section.id, `<div style="max-width:800px;margin:0 auto">${sectionHeader(title, subtitle, true, 'FAQ')}<div>${acc}</div></div>`, section, portfolio, alt);
}

function renderCustom(section: PortfolioSection, portfolio: Portfolio, title: string, alt: boolean): string {
  const content = fv(section, 'content');
  const subtitle = fv(section, 'subtitle');
  const known = new Set(['title', 'content', 'subtitle']);
  const custom = section.fields.filter(f => !known.has(f.id)).map(renderDynamicField).join('');
  return shell(section.id, `<div style="padding:3rem 2.5rem;border-radius:var(--radius);background:linear-gradient(135deg,color-mix(in srgb,var(--primary) 6%,transparent),color-mix(in srgb,var(--secondary) 4%,transparent));border:1px solid color-mix(in srgb,var(--primary) 13%,transparent)">
    ${sectionHeader(title, subtitle, false, 'Custom')}
    ${content ? `<p style="opacity:0.82;line-height:1.9;font-size:1.05rem;white-space:pre-wrap;max-width:760px">${escapeHtml(content)}</p>` : ''}
    ${custom ? `<div class="grid-auto" style="margin-top:2rem">${custom}</div>` : ''}
  </div>`, section, portfolio, alt);
}

function renderContact(section: PortfolioSection, portfolio: Portfolio, title: string, alt: boolean, social: SocialLinks): string {
  const subtitle = fv(section, 'subtitle');
  const intro = fv(section, 'message');
  const responseTime = fv(section, 'responseTime');
  const infoIds = ['email', 'phone', 'location', 'address', 'hours'] as const;
  const icons: Record<string, string> = { email: '📧', phone: '📞', location: '📍', address: '🏢', hours: '🕐' };
  const infoItems = infoIds.map(id => {
    const val = fv(section, id);
    if (!val) return '';
    const label = section.fields.find(f => f.id === id)?.label || id;
    let href = id === 'email' ? `mailto:${val}` : id === 'phone' ? `tel:${val.replace(/\s/g, '')}` : '';
    const tag = href ? 'a' : 'div';
    return `<${tag} class="info-card"${href ? ` href="${escapeHtml(href)}"` : ''}>
      <div class="info-icon">${icons[id]}</div><div><p style="font-size:0.72rem;opacity:0.45;text-transform:uppercase;margin-bottom:2px">${escapeHtml(label)}</p>
      <p style="font-size:0.9rem;opacity:0.9;font-weight:500">${escapeHtml(val)}</p></div></${tag}>`;
  }).join('');

  const contactLayout = fv(section, 'contactLayout') || 'split';
  const contactClass = contactLayout === 'centered' ? ' contact-centered' : contactLayout === 'minimal' ? ' contact-minimal' : '';
  const known = new Set(['contactLayout', 'title', 'subtitle', 'message', 'email', 'phone', 'location', 'address', 'hours', 'responseTime']);
  const custom = section.fields.filter(f => !known.has(f.id)).map(renderDynamicField).join('');
  const email = fv(section, 'email');
  return shell(section.id, `${sectionHeader(title, subtitle, true)}
    <div class="contact-grid${contactClass}">
      ${contactLayout !== 'minimal' ? `<div style="display:flex;flex-direction:column;gap:1.25rem">
        ${intro ? `<div class="contact-intro"><p style="opacity:0.82;line-height:1.85;white-space:pre-wrap">${escapeHtml(intro)}</p></div>` : ''}
        ${responseTime ? `<div style="display:inline-flex;align-items:center;gap:0.6rem;padding:0.55rem 1.1rem;border-radius:999px;background:color-mix(in srgb,var(--primary) 10%,transparent);border:1px solid color-mix(in srgb,var(--primary) 20%,transparent);font-size:0.82rem;font-weight:600;color:var(--primary)">⚡ ${escapeHtml(responseTime)}</div>` : ''}
        ${infoItems ? `<div style="display:flex;flex-direction:column;gap:0.65rem">${infoItems}</div>` : ''}
        ${Object.values(social).some(Boolean) ? `<div style="padding:1.25rem;border-radius:var(--radius);background:color-mix(in srgb,var(--primary) 4%,transparent);border:1px solid color-mix(in srgb,var(--primary) 8%,transparent)"><p class="field-label">Connect on social</p>${socialBar(social)}</div>` : ''}
      </div>` : ''}
      <div class="contact-form-wrap">
        <div class="contact-form-glow"></div>
        <div class="contact-form">
          <div style="display:flex;align-items:center;gap:0.85rem;margin-bottom:1.75rem">
            <div style="width:44px;height:44px;border-radius:var(--radius);background:color-mix(in srgb,var(--primary) 10%,transparent);display:flex;align-items:center;justify-content:center;font-size:1.25rem">✉️</div>
            <div><p style="font-weight:700;font-size:1.1rem">Send a Message</p><p style="opacity:0.5;font-size:0.82rem;margin-top:2px">Fill in the form below</p></div>
          </div>
          <form id="contact-form" data-mailto="${escapeHtml(email)}">
            <div class="form-row">
              <div class="form-group"><label class="form-label">Your Name</label><input class="form-input" name="name" required placeholder="John Doe"></div>
              <div class="form-group"><label class="form-label">Your Email</label><input class="form-input" type="email" name="email" required placeholder="you@email.com"></div>
            </div>
            <div class="form-group"><label class="form-label">Subject (optional)</label><input class="form-input" name="subject" placeholder="Project inquiry"></div>
            <div class="form-group"><label class="form-label">Your Message</label><textarea class="form-input" name="message" rows="5" required placeholder="Tell me about your project…" style="resize:vertical;min-height:130px"></textarea></div>
            <button type="submit" class="form-submit">Send Message →</button>
          </form>
        </div>
      </div>
    </div>
    ${custom ? `<div class="grid-auto" style="margin-top:2.5rem;max-width:1040px;margin-left:auto;margin-right:auto;padding:1.75rem;border-radius:var(--radius);background:color-mix(in srgb,var(--primary) 3%,transparent)">${custom}</div>` : ''}
  `, section, portfolio, alt);
}

export function renderSection(section: PortfolioSection, index: number, portfolio: Portfolio): string {
  const alt = index % 2 !== 0;
  const title = fv(section, 'title') || section.title;
  const social = portfolio.social || {};

  switch (section.type) {
    case 'hero': return renderHero(section, portfolio, social);
    case 'about': return renderAbout(section, portfolio, alt);
    case 'skills': return renderSkills(section, portfolio, title, alt);
    case 'experience': return renderExperience(section, portfolio, title, alt);
    case 'projects': return renderProjects(section, portfolio, title, alt);
    case 'services': return renderServices(section, portfolio, title, alt);
    case 'blog': return renderBlog(section, portfolio, title, alt);
    case 'gallery': return renderGallery(section, portfolio, title, alt);
    case 'videos': return renderVideos(section, portfolio, title, alt);
    case 'social': return renderSocial(section, portfolio, title);
    case 'testimonials': return renderTestimonials(section, portfolio, title, alt);
    case 'stats': return renderStats(section, portfolio, title);
    case 'team': return renderTeam(section, portfolio, title, alt);
    case 'pricing': return renderPricing(section, portfolio, title, alt);
    case 'faq': return renderFAQ(section, portfolio, title, alt);
    case 'custom': return renderCustom(section, portfolio, title, alt);
    case 'contact': return renderContact(section, portfolio, title, alt, social);
    default: {
      const fields = section.fields.filter(f => f.id !== 'title' && f.type !== 'select');
      return shell(section.id, `${sectionHeader(title, fv(section, 'subtitle'), false)}<div class="grid-auto">${fields.map(renderDynamicField).join('')}</div>`, section, portfolio, alt);
    }
  }
}
