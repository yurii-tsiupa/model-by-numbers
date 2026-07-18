"use client";

import { Box, Plus, Sparkles } from "lucide-react";
import { useTranslation } from "@/features/i18n/hooks/useTranslation";

type ModelsEmptyStateProps = {
  onNewProject: () => void;
};

export function ModelsEmptyState({
  onNewProject,
}: ModelsEmptyStateProps) {
  const {t}=useTranslation();
  return (
    <div className="flex min-h-[520px] items-center justify-center rounded-3xl border border-[var(--border)] bg-[var(--card)] px-6 py-12">
      <div className="max-w-xl text-center">
        <div className="mx-auto flex flex-col items-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--bg)]">
            <Box
              className="h-9 w-9 text-[var(--accent)]"
              strokeWidth={1.6}
            />
          </div>

          <div
            aria-hidden="true"
            className="mt-5 flex flex-col items-center gap-1"
          >
            <span className="h-1 w-16 rounded-full bg-[var(--accent)] opacity-30" />
            <span className="h-1 w-12 rounded-full bg-[var(--accent)] opacity-20" />
            <span className="h-1 w-8 rounded-full bg-[var(--accent)] opacity-10" />
          </div>
        </div>

        <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--bg)] px-3 py-1.5">
          <Sparkles
            className="h-3.5 w-3.5 text-[var(--accent)]"
            strokeWidth={2}
          />

          <span className="font-[family-name:var(--font-jetbrains-mono)] text-[11px] uppercase tracking-[0.14em] text-[var(--text-secondary)]">
            {t("models.ready")}
          </span>
        </div>

        <h2 className="mt-6 font-[family-name:var(--font-space-grotesk)] text-3xl font-semibold tracking-[-0.03em] text-[var(--text)]">
          {t("models.emptyTitle")}
        </h2>

        <p className="mx-auto mt-4 max-w-md font-[family-name:var(--font-inter)] text-base leading-7 text-[var(--text-secondary)]">
          {t("models.emptyDescription")}
        </p>

        <button
          type="button"
          onClick={onNewProject}
          className="mt-10 inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-6 py-3 font-[family-name:var(--font-inter)] text-sm font-semibold text-[var(--accent-foreground)] transition-opacity hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          {t("models.createFirst")}
        </button>
      </div>
    </div>
  );
}
