"use client";

import { useTranslation } from "@/features/i18n/hooks/useTranslation";

import type { ImportTransform, Vector3Tuple } from "../types/ImportTransform";
import type { TransformBounds } from "../lib/getImportTransformBounds";
import type { ModelAnalysis } from "../types/ModelAnalysis";

type ImportTransformPanelProps = {
  analysis: ModelAnalysis;
  transform: ImportTransform;
  bounds: TransformBounds;
  onRotate: (axis: 0 | 1 | 2, direction: -1 | 1) => void;
  onView: (rotation: Vector3Tuple) => void;
  onResetRotation: () => void;
  onReset: () => void;
  onCenter: () => void;
  onNormalize: () => void;
};

const format = (value: number) =>
  Number.isFinite(value) ? value.toFixed(2) : "—";

export function ImportTransformPanel({
  analysis,
  transform,
  bounds,
  onRotate,
  onView,
  onResetRotation,
  onReset,
  onCenter,
  onNormalize,
}: ImportTransformPanelProps) {
  const { t } = useTranslation();

  const views = [
    {
      key: "front",
      value: [0, 0, 0],
    },
    {
      key: "back",
      value: [0, Math.PI, 0],
    },
    {
      key: "left",
      value: [0, -Math.PI / 2, 0],
    },
    {
      key: "right",
      value: [0, Math.PI / 2, 0],
    },
    {
      key: "top",
      value: [-Math.PI / 2, 0, 0],
    },
    {
      key: "bottom",
      value: [Math.PI / 2, 0, 0],
    },
  ] as const;

  const dimensions = [
    {
      label: t("modelImport.transform.width"),
      value: bounds.width,
    },
    {
      label: t("modelImport.transform.height"),
      value: bounds.height,
    },
    {
      label: t("modelImport.transform.depth"),
      value: bounds.depth,
    },
  ];

  const viewLabels = {
    front: t("modelImport.transform.views.front"),
    back: t("modelImport.transform.views.back"),
    left: t("modelImport.transform.views.left"),
    right: t("modelImport.transform.views.right"),
    top: t("modelImport.transform.views.top"),
    bottom: t("modelImport.transform.views.bottom"),
  };

  const extreme =
    Math.max(bounds.width, bounds.height, bounds.depth) > 1e7 ||
    Math.min(bounds.width, bounds.height, bounds.depth) < 1e-7;

  return (
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)]">
      <div className="border-b border-[var(--border)] px-5 py-4 sm:px-6">
        <div className="flex items-start gap-4">
          <div className="flex h-9 w-9 shrink-0 flex-col items-center justify-center gap-0.5 rounded-lg bg-[color-mix(in_srgb,var(--accent)_10%,transparent)]">
            <span className="h-0.5 w-4 rounded-full bg-[var(--accent)]" />
            <span className="h-0.5 w-3 rounded-full bg-[color-mix(in_srgb,var(--accent)_65%,transparent)]" />
            <span className="h-0.5 w-2 rounded-full bg-[color-mix(in_srgb,var(--accent)_35%,transparent)]" />
          </div>

          <div>
            <h3 className="font-[var(--font-space-grotesk)] text-base font-semibold text-[var(--text)]">
              {t("modelImport.transform.title")}
            </h3>

            <p className="mt-1 max-w-2xl text-xs leading-5 text-[var(--text-secondary)]">
              {t("modelImport.transform.description")}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6 p-5 sm:p-6">
        <div>
          <p className="font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-[var(--text-secondary)]">
            {t("modelImport.transform.rotation")}
          </p>

          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {([0, 1, 2] as const).flatMap((axis) =>
              ([-1, 1] as const).map((direction) => (
                <button
                  key={`${axis}-${direction}`}
                  type="button"
                  onClick={() => onRotate(axis, direction)}
                  className="cursor-pointer rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 py-2.5 font-mono text-[11px] font-medium text-[var(--text)] transition hover:border-[color-mix(in_srgb,var(--accent)_35%,var(--border))] hover:bg-[var(--card)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--accent)_25%,transparent)]"
                >
                  {t("modelImport.transform.rotate", {
                    axis: ["X", "Y", "Z"][axis],
                    degrees: direction * 90,
                  })}
                </button>
              )),
            )}
          </div>
        </div>

        <div>
          <p className="font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-[var(--text-secondary)]">
            View
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            {views.map((view) => (
              <button
                key={view.key}
                type="button"
                onClick={() => onView([...view.value])}
                className="cursor-pointer rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-xs font-medium text-[var(--text-secondary)] transition hover:border-[color-mix(in_srgb,var(--accent)_30%,var(--border))] hover:text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--accent)_25%,transparent)]"
              >
                {viewLabels[view.key]}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-[var(--text-secondary)]">
            Dimensions
          </p>

          <div className="mt-3 grid grid-cols-3 gap-2">
            {dimensions.map((item) => (
              <div
                key={item.label}
                className="rounded-xl border border-[var(--border)] bg-[var(--bg)] p-3"
              >
                <p className="text-[10px] text-[var(--text-secondary)]">
                  {item.label}
                </p>

                <p className="mt-1 font-mono text-sm font-medium text-[var(--text)]">
                  {format(item.value)}
                </p>
              </div>
            ))}
          </div>

          <p className="mt-3 font-mono text-[10px] leading-5 text-[var(--text-secondary)]">
            {t("modelImport.transform.center", {
              x: format(bounds.center[0]),
              y: format(bounds.center[1]),
              z: format(bounds.center[2]),
            })}
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-[var(--border)] bg-[var(--bg)] p-4">
            <p className="text-xs text-[var(--text-secondary)]">
              {t("modelImport.transform.originalBounds")}
            </p>

            <p className="mt-2 font-mono text-sm font-medium text-[var(--text)]">
              {format(analysis.bounds.width)} ×{" "}
              {format(analysis.bounds.height)} ×{" "}
              {format(analysis.bounds.depth)}
            </p>
          </div>

          <div className="rounded-xl border border-[color-mix(in_srgb,var(--accent)_28%,var(--border))] bg-[color-mix(in_srgb,var(--accent)_6%,var(--bg))] p-4">
            <p className="text-xs text-[var(--text-secondary)]">
              {t("modelImport.transform.normalizedBounds")}
            </p>

            <p className="mt-2 font-mono text-sm font-medium text-[var(--accent)]">
              {format(bounds.width)} × {format(bounds.height)} ×{" "}
              {format(bounds.depth)}
            </p>
          </div>
        </div>

        {extreme ? (
          <div className="rounded-xl border border-amber-500/25 bg-amber-500/5 px-4 py-3">
            <p className="text-xs leading-5 text-amber-600 dark:text-amber-300">
              {t("modelImport.transform.extremeWarning")}
            </p>
          </div>
        ) : null}

        <div className="flex flex-col gap-3 border-t border-[var(--border)] pt-5 sm:flex-row sm:flex-wrap sm:items-center">
          <button
            type="button"
            onClick={onResetRotation}
            className="cursor-pointer rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-2.5 text-xs font-medium text-[var(--text-secondary)] transition hover:bg-[var(--card)] hover:text-[var(--text)]"
          >
            {t("modelImport.transform.resetRotation")}
          </button>

          <button
            type="button"
            onClick={onReset}
            className="cursor-pointer rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-2.5 text-xs font-medium text-[var(--text-secondary)] transition hover:bg-[var(--card)] hover:text-[var(--text)]"
          >
            {t("modelImport.transform.reset")}
          </button>

          <button
            type="button"
            onClick={onCenter}
            className="cursor-pointer rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-2.5 text-xs font-medium text-[var(--text-secondary)] transition hover:border-[color-mix(in_srgb,var(--accent)_30%,var(--border))] hover:text-[var(--text)]"
          >
            {t("modelImport.transform.autoCenter")}
          </button>

          <button
            type="button"
            onClick={onNormalize}
            className="cursor-pointer rounded-xl bg-[var(--accent)] px-4 py-2.5 text-xs font-semibold text-white transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--accent)_30%,transparent)] sm:ml-auto"
          >
            {t("modelImport.transform.autoNormalize")}
          </button>
        </div>
      </div>

      <span className="sr-only">{transform.scale}</span>
    </section>
  );
}