import type { ProjectPart } from "@/features/models/types/ProjectPart";

import type { ModelPart } from "../types/ModelPart";

export function mergeModelParts(
  extractedParts: ModelPart[],
  savedParts: ProjectPart[],
): ModelPart[] {
  const savedPartsById = new Map(
    savedParts.map((part) => [part.id, part]),
  );

  return extractedParts.map((part) => {
    const savedPart = savedPartsById.get(part.id);

    if (!savedPart) {
      return part;
    }

    return {
      ...part,
      name: savedPart.name || part.name,
      visible: savedPart.visible,
      includeInGuide: savedPart.includeInGuide !== false,

      // Legacy projects may still contain direct HEX values.
      color: savedPart.paletteColorId
        ? null
        : savedPart.color,

      paletteColorId:
        savedPart.paletteColorId ?? null,
    };
  });
}
