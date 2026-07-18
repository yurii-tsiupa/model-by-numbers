"use client";

import { Plus } from "lucide-react";
import { useTranslation } from "@/features/i18n/hooks/useTranslation";

export function ModelsHeader({ onNewProject }: { onNewProject: () => void }) {
  const { t } = useTranslation();
  return <section className="border-b border-[var(--border)] bg-[var(--bg)]">
    <div className="mx-auto w-full max-w-[1440px] px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl"><p className="mb-5 font-[family-name:var(--font-jetbrains-mono)] text-xs font-medium uppercase tracking-[0.16em] text-[var(--accent)]">{t("models.workspace")}</p><h1 className="font-[family-name:var(--font-space-grotesk)] text-3xl font-semibold tracking-[-0.035em] text-[var(--text)] sm:text-4xl lg:text-[2.75rem]">{t("models.title")}</h1><p className="mt-4 max-w-xl font-[family-name:var(--font-inter)] text-sm leading-6 text-[var(--text-secondary)] sm:text-base sm:leading-7">{t("models.description")}</p></div>
        <button type="button" onClick={onNewProject} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-[var(--accent-foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] sm:w-auto"><Plus className="size-4"/>{t("models.new")}</button>
      </div>
    </div>
  </section>;
}
