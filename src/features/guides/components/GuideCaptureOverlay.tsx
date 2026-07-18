"use client";

import {
  CircleAlert,
  LoaderCircle,
} from "lucide-react";

import { useTranslation } from "@/features/i18n/hooks/useTranslation";

import {
  type GuideCaptureStep,
  useGuideGenerationStore,
} from "../store/guideGenerationStore";

type GuideCaptureOverlayProps = {
  onRetry: () => void;
  onCancel: () => void;
};

export function GuideCaptureOverlay({
  onRetry,
  onCancel,
}: GuideCaptureOverlayProps) {
  const { t } = useTranslation();

  const captureStepLabels: Record<
    GuideCaptureStep,
    string
  > = {
    original: t("capture.original"),
    base: t("capture.base"),
    painted: t("capture.painted"),
    numbers: t("capture.numbers"),
    exploded: t("capture.exploded"),
    "assembly-assets": t(
      "capture.assemblyAssets",
    ),
  };

  const status = useGuideGenerationStore(
    (state) => state.status,
  );

  const currentStep = useGuideGenerationStore(
    (state) => state.currentStep,
  );

  const completedSteps = useGuideGenerationStore(
    (state) => state.completedSteps,
  );

  const totalSteps = useGuideGenerationStore(
    (state) => state.totalSteps,
  );

  if (
    status !== "capturing" &&
    status !== "error"
  ) {
    return null;
  }

  const progress =
    totalSteps > 0
      ? Math.min(
          100,
          Math.max(
            0,
            (completedSteps / totalSteps) * 100,
          ),
        )
      : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-5 backdrop-blur-sm">
      <section
        role={
          status === "error"
            ? "alertdialog"
            : "status"
        }
        aria-live="polite"
        aria-modal="true"
        className="w-full max-w-md overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--card)] text-[var(--text)] shadow-2xl shadow-black/20"
      >
        <div className="border-b border-[var(--border)] px-6 py-5 sm:px-7">
          <div className="flex items-center gap-3">
            <span className="h-1.5 w-8 rounded-full bg-[var(--accent)]" />
            <span className="h-1.5 w-4 rounded-full bg-[var(--accent-2)]" />
            <span className="h-1.5 w-2 rounded-full bg-[var(--border)]" />
          </div>
        </div>

        <div className="p-6 text-center sm:p-7">
          {status === "capturing" ? (
            <>
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--bg)]">
                <LoaderCircle
                  className="h-6 w-6 animate-spin text-[var(--accent)]"
                  strokeWidth={1.8}
                  aria-hidden="true"
                />
              </div>

              <p className="mt-5 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
                {completedSteps} / {totalSteps}
              </p>

              <h2 className="mt-2 font-[family-name:var(--font-space-grotesk)] text-xl font-semibold tracking-[-0.025em] text-[var(--text)]">
                {t("capture.title")}
              </h2>

              <p className="mt-2 min-h-5 text-sm leading-6 text-[var(--text-secondary)]">
                {currentStep
                  ? captureStepLabels[currentStep]
                  : t("capture.preparing")}
              </p>

              <div
                className="mt-7 h-2 overflow-hidden rounded-full bg-[var(--bg)]"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={totalSteps}
                aria-valuenow={completedSteps}
              >
                <div
                  className="h-full rounded-full bg-[var(--accent)] transition-[width] duration-300 ease-out"
                  style={{
                    width: `${progress}%`,
                  }}
                />
              </div>

              <div className="mt-3 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--text-secondary)]">
                <span>
                  {currentStep
                    ? captureStepLabels[currentStep]
                    : t("capture.preparing")}
                </span>

                <span>
                  {Math.round(progress)}%
                </span>
              </div>
            </>
          ) : (
            <>
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10">
                <CircleAlert
                  className="h-6 w-6 text-red-400"
                  strokeWidth={1.8}
                  aria-hidden="true"
                />
              </div>

              <p className="mt-5 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-red-400">
                Error
              </p>

              <h2 className="mt-2 font-[family-name:var(--font-space-grotesk)] text-xl font-semibold tracking-[-0.025em] text-[var(--text)]">
                {t("capture.failed")}
              </h2>

              <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-[var(--text-secondary)]">
                {t("capture.failedDescription")}
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={onRetry}
                  className="inline-flex min-h-11 flex-1 cursor-pointer items-center justify-center rounded-full bg-[var(--accent)] px-5 text-sm font-semibold text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--card)]"
                >
                  {t("common.retry")}
                </button>

                <button
                  type="button"
                  onClick={onCancel}
                  className="inline-flex min-h-11 flex-1 cursor-pointer items-center justify-center rounded-full border border-[var(--border)] bg-transparent px-5 text-sm font-medium text-[var(--text)] transition-colors hover:bg-[var(--bg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--card)]"
                >
                  {t("common.cancel")}
                </button>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}