import JSZip from 'jszip';
import { Portfolio, ExportFormat } from './types';

function generateHTML(portfolio: Portfolio): string {
  const { theme, sections, seo } = portfolio;
  const visibleSections = sections.filter(s => s.visible).sort((a, b) => a.order - b.order);

  const sectionHTML = visibleSections.map(section => {
    const fields = section.fields.map(f => {
      if (Array.isArray(f.value)) {
        return `<ul class="field-list">${(f.value as string[]).map(v => `<li>${v}</li>`).join('')}</ul>`;
      }
      return `<p class="field-value">${f.value}</p>`;
    }).join('\n');
    return `
  <section id="${section.type}" class="section section-${section.type}">
    <div class="container">
      <h2 class="section-title">${section.title}</h2>
      ${fields}
    </div>
  </section>`;
  }).join('\n');

  return `<!DOCTYPE html>
<html lang="${portfolio.language}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${seo.title || portfolio.name}</title>
  <meta name="description" content="${seo.description}" />
  <meta name="keywords" content="${seo.keywords}" />
  <meta property="og:title" content="${seo.title}" />
  <meta property="og:description" content="${seo.description}" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=${theme.fontFamily.replace(' ', '+')}:wght@400;600;700&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="styles.css" />
</head>
<body>
  <nav class="navbar">
    <div class="container">
      <span class="nav-brand">${portfolio.name}</span>
      <ul class="nav-links">
        ${visibleSections.map(s => `<li><a href="#${s.type}">${s.title}</a></li>`).join('')}
      </ul>
    </div>
  </nav>
  <main>${sectionHTML}</main>
  <footer class="footer">
    <div class="container">
      <p>&copy; ${new Date().getFullYear()} ${portfolio.name}. All rights reserved.</p>
    </div>
  </footer>
  <script src="script.js"></script>
</body>
</html>`;
}

function generateCSS(portfolio: Portfolio): string {
  const { theme } = portfolio;
  const radii: Record<string, string> = { none: '0', sm: '4px', md: '8px', lg: '16px', full: '9999px' };
  const spacing: Record<string, string> = { compact: '3rem', normal: '5rem', relaxed: '8rem' };
  return `
:root {
  --primary: ${theme.primaryColor};
  --secondary: ${theme.secondaryColor};
  --accent: ${theme.accentColor};
  --bg: ${theme.backgroundColor};
  --text: ${theme.textColor};
  --radius: ${radii[theme.borderRadius]};
  --section-padding: ${spacing[theme.spacing]};
  --font: '${theme.fontFamily}', sans-serif;
}
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: var(--font); background: var(--bg); color: var(--text); line-height: 1.6; }
.container { max-width: 1200px; margin: 0 auto; padding: 0 1.5rem; }
.navbar { position: sticky; top: 0; background: var(--bg); border-bottom: 1px solid rgba(255,255,255,0.1); padding: 1rem 0; z-index: 100; }
.navbar .container { display: flex; justify-content: space-between; align-items: center; }
.nav-brand { font-size: 1.25rem; font-weight: 700; color: var(--primary); }
.nav-links { list-style: none; display: flex; gap: 2rem; }
.nav-links a { color: var(--text); text-decoration: none; opacity: 0.8; transition: opacity 0.2s; }
.nav-links a:hover { opacity: 1; color: var(--primary); }
.section { padding: var(--section-padding) 0; }
.section-title { font-size: 2rem; font-weight: 700; margin-bottom: 2rem; color: var(--primary); }
.field-value { margin-bottom: 1rem; opacity: 0.9; }
.field-list { padding-left: 1.5rem; }
.field-list li { margin-bottom: 0.5rem; }
.footer { padding: 2rem 0; border-top: 1px solid rgba(255,255,255,0.1); text-align: center; opacity: 0.6; }
@media (max-width: 768px) {
  .nav-links { display: none; }
  .section-title { font-size: 1.5rem; }
}`;
}

function generateJS(): string {
  return `
// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    const target = document.querySelector(a.getAttribute('href'));
    if (target) target.scrollIntoView({ behavior: 'smooth' });
  });
});

// Intersection observer for fade-in
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.section').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(20px)';
  el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  observer.observe(el);
});`;
}

