import JSZip from 'jszip';
import { DESKTOP_VIEWPORT_CONTENT } from './brand';
import { Portfolio, ExportFormat } from './types';
import { AssetBundler } from './export-assets';
import { generateExportCSS } from './export-css';
import { generateExportHTML } from './export-html';
import { generateExportJS } from './export-js';

async function preparePortfolio(portfolio: Portfolio): Promise<{ portfolio: Portfolio; bundler: AssetBundler }> {
  const bundler = new AssetBundler();
  const processed = await bundler.processPortfolio(structuredClone(portfolio));
  return { portfolio: processed, bundler };
}

function addAssetsToZip(zip: JSZip, bundler: AssetBundler) {
  bundler.files.forEach((bytes, path) => {
    zip.file(path, bytes);
  });
}

export async function exportPortfolio(portfolio: Portfolio, format: ExportFormat): Promise<Blob> {
  const { portfolio: processed, bundler } = await preparePortfolio(portfolio);
  const zip = new JSZip();
  const css = generateExportCSS(processed);
  const html = generateExportHTML(processed);
  const js = generateExportJS(processed);
  const slug = processed.name.toLowerCase().replace(/\s+/g, '-');

  if (format === 'html') {
    zip.file('index.html', html);
    zip.file('styles.css', css);
    zip.file('script.js', js);
    addAssetsToZip(zip, bundler);
    zip.file('README.md', `# ${processed.name}\n\nOpen \`index.html\` in your browser to view your portfolio.\n\nAll images are in the \`assets/\` folder with correct relative paths.`);
  } else if (format === 'react') {
    zip.file('index.html', `<!DOCTYPE html>
<html lang="${processed.language || 'en'}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="${DESKTOP_VIEWPORT_CONTENT}">
  <title>${processed.seo.title || processed.name}</title>
  <link rel="stylesheet" href="/src/styles.css">
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.jsx"></script>
</body>
</html>`);
    zip.file('src/main.jsx', `import React from 'react';\nimport ReactDOM from 'react-dom/client';\nimport App from './App';\nimport './styles.css';\nReactDOM.createRoot(document.getElementById('root')).render(<App />);`);
    zip.file('src/App.jsx', `export default function App() {\n  return (\n    <iframe\n      title="Portfolio"\n      src="/preview.html"\n      style={{ width: '100%', height: '100vh', border: 'none' }}\n    />\n  );\n}`);
    zip.file('public/preview.html', html);
    zip.file('public/styles.css', css);
    zip.file('public/script.js', js);
    bundler.files.forEach((bytes, path) => {
      zip.file(`public/${path}`, bytes);
    });
    zip.file('vite.config.js', `import { defineConfig } from 'vite';\nimport react from '@vitejs/plugin-react';\nexport default defineConfig({ plugins: [react()] });`);
    zip.file('package.json', JSON.stringify({
      name: slug, version: '1.0.0',
      scripts: { dev: 'vite', build: 'vite build', preview: 'vite preview' },
      dependencies: { react: '^18.0.0', 'react-dom': '^18.0.0' },
      devDependencies: { vite: '^5.0.0', '@vitejs/plugin-react': '^4.0.0' },
    }, null, 2));
    zip.file('README.md', `# ${processed.name}\n\nRun \`npm install && npm run dev\` to start.\n\nPortfolio preview is served from \`public/preview.html\` with all assets included.`);
  } else {
    zip.file('app/page.tsx', `export default function Home() {\n  return (\n    <iframe\n      title="Portfolio"\n      src="/preview.html"\n      style={{ width: '100%', height: '100vh', border: 'none' }}\n    />\n  );\n}`);
    zip.file('app/layout.tsx', `import type { Metadata } from 'next';\nexport const metadata: Metadata = { title: '${(processed.seo.title || processed.name).replace(/'/g, "\\'")}', description: '${(processed.seo.description || '').replace(/'/g, "\\'")}' };\nexport default function RootLayout({ children }: { children: React.ReactNode }) {\n  return <html lang="${processed.language || 'en'}"><body>{children}</body></html>;\n}`);
    zip.file('public/preview.html', html);
    zip.file('public/styles.css', css);
    zip.file('public/script.js', js);
    bundler.files.forEach((bytes, path) => {
      zip.file(`public/${path}`, bytes);
    });
    zip.file('package.json', JSON.stringify({
      name: slug, version: '1.0.0',
      scripts: { dev: 'next dev', build: 'next build', start: 'next start' },
      dependencies: { next: '^15.0.0', react: '^18.0.0', 'react-dom': '^18.0.0' },
      devDependencies: { typescript: '^5.0.0', '@types/react': '^18.0.0', '@types/node': '^20.0.0' },
    }, null, 2));
    zip.file('next.config.ts', `import type { NextConfig } from 'next';\nconst config: NextConfig = {};\nexport default config;`);
    zip.file('README.md', `# ${processed.name}\n\nRun \`npm install && npm run dev\` to start.\n\nPortfolio preview is served from \`public/preview.html\` with all assets included.`);
  }

  return zip.generateAsync({ type: 'blob' });
}
