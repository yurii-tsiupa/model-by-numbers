import type { ManualDetail } from "@/features/models/types/ManualDetail";
import type { PaintingStage } from "@/features/model-editor/types/PaintingWorkflow";

import type { GuidePaletteColor, GuidePart } from "../types/ModelGuide";
import type { GuidePaintingStepColor } from "../types/GuidePaintingStep";

type SnapshotPaletteColor = Pick<
  GuidePaletteColor,
  "id" | "number" | "name" | "hex"
>;

export type ResolvedGuideStepColor = {
  paletteColorId: string | null;
  color: GuidePaintingStepColor | null;
  status: "resolved" | "none" | "missing";
};

export function resolveGuideStepColor({
  stage,
  detailsById,
  partsById,
  paletteById,
}: {
  stage: PaintingStage;
  detailsById: ReadonlyMap<string, ManualDetail>;
  partsById: ReadonlyMap<string, GuidePart>;
  paletteById: ReadonlyMap<string, SnapshotPaletteColor>;
}): ResolvedGuideStepColor {
  const snapshotStage = stage as Omit<PaintingStage, "paletteColorId"> & {
    paletteColorId?: string | null;
  };
  const detailReference = stage.targetReferences?.find(
    (reference) => reference.type === "manualDetail",
  );
  const detailColorId = detailReference
    ? detailsById.get(detailReference.id)?.colorId
    : undefined;

  // Marker and region Steps save their assignment on the referenced Detail.
  // Color Parts and whole-model Steps save it directly on the Step.
  let paletteColorId = detailReference
    ? detailColorId ?? null
    : snapshotStage.paletteColorId ?? null;

  // Genuinely old Color Parts snapshots can predate the Step field. Use the
  // snapshotted part assignment only in that legacy shape, never live state.
  if (
    !detailReference &&
    !("paletteColorId" in snapshotStage)
  ) {
    const partReference = snapshotStage.targetReferences?.find(
      (reference) => reference.type === "part",
    );
    paletteColorId = partReference
      ? partsById.get(partReference.id)?.paletteColorId ?? null
      : null;
  }

  if (!paletteColorId) {
    return { paletteColorId: null, color: null, status: "none" };
  }

  const paletteColor = paletteById.get(paletteColorId);
  if (!paletteColor) {
    return { paletteColorId, color: null, status: "missing" };
  }

  return {
    paletteColorId,
    color: {
      id: paletteColor.id,
      number: paletteColor.number,
      name: paletteColor.name,
      hex: paletteColor.hex,
    },
    status: "resolved",
  };
}
