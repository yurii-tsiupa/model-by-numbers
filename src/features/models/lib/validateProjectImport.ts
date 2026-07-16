import type { ImportTransform } from "@/features/model-import/types/ImportTransform";
import type { ModelDimensions } from "@/features/model-import/types/ModelUnits";

function isFiniteTuple(values: readonly number[]): boolean {
  return values.every(Number.isFinite);
}

export function isValidProjectImport(
  transform: ImportTransform,
  dimensions: ModelDimensions,
): boolean {
  return (
    isFiniteTuple(transform.rotation) &&
    isFiniteTuple(transform.centerOffset) &&
    Number.isFinite(transform.scale) &&
    transform.scale > 0 &&
    isFiniteTuple([
      dimensions.width,
      dimensions.height,
      dimensions.depth,
    ]) &&
    dimensions.width >= 0 &&
    dimensions.height >= 0 &&
    dimensions.depth >= 0
  );
}
