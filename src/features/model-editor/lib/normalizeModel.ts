import type { Object3D } from "three";

import { getModelBounds } from "./getModelBounds";

const TARGET_MODEL_SIZE = 4;

export function normalizeModel(
  sourceScene: Object3D,
): Object3D {
  const model = sourceScene.clone(true);

  const initialBounds = getModelBounds(model);

  const largestDimension = Math.max(
    initialBounds.size.x,
    initialBounds.size.y,
    initialBounds.size.z,
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

  const normalizedBounds = getModelBounds(model);

  model.position.set(
    -normalizedBounds.center.x,
    -normalizedBounds.box.min.y,
    -normalizedBounds.center.z,
  );

  model.updateWorldMatrix(true, true);

  return model;
}