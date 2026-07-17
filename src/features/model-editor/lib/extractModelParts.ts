import {
  Color,
  Mesh,
  type Material,
  type Object3D,
} from "three";

import type { ModelPart } from "../types/ModelPart";
import { DEFAULT_PART_PAINTING_WORKFLOW } from "../types/PaintingWorkflow";

type MaterialWithColor = Material & {
  color: Color;
};

function hasMaterialColor(
  material: Material,
): material is MaterialWithColor {
  return (
    "color" in material &&
    material.color instanceof Color
  );
}

function getMeshOriginalColor(
  mesh: Mesh,
): string | null {
  const materials = Array.isArray(mesh.material)
    ? mesh.material
    : [mesh.material];

  const materialWithColor = materials.find(
    hasMaterialColor,
  );

  if (!materialWithColor) {
    return null;
  }

  return `#${materialWithColor.color.getHexString()}`;
}

function createFallbackPartName(
  index: number,
): string {
  return `P${String(index + 1).padStart(2, "0")}`;
}

export function extractModelParts(
  rootObject: Object3D,
): ModelPart[] {
  const parts: ModelPart[] = [];

  rootObject.traverse((object) => {
    if (!(object instanceof Mesh)) {
      return;
    }

    const index = parts.length;
    const trimmedName = object.name.trim();

    parts.push({
      id: `part-${index}`,
      meshUuid: object.uuid,
      sourcePartKey: typeof object.userData.sourcePartKey === "string" ? object.userData.sourcePartKey : undefined,
      name:
        trimmedName ||
        createFallbackPartName(index),
      index,
      visible: object.visible,
      includeInGuide: true,
      color: null,
      paletteColorId: null,
      explodedOffset: null,
      paintingWorkflow: { ...DEFAULT_PART_PAINTING_WORKFLOW, stages: [] },
      originalColor: getMeshOriginalColor(object),
    });
  });

  return parts;
}
