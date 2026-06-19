/**
 * Google Search Console ownership verification.
 *
 * HTML file method (recommended if you already chose it in GSC):
 *   GOOGLE_SITE_VERIFICATION_HTML=googleXXXXXXXXXXXXXXXX.html
 *   (exact filename from Search Console — serves at https://yoursite.com/googleXXX.html)
 *
 * Meta tag method (alternative — switch method in GSC):
 *   GOOGLE_SITE_VERIFICATION=your_meta_tag_token
 */

export function getGoogleVerificationHtmlFile(): string | null {
  const name = process.env.GOOGLE_SITE_VERIFICATION_HTML?.trim();
  if (!name || !/^google[a-z0-9]+\.html$/i.test(name)) return null;
  return name;
}

export function getGoogleVerificationMetaToken(): string | null {
  const token = process.env.GOOGLE_SITE_VERIFICATION?.trim();
  return token || null;
}

export function googleVerificationHtmlBody(filename: string): string {
  return `google-site-verification: ${filename}`;
}

/** Matches GSC HTML file paths like /googleabc123.html → filename */
export function parseGoogleVerificationPath(pathname: string): string | null {
  const match = pathname.match(/^\/(google[a-z0-9]+\.html)\/?$/i);
  return match ? match[1] : null;
}

/** True when pathname is the configured GSC HTML verification file (env override) */
export function isGoogleVerificationPath(pathname: string): boolean {
  const fromPath = parseGoogleVerificationPath(pathname);
  if (!fromPath) return false;
  const configured = getGoogleVerificationHtmlFile();
  if (configured) return pathname === `/${configured}` || pathname === `/${configured}/`;
  return true;
}
