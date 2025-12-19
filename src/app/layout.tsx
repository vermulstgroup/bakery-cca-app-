import type { Metadata, Viewport } from 'next';
import { ThemeProvider } from '@/components/theme-provider';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { TranslationProvider } from '@/providers/translation-provider';

const APP_NAME = "Bakery CCA";
const APP_DESCRIPTION = "Bakery management for Child Care Africa Uganda";

export const metadata: Metadata = {
  applicationName: APP_NAME,
  title: APP_NAME,
  description: APP_DESCRIPTION,
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: APP_NAME,
  },
};

export const viewport: Viewport = {
  themeColor: '#F59E0B',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;700&family=DM+Mono:wght@400;500;700&display=swap" rel="stylesheet" />
        <link rel="icon" href="/icons/bread-icon.svg" type="image/svg+xml" />
      </head>
      <body className="font-body antialiased min-h-svh">
        <TranslationProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            forcedTheme="dark"
            disableTransitionOnChange
          >
            {children}
            <Toaster />
          </ThemeProvider>
        </TranslationProvider>
      </body>
    </html>
  );
}
