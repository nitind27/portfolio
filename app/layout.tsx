import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { APP_NAME, LOGO_SRC, DESKTOP_VIEWPORT_WIDTH } from '@/lib/brand';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: `${APP_NAME} — Build & Launch Your Website`,
  description: 'Create professional websites, portfolios, and online stores. No code required.',
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
      <body className={inter.className}>{children}</body>
    </html>
  );
}
