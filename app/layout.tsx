import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { APP_NAME, APP_DESCRIPTION, LOGO_SRC, DESKTOP_VIEWPORT_WIDTH } from '@/lib/brand';
import MaintenanceGate from '@/components/MaintenanceGate';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: `${APP_NAME} — Build & Launch Your Website`,
  description: APP_DESCRIPTION,
  icons: {
    icon: LOGO_SRC,
    apple: LOGO_SRC,
  },
};

/** Always render desktop layout; phone browsers zoom out to fit. */
export const viewport: Viewport = {
  width: DESKTOP_VIEWPORT_WIDTH,
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <MaintenanceGate>{children}</MaintenanceGate>
      </body>
    </html>
  );
}
