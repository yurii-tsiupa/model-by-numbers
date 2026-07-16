import { Box3, Euler, Matrix4, Mesh, Quaternion, Vector3, type Object3D } from "three";
import type { Locale } from "@/features/i18n/types/Locale";
import type { ModelDimensions, ModelUnits } from "../types/ModelUnits";

const MILLIMETERS_PER_UNIT: Record<ModelUnits, number> = { mm: 1, cm: 10, m: 1000, inch: 25.4 };

export function convertModelDimension(value: number, from: ModelUnits, to: ModelUnits): number {
  return value * MILLIMETERS_PER_UNIT[from] / MILLIMETERS_PER_UNIT[to];
}

export function convertModelDimensions(dimensions: ModelDimensions, from: ModelUnits, to: ModelUnits): ModelDimensions {
  return { width: convertModelDimension(dimensions.width, from, to), height: convertModelDimension(dimensions.height, from, to), depth: convertModelDimension(dimensions.depth, from, to) };
}

export function formatModelDimension(value: number, locale: Locale): string {
  return new Intl.NumberFormat(locale === "uk" ? "uk-UA" : "en-US", { maximumFractionDigits: Math.abs(value) < 10 ? 3 : 2 }).format(value);
}

export function calculateModelSourceDimensions(scene: Object3D, rotation: readonly [number, number, number], includedMeshUuids?: ReadonlySet<string>): ModelDimensions | null {
  scene.updateWorldMatrix(true, true);
  const rotationMatrix = new Matrix4().makeRotationFromQuaternion(new Quaternion().setFromEuler(new Euler(rotation[0], rotation[1], rotation[2], "XYZ")));
  const bounds = new Box3();
  let found = false;
  scene.traverse((object) => {
    if (!(object instanceof Mesh) || !object.visible || includedMeshUuids && !includedMeshUuids.has(object.uuid)) return;
    const position = object.geometry.getAttribute("position");
    if (!position || position.count < 3) return;
    if (!object.geometry.boundingBox) object.geometry.computeBoundingBox();
    const geometryBounds = object.geometry.boundingBox;
    if (!geometryBounds || geometryBounds.isEmpty()) return;
    const transformed = geometryBounds.clone().applyMatrix4(object.matrixWorld).applyMatrix4(rotationMatrix);
    const values = [transformed.min.x, transformed.min.y, transformed.min.z, transformed.max.x, transformed.max.y, transformed.max.z];
    if (!values.every(Number.isFinite)) return;
    bounds.union(transformed); found = true;
  });
  if (!found || bounds.isEmpty()) return null;
  const size = bounds.getSize(new Vector3());
  if (![size.x, size.y, size.z].every((value) => Number.isFinite(value) && value >= 0) || size.lengthSq() <= Number.EPSILON) return null;
  return { width: size.x, height: size.y, depth: size.z };
}
