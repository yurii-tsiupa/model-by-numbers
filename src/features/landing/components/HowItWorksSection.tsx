'use client';

import { Container } from '@/components/ui/Container';
import { useTranslation } from '@/features/i18n/hooks/useTranslation';
import { MediaPlaceholder } from './MediaPlaceholder';

const stepMedia = [
  '/landing-placeholders/step-upload-model.svg',
  '/landing-placeholders/step-mark-colors.svg',
  '/landing-placeholders/step-export-guide.svg',
] as const;

export function HowItWorksSection() {
  const { t } = useTranslation();
  const steps = ([1, 2, 3] as const).map((number, index) => ({
    number: String(number).padStart(2, '0'),
    label: t(`landing.workflow.steps.${number}.label`),
    title: t(`landing.workflow.steps.${number}.title`),
    description: t(`landing.workflow.steps.${number}.description`),
    mediaSrc: stepMedia[index],
    mediaLabel: t(`landing.media.workflow.${number}`),
  }));

  return (
    <section
      id="how-it-works"
      className="border-t border-[var(--border)] py-20 sm:py-24 lg:py-28 xl:py-32"
    >
      <Container>
        <div className="grid gap-8 lg:grid-cols-2 lg:items-end lg:gap-16 xl:gap-24">
          <div>
            <span className="font-[var(--font-mono)] text-xs font-semibold tracking-[0.1em] text-[var(--accent)]">
              {t('landing.workflow.eyebrow')}
            </span>
            <h2 className="mt-4 max-w-[820px] text-[clamp(38px,5vw,64px)] font-semibold leading-[1.02] tracking-[-0.045em]">
              {t('landing.workflow.title')}
            </h2>
          </div>
          <p className="max-w-[760px] text-base leading-[1.7] text-[var(--text-secondary)] sm:text-[18px]">
            {t('landing.workflow.description')}
          </p>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-3 lg:mt-16">
          {steps.map((step) => (
            <article
              key={step.number}
              className="group relative min-w-0 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 sm:p-6 lg:p-8"
            >
              <div className="flex items-center justify-between gap-4">
                <span className="font-[var(--font-mono)] text-[11px] font-semibold tracking-[0.08em] text-[var(--text-secondary)]">
                  {t('landing.common.step', { number: step.number })}
                </span>
                <span className="font-[var(--font-mono)] text-[10px] font-semibold tracking-[0.08em] text-[var(--accent)]">
                  {step.label}
                </span>
              </div>

              <MediaPlaceholder
                label={step.mediaLabel}
                src={step.mediaSrc}
                aspectRatio="5 / 3"
                className="mt-8"
              />

              <h3 className="mt-8 text-2xl font-semibold tracking-[-0.025em]">
                {step.title}
              </h3>
              <p className="mt-3 max-w-[460px] text-sm leading-[1.7] text-[var(--text-secondary)] sm:text-[15px]">
                {step.description}
              </p>
              <div className="pointer-events-none absolute bottom-0 left-0 h-1 w-0 bg-[var(--accent)] transition-all duration-300 group-hover:w-full" />
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
