import type { ReviewedDetectedModelPart } from "@/features/model-import/types/ReviewedDetectedModelPart";

import type { ProjectPart } from "../types/ProjectPart";

export function buildInitialProjectParts(
  reviewedParts: ReviewedDetectedModelPart[],
): ProjectPart[] {
  return reviewedParts
    .filter((part) => part.includeInProject)
    .map((part) => ({
      id: `part-${Math.max(0, Number(part.id.slice(5)) - 1)}`,
      meshUuid: part.meshUuid,
      ...(part.sourcePartKey
        ? { sourcePartKey: part.sourcePartKey }
        : {}),
      name: part.editedName.trim().replace(/\s+/g, " "),
      visible: true,
      includeInGuide: true,
      color: null,
      paletteColorId: null,
      explodedOffset: null,
    }));
}
