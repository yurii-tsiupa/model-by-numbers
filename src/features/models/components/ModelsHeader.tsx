"use client";

import type { User } from "firebase/auth";
import { Box, Plus } from "lucide-react";

import { SignOutButton } from "@/components/auth/SignOutButton";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { LanguageSwitcher } from "@/features/i18n/components/LanguageSwitcher";
import { useTranslation } from "@/features/i18n/hooks/useTranslation";

type ModelsHeaderProps = {
  user: User;
  onNewProject: () => void;
};

export function ModelsHeader({
  user,
  onNewProject,
}: ModelsHeaderProps) {
  const { t } = useTranslation();

  const fallbackLetter = (
    user.displayName ??
    user.email ??
    t("common.user")
  )
    .charAt(0)
    .toUpperCase();

  return (
    <>
      <header className="border-b border-[var(--border)]">
        <div className="flex min-h-16 items-center justify-between px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--card)]">
              <Box
                className="h-[18px] w-[18px] text-[var(--accent)]"
                strokeWidth={1.8}
              />

              <span
                aria-hidden="true"
                className="absolute -bottom-1 left-2 right-2 h-1 rounded-full bg-[var(--accent)] opacity-30"
              />
            </div>

            <div className="hidden min-w-0 sm:block">
              <p className="font-[family-name:var(--font-space-grotesk)] text-sm font-semibold tracking-[-0.01em] text-[var(--text)]">
                Model by Numbers
              </p>

              <p className="font-[family-name:var(--font-jetbrains-mono)] text-[10px] uppercase tracking-[0.14em] text-[var(--text-secondary)]">
                Layer workspace
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <LanguageSwitcher />

            <div className="hidden min-w-0 text-right lg:block">
              <p className="max-w-44 truncate font-[family-name:var(--font-inter)] text-sm font-medium text-[var(--text)]">
                {user.displayName ?? t("common.user")}
              </p>

              <p className="max-w-44 truncate font-[family-name:var(--font-inter)] text-xs text-[var(--text-secondary)]">
                {user.email}
              </p>
            </div>

            {user.photoURL ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.photoURL}
                alt={user.displayName ?? t("models.avatar")}
                referrerPolicy="no-referrer"
                className="h-9 w-9 shrink-0 rounded-full border border-[var(--border)] object-cover"
              />
            ) : (
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--card)] font-[family-name:var(--font-inter)] text-sm font-semibold text-[var(--text)]">
                {fallbackLetter}
              </div>
            )}

            <ThemeToggle />
            <SignOutButton />
          </div>
        </div>
      </header>

      <section className="border-b border-[var(--border)] bg-[var(--bg)]">
        <div className="mx-auto w-full max-w-[1440px] px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="mb-5 flex items-center gap-3">
                <div
                  aria-hidden="true"
                  className="flex flex-col gap-1"
                >
                  <span className="h-1 w-7 rounded-full bg-[var(--accent)]" />
                  <span className="h-1 w-5 rounded-full bg-[var(--accent)] opacity-60" />
                  <span className="h-1 w-3 rounded-full bg-[var(--accent)] opacity-30" />
                </div>

                <p className="font-[family-name:var(--font-jetbrains-mono)] text-xs font-medium uppercase tracking-[0.16em] text-[var(--accent)]">
                  {t("models.workspace")}
                </p>
              </div>

              <h1 className="font-[family-name:var(--font-space-grotesk)] text-3xl font-semibold tracking-[-0.035em] text-[var(--text)] sm:text-4xl lg:text-[2.75rem] lg:leading-[1.05]">
                {t("models.title")}
              </h1>

              <p className="mt-4 max-w-xl font-[family-name:var(--font-inter)] text-sm leading-6 text-[var(--text-secondary)] sm:text-base sm:leading-7">
                {t("models.description")}
              </p>
            </div>

            <button
              type="button"
              onClick={onNewProject}
              className="inline-flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-5 py-3 font-[family-name:var(--font-inter)] text-sm font-semibold text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)] sm:w-auto"
            >
              <Plus className="h-4 w-4" strokeWidth={2} />
              {t("models.new")}
            </button>
          </div>
        </div>
      </section>
    </>
  );
}