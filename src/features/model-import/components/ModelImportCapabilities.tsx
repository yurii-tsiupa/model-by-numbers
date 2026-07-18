"use client";

import {
  CheckCircle2,
  XCircle,
} from "lucide-react";

import { useTranslation } from "@/features/i18n/hooks/useTranslation";

import type { GuideCapability } from "../lib/getModelGuideCapabilities";

type ModelImportCapabilitiesProps = {
  items: readonly GuideCapability[];
};

export function ModelImportCapabilities({
  items,
}: ModelImportCapabilitiesProps) {
  const { t } = useTranslation();

  const availableCount = items.filter(
    (item) => item.available,
  ).length;

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h4 className="font-[var(--font-space-grotesk)] text-sm font-semibold text-[var(--text)]">
          {t("modelImport.capabilitySummary.title")}
        </h4>

        <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--text-secondary)]">
          {availableCount}/{items.length}
        </span>
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {items.map((item) => {
          const available = item.available;

          return (
            <div
              key={item.code}
              className={`
                flex min-w-0 items-center gap-3 rounded-xl border
                bg-[var(--bg)] px-3 py-3
                ${
                  available
                    ? "border-[color-mix(in_srgb,var(--accent-2)_24%,var(--border))]"
                    : "border-[var(--border)]"
                }
              `}
            >
              <div
                className={`
                  flex h-8 w-8 shrink-0 items-center justify-center
                  rounded-lg border
                  ${
                    available
                      ? "border-[color-mix(in_srgb,var(--accent-2)_25%,var(--border))] bg-[color-mix(in_srgb,var(--accent-2)_7%,var(--card))] text-[var(--accent-2)]"
                      : "border-[var(--border)] bg-[var(--card)] text-[var(--text-secondary)]"
                  }
                `}
              >
                {available ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <XCircle className="h-4 w-4" />
                )}
              </div>

              <span
                className={`
                  min-w-0 text-xs leading-5
                  ${
                    available
                      ? "text-[var(--text)]"
                      : "text-[var(--text-secondary)]"
                  }
                `}
              >
                {t(
                  `modelImport.capabilitySummary.${item.code}`,
                )}
              </span>

              <span className="sr-only">
                {t(
                  available
                    ? "modelImport.capabilitySummary.available"
                    : "modelImport.capabilitySummary.unavailable",
                )}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}