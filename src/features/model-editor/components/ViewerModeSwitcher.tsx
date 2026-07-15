"use client";

import {
  Box,
  Hash,
  Layers3,
  Paintbrush,
} from "lucide-react";

import { useModelEditorStore } from "../store/modelEditorStore";
import type { ViewerMode } from "../types/ViewerMode";

const viewerModes: Array<{
  id: ViewerMode;
  label: string;
  icon: typeof Box;
}> = [
  {
    id: "original",
    label: "Original",
    icon: Layers3,
  },
  {
    id: "base",
    label: "Base",
    icon: Box,
  },
  {
    id: "painted",
    label: "Painted",
    icon: Paintbrush,
  },
  {
    id: "numbers",
    label: "Numbers",
    icon: Hash,
  },
];

export function ViewerModeSwitcher() {
  const viewerMode = useModelEditorStore(
    (state) => state.viewerMode,
  );

  const setViewerMode = useModelEditorStore(
    (state) => state.setViewerMode,
  );

  return (
    <div className="pointer-events-auto flex items-center gap-1 rounded-full border border-white/10 bg-black/70 p-1.5 shadow-2xl shadow-black/50 backdrop-blur-xl">
      {viewerModes.map((mode) => {
        const Icon = mode.icon;
        const isActive =
          viewerMode === mode.id;

        return (
          <button
            key={mode.id}
            type="button"
            onClick={() =>
              setViewerMode(mode.id)
            }
            title={`${mode.label} mode`}
            aria-label={`${mode.label} mode`}
            aria-pressed={isActive}
            className={`flex h-9 cursor-pointer items-center gap-2 rounded-full px-3 text-xs font-medium transition ${
              isActive
                ? "bg-orange-400/15 text-orange-300"
                : "text-neutral-500 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Icon className="h-4 w-4" />

            <span className="hidden sm:inline">
              {mode.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}