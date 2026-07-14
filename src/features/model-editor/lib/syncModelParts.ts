import {
  Color,
  Mesh,
  MeshStandardMaterial,
  type Material,
  type Object3D,
} from "three";

import type { ModelPart } from "../types/ModelPart";
import {
  getOriginalEmissive,
  getOriginalEmissiveIntensity,
  getOriginalMaterialColor,
} from "./prepareModelMeshes";

const SELECTED_EMISSIVE_COLOR = new Color(
  "#f97316",
);

const SELECTED_EMISSIVE_INTENSITY = 0.28;

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

function updateMaterialColor(
  material: Material,
  assignedColor: string | null,
): void {
  if (!hasMaterialColor(material)) {
    return;
  }

  if (assignedColor) {
    material.color.set(assignedColor);
  } else {
    const originalColor =
      getOriginalMaterialColor(material);

    if (originalColor !== null) {
      material.color.setHex(originalColor);
    }
  }

  material.needsUpdate = true;
}

function updateMaterialSelection(
  material: Material,
  isSelected: boolean,
): void {
  if (
    !(
      material instanceof
      MeshStandardMaterial
    )
  ) {
    return;
  }

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

function syncMeshMaterials({
  mesh,
  assignedColor,
  isSelected,
}: {
  mesh: Mesh;
  assignedColor: string | null;
  isSelected: boolean;
}): void {
  const materials = Array.isArray(
    mesh.material,
  )
    ? mesh.material
    : [mesh.material];

  materials.forEach((material) => {
    updateMaterialColor(
      material,
      assignedColor,
    );

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

    syncMeshMaterials({
      mesh: object,
      assignedColor: part.color,
      isSelected:
        selectedPartId === part.id,
    });
  });
}