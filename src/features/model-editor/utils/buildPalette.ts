import type { PaletteColor } from "@/features/models/types/PaletteColor";

import type { ModelPart } from "../types/ModelPart";

export type GeneratePaletteResult = {
  palette: PaletteColor[];
  parts: ModelPart[];
};

type BuildPaletteParams = {
  parts: ModelPart[];
  resolveColor: (part: ModelPart) => string;
};

export function buildPalette({
  parts,
  resolveColor,
}: BuildPaletteParams): GeneratePaletteResult {
  const palette: PaletteColor[] = [];
  const paletteIdsByHex = new Map<string, string>();

  let colorNumber = 1;

  const updatedParts = parts.map((part) => {
    const hex = resolveColor(part).toUpperCase();

    let paletteColorId =
      paletteIdsByHex.get(hex);

    if (!paletteColorId) {
      paletteColorId = crypto.randomUUID();

      paletteIdsByHex.set(
        hex,
        paletteColorId,
      );

      palette.push({
        id: paletteColorId,
        number: colorNumber,
        name: `C${String(
          colorNumber,
        ).padStart(2, "0")}`,
        hex,
      });

      colorNumber += 1;
    }

    return {
      ...part,
      color: null,
      paletteColorId,
    };
  });

  return {
    palette,
    parts: updatedParts,
  };
}
