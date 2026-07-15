"use client";

import { Camera } from "lucide-react";
import { useState, type RefObject } from "react";

import type { ViewerMode } from "../types/ViewerMode";
import type { ModelViewerHandle } from "./ModelViewer";

type ModelCaptureDevControlsProps = {
  viewerRef: RefObject<ModelViewerHandle | null>;
};

const captureModes: ViewerMode[] = [
  "original",
  "base",
  "painted",
  "numbers",
];

export function ModelCaptureDevControls({
  viewerRef,
}: ModelCaptureDevControlsProps) {
  const [capturingMode, setCapturingMode] =
    useState<ViewerMode | null>(null);

  async function handleCapture(mode: ViewerMode) {
    const viewer = viewerRef.current;

    if (!viewer || capturingMode) {
      return;
    }

    setCapturingMode(mode);

    try {
      const image = await viewer.captureView(mode);

      console.info("Model viewer capture", {
        mode,
        length: image.length,
        prefix: image.slice(0, 22),
      });
    } catch (error) {
      console.error(`Failed to capture ${mode} view:`, error);
    } finally {
      setCapturingMode(null);
    }
  }

  return (
    <div className="absolute bottom-20 left-1/2 z-30 flex max-w-[calc(100%-2rem)] -translate-x-1/2 flex-wrap items-center justify-center gap-1 rounded-2xl border border-violet-400/25 bg-neutral-950/90 p-2 shadow-xl backdrop-blur-xl">
      <span className="flex items-center gap-1.5 px-2 text-[10px] font-semibold uppercase tracking-wider text-violet-300">
        <Camera className="h-3.5 w-3.5" />
        Dev capture
      </span>

      {captureModes.map((mode) => (
        <button
          key={mode}
          type="button"
          disabled={capturingMode !== null}
          onClick={() => void handleCapture(mode)}
          className="cursor-pointer rounded-full border border-white/10 px-2.5 py-1.5 text-[11px] font-medium capitalize text-neutral-300 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:text-neutral-600"
        >
          {capturingMode === mode ? "Capturing..." : `Capture ${mode}`}
        </button>
      ))}
    </div>
  );
}
