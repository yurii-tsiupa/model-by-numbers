import {
  MathUtils,
  PerspectiveCamera,
  Vector3,
} from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";

import type { ModelBounds } from "./getModelBounds";

type FitCameraToBoundsParams = {
  camera: PerspectiveCamera;
  controls: OrbitControlsImpl;
  bounds: ModelBounds;
  padding?: number;
  direction?: Vector3;
};

export function fitCameraToBounds({
  camera,
  controls,
  bounds,
  padding = 1.25,
  direction,
}: FitCameraToBoundsParams): void {
  const verticalFov = MathUtils.degToRad(camera.fov);

  const horizontalFov =
    2 *
    Math.atan(
      Math.tan(verticalFov / 2) * camera.aspect,
    );

  const distanceForHeight =
    bounds.size.y /
    (2 * Math.tan(verticalFov / 2));

  const distanceForWidth =
    bounds.size.x /
    (2 * Math.tan(horizontalFov / 2));

  const distanceForDepth = bounds.size.z / 2;

  const cameraDistance =
    Math.max(
      distanceForHeight,
      distanceForWidth,
      distanceForDepth,
      bounds.radius,
    ) * padding;

  const viewDirection =
    direction?.clone() ??
    camera.position
      .clone()
      .sub(controls.target)
      .normalize();

  if (viewDirection.lengthSq() === 0) {
    viewDirection.set(1, 0.75, 1).normalize();
  }

  camera.position
    .copy(bounds.center)
    .add(
      viewDirection.multiplyScalar(cameraDistance),
    );

  controls.target.copy(bounds.center);

  camera.near = Math.max(cameraDistance / 100, 0.01);
  camera.far = Math.max(
    cameraDistance * 100,
    bounds.radius * 20,
    100,
  );

  camera.updateProjectionMatrix();
  controls.update();
}