import Link from 'next/link';

import { Container } from '@/components/ui/Container';

const benefits = [
  'Покрокові ракурси моделі',
  'Позначення важливих областей',
  'Кольори та пояснення для кожного етапу',
  'Експорт у зрозумілий PDF-гайд',
];

export function FinalCtaSection() {
  return (
    <section className="border-t border-[var(--border)] py-20 sm:py-24 lg:py-28 xl:py-32">
      <Container>
        <div className="relative overflow-hidden rounded-[24px] border border-[var(--border)] bg-[var(--card)] px-5 py-10 sm:px-8 sm:py-14 lg:px-12 lg:py-16 xl:px-16 xl:py-20">
          <div
            className="pointer-events-none absolute -right-16 -top-12 hidden h-[430px] w-[520px] lg:block"
            aria-hidden="true"
          >
            <GuideStackIllustration />
          </div>

          <div className="relative z-10 max-w-[900px]">
            <span className="font-[var(--font-mono)] text-xs font-semibold tracking-[0.1em] text-[var(--accent)]">
              ГОТОВІ ПОЧАТИ?
            </span>

            <h2 className="mt-4 max-w-[900px] text-[clamp(38px,5.2vw,72px)] font-semibold leading-[0.98] tracking-[-0.05em]">
              Перетвори складну модель на зрозумілу інструкцію
            </h2>

            <p className="mt-6 max-w-[700px] text-base leading-[1.7] text-[var(--text-secondary)] sm:text-[18px]">
              Створи професійний гайд для клієнта без ручної верстки,
              нескінченних скріншотів і заплутаних пояснень.
            </p>

            <div className="mt-8 grid max-w-[760px] gap-3 sm:grid-cols-2">
              {benefits.map((benefit) => (
                <div
                  key={benefit}
                  className="flex min-w-0 items-start gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-3.5"
                >
                  <span
                    className="mt-1 grid size-5 shrink-0 place-items-center rounded-full bg-[var(--accent)] text-[11px] font-bold text-white"
                    aria-hidden="true"
                  >
                    ✓
                  </span>

                  <span className="text-sm leading-6">{benefit}</span>
                </div>
              ))}
            </div>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link
                href="/login"
                className="inline-flex min-h-[52px] items-center justify-center rounded-[10px] bg-[var(--accent)] px-6 text-[15px] font-medium text-white transition-opacity hover:opacity-90"
              >
                Створити перший гайд
              </Link>

              <a
                href="#guide-preview"
                className="inline-flex min-h-[52px] items-center justify-center rounded-[10px] border border-[var(--border)] bg-[var(--bg)] px-6 text-[15px] font-medium transition-colors hover:border-[var(--accent)]"
              >
                Переглянути приклад
              </a>
            </div>
          </div>

          <div className="mt-10 h-[290px] lg:hidden" aria-hidden="true">
            <GuideStackIllustration />
          </div>
        </div>
      </Container>
    </section>
  );
}

function GuideStackIllustration() {
  return (
    <div className="relative h-full w-full">
      <div className="absolute left-[5%] top-[15%] h-[72%] w-[72%] rotate-[-7deg] rounded-[20px] border border-[var(--border)] bg-[var(--bg)]" />

      <div className="absolute left-[15%] top-[8%] h-[76%] w-[72%] rotate-[-2deg] rounded-[20px] border border-[var(--border)] bg-[var(--card)]" />

      <div className="absolute right-[3%] top-0 h-[82%] w-[74%] rotate-[5deg] rounded-[20px] border border-[#E3DEEC] bg-white p-4 text-[#181221] shadow-[0_20px_60px_rgb(24_18_33_/_0.12)] sm:p-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-[var(--font-mono)] text-[8px] font-semibold tracking-[0.12em] text-[#6D28D9]">
              PAINTING GUIDE
            </div>

            <div className="mt-2 h-2.5 w-28 rounded-full bg-[#181221]" />
          </div>

          <span className="rounded-full bg-[#F3E8FF] px-2 py-1 font-[var(--font-mono)] text-[8px] font-semibold text-[#6D28D9]">
            PDF
          </span>
        </div>

        <div className="mt-5 grid grid-cols-[minmax(0,1fr)_64px] gap-3">
          <div className="relative h-28 overflow-hidden rounded-xl bg-[#F5F5F5] sm:h-36">
            <div className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2">
              <span className="absolute left-1/2 top-0 h-9 w-11 -translate-x-1/2 rounded-full bg-[#6D28D9]" />
              <span className="absolute left-1/2 top-8 h-14 w-[72px] -translate-x-1/2 rounded-2xl bg-[#6D28D9]" />
              <span className="absolute bottom-0 left-3 h-8 w-6 rounded-lg bg-[#0E7C86]" />
              <span className="absolute bottom-0 right-3 h-8 w-6 rounded-lg bg-[#0E7C86]" />
            </div>

            <span className="absolute right-[26%] top-[22%] size-3 rounded-full border-2 border-white bg-[#E8A35B]" />
            <span className="absolute right-[9%] top-[27%] h-px w-[18%] bg-[#E8A35B]" />
          </div>

          <div className="grid content-start gap-2">
            <span className="h-12 rounded-lg bg-[#6D28D9]" />
            <span className="h-12 rounded-lg bg-[#0E7C86]" />
            <span className="h-12 rounded-lg bg-[#E8A35B]" />
          </div>
        </div>

        <div className="mt-5 grid gap-3">
          {[1, 2, 3].map((step) => (
            <div
              key={step}
              className="grid grid-cols-[22px_minmax(0,1fr)] items-center gap-3"
            >
              <span className="font-[var(--font-mono)] text-[8px] font-semibold text-[#6D28D9]">
                0{step}
              </span>

              <div>
                <div className="h-1.5 w-2/3 rounded-full bg-[#A79FB5]" />
                <div className="mt-1.5 h-1.5 w-full rounded-full bg-[#E3DEEC]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}