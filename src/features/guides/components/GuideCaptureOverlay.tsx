"use client";

import { CircleAlert, LoaderCircle } from "lucide-react";

import {
  type GuideCaptureStep,
  useGuideGenerationStore,
} from "../store/guideGenerationStore";

type GuideCaptureOverlayProps = {
  onRetry: () => void;
  onCancel: () => void;
};

const captureStepLabels: Record<GuideCaptureStep, string> = {
  original: "Capturing original view...",
  base: "Capturing base view...",
  painted: "Capturing painted view...",
  numbers: "Capturing numbered view...",
};

export function GuideCaptureOverlay({
  onRetry,
  onCancel,
}: GuideCaptureOverlayProps) {
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

  if (status !== "capturing" && status !== "error") {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-5 backdrop-blur-md">
      <section
        role={status === "error" ? "alertdialog" : "status"}
        aria-live="polite"
        aria-modal="true"
        className="w-full max-w-md rounded-3xl border border-white/10 bg-neutral-950 p-7 text-center shadow-2xl"
      >
        {status === "capturing" ? (
          <>
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-orange-400/20 bg-orange-400/10">
              <LoaderCircle className="h-6 w-6 animate-spin text-orange-300" />
            </div>
            <h2 className="mt-5 text-xl font-semibold text-white">
              Preparing your guide
            </h2>
            <p className="mt-2 text-sm text-neutral-400">
              {currentStep
                ? captureStepLabels[currentStep]
                : "Preparing model capture..."}
            </p>
            <div className="mt-6 h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
              <div
                className="h-full rounded-full bg-orange-400 transition-[width]"
                style={{
                  width: `${(completedSteps / totalSteps) * 100}%`,
                }}
              />
            </div>
            <p className="mt-3 text-xs font-medium text-neutral-500">
              {completedSteps} / {totalSteps}
            </p>
          </>
        ) : (
          <>
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-red-400/20 bg-red-400/10">
              <CircleAlert className="h-6 w-6 text-red-400" />
            </div>
            <h2 className="mt-5 text-xl font-semibold text-white">
              We could not prepare the guide preview.
            </h2>
            <p className="mt-2 text-sm leading-6 text-neutral-500">
              The model views could not be captured. Please try again.
            </p>
            <div className="mt-6 flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={onRetry}
                className="flex-1 cursor-pointer rounded-full bg-orange-400 px-4 py-2.5 text-sm font-semibold text-neutral-950 transition hover:bg-orange-300"
              >
                Try Again
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 cursor-pointer rounded-full border border-white/10 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/[0.05]"
              >
                Cancel
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
