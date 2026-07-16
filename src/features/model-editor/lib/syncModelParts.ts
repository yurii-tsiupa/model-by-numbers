import type { PaletteColor } from "@/features/models/types/PaletteColor";

import {
  Color,
  Mesh,
  MeshStandardMaterial,
  type Material,
  type Object3D,
} from "three";

import type { ModelPart } from "../types/ModelPart";
import type { ViewerMode } from "../types/ViewerMode";
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

type SyncMeshMaterialsParams = {
  mesh: Mesh;
  viewerMode: ViewerMode;
  baseColor: string;
  paintedColor: string | null;
  isSelected: boolean;
};

function hasMaterialColor(
  material: Material,
): material is MaterialWithColor {
  return (
    "color" in material &&
    material.color instanceof Color
  );
}

function restoreOriginalMaterialColor(
  material: Material,
): void {
  if (!hasMaterialColor(material)) {
    return;
  }

  const originalColor =
    getOriginalMaterialColor(material);

  if (originalColor !== null) {
    material.color.setHex(originalColor);
  }

  material.needsUpdate = true;
}

function updateMaterialDisplayColor({
  material,
  viewerMode,
  baseColor,
  paintedColor,
}: {
  material: Material;
  viewerMode: ViewerMode;
  baseColor: string;
  paintedColor: string | null;
}): void {
  if (!hasMaterialColor(material)) {
    return;
  }

  switch (viewerMode) {
    case "original": {
      restoreOriginalMaterialColor(material);
      return;
    }

    case "base": {
      material.color.set(baseColor);
      material.needsUpdate = true;
      return;
    }

    case "painted":
    case "numbers":
    case "exploded": {
      material.color.set(
        paintedColor ?? baseColor,
      );

      material.needsUpdate = true;
      return;
    }

    default: {
      restoreOriginalMaterialColor(material);
    }
  }
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
  viewerMode,
  baseColor,
  paintedColor,
  isSelected,
}: SyncMeshMaterialsParams): void {
  const materials = Array.isArray(
    mesh.material,
  )
    ? mesh.material
    : [mesh.material];

  materials.forEach((material) => {
    updateMaterialDisplayColor({
      material,
      viewerMode,
      baseColor,
      paintedColor,
    });

    updateMaterialSelection(
      material,
      isSelected,
    );
  });
}

export function syncModelParts({
  model,
  parts,
  palette,
  viewerMode,
  baseColor,
  selectedPartId,
  selectedPartIds,
  highlightedPaletteColorId,
}: {
  model: Object3D;
  parts: ModelPart[];
  palette: PaletteColor[];
  viewerMode: ViewerMode;
  baseColor: string;
  selectedPartId: string | null;
  selectedPartIds: string[];
  highlightedPaletteColorId: string | null;
}): void {
  const paletteById = new Map(
    palette.map((color) => [
      color.id,
      color,
    ]),
  );

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

    const paletteColor =
      part.paletteColorId
        ? paletteById.get(
            part.paletteColorId,
          )
        : null;

    const paintedColor =
      paletteColor?.hex ??
      part.color ??
      null;

    const isSingleSelected =
      selectedPartId === part.id;

    const isBatchSelected =
      selectedPartIds.includes(part.id);

    const isPaletteHighlighted =
      Boolean(
        highlightedPaletteColorId,
      ) &&
      part.paletteColorId ===
        highlightedPaletteColorId;

    syncMeshMaterials({
      mesh: object,
      viewerMode,
      baseColor,
      paintedColor,
      isSelected:
        isSingleSelected ||
        isBatchSelected ||
        isPaletteHighlighted,
    });
  });
}
