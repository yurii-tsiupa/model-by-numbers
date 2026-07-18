"use client";

import { Ruler } from "lucide-react";

import { useTranslation } from "@/features/i18n/hooks/useTranslation";

import { formatModelDimension } from "../lib/modelDimensions";
import type {
  ModelDimensions,
  ModelUnits,
} from "../types/ModelUnits";
import type { ModelFormat } from "../types/ModelFormat";

const UNITS: readonly ModelUnits[] = [
  "mm",
  "cm",
  "m",
  "inch",
];

type ImportUnitsPanelProps = {
  format: ModelFormat;
  units: ModelUnits | null;
  dimensions: ModelDimensions;
  warning: "small" | "large" | null;
  onChange: (units: ModelUnits) => void;
};

export function ImportUnitsPanel({
  format,
  units,
  dimensions,
  warning,
  onChange,
}: ImportUnitsPanelProps) {
  const { t, locale } = useTranslation();

  const symbol = units
    ? t(`modelImport.units.symbol.${units}`)
    : t("modelImport.units.modelUnit");

  const dimensionText = `${formatModelDimension(
    dimensions.width,
    locale,
  )} × ${formatModelDimension(
    dimensions.height,
    locale,
  )} × ${formatModelDimension(
    dimensions.depth,
    locale,
  )} ${symbol}`;

  return (
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)]">
      <div className="border-b border-[var(--border)] px-5 py-4 sm:px-6">
        <div className="flex items-start gap-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] text-[var(--accent)]">
            <Ruler className="h-4 w-4" />
          </div>

          <div>
            <h3 className="font-[var(--font-space-grotesk)] text-base font-semibold text-[var(--text)]">
              {t("modelImport.units.title")}
            </h3>

            <p className="mt-1 max-w-2xl text-xs leading-5 text-[var(--text-secondary)]">
              {format === "stl"
                ? t("modelImport.units.stlDescription")
                : t("modelImport.units.glbDetected")}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4 p-5 sm:p-6">
        <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(13rem,0.65fr)]">
          <div className="rounded-xl border border-[var(--border)] bg-[var(--bg)] p-4">
            <p className="font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-[var(--text-secondary)]">
              {t("modelImport.units.dimensions")}
            </p>

            <p className="mt-2 font-mono text-sm font-medium text-[var(--text)]">
              {dimensionText}
            </p>
          </div>

          <label className="block">
            <span className="text-xs font-medium text-[var(--text-secondary)]">
              {t("modelImport.units.label")}
            </span>

            <select
              value={units ?? ""}
              onChange={(event) =>
                onChange(event.target.value as ModelUnits)
              }
              className="mt-2 w-full cursor-pointer rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 py-3 text-sm text-[var(--text)] outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--accent)_14%,transparent)]"
            >
              <option value="" disabled>
                {t("modelImport.units.choose")}
              </option>

              {UNITS.map((value) => (
                <option key={value} value={value}>
                  {t(`modelImport.units.${value}`)}
                </option>
              ))}
            </select>
          </label>
        </div>

        <p className="text-xs leading-5 text-[var(--text-secondary)]">
          {t("modelImport.units.previewUnaffected")}
        </p>

        {warning ? (
          <div className="rounded-xl border border-amber-500/25 bg-amber-500/5 px-4 py-3">
            <p className="text-xs leading-5 text-amber-600 dark:text-amber-300">
              {t(`modelImport.units.warning.${warning}`)}
            </p>
          </div>
        ) : null}
      </div>
    </section>
  );
}