'use client';

import type { CSSProperties } from 'react';

import { Container } from '@/components/ui/Container';

import { useTranslation } from '@/features/i18n/hooks/useTranslation';

export function GuidePreviewSection() {
  const { t } = useTranslation();
  const colors = ['#D7D3DD','#6D28D9','#0E7C86'] as const;
  const guideSteps = ([1,2,3] as const).map((number,index)=>({number:String(number).padStart(2,'0'),title:t(`landing.guidePreview.steps.${number}.title`),description:t(`landing.guidePreview.steps.${number}.description`),color:colors[index]}));
  const palette = ([['purple','#6D28D9'],['turquoise','#0E7C86'],['lightGray','#D7D3DD']] as const).map(([name,code])=>({name:t(`landing.guidePreview.palette.${name}`),code}));
  const benefits = ([1,2,3] as const).map(number=>({number:String(number).padStart(2,'0'),title:t(`landing.guidePreview.benefits.${number}.title`),description:t(`landing.guidePreview.benefits.${number}.description`)}));
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

        <div className="grid items-start gap-12 lg:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)] xl:gap-16">
          <div className="rounded-[22px] border border-[#E3DEEC] bg-white p-4 text-[#181221] shadow-[0_24px_60px_rgb(24_18_33_/_0.08)] sm:p-7 lg:p-[34px]">
            <header className="flex flex-col items-start justify-between gap-6 border-b border-[#E3DEEC] pb-7 sm:flex-row">
              <div>
                <span className="font-[var(--font-mono)] text-[10px] font-semibold tracking-[0.1em] text-[#6B637A]">
                  {t('landing.guidePreview.documentType')}
                </span>

                <h3 className="mt-2.5 text-2xl font-semibold leading-[1.1] sm:text-3xl">
                  {t('landing.guidePreview.modelName')}
                </h3>

                <p className="mt-2.5 max-w-[440px] text-sm leading-6 text-[#6B637A]">
                  {t('landing.guidePreview.documentDescription')}
                </p>
              </div>

              <div className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[rgb(14_124_134_/_0.08)] px-2.5 py-2 font-[var(--font-mono)] text-[10px] font-semibold text-[#0E7C86]">
                <span className="size-[7px] rounded-full bg-[#0E7C86]" />
                {t('landing.guidePreview.ready')}
              </div>
            </header>

            <div className="grid gap-5 py-7 md:grid-cols-[minmax(0,1.2fr)_minmax(210px,0.8fr)]">
              <div className="grid min-h-[240px] place-items-center rounded-2xl bg-[#F5F5F5] sm:min-h-[290px]">
                <div className="relative h-[205px] w-[180px]">
                  <span className="absolute left-1/2 top-0 h-[78px] w-[84px] -translate-x-1/2 rounded-[44px_44px_22px_22px] border-2 border-[rgb(24_18_33_/_0.18)] bg-[#6D28D9]" />

                  <span className="absolute left-1/2 top-[70px] h-[88px] w-36 -translate-x-1/2 rounded-[30px] border-2 border-[rgb(24_18_33_/_0.18)] bg-[#6D28D9]" />

                  <span className="absolute left-1/2 top-[147px] h-[55px] w-[108px] -translate-x-1/2 rounded-[15px_15px_26px_26px] border-2 border-[rgb(24_18_33_/_0.18)] bg-[#0E7C86]" />
                </div>
              </div>

              <div className="rounded-2xl border border-[#E3DEEC] bg-[#FAF9FC] p-[22px]">
                <span className="font-[var(--font-mono)] text-[10px] font-semibold tracking-[0.1em] text-[#6B637A]">
                  {t('landing.guidePreview.paletteLabel')}
                </span>

                <div className="mt-[18px] grid gap-2.5">
                  {palette.map((color) => (
                    <div
                      key={color.code}
                      className="flex items-center gap-3 rounded-xl border border-[#E3DEEC] bg-white p-[11px]"
                    >
                      <span
                        className="size-[34px] shrink-0 rounded-[9px] border border-[rgb(24_18_33_/_0.1)]"
                        style={{ backgroundColor: color.code }}
                      />

                      <div>
                        <strong className="block text-xs font-semibold">
                          {color.name}
                        </strong>

                        <code className="mt-[3px] block font-[var(--font-mono)] text-[9px] text-[#6B637A]">
                          {color.code}
                        </code>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="border-t border-[#E3DEEC] pt-6">
              <div className="mb-3.5 flex items-center justify-between">
                <span className="font-[var(--font-mono)] text-[10px] font-semibold tracking-[0.1em] text-[#6B637A]">
                  {t('landing.guidePreview.stepsLabel')}
                </span>

                <span className="text-[11px] text-[#6B637A]">{t('landing.guidePreview.stageCount',{count:3})}</span>
              </div>

              <div className="grid gap-2.5">
                {guideSteps.map((step) => (
                  <article
                    key={step.number}
                    className="grid grid-cols-[28px_minmax(0,1fr)] items-center gap-2.5 rounded-[14px] border border-[#E3DEEC] p-3 sm:grid-cols-[38px_72px_minmax(0,1fr)] sm:gap-3.5"
                  >
                    <div className="font-[var(--font-mono)] text-[11px] font-semibold text-[#6D28D9]">
                      {step.number}
                    </div>

                    <div
                      className="relative hidden h-[58px] overflow-hidden rounded-[10px] bg-[#F5F5F5] sm:block"
                      style={
                        {
                          '--step-color': step.color,
                        } as CSSProperties
                      }
                    >
                      <span className="absolute left-1/2 top-2.5 h-[22px] w-[26px] -translate-x-1/2 rounded-[50%_50%_30%_30%] bg-[var(--step-color)]" />

                      <span className="absolute left-1/2 top-7 h-6 w-[42px] -translate-x-1/2 rounded-lg bg-[var(--step-color)]" />
                    </div>

                    <div>
                      <h4 className="m-0 text-[13px] font-semibold">
                        {step.title}
                      </h4>

                      <p className="mt-1 text-[11px] leading-[1.45] text-[#6B637A]">
                        {step.description}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
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
