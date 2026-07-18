"use client";

import { CheckCircle2 } from "lucide-react";

import { useTranslation } from "@/features/i18n/hooks/useTranslation";
import { formatLocalizedNumber } from "@/features/i18n/lib/i18n";

import { formatModelDimension } from "../lib/modelDimensions";
import type { GuideCapability } from "../lib/getModelGuideCapabilities";
import type { ModelAnalysis } from "../types/ModelAnalysis";
import type {
  ModelDimensions,
  ModelUnits,
} from "../types/ModelUnits";
import { ModelImportCapabilities } from "./ModelImportCapabilities";

type ModelImportFinalSummaryProps = {
  name: string;
  fileName: string;
  printer: string;
  material: string;
  baseColor: string;
  analysis: ModelAnalysis;
  included: number;
  excluded: number;
  dimensions: ModelDimensions;
  units: ModelUnits;
  orientationAdjusted: boolean;
  warningCount: number;
  capabilities: readonly GuideCapability[];
};

export function ModelImportFinalSummary({
  name,
  fileName,
  printer,
  material,
  baseColor,
  analysis,
  included,
  excluded,
  dimensions,
  units,
  orientationAdjusted,
  warningCount,
  capabilities,
}: ModelImportFinalSummaryProps) {
  const { t, locale } = useTranslation();

  const dimensionText = `${formatModelDimension(
    dimensions.width,
    locale,
  )} × ${formatModelDimension(
    dimensions.height,
    locale,
  )} × ${formatModelDimension(
    dimensions.depth,
    locale,
  )} ${t(`modelImport.units.symbol.${units}`)}`;

  const rows = [
    [t("modelImport.final.project"), name],
    [t("guide.printer"), printer],
    [t("guide.material"), material],
    [t("modelImport.final.file"), fileName],
    [
      t("modelImport.report.format"),
      t(`modelImport.formats.${analysis.format ?? "glb"}`),
    ],
    [
      t("modelImport.final.parts"),
      t("modelImport.final.partsValue", {
        included,
        excluded,
      }),
    ],
    [
      t("modelImport.report.triangles"),
      formatLocalizedNumber(
        analysis.geometry.trianglesCount,
        locale,
      ),
    ],
    [t("modelImport.report.dimensions"), dimensionText],
    [
      t("modelImport.report.performance"),
      t(
        `modelImport.performance.${analysis.performanceLevel}`,
      ),
    ],
    [
      t("modelImport.final.orientation"),
      t(orientationAdjusted ? "common.yes" : "common.no"),
    ],
  ];

  return (
    <section
      id="import-step-review"
      className="scroll-mt-40 rounded-2xl border border-[var(--border)] bg-[var(--card)]"
    >
      <div className="border-b border-[var(--border)] px-5 py-4 sm:px-6">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[color-mix(in_srgb,var(--accent-2)_28%,var(--border))] bg-[color-mix(in_srgb,var(--accent-2)_8%,var(--bg))] text-[var(--accent-2)]">
            <CheckCircle2 className="h-5 w-5" />
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-[var(--font-space-grotesk)] text-base font-semibold text-[var(--text)]">
                {t("modelImport.final.title")}
              </h3>

              <span className="rounded-md bg-[color-mix(in_srgb,var(--accent-2)_12%,transparent)] px-2 py-1 font-mono text-[9px] font-medium uppercase tracking-[0.12em] text-[var(--accent-2)]">
                {t("modelImport.fileStatus.ready")}
              </span>
            </div>

            <p className="mt-1 max-w-2xl text-xs leading-5 text-[var(--text-secondary)]">
              {t("modelImport.final.description")}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-5 p-5 sm:p-6">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map(([label, value]) => (
            <div
              key={String(label)}
              className="min-w-0 rounded-xl border border-[var(--border)] bg-[var(--bg)] p-4"
            >
              <p className="font-mono text-[9px] font-medium uppercase tracking-[0.12em] text-[var(--text-secondary)]">
                {label}
              </p>

              <p
                className="mt-2 truncate text-sm font-medium text-[var(--text)]"
                title={String(value)}
              >
                {value}
              </p>
            </div>
          ))}

          <div className="rounded-xl border border-[var(--border)] bg-[var(--bg)] p-4">
            <p className="font-mono text-[9px] font-medium uppercase tracking-[0.12em] text-[var(--text-secondary)]">
              {t("guide.baseColor")}
            </p>

            <div className="mt-2 flex items-center gap-2">
              <span
                aria-hidden="true"
                className="h-5 w-5 shrink-0 rounded-md border border-[var(--border)]"
                style={{ backgroundColor: baseColor }}
              />

              <span className="font-mono text-sm font-medium uppercase text-[var(--text)]">
                {baseColor}
              </span>
            </div>
          </div>
        </div>

        <div className="border-t border-[var(--border)] pt-5">
          <ModelImportCapabilities items={capabilities} />
        </div>

        <div
          className={`
            rounded-xl border px-4 py-3
            ${
              warningCount
                ? "border-[color-mix(in_srgb,var(--accent)_25%,var(--border))] bg-[color-mix(in_srgb,var(--accent)_6%,var(--bg))]"
                : "border-[color-mix(in_srgb,var(--accent-2)_25%,var(--border))] bg-[color-mix(in_srgb,var(--accent-2)_6%,var(--bg))]"
            }
          `}
        >
          <p
            className={`
              text-xs font-medium leading-5
              ${
                warningCount
                  ? "text-[var(--accent)]"
                  : "text-[var(--accent-2)]"
              }
            `}
          >
            {warningCount
              ? t("modelImport.final.warnings", {
                  count: warningCount,
                })
              : t("modelImport.final.noWarnings")}
          </p>
        </div>
      </div>
    </section>
  );
}