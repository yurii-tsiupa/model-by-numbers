import type { PaletteColor } from "@/features/models/types/PaletteColor";

import type { ModelPart } from "../types/ModelPart";
import { normalizeHexColor } from "./normalizeHexColor";

type GeneratedPaletteResult = {
  palette: PaletteColor[];
  parts: ModelPart[];
};

function createPaletteColorId(
  number: number,
): string {
  return `color-${number}`;
}

function createPaletteColorName(
  number: number,
): string {
  return `C${String(number).padStart(2, "0")}`;
}

export function syncPaletteFromParts(
  parts: ModelPart[],
  existingPalette: PaletteColor[] = [],
): GeneratedPaletteResult {
  const paletteByHex = new Map<string, PaletteColor>();

  existingPalette.forEach((color) => {
    const normalizedHex = normalizeHexColor(color.hex);

    if (!normalizedHex) {
      return;
    }

    paletteByHex.set(normalizedHex, {
      ...color,
      hex: normalizedHex,
    });
  });

  let nextColorNumber =
    existingPalette.reduce(
      (largestNumber, color) =>
        Math.max(largestNumber, color.number),
      0,
    ) + 1;

  const updatedParts = parts.map((part) => {
    if (part.paletteColorId) {
      return part;
    }

    if (!part.color) {
      return part;
    }

    const normalizedHex = normalizeHexColor(part.color);

    if (!normalizedHex) {
      return part;
    }

    let paletteColor =
      paletteByHex.get(normalizedHex);

    if (!paletteColor) {
      const number = nextColorNumber;

      paletteColor = {
        id: createPaletteColorId(number),
        number,
        name: createPaletteColorName(number),
        hex: normalizedHex,
      };

      paletteByHex.set(normalizedHex, paletteColor);
      nextColorNumber += 1;
    }

    return {
      ...part,
      color: null,
      paletteColorId: paletteColor.id,
    };
  });

  const palette = Array.from(
    paletteByHex.values(),
  ).sort(
    (firstColor, secondColor) =>
      firstColor.number - secondColor.number,
  );

  return {
    palette,
    parts: updatedParts,
  };
}
