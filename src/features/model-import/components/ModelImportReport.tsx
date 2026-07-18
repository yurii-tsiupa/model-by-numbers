"use client";

import {
  Check,
  CheckCircle2,
  ChevronDown,
  Copy,
  FileText,
  RotateCcw,
} from "lucide-react";
import { useState } from "react";

import { useTranslation } from "@/features/i18n/hooks/useTranslation";
import { formatLocalizedNumber } from "@/features/i18n/lib/i18n";

import { analyzeModelHealth } from "../analysis/analyzeModelHealth";
import { createTechnicalImportReport } from "../lib/createTechnicalImportReport";
import type { ModelAnalysis } from "../types/ModelAnalysis";
import type { ModelUnits } from "../types/ModelUnits";
import type { OrientationConfidence } from "../types/OrientationSuggestion";

type CategoryKey =
  | "geometry"
  | "performance"
  | "structure"
  | "printability";

type ModelImportReportProps = {
  analysis: ModelAnalysis;
  modelUnits: ModelUnits | null;
  orientationConfidence: OrientationConfidence | null;
  onChooseAnother: () => void;
};

const CATEGORY_TONE = {
  excellent: {
    border:
      "border-[color-mix(in_srgb,var(--accent-2)_30%,var(--border))]",
    background:
      "bg-[color-mix(in_srgb,var(--accent-2)_5%,var(--card))]",
    text: "text-[var(--accent-2)]",
  },
  good: {
    border:
      "border-[color-mix(in_srgb,var(--accent-2)_22%,var(--border))]",
    background:
      "bg-[color-mix(in_srgb,var(--accent-2)_3%,var(--card))]",
    text: "text-[var(--accent-2)]",
  },
  warning: {
    border:
      "border-[color-mix(in_srgb,var(--accent)_30%,var(--border))]",
    background:
      "bg-[color-mix(in_srgb,var(--accent)_5%,var(--card))]",
    text: "text-[var(--accent)]",
  },
  critical: {
    border: "border-red-500/30",
    background: "bg-red-500/5",
    text: "text-red-500",
  },
} as const;

const RECOMMENDATION_TONE = {
  info: {
    border: "border-[var(--border)]",
    accent: "bg-[var(--text-secondary)]",
  },
  warning: {
    border:
      "border-[color-mix(in_srgb,var(--accent)_28%,var(--border))]",
    accent: "bg-[var(--accent)]",
  },
  critical: {
    border: "border-red-500/30",
    accent: "bg-red-500",
  },
} as const;

