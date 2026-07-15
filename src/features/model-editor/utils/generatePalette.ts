import type { ModelPart } from "../types/ModelPart";
import type { GeneratePaletteOptions } from "../types/PaletteGeneration";

import { PALETTE_THRESHOLDS } from "../constants/paletteThresholds";
import { generatePaletteFromModel } from "./generatePaletteFromModel";
import { generateReducedPalette } from "./generateReducedPalette";

export function generatePalette(
  parts: ModelPart[],
  options: GeneratePaletteOptions,
) {
  switch (options.source) {
    case "original":
      return generateOriginalPalette(parts, options);

    default:
      return generateOriginalPalette(parts, options);
  }
}

function generateOriginalPalette(
  parts: ModelPart[],
  options: GeneratePaletteOptions,
) {
  switch (options.optimization) {
    case "none":
      return generatePaletteFromModel(parts);

    case "low":
      return generateReducedPalette(
        parts,
        PALETTE_THRESHOLDS.low,
      );

    case "medium":
      return generateReducedPalette(
        parts,
        PALETTE_THRESHOLDS.medium,
      );

    case "high":
      return generateReducedPalette(
        parts,
        PALETTE_THRESHOLDS.high,
      );

    default:
      return generatePaletteFromModel(parts);
  }
}