import {
  Box3,
  Sphere,
  Vector3,
  type Object3D,
} from "three";

export type ModelBounds = {
  box: Box3;
  center: Vector3;
  size: Vector3;
  sphere: Sphere;
  radius: number;
};

export function getModelBounds(
  model: Object3D,
): ModelBounds {
  model.updateWorldMatrix(true, true);

  const box = new Box3().setFromObject(model, true);

  if (box.isEmpty()) {
    throw new Error(
      "Unable to calculate model bounds.",
    );
  }

  const center = box.getCenter(new Vector3());

  const size = box.getSize(new Vector3());

  const sphere = box.getBoundingSphere(
    new Sphere(),
  );

  return {
    box,
    center,
    size,
    sphere,
    radius: sphere.radius,
  };
}