export function ModelImportReport({
  analysis,
  modelUnits,
  orientationConfidence,
  onChooseAnother,
}: ModelImportReportProps) {
  const { t, locale } = useTranslation();

  const [expanded, setExpanded] = useState<Set<CategoryKey>>(
    new Set(),
  );
  const [isCopied, setIsCopied] = useState(false);

  const health = analyzeModelHealth({
    analysis,
    modelUnits,
    orientationConfidence,
  });

  const categories = Object.entries(
    health.categories,
  ) as Array<
    [
      CategoryKey,
      (typeof health.categories)[CategoryKey],
    ]
  >;

  const details: Record<
    CategoryKey,
    Array<[string, string]>
  > = {
    geometry: [
      [
        t("modelImport.report.triangles"),
        formatLocalizedNumber(
          analysis.geometry.trianglesCount,
          locale,
        ),
      ],
      [
        t("modelImport.health.details.invalidGeometry"),
        formatLocalizedNumber(
          analysis.geometry.invalidGeometriesCount,
          locale,
        ),
      ],
      [
        t("modelImport.report.dimensions"),
        `${analysis.bounds.width.toFixed(
          2,
        )} × ${analysis.bounds.height.toFixed(
          2,
        )} × ${analysis.bounds.depth.toFixed(2)}`,
      ],
    ],
    performance: [
      [
        t("modelImport.report.performance"),
        t(
          `modelImport.performance.${analysis.performanceLevel}`,
        ),
      ],
      [
        t("modelImport.health.details.textureMemory"),
        `${(
          analysis.textures.estimatedMemoryBytes /
          1024 /
          1024
        ).toFixed(1)} MB`,
      ],
      [
        t("modelImport.report.fileSize"),
        `${(
          analysis.file.sizeBytes /
          1024 /
          1024
        ).toFixed(1)} MB`,
      ],
    ],
    structure: [
      [
        t("modelImport.report.parts"),
        formatLocalizedNumber(
          analysis.parts.length,
          locale,
        ),
      ],
      [
        t("modelImport.report.meshes"),
        formatLocalizedNumber(
          analysis.scene.meshesCount,
          locale,
        ),
      ],
      [
        t("modelImport.health.details.hiddenParts"),
        formatLocalizedNumber(
          analysis.parts.filter((part) => !part.visible)
            .length,
          locale,
        ),
      ],
    ],
    printability: [
      [
        t("projectInfo.units"),
        modelUnits
          ? t(`modelImport.units.${modelUnits}`)
          : t("projectInfo.unknown"),
      ],
      [
        t("modelImport.health.details.orientation"),
        orientationConfidence
          ? t(
              `modelImport.health.confidence.${orientationConfidence}`,
            )
          : t("projectInfo.unknown"),
      ],
      [
        t("modelImport.report.format"),
        t(
          `modelImport.formats.${
            analysis.format ?? "glb"
          }`,
        ),
      ],
    ],
  };

  const summaryItems = [
    [
      t("modelImport.report.format"),
      t(
        `modelImport.formats.${analysis.format ?? "glb"}`,
      ),
    ],
    [
      t("modelImport.report.fileSize"),
      `${(
        analysis.file.sizeBytes /
        1024 /
        1024
      ).toFixed(1)} MB`,
    ],
    [
      t("modelImport.report.parts"),
      formatLocalizedNumber(
        analysis.parts.length,
        locale,
      ),
    ],
    [
      t("modelImport.report.triangles"),
      formatLocalizedNumber(
        analysis.geometry.trianglesCount,
        locale,
      ),
    ],
  ];

  function toggle(key: CategoryKey) {
    setExpanded((current) => {
      const next = new Set(current);

      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }

      return next;
    });
  }

  async function copyReport() {
    await navigator.clipboard.writeText(
      createTechnicalImportReport({
        analysis,
        format: analysis.format ?? "glb",
        userAgent: navigator.userAgent,
      }),
    );

    setIsCopied(true);

    window.setTimeout(() => {
      setIsCopied(false);
    }, 1800);
  }

  const overallTone =
    health.overallStatus === "poor"
      ? CATEGORY_TONE.critical
      : health.overallStatus === "acceptable"
        ? CATEGORY_TONE.warning
        : CATEGORY_TONE[health.overallStatus];

  return (
    <section className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)]">
      <div className="border-b border-[var(--border)] px-5 py-4 sm:px-6">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[color-mix(in_srgb,var(--accent-2)_28%,var(--border))] bg-[color-mix(in_srgb,var(--accent-2)_8%,var(--bg))] text-[var(--accent-2)]">
            <CheckCircle2 className="h-5 w-5" />
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-[var(--font-space-grotesk)] text-base font-semibold text-[var(--text)]">
                {t("modelImport.report.success")}
              </h3>

              <span className="rounded-md bg-[color-mix(in_srgb,var(--accent-2)_10%,transparent)] px-2 py-1 font-mono text-[9px] font-medium uppercase tracking-[0.12em] text-[var(--accent-2)]">
                {t("modelImport.fileStatus.ready")}
              </span>
            </div>

            <p className="mt-1 text-xs leading-5 text-[var(--text-secondary)]">
              {t("modelImport.health.overall")}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6 p-5 sm:p-6">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {summaryItems.map(([label, value]) => (
            <div
              key={label}
              className="min-w-0 rounded-xl border border-[var(--border)] bg-[var(--bg)] p-4"
            >
              <p className="font-mono text-[9px] font-medium uppercase tracking-[0.12em] text-[var(--text-secondary)]">
                {label}
              </p>

              <p
                title={value}
                className="mt-2 truncate font-mono text-sm font-medium text-[var(--text)]"
              >
                {value}
              </p>
            </div>
          ))}
        </div>

        <section
          className={`rounded-2xl border p-5 ${overallTone.border} ${overallTone.background}`}
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="font-mono text-[9px] font-medium uppercase tracking-[0.14em] text-[var(--text-secondary)]">
                {t("modelImport.health.overall")}
              </p>

              <p className="mt-2 font-[var(--font-space-grotesk)] text-4xl font-semibold tracking-tight text-[var(--text)]">
                {health.overallScore}
                <span className="ml-1 text-sm font-normal text-[var(--text-secondary)]">
                  / 100
                </span>
              </p>
            </div>

            <span
              className={`w-fit rounded-lg border px-3 py-1.5 font-mono text-[10px] font-medium uppercase tracking-[0.08em] ${overallTone.border} ${overallTone.text}`}
            >
              {t(
                `modelImport.health.overallStatus.${health.overallStatus}`,
              )}
            </span>
          </div>

          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[var(--border)]">
            <div
              className="h-full rounded-full bg-[var(--accent-2)] transition-[width] duration-500"
              style={{
                width: `${Math.min(
                  100,
                  Math.max(0, health.overallScore),
                )}%`,
              }}
            />
          </div>
        </section>

        <div className="space-y-3">
          {categories.map(([key, value]) => {
            const isExpanded = expanded.has(key);
            const tone = CATEGORY_TONE[value.status];

            return (
              <section
                key={key}
                className={`overflow-hidden rounded-xl border ${tone.border} ${tone.background}`}
              >
                <button
                  type="button"
                  onClick={() => toggle(key)}
                  aria-expanded={isExpanded}
                  className="flex w-full cursor-pointer items-center justify-between gap-4 p-4 text-left transition hover:bg-[color-mix(in_srgb,var(--text)_2%,transparent)]"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div
                      className={`h-2 w-2 shrink-0 rounded-full ${tone.text} bg-current`}
                    />

                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-[var(--text)]">
                        {t(
                          `modelImport.health.category.${key}`,
                        )}
                      </p>

                      <p
                        className={`mt-1 font-mono text-[10px] ${tone.text}`}
                      >
                        {value.score}/100 ·{" "}
                        {t(
                          `modelImport.health.categoryStatus.${value.status}`,
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <span className="hidden text-[10px] text-[var(--text-secondary)] sm:inline">
                      {t(
                        isExpanded
                          ? "modelImport.health.hideDetails"
                          : "modelImport.health.showDetails",
                      )}
                    </span>

                    <ChevronDown
                      className={`h-4 w-4 text-[var(--text-secondary)] transition-transform ${
                        isExpanded ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                </button>

                {isExpanded ? (
                  <dl className="grid gap-px border-t border-[var(--border)] bg-[var(--border)] sm:grid-cols-2">
                    {details[key].map(([label, value]) => (
                      <div
                        key={label}
                        className="min-w-0 bg-[var(--bg)] p-4"
                      >
                        <dt className="font-mono text-[9px] uppercase tracking-[0.1em] text-[var(--text-secondary)]">
                          {label}
                        </dt>

                        <dd
                          title={value}
                          className="mt-1.5 truncate text-xs font-medium text-[var(--text)]"
                        >
                          {value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                ) : null}
              </section>
            );
          })}
        </div>

        {health.recommendations.length ? (
          <section>
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-[var(--text-secondary)]" />

              <h4 className="font-[var(--font-space-grotesk)] text-sm font-semibold text-[var(--text)]">
                {t(
                  "modelImport.health.recommendations.title",
                )}
              </h4>
            </div>

            <div className="mt-3 space-y-2">
              {health.recommendations.map((item) => {
                const tone =
                  RECOMMENDATION_TONE[item.severity];

                return (
                  <article
                    key={item.code}
                    className={`relative overflow-hidden rounded-xl border bg-[var(--bg)] p-4 pl-5 ${tone.border}`}
                  >
                    <span
                      aria-hidden="true"
                      className={`absolute inset-y-0 left-0 w-1 ${tone.accent}`}
                    />

                    <p className="text-xs font-medium text-[var(--text)]">
                      {t(item.titleKey)}
                    </p>

                    <p className="mt-1 text-xs leading-5 text-[var(--text-secondary)]">
                      {t(item.descriptionKey)}
                    </p>
                  </article>
                );
              })}
            </div>
          </section>
        ) : null}
      </div>

      <div className="border-t border-[var(--border)] bg-[var(--bg)] px-5 py-4 sm:px-6">
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={onChooseAnother}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-2.5 text-xs font-medium text-[var(--text-secondary)] transition hover:text-[var(--text)] sm:w-auto"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            {t("modelImport.actions.chooseAnother")}
          </button>

          <button
            type="button"
            onClick={() => void copyReport()}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-4 py-2.5 text-xs font-semibold text-white transition hover:opacity-90 sm:w-auto"
          >
            {isCopied ? (
              <Check className="h-3.5 w-3.5" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}

            {isCopied
              ? t("common.copied")
              : t("modelImport.actions.copyReport")}
          </button>
        </div>
      </div>
    </section>
  );
}