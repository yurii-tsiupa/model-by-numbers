import type { ModelPart } from "../types/ModelPart";
import type { PaletteColor } from "@/features/models/types/PaletteColor";
import type { ManualDetail } from "@/features/models/types/ManualDetail";

export type GuideBuilderReadiness = {
  hasDetails: boolean;
  hasAssignedColors: boolean;
  hasPaintingSteps: boolean;
};

export function getGuideBuilderReadiness(parts:readonly ModelPart[],palette:readonly PaletteColor[],manualDetails:readonly ManualDetail[]=[]):GuideBuilderReadiness {
  const details = parts.filter((part) => part.includeInGuide);
  const paletteIds = new Set(palette.map((color) => color.id));
  return {
    hasDetails:details.length>0||manualDetails.some(detail=>detail.pins.length>0),
    hasAssignedColors:details.some(part=>Boolean(part.paletteColorId&&paletteIds.has(part.paletteColorId)))||manualDetails.some(detail=>Boolean(detail.colorId&&paletteIds.has(detail.colorId))),
    hasPaintingSteps: details.some((part) => part.paintingWorkflow.stages.length > 0),
  };
}
