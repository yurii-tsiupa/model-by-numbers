import type { ProjectPart } from "@/features/models/types/ProjectPart";

import type { ModelPart } from "../types/ModelPart";

export function mergeModelParts(
  extractedParts: ModelPart[],
  savedParts: ProjectPart[],
  authoritativeImport = false,
): ModelPart[] {
  const savedPartsById = new Map(
    savedParts.map((part) => [part.id, part]),
  );

  const savedPartsByMeshUuid = new Map(savedParts.filter(part=>part.meshUuid).map(part=>[part.meshUuid,part]));
  return extractedParts.flatMap((part) => {
    const savedPart = savedPartsByMeshUuid.get(part.meshUuid) ?? savedPartsById.get(part.id);

    if (!savedPart) {
      return authoritativeImport ? [] : [part];
    }

    return [{
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
      explodedOffset: savedPart.explodedOffset ?? null,
    }];
  });
}
