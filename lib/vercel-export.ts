import { Portfolio } from './types';
import { AssetBundler } from './export-assets';
import { generateExportCSS } from './export-css';
import { generateExportHTML } from './export-html';
import { generateExportJS } from './export-js';
import { EXPORT_NEXT_VERSION, EXPORT_REACT_VERSION } from './export-versions';

export interface VercelDeployFile {
  file: string;
  data: string;
  encoding?: 'utf-8' | 'base64';
}

function slugName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 48) || 'site99-site';
}

function esc(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

export async function buildNextjsDeployFiles(portfolio: Portfolio): Promise<VercelDeployFile[]> {
  const bundler = new AssetBundler();
  const processed = await bundler.processPortfolio(structuredClone(portfolio));
  const css = generateExportCSS(processed);
  const html = generateExportHTML(processed);
  const js = generateExportJS(processed);
  const slug = slugName(processed.name);
  const title = esc(processed.seo.title || processed.name);
  const desc = esc(processed.seo.description || '');

  const files: VercelDeployFile[] = [
    {
      file: 'app/page.tsx',
      data: `export default function Home() {
  return (
    <iframe
      title="Portfolio"
      src="/preview.html"
      style={{ width: '100%', height: '100vh', border: 'none', margin: 0, padding: 0 }}
    />
  );
}`,
    },
    {
      file: 'app/layout.tsx',
      data: `import type { Metadata } from 'next';
export const metadata: Metadata = { title: '${title}', description: '${desc}' };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="${processed.language || 'en'}">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}`,
    },
    { file: 'public/preview.html', data: html },
    { file: 'public/styles.css', data: css },
    { file: 'public/script.js', data: js },
    {
      file: 'package.json',
      data: JSON.stringify({
        name: slug,
        version: '1.0.0',
        private: true,
        scripts: { dev: 'next dev', build: 'next build', start: 'next start' },
        dependencies: {
          next: EXPORT_NEXT_VERSION,
          react: EXPORT_REACT_VERSION,
          'react-dom': EXPORT_REACT_VERSION,
        },
        devDependencies: {
          typescript: '^5.0.0',
          '@types/react': '^19.0.0',
          '@types/node': '^20.0.0',
        },
      }, null, 2),
    },
    {
      file: 'next.config.ts',
      data: `import type { NextConfig } from 'next';
const config: NextConfig = {};
export default config;`,
    },
    {
      file: 'tsconfig.json',
      data: JSON.stringify({
        compilerOptions: {
          target: 'ES2017',
          lib: ['dom', 'dom.iterable', 'esnext'],
          allowJs: true,
          skipLibCheck: true,
          strict: true,
          noEmit: true,
          esModuleInterop: true,
          module: 'esnext',
          moduleResolution: 'bundler',
          resolveJsonModule: true,
          isolatedModules: true,
          jsx: 'preserve',
          incremental: true,
          plugins: [{ name: 'next' }],
          paths: { '@/*': ['./*'] },
        },
        include: ['next-env.d.ts', '**/*.ts', '**/*.tsx'],
        exclude: ['node_modules'],
      }, null, 2),
    },
    { file: 'next-env.d.ts', data: '/// <reference types="next" />\n/// <reference types="next/image-types/global" />\n' },
  ];

  bundler.files.forEach((bytes, path) => {
    files.push({
      file: `public/${path}`,
      data: Buffer.from(bytes).toString('base64'),
      encoding: 'base64',
    });
  });

  return files;
}

export async function buildStaticDeployFiles(portfolio: Portfolio): Promise<VercelDeployFile[]> {
  const bundler = new AssetBundler();
  const processed = await bundler.processPortfolio(structuredClone(portfolio));
  const files: VercelDeployFile[] = [
    { file: 'index.html', data: generateExportHTML(processed) },
    { file: 'styles.css', data: generateExportCSS(processed) },
    { file: 'script.js', data: generateExportJS(processed) },
  ];
  bundler.files.forEach((bytes, path) => {
    files.push({ file: path, data: Buffer.from(bytes).toString('base64'), encoding: 'base64' });
  });
  return files;
}

export function deployProjectName(portfolio: Portfolio): string {
  const idPart = portfolio.id.replace(/-/g, '').slice(0, 14);
  const label = slugName(portfolio.slug || portfolio.name).slice(0, 28);
  return `site99-${label}-${idPart}`.slice(0, 52);
}
