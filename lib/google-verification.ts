/**
 * Google Search Console ownership verification.
 *
 * HTML file: place the exact file from GSC in public/ (e.g. public/googleXXXX.html).
 *
 * Meta tag (URL prefix property):
 *   GOOGLE_SITE_VERIFICATION=your_meta_tag_token
 */

export function getGoogleVerificationMetaToken(): string | null {
  const token = process.env.GOOGLE_SITE_VERIFICATION?.trim();
  if (token) return token;
  return 'FLrh1qR22UNnkwYLDdv_gBPzFyr0o53LDqrJS';
}

/** TXT record value for Hostinger DNS (domain property verification) */
export const GSC_DNS_TXT_VALUE =
  'google-site-verification=FLrh1qR22UNnkwYLDdv_gBPzFyr0o53LDqrJS';
