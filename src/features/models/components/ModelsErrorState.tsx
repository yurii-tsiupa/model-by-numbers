"use client";

import { RefreshCw, TriangleAlert } from "lucide-react";
import { useTranslation } from "@/features/i18n/hooks/useTranslation";

type ModelsErrorStateProps = {
  onRetry: () => void;
};

export function ModelsErrorState({
  onRetry,
}: ModelsErrorStateProps) {
  const {t}=useTranslation();
  return (
    <div className="flex min-h-[420px] items-center justify-center rounded-3xl border border-[var(--border)] bg-[var(--card)] px-6 py-12">
      <div className="max-w-md text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10">
          <TriangleAlert
            className="h-7 w-7 text-red-500"
            strokeWidth={1.8}
          />
        </div>

        <h2 className="mt-6 font-[family-name:var(--font-space-grotesk)] text-2xl font-semibold tracking-[-0.02em] text-[var(--text)]">
          {t("models.errorTitle")}
        </h2>

        <p className="mt-3 font-[family-name:var(--font-inter)] text-sm leading-6 text-[var(--text-secondary)]">
          {t("models.errorDescription")}
        </p>

        <button
          type="button"
          onClick={onRetry}
          className="mt-8 inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--bg)] px-5 py-3 font-[family-name:var(--font-inter)] text-sm font-medium text-[var(--text)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
        >
          <RefreshCw className="h-4 w-4" />
          {t("common.retry")}
        </button>
      </div>
    </div>
  );
}
