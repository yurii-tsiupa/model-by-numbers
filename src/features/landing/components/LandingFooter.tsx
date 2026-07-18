'use client';

import Link from 'next/link';

import { Container } from '@/components/ui/Container';

import { useTranslation } from '@/features/i18n/hooks/useTranslation';

export function LandingFooter() {
  const { t } = useTranslation();
  const navigation=[{label:t('landing.footer.guidePreview'),href:'#guide-preview'},{label:t('landing.footer.howItWorks'),href:'#how-it-works'},{label:t('landing.footer.features'),href:'#features'}];
  return (
    <footer className="border-t border-[var(--border)] py-8 sm:py-10">
      <Container>
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-[420px]">
            <Link
              href="/"
              className="inline-flex items-center gap-3 text-lg font-semibold tracking-[-0.02em]"
              aria-label={t('landing.accessibility.home')}
            >
              <LogoMark />
              <span>Model by Numbers</span>
            </Link>

            <p className="mt-4 text-sm leading-6 text-[var(--text-secondary)]">
              {t('landing.footer.description')}
            </p>
          </div>

          <nav
            className="flex flex-col gap-3 text-sm sm:flex-row sm:flex-wrap sm:gap-x-7"
            aria-label={t('landing.accessibility.footerNavigation')}
          >
            {navigation.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-[var(--text-secondary)] transition-colors hover:text-[var(--text)]"
              >
                {item.label}
              </a>
            ))}

            <Link
              href="/login"
              className="font-medium text-[var(--text)] transition-colors hover:text-[var(--accent)]"
            >
              {t('header.login')}
            </Link>
          </nav>
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-[var(--border)] pt-6 text-xs text-[var(--text-secondary)] sm:flex-row sm:items-center sm:justify-between">
          <p>{t('landing.footer.copyright',{year:new Date().getFullYear()})}</p>

          <p className="font-[var(--font-mono)] tracking-[0.06em]">
            {t('landing.footer.tagline')}
          </p>
        </div>
      </Container>
    </footer>
  );
}

function LogoMark() {
  return (
    <span
      className="relative block h-9 w-9"
      aria-hidden="true"
    >
      <span className="absolute left-0 top-0 h-6 w-7 rounded-[8px] border border-[var(--accent)] bg-[var(--card)]" />
      <span className="absolute bottom-0 right-0 h-6 w-7 rounded-[8px] bg-[var(--accent)]" />
    </span>
  );
}
