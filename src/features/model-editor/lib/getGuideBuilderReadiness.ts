import type { ModelPart } from "../types/ModelPart";
import type { PaletteColor } from "@/features/models/types/PaletteColor";
import type { PaintMarker } from "@/features/models/types/PaintMarker";

export type GuideBuilderReadiness = {
  hasDetails: boolean;
  hasAssignedColors: boolean;
  hasPaintingSteps: boolean;
};

export function getGuideBuilderReadiness(parts: readonly ModelPart[], palette: readonly PaletteColor[], markers: readonly PaintMarker[] = []): GuideBuilderReadiness {
  const details = parts.filter((part) => part.includeInGuide);
  const paletteIds = new Set(palette.map((color) => color.id));
  return {
    hasDetails: details.length > 0 || markers.length > 0,
    hasAssignedColors: details.some((part) => Boolean(part.paletteColorId && paletteIds.has(part.paletteColorId))) || markers.some((marker) => Boolean(marker.colorId && paletteIds.has(marker.colorId))),
    hasPaintingSteps: details.some((part) => part.paintingWorkflow.stages.length > 0),
  };
}
