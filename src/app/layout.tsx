import type { Metadata } from 'next';
import {
  Inter,
  JetBrains_Mono,
  Space_Grotesk,
} from 'next/font/google';

import { I18nProvider } from '@/features/i18n/context/I18nProvider';
import { AuthProvider } from '@/providers/AuthProvider';
import { QueryProvider } from '@/providers/QueryProvider';
import { ThemeProvider } from '@/providers/ThemeProvider';

import './globals.css';

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-body',
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Model by Numbers',
  description:
    'Create professional painting guides for physical 3D models.',
};

type RootLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

export default function RootLayout({
  children,
}: RootLayoutProps) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
    >
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} ${jetBrainsMono.variable}`}
      >
        <ThemeProvider
          attribute="data-theme"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            <I18nProvider>
              <AuthProvider>{children}</AuthProvider>
            </I18nProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}