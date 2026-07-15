import type { ModelPart } from "../types/ModelPart";
import type { GeneratePaletteOptions } from "../types/PaletteGeneration";
import { generatePalette } from "./generatePalette";

export type PaletteGenerationPreview = {
  originalColorCount: number;
  generatedColorCount: number;
  mergedColorCount: number;
};

export function getPaletteGenerationPreview(
  parts: ModelPart[],
  options: GeneratePaletteOptions,
): PaletteGenerationPreview {
  if (parts.length === 0) {
    return {
      originalColorCount: 0,
      generatedColorCount: 0,
      mergedColorCount: 0,
    };
  }

  const originalColors = new Set(
    parts.map(
      (part) =>
        part.originalColor?.toUpperCase() ??
        "#808080",
    ),
  );

  const generated = generatePalette(
    parts,
    options,
  );

  const originalColorCount =
    originalColors.size;

  const generatedColorCount =
    generated.palette.length;

  return {
    originalColorCount,
    generatedColorCount,
    mergedColorCount: Math.max(
      0,
      originalColorCount -
        generatedColorCount,
    ),
  };
}