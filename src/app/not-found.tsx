"use client";

import { Home } from "lucide-react";
import Link from "next/link";

import { BackButton } from "@/components/ui/BackButton";
import { Container } from "@/components/ui/Container";
import { AppHeader } from "@/components/layout/AppHeader";
import { useTranslation } from "@/features/i18n/hooks/useTranslation";

export default function NotFoundPage() {
  const { t } = useTranslation();
  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden bg-[var(--bg)] text-[var(--text)]">
      <AppHeader variant="public" showNavigation={false}/>

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
            {t("notFound.eyebrow")}
          </p>

          <h1 className="mt-4 font-[var(--font-heading)] text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
            {t("notFound.title")}
          </h1>

          <p className="mx-auto mt-4 max-w-sm leading-7 text-[var(--text-secondary)]">
            {t("notFound.description")}
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <BackButton label={t("notFound.back")} />

            <Link
              href="/"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[10px] bg-[var(--accent)] px-5 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              <Home className="size-4" />
              {t("notFound.home")}
            </Link>
          </div>
        </section>
      </Container>
    </main>
  );
}
