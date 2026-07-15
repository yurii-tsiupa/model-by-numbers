import type { ModelPart } from "../types/ModelPart";
import {
  buildPalette,
  type GeneratePaletteResult,
} from "./buildPalette";

const FALLBACK_COLOR = "#808080";

export function generatePaletteFromModel(
  parts: ModelPart[],
): GeneratePaletteResult {
  return buildPalette({
    parts,
    resolveColor: (part) =>
      part.originalColor ?? FALLBACK_COLOR,
  });
}