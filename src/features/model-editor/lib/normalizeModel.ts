import {
  Box3,
  type Object3D,
  Vector3,
} from "three";

const TARGET_MODEL_SIZE = 4;

export function normalizeModel(
  sourceScene: Object3D,
): Object3D {
  const model = sourceScene.clone(true);

  model.updateWorldMatrix(true, true);

  const initialBoundingBox = new Box3().setFromObject(
    model,
    true,
  );

  if (initialBoundingBox.isEmpty()) {
    throw new Error(
      "No visible geometry was found in this model.",
    );
  }

  const initialSize = initialBoundingBox.getSize(
    new Vector3(),
  );

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

  const normalizedBoundingBox = new Box3().setFromObject(
    model,
    true,
  );

  const normalizedCenter = normalizedBoundingBox.getCenter(
    new Vector3(),
  );

  model.position.set(
    -normalizedCenter.x,
    -normalizedBoundingBox.min.y,
    -normalizedCenter.z,
  );

  model.updateWorldMatrix(true, true);

  return model;
}