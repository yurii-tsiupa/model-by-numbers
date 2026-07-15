import type { PaletteColor } from "@/features/models/types/PaletteColor";

import type { GuidePartInput } from "../types/GuidePartInput";
import type { GuidePaletteColor } from "../types/ModelGuide";
import { isPartIncludedInGuide } from "./isPartIncludedInGuide";

export function getGuidePalette(
  parts: readonly GuidePartInput[],
  palette: readonly PaletteColor[],
): GuidePaletteColor[] {
  const colorUsage = new Map<string, number>();

  for (const part of parts) {
    if (!isPartIncludedInGuide(part) || !part.paletteColorId) {
      continue;
    }

    colorUsage.set(
      part.paletteColorId,
      (colorUsage.get(part.paletteColorId) ?? 0) + 1,
    );
  }

  return palette
    .filter((color) => colorUsage.has(color.id))
    .map((color) => ({
      id: color.id,
      number: color.number,
      name: color.name,
      hex: color.hex,
      usageCount: colorUsage.get(color.id) ?? 0,
    }))
    .sort((firstColor, secondColor) =>
      firstColor.number - secondColor.number,
    );
}
