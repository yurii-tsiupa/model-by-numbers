"use client";

import { LoaderCircle } from "lucide-react";

import { useTranslation } from "@/features/i18n/hooks/useTranslation";

type ModelImportProgressProps = {
  progress: number;
  stage: string;
  onCancel: () => void;
};

export function ModelImportProgress({
  progress,
  stage,
  onCancel,
}: ModelImportProgressProps) {
  const { t } = useTranslation();

  const stageKey =
    stage === "geometry"
      ? "modelImport.status.geometry"
      : stage === "materials"
        ? "modelImport.status.materials"
        : stage === "parts"
          ? "modelImport.status.parts"
          : stage === "report"
            ? "modelImport.status.report"
            : stage === "parsing"
              ? "modelImport.status.parsing"
              : "modelImport.status.reading";

  const value = Math.min(
    100,
    Math.max(0, Math.round(progress)),
  );

  return (
    <section
      role="status"
      aria-live="polite"
      className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)]"
    >
      <div className="border-b border-[var(--border)] px-5 py-4 sm:px-6">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[color-mix(in_srgb,var(--accent)_28%,var(--border))] bg-[color-mix(in_srgb,var(--accent)_8%,var(--bg))] text-[var(--accent)]">
            <LoaderCircle className="h-5 w-5 animate-spin" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-[var(--font-space-grotesk)] text-base font-semibold text-[var(--text)]">
                  {t(stageKey)}
                </p>

                <p className="mt-1 text-xs text-[var(--text-secondary)]">
                  {t("modelImport.status.processing")}
                </p>
              </div>

              <span className="font-mono text-sm font-semibold text-[var(--accent)]">
                {value}%
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4 p-5 sm:p-6">
        <div className="overflow-hidden rounded-full bg-[var(--border)]">
          <div
            className="relative h-2 rounded-full bg-[var(--accent)] transition-[width] duration-300"
            style={{ width: `${value}%` }}
          >
            <div className="absolute inset-0 animate-pulse bg-white/10" />
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--text-secondary)]">
            {t("modelImport.status.processing")}
          </span>

          <button
            type="button"
            onClick={onCancel}
            className="cursor-pointer rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-xs font-medium text-[var(--text-secondary)] transition hover:text-[var(--text)]"
          >
            {t("modelImport.actions.cancel")}
          </button>
        </div>
      </div>
    </section>
  );
}