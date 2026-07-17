import { Home } from "lucide-react";
import Link from "next/link";

import { BackButton } from "@/components/ui/BackButton";
import { Container } from "@/components/ui/Container";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { LanguageSwitcher } from "@/features/i18n/components/LanguageSwitcher";

export default function NotFoundPage() {
  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden bg-[var(--bg)] text-[var(--text)]">
      <header className="relative z-20 border-b border-[var(--border)] bg-[color-mix(in_srgb,var(--bg)_92%,transparent)] backdrop-blur-xl">
        <Container className="flex min-h-16 items-center justify-between gap-6 sm:min-h-[72px]">
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 font-[var(--font-heading)] text-xl font-semibold"
            aria-label="Шар — головна"
          >
            <span
              className="grid size-9 place-items-center rounded-[10px] bg-[var(--accent)] text-sm font-semibold text-white"
              aria-hidden="true"
            >
              Ш
            </span>

            <span className="hidden min-[380px]:inline">Шар</span>
          </Link>

          <div className="flex items-center gap-2.5">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </Container>
      </header>

      <div
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
        aria-hidden="true"
      >
        <span className="font-[var(--font-heading)] text-[clamp(12rem,35vw,32rem)] font-semibold leading-none text-[var(--border)]">
          404
        </span>
      </div>

      <Container className="relative z-10 flex flex-1 items-center justify-center py-12">
        <section className="w-full max-w-lg rounded-[24px] border border-[var(--border)] bg-[var(--card)] p-6 text-center sm:p-10">
          <p className="font-[var(--font-mono)] text-xs font-medium uppercase tracking-[0.16em] text-[var(--accent)]">
            Шар не знайдено
          </p>

          <h1 className="mt-4 font-[var(--font-heading)] text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
            Такої сторінки не існує
          </h1>

          <p className="mx-auto mt-4 max-w-sm leading-7 text-[var(--text-secondary)]">
            Можливо, посилання застаріло або в адресі допущена помилка.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <BackButton label="Повернутися назад" />

            <Link
              href="/"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[10px] bg-[var(--accent)] px-5 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              <Home className="size-4" />
              На головну
            </Link>
          </div>
        </section>
      </Container>
    </main>
  );
}