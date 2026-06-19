import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { LOGO_SRC } from '@/lib/brand';
import { buildDefaultSiteMetadata } from '@/lib/site-seo';
import { getGoogleVerificationMetaToken } from '@/lib/google-verification';
import MaintenanceGate from '@/components/MaintenanceGate';
import SiteAnalyticsTracker from '@/components/SiteAnalyticsTracker';
import PromoModalProvider from '@/components/PromoModalProvider';
import { ThemeProvider } from '@/components/theme/ThemeProvider';
import { getThemeInitScript } from '@/lib/app-theme';

const inter = Inter({ subsets: ['latin'] });

const themeInitScript = getThemeInitScript();

export const metadata: Metadata = buildDefaultSiteMetadata();

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" suppressHydrationWarning data-theme="dark">
      <head>
        <link rel="icon" href={LOGO_SRC} />
        <link rel="apple-touch-icon" href={LOGO_SRC} />
        <meta name="theme-color" content="#0a1d37" />
        {getGoogleVerificationMetaToken() ? (
          <meta name="google-site-verification" content={getGoogleVerificationMetaToken()!} />
        ) : null}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className={inter.className}>
        <ThemeProvider>
          <MaintenanceGate>
            <SiteAnalyticsTracker />
            <PromoModalProvider />
            {children}
          </MaintenanceGate>
        </ThemeProvider>
      </body>
    </html>
  );
}
