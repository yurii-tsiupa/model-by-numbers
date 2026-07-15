import { PaletteColor } from "@/features/models/types/PaletteColor";
import type { ModelPart } from "../types/ModelPart";

type GeneratePaletteResult = {
  palette: PaletteColor[];
  parts: ModelPart[];
};

export function generatePaletteFromModel(
  parts: ModelPart[],
): GeneratePaletteResult {
  const palette: PaletteColor[] = [];
  const paletteMap = new Map<string, string>();

  let colorNumber = 1;

  const updatedParts = parts.map((part) => {
    const hex =
      part.originalColor?.toUpperCase() ??
      "#808080";

    let paletteColorId =
      paletteMap.get(hex);

    if (!paletteColorId) {
      paletteColorId = crypto.randomUUID();

      paletteMap.set(hex, paletteColorId);

      palette.push({
        id: paletteColorId,
        number: colorNumber,
        name: `Color ${colorNumber}`,
        hex,
      });

      colorNumber++;
    }

    return {
      ...part,

      color: hex,

      paletteColorId,
    };
  });

  return {
    palette,
    parts: updatedParts,
  };
}