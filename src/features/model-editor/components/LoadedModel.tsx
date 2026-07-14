"use client";

import { useGLTF } from "@react-three/drei";
import {
  type ThreeEvent,
} from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import {
  Box3,
  Color,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  Vector3,
} from "three";
import type { GLTF } from "three-stdlib";

import { extractModelParts } from "../services/extractModelParts";
import { useModelEditorStore } from "../store/modelEditorStore";

type LoadedModelProps = {
  modelUrl: string;
};

const TARGET_MODEL_SIZE = 4;
const SELECTED_EMISSIVE_COLOR = new Color("#f97316");

function prepareModel(sourceScene: Object3D): Object3D {
  const model = sourceScene.clone(true);

  model.updateWorldMatrix(true, true);

  const initialBox = new Box3().setFromObject(model, true);

  if (initialBox.isEmpty()) {
    throw new Error(
      "No visible geometry was found in this model.",
    );
  }

  const initialSize = initialBox.getSize(new Vector3());

  const largestDimension = Math.max(
    initialSize.x,
    initialSize.y,
    initialSize.z,
  );

  if (
    !Number.isFinite(largestDimension) ||
    largestDimension <= 0
  ) {
    throw new Error(
      "The model has invalid geometry dimensions.",
    );
  }

  const normalizedScale =
    TARGET_MODEL_SIZE / largestDimension;

  model.scale.setScalar(normalizedScale);
  model.updateWorldMatrix(true, true);

  const normalizedBox = new Box3().setFromObject(model, true);

  const normalizedCenter = normalizedBox.getCenter(
    new Vector3(),
  );

  model.position.set(
    -normalizedCenter.x,
    -normalizedBox.min.y,
    -normalizedCenter.z,
  );

  model.updateWorldMatrix(true, true);

  return model;
}

function cloneMeshMaterials(model: Object3D): void {
  model.traverse((object) => {
    if (!(object instanceof Mesh)) {
      return;
    }

    if (Array.isArray(object.material)) {
      object.material = object.material.map((material) =>
        material.clone(),
      );
    } else {
      object.material = object.material.clone();
    }

    object.castShadow = true;
    object.receiveShadow = true;
  });
}

function updateMaterialSelection(
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

    material.emissive.copy(
      isSelected
        ? SELECTED_EMISSIVE_COLOR
        : new Color("#000000"),
    );

    material.emissiveIntensity = isSelected ? 0.28 : 0;
    material.needsUpdate = true;
  });
}

export function LoadedModel({
  modelUrl,
}: LoadedModelProps) {
  const gltf = useGLTF(modelUrl) as GLTF;

  const parts = useModelEditorStore(
    (state) => state.parts,
  );

  const selectedPartId = useModelEditorStore(
    (state) => state.selectedPartId,
  );

  const setParts = useModelEditorStore(
    (state) => state.setParts,
  );

  const selectPart = useModelEditorStore(
    (state) => state.selectPart,
  );

  const model = useMemo(() => {
    const preparedModel = prepareModel(gltf.scene);

    cloneMeshMaterials(preparedModel);

    return preparedModel;
  }, [gltf.scene]);

  useEffect(() => {
    const extractedParts = extractModelParts(model);

    setParts(extractedParts);
  }, [model, setParts]);

  useEffect(() => {
    const partsByMeshUuid = new Map(
      parts.map((part) => [part.meshUuid, part]),
    );

    model.traverse((object) => {
      if (!(object instanceof Mesh)) {
        return;
      }

      const part = partsByMeshUuid.get(object.uuid);

      if (!part) {
        return;
      }

      object.visible = part.visible;

      updateMaterialSelection(
        object,
        selectedPartId === part.id,
      );
    });
  }, [model, parts, selectedPartId]);

  function handlePointerDown(
    event: ThreeEvent<PointerEvent>,
  ) {
    event.stopPropagation();

    const clickedMesh = event.object;

    if (!(clickedMesh instanceof Mesh)) {
      return;
    }

    const clickedPart = parts.find(
      (part) => part.meshUuid === clickedMesh.uuid,
    );

    if (!clickedPart) {
      return;
    }

    selectPart(clickedPart.id);
  }

  return (
    <primitive
      object={model}
      onPointerDown={handlePointerDown}
    />
  );
}