import { Container } from '@/components/ui/Container';

const steps = [
  {
    number: '01',
    label: 'МОДЕЛЬ',
    title: 'Завантаж 3D-модель',
    description:
      'Додай GLB або GLTF-файл і підготуй потрібні ракурси у візуальному редакторі.',
  },
  {
    number: '02',
    label: 'КРОКИ',
    title: 'Створи етапи фарбування',
    description:
      'Обери потрібний ракурс, наблизь важливу область, додай назву, опис і кольори цього кроку.',
  },
  {
    number: '03',
    label: 'ГАЙД',
    title: 'Експортуй інструкцію',
    description:
      'Збери всі етапи у структурований PDF або веб-гайд для свого клієнта.',
  },
];

export function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="border-t border-[var(--border)] py-20 sm:py-24 lg:py-28 xl:py-32"
    >
      <Container>
        <div className="grid gap-8 lg:grid-cols-2 lg:items-end lg:gap-16 xl:gap-24">
          <div>
            <span className="font-[var(--font-mono)] text-xs font-semibold tracking-[0.1em] text-[var(--accent)]">
              ЯК ЦЕ ПРАЦЮЄ
            </span>

            <h2 className="mt-4 max-w-[820px] text-[clamp(38px,5vw,64px)] font-semibold leading-[1.02] tracking-[-0.045em]">
              Побудуй гайд навколо реального процесу фарбування
            </h2>
          </div>

          <p className="max-w-[760px] text-base leading-[1.7] text-[var(--text-secondary)] sm:text-[18px]">
            Одна частина моделі може мати десятки дрібних кольорових областей.
            Тому гайд створюється через окремі ракурси, пояснення та етапи, а не
            лише через mesh-елементи.
          </p>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-3 lg:mt-16">
          {steps.map((step, index) => (
            <article
              key={step.number}
              className="group relative min-w-0 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 sm:p-6 lg:min-h-[380px] lg:p-8"
            >
              <div className="flex items-center justify-between gap-4">
                <span className="font-[var(--font-mono)] text-[11px] font-semibold tracking-[0.08em] text-[var(--text-secondary)]">
                  КРОК {step.number}
                </span>

                <span className="font-[var(--font-mono)] text-[10px] font-semibold tracking-[0.08em] text-[var(--accent)]">
                  {step.label}
                </span>
              </div>

              <div className="mt-10 h-32 sm:h-36 lg:mt-14">
                {index === 0 && <ModelIllustration />}
                {index === 1 && <GuideStepIllustration />}
                {index === 2 && <ExportIllustration />}
              </div>

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

function ModelIllustration() {
  return (
    <div className="relative h-full overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg)]">
      <div className="absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2">
        <span className="absolute left-1/2 top-0 h-10 w-12 -translate-x-1/2 rounded-[24px_24px_12px_12px] bg-[var(--accent)]" />
        <span className="absolute left-1/2 top-8 h-16 w-20 -translate-x-1/2 rounded-2xl bg-[var(--accent)]" />
        <span className="absolute bottom-0 left-4 h-10 w-7 rounded-lg bg-[var(--accent-2)]" />
        <span className="absolute bottom-0 right-4 h-10 w-7 rounded-lg bg-[var(--accent-2)]" />
      </div>

      <span className="absolute bottom-3 left-3 font-[var(--font-mono)] text-[9px] text-[var(--text-secondary)]">
        MODEL.GLB
      </span>
    </div>
  );
}

function GuideStepIllustration() {
  return (
    <div className="grid h-full grid-cols-[minmax(0,1fr)_92px] gap-3">
      <div className="relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg)]">
        <div className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2">
          <span className="absolute left-1/2 top-0 h-9 w-11 -translate-x-1/2 rounded-full bg-[var(--accent)]" />
          <span className="absolute left-1/2 top-8 h-14 w-[72px] -translate-x-1/2 rounded-2xl bg-[var(--accent)]" />
        </div>

        <span className="absolute right-[22%] top-[26%] size-3 rounded-full border-2 border-[var(--card)] bg-[#E8A35B]" />
        <span className="absolute right-[10%] top-[30%] h-px w-[18%] bg-[#E8A35B]" />
      </div>

      <div className="grid content-start gap-2 rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-2">
        <span className="h-8 rounded-lg bg-[var(--accent)]" />
        <span className="h-8 rounded-lg bg-[var(--accent-2)]" />
        <span className="h-8 rounded-lg bg-[#E8A35B]" />
      </div>
    </div>
  );
}

function ExportIllustration() {
  return (
    <div className="relative h-full overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg)]">
      <div className="absolute left-[16%] top-[18%] h-[76%] w-[54%] rotate-[-5deg] rounded-xl border border-[var(--border)] bg-[var(--card)]" />

      <div className="absolute right-[12%] top-[8%] h-[82%] w-[58%] rotate-[3deg] rounded-xl border border-[#E3DEEC] bg-white p-3">
        <div className="h-2 w-14 rounded-full bg-[#6D28D9]" />
        <div className="mt-3 h-10 rounded-md bg-[#F5F5F5]" />

        <div className="mt-3 grid gap-1.5">
          <span className="h-1.5 rounded-full bg-[#E3DEEC]" />
          <span className="h-1.5 w-4/5 rounded-full bg-[#E3DEEC]" />
          <span className="h-1.5 w-2/3 rounded-full bg-[#E3DEEC]" />
        </div>
      </div>
    </div>
  );
}