export async function exportPortfolio(portfolio: Portfolio, format: ExportFormat): Promise<Blob> {
  const zip = new JSZip();

  if (format === 'html') {
    zip.file('index.html', generateHTML(portfolio));
    zip.file('styles.css', generateCSS(portfolio));
    zip.file('script.js', generateJS());
    zip.file('README.md', `# ${portfolio.name}\n\nOpen index.html in your browser to view your portfolio.`);
  } else if (format === 'react') {
    const appContent = generateReactApp(portfolio);
    zip.file('src/App.jsx', appContent.app);
    zip.file('src/styles.css', generateCSS(portfolio));
    zip.file('src/main.jsx', `import React from 'react';\nimport ReactDOM from 'react-dom/client';\nimport App from './App';\nimport './styles.css';\nReactDOM.createRoot(document.getElementById('root')).render(<App />);`);
    zip.file('index.html', `<!DOCTYPE html><html><head><meta charset="UTF-8"/><title>${portfolio.seo.title}</title></head><body><div id="root"></div><script type="module" src="/src/main.jsx"></script></body></html>`);
    zip.file('package.json', JSON.stringify({ name: portfolio.name.toLowerCase().replace(/\s/g, '-'), version: '1.0.0', scripts: { dev: 'vite', build: 'vite build' }, dependencies: { react: '^18.0.0', 'react-dom': '^18.0.0' }, devDependencies: { vite: '^5.0.0', '@vitejs/plugin-react': '^4.0.0' } }, null, 2));
    zip.file('README.md', `# ${portfolio.name}\n\nRun \`npm install && npm run dev\` to start.`);
  } else {
    // Next.js
    const nextContent = generateNextApp(portfolio);
    zip.file('app/page.tsx', nextContent.page);
    zip.file('app/layout.tsx', nextContent.layout);
    zip.file('app/globals.css', generateCSS(portfolio));
    zip.file('package.json', JSON.stringify({ name: portfolio.name.toLowerCase().replace(/\s/g, '-'), version: '1.0.0', scripts: { dev: 'next dev', build: 'next build', start: 'next start' }, dependencies: { next: '^15.0.0', react: '^18.0.0', 'react-dom': '^18.0.0' }, devDependencies: { typescript: '^5.0.0', '@types/react': '^18.0.0', '@types/node': '^20.0.0' } }, null, 2));
    zip.file('next.config.ts', `import type { NextConfig } from 'next';\nconst config: NextConfig = {};\nexport default config;`);
    zip.file('README.md', `# ${portfolio.name}\n\nRun \`npm install && npm run dev\` to start.`);
  }

  return zip.generateAsync({ type: 'blob' });
}

function generateReactApp(portfolio: Portfolio) {
  const sections = portfolio.sections.filter(s => s.visible).sort((a, b) => a.order - b.order);
  const app = `import React from 'react';

export default function App() {
  return (
    <div className="portfolio">
      <nav className="navbar">
        <div className="container">
          <span className="nav-brand">${portfolio.name}</span>
        </div>
      </nav>
      <main>
        ${sections.map(s => `<section id="${s.type}" className="section section-${s.type}">
          <div className="container">
            <h2 className="section-title">${s.title}</h2>
            ${s.fields.map(f => Array.isArray(f.value)
              ? `<ul className="field-list">${(f.value as string[]).map(v => `<li>${v}</li>`).join('')}</ul>`
              : `<p className="field-value">${f.value}</p>`
            ).join('\n            ')}
          </div>
        </section>`).join('\n        ')}
      </main>
      <footer className="footer"><div className="container"><p>&copy; ${new Date().getFullYear()} ${portfolio.name}</p></div></footer>
    </div>
  );
}`;
  return { app };
}

function generateNextApp(portfolio: Portfolio) {
  const sections = portfolio.sections.filter(s => s.visible).sort((a, b) => a.order - b.order);
  const page = `export default function Home() {
  return (
    <main>
      ${sections.map(s => `<section id="${s.type}" className="section section-${s.type}">
        <div className="container">
          <h2 className="section-title">${s.title}</h2>
          ${s.fields.map(f => Array.isArray(f.value)
            ? `<ul className="field-list">${(f.value as string[]).map(v => `<li>${v}</li>`).join('')}</ul>`
            : `<p className="field-value">${f.value}</p>`
          ).join('\n          ')}
        </div>
      </section>`).join('\n      ')}
    </main>
  );
}`;
  const layout = `import './globals.css';
export const metadata = { title: '${portfolio.seo.title}', description: '${portfolio.seo.description}' };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="${portfolio.language}"><body>{children}</body></html>;
}`;
  return { page, layout };
}
