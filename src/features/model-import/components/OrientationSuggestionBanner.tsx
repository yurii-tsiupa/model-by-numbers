"use client";

import { Compass } from "lucide-react";

import { useTranslation } from "@/features/i18n/hooks/useTranslation";

import type { OrientationSuggestion } from "../types/OrientationSuggestion";

type Props = {
  suggestion: OrientationSuggestion | null;
  hasManualOverride: boolean;
  onReset: () => void;
  onReview: () => void;
};

export function OrientationSuggestionBanner({
  suggestion,
  hasManualOverride,
  onReset,
  onReview,
}: Props) {
  const { t } = useTranslation();

  if (!suggestion || hasManualOverride) {
    return null;
  }

  const applied = suggestion.confidence !== "low";

  return (
    <aside className="mb-4 rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-4 sm:p-5">
      <div className="flex items-start gap-4">
        <div
          className={`
            flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border
            ${
              applied
                ? "border-[color-mix(in_srgb,var(--accent-2)_28%,var(--border))] bg-[color-mix(in_srgb,var(--accent-2)_8%,var(--card))] text-[var(--accent-2)]"
                : "border-[color-mix(in_srgb,var(--accent)_25%,var(--border))] bg-[color-mix(in_srgb,var(--accent)_7%,var(--card))] text-[var(--accent)]"
            }
          `}
        >
          <Compass className="h-4.5 w-4.5" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-[var(--font-space-grotesk)] text-sm font-semibold text-[var(--text)]">
              {t(
                applied
                  ? "modelImport.orientation.appliedTitle"
                  : "modelImport.orientation.unknownTitle",
              )}
            </p>

            <span
              className={`
                rounded-md px-2 py-1 font-mono text-[9px] font-medium uppercase tracking-[0.1em]
                ${
                  applied
                    ? "bg-[color-mix(in_srgb,var(--accent-2)_12%,transparent)] text-[var(--accent-2)]"
                    : "bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] text-[var(--accent)]"
                }
              `}
            >
              {applied ? "Applied" : "Review"}
            </span>
          </div>

          <p className="mt-1.5 max-w-2xl text-xs leading-5 text-[var(--text-secondary)]">
            {t(
              applied
                ? "modelImport.orientation.appliedDescription"
                : "modelImport.orientation.unknownDescription",
            )}
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            {applied ? (
              <button
                type="button"
                onClick={onReset}
                className="cursor-pointer rounded-xl border border-[var(--border)] bg-[var(--card)] px-3.5 py-2 text-xs font-medium text-[var(--text-secondary)] transition hover:bg-[var(--bg)] hover:text-[var(--text)]"
              >
                {t("modelImport.orientation.reset")}
              </button>
            ) : null}

            <button
              type="button"
              onClick={onReview}
              className="cursor-pointer rounded-xl bg-[var(--accent)] px-3.5 py-2 text-xs font-semibold text-white transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--accent)_30%,transparent)]"
            >
              {t("modelImport.orientation.review")}
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}