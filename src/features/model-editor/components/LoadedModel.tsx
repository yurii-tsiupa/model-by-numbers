"use client";

import { useGLTF } from "@react-three/drei";
import { useEffect, useMemo } from "react";
import {
  Box3,
  Mesh,
  Object3D,
  Vector3,
} from "three";
import type { GLTF } from "three-stdlib";

type LoadedModelProps = {
  modelUrl: string;
};

const TARGET_MODEL_SIZE = 4;

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

export function LoadedModel({
  modelUrl,
}: LoadedModelProps) {
  const gltf = useGLTF(modelUrl) as GLTF;

  const model = useMemo(
    () => prepareModel(gltf.scene),
    [gltf.scene],
  );

  useEffect(() => {
    model.traverse((object) => {
      if (!(object instanceof Mesh)) {
        return;
      }

      object.castShadow = true;
      object.receiveShadow = true;
    });
  }, [model]);

  return <primitive object={model} />;
}