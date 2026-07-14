import { Mesh, type Object3D } from "three";

import type { ModelPart } from "../types/ModelPart";

function createFallbackPartName(index: number): string {
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
      id: object.uuid,
      meshUuid: object.uuid,
      name: trimmedName || createFallbackPartName(index),
      index,
      visible: object.visible,
    });
  });

  return parts;
}