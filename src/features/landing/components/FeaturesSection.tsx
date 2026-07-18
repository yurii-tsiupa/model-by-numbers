'use client';

import { Container } from '@/components/ui/Container';
import { useTranslation } from '@/features/i18n/hooks/useTranslation';

export function FeaturesSection() {
  const { t } = useTranslation();
  const illustrations=['viewpoint','annotation','palette','steps'] as const;
  const features=([1,2,3,4] as const).map((number,index)=>({number:String(number).padStart(2,'0'),meta:t(`landing.features.items.${number}.meta`),title:t(`landing.features.items.${number}.title`),description:t(`landing.features.items.${number}.description`),illustration:illustrations[index]}));
  return (
    <section
      id="features"
      className="border-t border-[var(--border)] py-20 sm:py-24 lg:py-28 xl:py-32"
    >
      <Container>
        <div className="grid gap-8 lg:grid-cols-2 lg:items-end lg:gap-16 xl:gap-24">
          <div>
            <span className="font-[var(--font-mono)] text-xs font-semibold tracking-[0.1em] text-[var(--accent)]">
              {t('landing.features.eyebrow')}
            </span>

            <h2 className="mt-4 max-w-[850px] text-[clamp(38px,5vw,64px)] font-semibold leading-[1.02] tracking-[-0.045em]">
              {t('landing.features.title')}
            </h2>
          </div>

          <p className="max-w-[760px] text-base leading-[1.7] text-[var(--text-secondary)] sm:text-[18px]">
            {t('landing.features.description')}
          </p>
        </div>

        <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--border)] md:grid-cols-2 lg:mt-16">
          {features.map((feature) => (
            <article
              key={feature.number}
              className="min-w-0 bg-[var(--card)] p-5 sm:p-7 lg:min-h-[430px] lg:p-9 xl:min-h-[470px] xl:p-10"
            >
              <div className="flex items-center justify-between gap-4">
                <span className="font-[var(--font-mono)] text-[11px] font-semibold text-[var(--text-secondary)]">
                  {feature.number}
                </span>

                <span className="font-[var(--font-mono)] text-[10px] font-semibold tracking-[0.1em] text-[var(--accent)]">
                  {feature.meta}
                </span>
              </div>

              <div className="mt-8 h-[190px] sm:h-[220px] lg:h-[240px]">
                {feature.illustration === 'viewpoint' && (
                  <ViewpointIllustration />
                )}
                {feature.illustration === 'annotation' && (
                  <AnnotationIllustration />
                )}
                {feature.illustration === 'palette' && (
                  <PaletteIllustration />
                )}
                {feature.illustration === 'steps' && <StepsIllustration />}
              </div>

              <h3 className="mt-8 max-w-[560px] text-2xl font-semibold tracking-[-0.025em] sm:text-[28px]">
                {feature.title}
              </h3>

              <p className="mt-3 max-w-[600px] text-sm leading-[1.7] text-[var(--text-secondary)] sm:text-[15px]">
                {feature.description}
              </p>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}

function ViewpointIllustration() {
  const { t } = useTranslation();
  return (
    <div className="grid h-full grid-cols-2 gap-3 sm:gap-4">
      {[0, 1].map((item) => (
        <div
          key={item}
          className="relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg)]"
        >
          <div
            className={`absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 ${
              item === 1 ? 'scale-125' : ''
            }`}
          >
            <span className="absolute left-1/2 top-0 h-10 w-12 -translate-x-1/2 rounded-full bg-[var(--accent)]" />
            <span className="absolute left-1/2 top-8 h-16 w-20 -translate-x-1/2 rounded-2xl bg-[var(--accent)]" />
            <span className="absolute bottom-0 left-4 h-9 w-7 rounded-lg bg-[var(--accent-2)]" />
            <span className="absolute bottom-0 right-4 h-9 w-7 rounded-lg bg-[var(--accent-2)]" />
          </div>

          <span className="absolute bottom-3 left-3 font-[var(--font-mono)] text-[9px] text-[var(--text-secondary)]">
            {t('landing.features.view',{number:item+1})}
          </span>
        </div>
      ))}
    </div>
  );
}

function AnnotationIllustration() {
  const { t } = useTranslation();
  return (
    <div className="relative h-full overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg)]">
      <div className="absolute left-1/2 top-1/2 h-36 w-36 -translate-x-1/2 -translate-y-1/2">
        <span className="absolute left-1/2 top-0 h-12 w-14 -translate-x-1/2 rounded-full bg-[var(--accent)]" />
        <span className="absolute left-1/2 top-10 h-20 w-28 -translate-x-1/2 rounded-3xl bg-[var(--accent)]" />
      </div>

      <span className="absolute right-[30%] top-[28%] size-4 rounded-full border-[3px] border-[var(--card)] bg-[#E8A35B]" />
      <span className="absolute right-[13%] top-[32%] h-px w-[18%] bg-[#E8A35B]" />

      <div className="absolute right-4 top-[22%] rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-xs font-medium">
        {t('landing.features.annotation')}
      </div>
    </div>
  );
}

function PaletteIllustration() {
  const { t } = useTranslation();
  const colors = [
    [t('landing.features.colors.primary'), 'var(--accent)'],
    [t('landing.features.colors.details'), 'var(--accent-2)'],
    [t('landing.features.colors.accent'), '#E8A35B'],
  ];

  return (
    <div className="grid h-full gap-3">
      {colors.map(([name, color]) => (
        <div
          key={name}
          className="flex items-center gap-4 rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-3 sm:p-4"
        >
          <span
            className="size-12 shrink-0 rounded-xl border border-black/10 sm:size-14"
            style={{ backgroundColor: color }}
          />

          <div className="min-w-0 flex-1">
            <strong className="block text-sm font-semibold">{name}</strong>
            <span className="mt-1 block font-[var(--font-mono)] text-[10px] text-[var(--text-secondary)]">
              {t('landing.features.stageColor')}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

function StepsIllustration() {
  return (
    <div className="grid h-full gap-3">
      {[1, 2, 3].map((step) => (
        <div
          key={step}
          className="grid min-w-0 grid-cols-[34px_minmax(0,1fr)] items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-3 sm:grid-cols-[42px_72px_minmax(0,1fr)] sm:p-4"
        >
          <span className="font-[var(--font-mono)] text-xs font-semibold text-[var(--accent)]">
            0{step}
          </span>

          <div className="relative hidden h-12 overflow-hidden rounded-lg bg-[var(--card)] sm:block">
            <span className="absolute left-1/2 top-2 h-4 w-5 -translate-x-1/2 rounded-full bg-[var(--accent)]" />
            <span className="absolute left-1/2 top-5 h-5 w-8 -translate-x-1/2 rounded-md bg-[var(--accent)]" />
          </div>

          <div className="min-w-0">
            <div className="h-2.5 w-2/3 rounded-full bg-[var(--text)] opacity-70" />
            <div className="mt-2 h-2 w-full rounded-full bg-[var(--border)]" />
            <div className="mt-1.5 h-2 w-4/5 rounded-full bg-[var(--border)]" />
          </div>
        </div>
      ))}
    </div>
  );
}
