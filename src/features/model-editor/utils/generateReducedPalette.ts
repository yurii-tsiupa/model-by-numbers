import type { ModelPart } from "../types/ModelPart";
import {
  buildPalette,
  type GeneratePaletteResult,
} from "./buildPalette";
import { mergeSimilarColors } from "./colors/mergeSimilarColors";

const FALLBACK_COLOR = "#808080";

export function generateReducedPalette(
  parts: ModelPart[],
  threshold: number,
): GeneratePaletteResult {
  const originalColors = parts.map(
    (part) =>
      part.originalColor?.toUpperCase() ??
      FALLBACK_COLOR,
  );

  const mergeMap = mergeSimilarColors(
    originalColors,
    threshold,
  );

  return buildPalette({
    parts,
    resolveColor: (part) => {
      const originalHex =
        part.originalColor?.toUpperCase() ??
        FALLBACK_COLOR;

      return (
        mergeMap.get(originalHex) ??
        originalHex
      );
    },
  });
}