"use client";

import { Check } from "lucide-react";

import { useTranslation } from "@/features/i18n/hooks/useTranslation";

export type ImportStepId =
  | "details"
  | "model"
  | "analysis"
  | "parts"
  | "adjust"
  | "review";

type ModelImportStepperProps = {
  current: ImportStepId;
  available: ReadonlySet<ImportStepId>;
  onSelect: (step: ImportStepId) => void;
};

const STEPS: readonly ImportStepId[] = [
  "details",
  "model",
  "analysis",
  "parts",
  "adjust",
  "review",
];

export function ModelImportStepper({
  current,
  available,
  onSelect,
}: ModelImportStepperProps) {
  const { t } = useTranslation();
  const currentIndex = STEPS.indexOf(current);

  return (
    <nav
      aria-label={t("modelImport.steps.label")}
      className="overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      <ol className="flex min-w-max items-center gap-2">
        {STEPS.map((step, index) => {
          const isCurrent = step === current;
          const isAvailable = available.has(step);
          const isComplete = index < currentIndex;

          return (
            <li key={step} className="flex items-center gap-2">
              <button
                type="button"
                disabled={!isAvailable}
                aria-current={isCurrent ? "step" : undefined}
                onClick={() => onSelect(step)}
                className={`
                  group flex min-w-[7.5rem] items-center gap-3 rounded-xl border
                  px-3 py-2.5 text-left transition
                  focus-visible:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-[color-mix(in_srgb,var(--accent)_25%,transparent)]
                  ${
                    isCurrent
                      ? "border-[var(--accent)] bg-[color-mix(in_srgb,var(--accent)_9%,var(--card))]"
                      : isComplete
                        ? "border-[color-mix(in_srgb,var(--accent-2)_28%,var(--border))] bg-[color-mix(in_srgb,var(--accent-2)_6%,var(--card))] hover:border-[color-mix(in_srgb,var(--accent-2)_45%,var(--border))]"
                        : isAvailable
                          ? "border-[var(--border)] bg-[var(--card)] hover:border-[color-mix(in_srgb,var(--accent)_30%,var(--border))] hover:bg-[var(--bg)]"
                          : "cursor-not-allowed border-transparent bg-transparent opacity-45"
                  }
                `}
              >
                <span
                  className={`
                    flex h-7 w-7 shrink-0 items-center justify-center rounded-lg
                    font-mono text-[11px] font-semibold transition
                    ${
                      isCurrent
                        ? "bg-[var(--accent)] text-white"
                        : isComplete
                          ? "bg-[var(--accent-2)] text-[var(--card)]"
                          : "border border-[var(--border)] bg-[var(--bg)] text-[var(--text-secondary)]"
                    }
                  `}
                >
                  {isComplete ? (
                    <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                  ) : (
                    String(index + 1).padStart(2, "0")
                  )}
                </span>

                <span className="min-w-0">
                  <span
                    className={`
                      block font-[var(--font-space-grotesk)] text-xs font-medium
                      ${
                        isCurrent
                          ? "text-[var(--accent)]"
                          : isComplete
                            ? "text-[var(--accent-2)]"
                            : "text-[var(--text)]"
                      }
                    `}
                  >
                    {t(`modelImport.steps.${step}`)}
                  </span>

                  <span className="mt-0.5 block font-mono text-[9px] uppercase tracking-[0.12em] text-[var(--text-secondary)]">
                    {isComplete
                      ? "Complete"
                      : isCurrent
                        ? "Current layer"
                        : "Layer"}
                  </span>
                </span>
              </button>

              {index < STEPS.length - 1 ? (
                <div
                  aria-hidden="true"
                  className={`
                    h-px w-5 shrink-0 transition
                    ${
                      index < currentIndex
                        ? "bg-[var(--accent-2)]"
                        : "bg-[var(--border)]"
                    }
                  `}
                />
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}