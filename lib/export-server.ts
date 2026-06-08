import JSZip from 'jszip';
import { Portfolio } from './types';
import { AssetBundler } from './export-assets';
import { generateExportCSS } from './export-css';
import { generateExportHTML } from './export-html';
import { generateExportJS } from './export-js';

/** Build a static HTML zip buffer for Hostinger deploy (index.html at root). */
export async function buildStaticSiteZip(portfolio: Portfolio): Promise<Buffer> {
  const bundler = new AssetBundler();
  const processed = await bundler.processPortfolio(structuredClone(portfolio));
  const zip = new JSZip();
  zip.file('index.html', generateExportHTML(processed));
  zip.file('styles.css', generateExportCSS(processed));
  zip.file('script.js', generateExportJS(processed));
  bundler.files.forEach((bytes, path) => zip.file(path, bytes));
  return zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE', compressionOptions: { level: 6 } });
}
