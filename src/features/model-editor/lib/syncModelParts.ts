import {
  Color,
  Mesh,
  MeshStandardMaterial,
  type Object3D,
} from "three";

import type { ModelPart } from "../types/ModelPart";
import {
  getOriginalEmissive,
  getOriginalEmissiveIntensity,
} from "./prepareModelMeshes";

const SELECTED_EMISSIVE_COLOR = new Color(
  "#f97316",
);

const SELECTED_EMISSIVE_INTENSITY = 0.28;

function updateMaterialSelection(
  material: MeshStandardMaterial,
  isSelected: boolean,
): void {
  if (isSelected) {
    material.emissive.copy(
      SELECTED_EMISSIVE_COLOR,
    );

    material.emissiveIntensity =
      SELECTED_EMISSIVE_INTENSITY;
  } else {
    material.emissive.setHex(
      getOriginalEmissive(material),
    );

    material.emissiveIntensity =
      getOriginalEmissiveIntensity(material);
  }

  material.needsUpdate = true;
}

function updateMeshSelection(
  mesh: Mesh,
  isSelected: boolean,
): void {
  const materials = Array.isArray(mesh.material)
    ? mesh.material
    : [mesh.material];

  materials.forEach((material) => {
    if (!(material instanceof MeshStandardMaterial)) {
      return;
    }

    updateMaterialSelection(
      material,
      isSelected,
    );
  });
}

export function syncModelParts({
  model,
  parts,
  selectedPartId,
}: {
  model: Object3D;
  parts: ModelPart[];
  selectedPartId: string | null;
}): void {
  const partsByMeshUuid = new Map(
    parts.map((part) => [
      part.meshUuid,
      part,
    ]),
  );

  model.traverse((object) => {
    if (!(object instanceof Mesh)) {
      return;
    }

    const part = partsByMeshUuid.get(
      object.uuid,
    );

    if (!part) {
      return;
    }

    object.visible = part.visible;

    updateMeshSelection(
      object,
      selectedPartId === part.id,
    );
  });
}