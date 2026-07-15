import type { ModelPart } from "../types/ModelPart";
import type { GeneratePaletteOptions } from "../types/PaletteGeneration";

import { generatePaletteFromModel } from "./generatePaletteFromModel";

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
      return generatePaletteFromModel(parts);

    case "medium":
      return generatePaletteFromModel(parts);

    case "high":
      return generatePaletteFromModel(parts);

    default:
      return generatePaletteFromModel(parts);
  }
}