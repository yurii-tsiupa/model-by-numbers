import {
  Color,
  Mesh,
  MeshStandardMaterial,
  type Material,
  type Object3D,
} from "three";

const ORIGINAL_COLOR_KEY =
  "modelByNumbersOriginalColor";

const ORIGINAL_EMISSIVE_KEY =
  "modelByNumbersOriginalEmissive";

const ORIGINAL_EMISSIVE_INTENSITY_KEY =
  "modelByNumbersOriginalEmissiveIntensity";

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

function cloneMaterial(
  material: Material,
): Material {
  const clonedMaterial = material.clone();

  if (hasMaterialColor(clonedMaterial)) {
    clonedMaterial.userData[ORIGINAL_COLOR_KEY] =
      clonedMaterial.color.getHex();
  }

  if (
    clonedMaterial instanceof
    MeshStandardMaterial
  ) {
    clonedMaterial.userData[
      ORIGINAL_EMISSIVE_KEY
    ] = clonedMaterial.emissive.getHex();

    clonedMaterial.userData[
      ORIGINAL_EMISSIVE_INTENSITY_KEY
    ] = clonedMaterial.emissiveIntensity;
  }

  return clonedMaterial;
}

export function prepareModelMeshes(
  model: Object3D,
): void {
  model.traverse((object) => {
    if (!(object instanceof Mesh)) {
      return;
    }

    object.material = Array.isArray(
      object.material,
    )
      ? object.material.map(cloneMaterial)
      : cloneMaterial(object.material);

    object.castShadow = true;
    object.receiveShadow = true;
  });
}

export function disposeModelMaterials(
  model: Object3D,
): void {
  model.traverse((object) => {
    if (!(object instanceof Mesh)) {
      return;
    }

    const materials = Array.isArray(
      object.material,
    )
      ? object.material
      : [object.material];

    materials.forEach((material) => {
      material.dispose();
    });
  });
}

export function getOriginalMaterialColor(
  material: Material,
): number | null {
  const storedValue =
    material.userData[ORIGINAL_COLOR_KEY];

  return typeof storedValue === "number"
    ? storedValue
    : null;
}

export function getOriginalEmissive(
  material: MeshStandardMaterial,
): number {
  const storedValue =
    material.userData[ORIGINAL_EMISSIVE_KEY];

  return typeof storedValue === "number"
    ? storedValue
    : 0x000000;
}

export function getOriginalEmissiveIntensity(
  material: MeshStandardMaterial,
): number {
  const storedValue =
    material.userData[
      ORIGINAL_EMISSIVE_INTENSITY_KEY
    ];

  return typeof storedValue === "number"
    ? storedValue
    : 1;
}