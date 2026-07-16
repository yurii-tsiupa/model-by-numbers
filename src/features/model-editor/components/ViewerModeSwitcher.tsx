"use client";

import {
  Box,
  Hash,
  Layers3,
  Paintbrush,
  UnfoldHorizontal,
} from "lucide-react";

import { useModelEditorStore } from "../store/modelEditorStore";
import type { ViewerMode } from "../types/ViewerMode";
import { useTranslation } from "@/features/i18n/hooks/useTranslation";

const viewerModes: Array<{
  id: ViewerMode;
  icon: typeof Box;
}> = [
  {
    id: "original",
    icon: Layers3,
  },
  {
    id: "base",
    icon: Box,
  },
  {
    id: "painted",
    icon: Paintbrush,
  },
  {
    id: "numbers",
    icon: Hash,
  },
  {id:"exploded",icon:UnfoldHorizontal},
];

export function ViewerModeSwitcher() {
  const {t}=useTranslation();
  const viewerMode = useModelEditorStore(
    (state) => state.viewerMode,
  );

  const setViewerMode = useModelEditorStore(
    (state) => state.setViewerMode,
  );
  const parts=useModelEditorStore(state=>state.parts);

  return (
    <div className="pointer-events-auto flex items-center gap-1 rounded-full border border-white/10 bg-black/70 p-1.5 shadow-2xl shadow-black/50 backdrop-blur-xl">
      {viewerModes.map((mode) => {
        const Icon = mode.icon;
        const isActive =
          viewerMode === mode.id;
        const unavailable=mode.id==="exploded"&&parts.length<2;

        return (
          <button
            key={mode.id}
            type="button"
            disabled={unavailable}
            onClick={() =>
              setViewerMode(mode.id)
            }
            title={unavailable?`${t("exploded.unavailable")} — ${t("exploded.singlePart")}`:mode.id==="exploded"?t("shortcuts.exploded"):t("viewer.mode",{mode:t(`viewer.${mode.id}`)})}
            aria-label={unavailable?t("exploded.unavailable"):t("viewer.mode",{mode:t(`viewer.${mode.id}`)})}
            aria-pressed={isActive}
            className={`flex h-9 cursor-pointer items-center gap-2 rounded-full px-3 text-xs font-medium transition ${
              isActive
                ? "bg-orange-400/15 text-orange-300"
                : "text-neutral-500 hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-35"
            }`}
          >
            <Icon className="h-4 w-4" />

            <span className="hidden sm:inline">
              {t(`viewer.${mode.id}`)}
            </span>
          </button>
        );
      })}
    </div>
  );
}
