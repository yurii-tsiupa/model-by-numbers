'use client';

import Link from 'next/link';

import { Container } from '@/components/ui/Container';
import { MediaPlaceholder } from './MediaPlaceholder';

import { useTranslation } from '@/features/i18n/hooks/useTranslation';

export function HeroSection() {
  const { t } = useTranslation();
  const heroMediaType: 'image' | 'video' = 'image';
  return (
    <section className="overflow-hidden py-14 sm:py-20 lg:flex lg:min-h-[calc(100vh-72px)] lg:items-center lg:py-24">
      <Container>
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16 xl:gap-24">
          <div className="max-w-[820px]">
            <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--card)] px-3 py-2 font-[var(--font-mono)] text-xs font-medium text-[var(--text-secondary)]">
              <span
                className="size-2 rounded-full bg-[var(--accent-2)]"
                aria-hidden="true"
              />

              {t('landing.hero.eyebrow')}
            </div>

            <h1 className="m-0 max-w-[900px] text-[clamp(42px,6vw,82px)] font-semibold leading-[0.96] tracking-[-0.055em]">
              {t('landing.hero.title')}
            </h1>

            <p className="mt-7 max-w-[700px] text-[17px] leading-[1.65] text-[var(--text-secondary)] sm:text-[19px]">
              {t('landing.hero.description')}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link
                href="/register"
                className="inline-flex min-h-[52px] items-center justify-center rounded-[10px] bg-[var(--accent)] px-6 text-[15px] font-medium text-[var(--accent-foreground)] transition-opacity hover:opacity-90"
              >
                {t('landing.hero.primaryCta')}
              </Link>

              <a
                href="#guide-preview"
                className="inline-flex min-h-[52px] items-center justify-center rounded-[10px] border border-[var(--border)] bg-[var(--card)] px-6 text-[15px] font-medium transition-colors hover:border-[var(--accent)]"
              >
                {t('landing.hero.secondaryCta')}
              </a>
            </div>

            <p className="mt-4 text-[13px] text-[var(--text-secondary)]">
              {t('landing.hero.note')}
            </p>
            <a href="#feedback" className="mt-5 inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-[var(--accent-2)] hover:opacity-80">
              {t('landing.hero.feedbackCta')} <span aria-hidden="true">↓</span>
            </a>
          </div>

          <div
            className="flex min-w-0 items-center justify-center"
          >
            <MediaPlaceholder
              label={t('landing.media.hero')}
              mediaType={heroMediaType}
              src={
                heroMediaType === 'image'
                  ? '/landing-placeholders/hero-product-preview.svg'
                  : undefined
              }
              aspectRatio="16 / 9"
              className="max-w-[720px] shadow-[0_22px_60px_var(--shadow)]"
            />
          </div>
        </div>
      </Container>
    </section>
  );
}
