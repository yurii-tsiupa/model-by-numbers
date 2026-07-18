'use client';

import Link from 'next/link';

import { Container } from '@/components/ui/Container';

import { useTranslation } from '@/features/i18n/hooks/useTranslation';

const layerTransforms = [
  'translate-x-0 translate-y-0',
  'translate-x-1.5 translate-y-3 sm:translate-x-3 sm:translate-y-3.5',
  'translate-x-3 translate-y-6 sm:translate-x-6 sm:translate-y-7',
];

export function HeroSection() {
  const { t } = useTranslation();
  const guideLayers = ([1,2,3] as const).map((number) => ({ number: String(number).padStart(2,'0'), title: t(`landing.hero.layers.${number}.title`), description: t(`landing.hero.layers.${number}.description`) }));
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
                href="/login"
                className="inline-flex min-h-[52px] items-center justify-center rounded-[10px] bg-[var(--accent)] px-6 text-[15px] font-medium text-white transition-opacity hover:opacity-90"
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
          </div>

          <div
            className="flex min-h-[390px] min-w-0 items-center justify-center sm:min-h-[480px] lg:min-h-[520px]"
            aria-label={t('landing.accessibility.layeredGuide')}
          >
            <div className="relative h-[390px] w-full max-w-[520px] sm:h-[450px] lg:max-w-[560px] xl:max-w-[620px]">
              {guideLayers.map((layer, index) => (
                <article
                  key={layer.number}
                  className={`absolute inset-0 h-[350px] rounded-[20px] border border-[var(--border)] bg-[var(--card)] p-4 shadow-[0_18px_45px_rgb(24_18_33_/_0.08)] sm:h-[390px] sm:p-[18px] ${layerTransforms[index]}`}
                  style={{
                    zIndex: guideLayers.length - index,
                  }}
                >
                  <div className="mb-3.5 flex items-center justify-between">
                    <span className="font-[var(--font-mono)] text-[11px] tracking-[0.08em] text-[var(--text-secondary)]">
                      {t('landing.common.step', { number: layer.number })}
                    </span>

                    {index === guideLayers.length - 1 && (
                      <span className="rounded-full bg-[color-mix(in_srgb,var(--accent-2)_10%,transparent)] px-2 py-1 font-[var(--font-mono)] text-[10px] font-semibold text-[var(--accent-2)]">
                        {t('landing.common.ready')}
                      </span>
                    )}
                  </div>

                  <div className="relative grid h-[205px] place-items-center overflow-hidden rounded-[14px] bg-[#F5F5F5] sm:h-[235px]">
                    <div className="relative h-40 w-[150px]">
                      <span className="absolute left-1/2 top-[5px] h-[60px] w-[72px] -translate-x-1/2 rounded-[36px_36px_18px_18px] border-2 border-[#4B1D98] bg-[#6D28D9]" />

                      <span className="absolute left-1/2 top-[58px] h-[65px] w-[118px] -translate-x-1/2 rounded-3xl border-2 border-[#4B1D98] bg-[#6D28D9]" />

                      <span className="absolute left-1/2 top-[116px] h-10 w-[88px] -translate-x-1/2 rounded-[12px_12px_20px_20px] border-2 border-[#075E66] bg-[#0E7C86]" />
                    </div>

                    {index === 1 && (
                      <>
                        <span className="absolute right-[18%] top-[24%] size-3 rounded-full border-2 border-white bg-[#E8A35B]" />
                        <span className="absolute right-[20%] top-[30%] h-px w-[18%] bg-[#E8A35B]" />
                      </>
                    )}
                  </div>

                  <div className="pt-[18px]">
                    <h2 className="m-0 text-xl font-semibold">
                      {layer.title}
                    </h2>

                    <p className="mt-1.5 text-sm leading-6 text-[var(--text-secondary)]">
                      {layer.description}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
