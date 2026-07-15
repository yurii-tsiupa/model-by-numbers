import {
  Color,
  Mesh,
  type Material,
  type Object3D,
} from "three";

import type { ModelPart } from "../types/ModelPart";

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
  return `Part ${String(index + 1).padStart(2, "0")}`;
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
      name:
        trimmedName ||
        createFallbackPartName(index),
      index,
      visible: object.visible,
      color: null,
      paletteColorId: null,
      originalColor: getMeshOriginalColor(object),
    });
  });

  return parts;
}