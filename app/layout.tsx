import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { APP_NAME, APP_DESCRIPTION, LOGO_SRC } from '@/lib/brand';
import MaintenanceGate from '@/components/MaintenanceGate';
import SiteAnalyticsTracker from '@/components/SiteAnalyticsTracker';
import PromoModalProvider from '@/components/PromoModalProvider';
import { ThemeProvider } from '@/components/theme/ThemeProvider';
import { getThemeInitScript } from '@/lib/app-theme';

const inter = Inter({ subsets: ['latin'] });

const themeInitScript = getThemeInitScript();

export const metadata: Metadata = {
  title: `${APP_NAME} — Build & Launch Your Website`,
  description: APP_DESCRIPTION,
  icons: {
    icon: LOGO_SRC,
    apple: LOGO_SRC,
  },
};

/** Phone & tablet: real responsive layout (desktop unchanged at lg+ breakpoints). */
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning data-theme="dark">
      <head>
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
