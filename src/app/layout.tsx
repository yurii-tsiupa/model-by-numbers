import type { Metadata } from 'next';

import '@fontsource/unbounded/500.css';
import '@fontsource/unbounded/600.css';
import '@fontsource/unbounded/700.css';
import '@fontsource-variable/inter';
import '@fontsource/jetbrains-mono/400.css';
import '@fontsource/jetbrains-mono/500.css';

import { I18nProvider } from '@/features/i18n/context/I18nProvider';
import { AppFooter } from '@/components/layout/AppFooter';
import { BackToTopButton } from '@/components/layout/BackToTopButton';
import { AuthProvider } from '@/providers/AuthProvider';
import { QueryProvider } from '@/providers/QueryProvider';
import { ThemeProvider } from '@/providers/ThemeProvider';

import './globals.css';

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
      <body>
        <ThemeProvider
          attribute="data-theme"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            <I18nProvider>
              <AuthProvider>
                <div className="flex min-h-dvh flex-col bg-[var(--bg)] text-[var(--text)]">
                  <div className="flex min-h-0 flex-1 flex-col">{children}</div>
                  <AppFooter />
                  <BackToTopButton />
                </div>
              </AuthProvider>
            </I18nProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
