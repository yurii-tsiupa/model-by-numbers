'use client';

import { Container } from '@/components/ui/Container';
import { useTranslation } from '@/features/i18n/hooks/useTranslation';
import { MediaPlaceholder } from './MediaPlaceholder';

export function GuidePreviewSection() {
  const { t } = useTranslation();
  const benefits = ([1, 2, 3] as const).map((number) => ({
    number: String(number).padStart(2, '0'),
    title: t(`landing.guidePreview.benefits.${number}.title`),
    description: t(`landing.guidePreview.benefits.${number}.description`),
  }));

  return (
    <section
      id="guide-preview"
      className="border-t border-[var(--border)] py-20 sm:py-28 lg:py-[120px]"
    >
      <Container>
        <div className="mb-14 grid items-end gap-6 lg:grid-cols-2 lg:gap-16 xl:gap-24">
          <div>
            <span className="block font-[var(--font-mono)] text-xs font-semibold tracking-[0.1em] text-[var(--accent)]">
              {t('landing.guidePreview.eyebrow')}
            </span>

            <h2 className="mt-3.5 max-w-[700px] text-[clamp(38px,5vw,58px)] font-semibold leading-[1.05] tracking-[-0.04em]">
              {t('landing.guidePreview.title')}
            </h2>
          </div>

          <p className="m-0 max-w-[650px] text-[17px] leading-[1.65] text-[var(--text-secondary)]">
            {t('landing.guidePreview.description')}
          </p>
        </div>

        <div className="grid items-start gap-12 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)] xl:gap-16">
          <div className="mx-auto w-full max-w-[760px]">
            <MediaPlaceholder
              label={t('landing.media.pdfGuide')}
              src="/landing-placeholders/pdf-guide-preview.svg"
              aspectRatio="210 / 297"
              className="shadow-[0_24px_60px_var(--shadow)]"
            />
          </div>

          <aside className="pt-5 lg:sticky lg:top-[110px]">
            <span className="block font-[var(--font-mono)] text-xs font-semibold tracking-[0.1em] text-[var(--accent)]">
              {t('landing.guidePreview.benefitsEyebrow')}
            </span>

            <h3 className="mt-4 max-w-[420px] text-[32px] font-semibold leading-[1.1] tracking-[-0.03em]">
              {t('landing.guidePreview.benefitsTitle')}
            </h3>

            <div className="mt-8">
              {benefits.map((benefit) => (
                <div
                  key={benefit.number}
                  className="grid grid-cols-[38px_minmax(0,1fr)] gap-4 border-t border-[var(--border)] py-6 last:border-b"
                >
                  <span className="font-[var(--font-mono)] text-[11px] font-semibold text-[var(--accent)]">
                    {benefit.number}
                  </span>

                  <div>
                    <h4 className="text-base font-semibold">
                      {benefit.title}
                    </h4>
                    <p className="mt-2 text-sm leading-[1.6] text-[var(--text-secondary)]">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </Container>
    </section>
  );
}
