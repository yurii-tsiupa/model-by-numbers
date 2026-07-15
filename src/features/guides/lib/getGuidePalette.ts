import type { PaletteColor } from "@/features/models/types/PaletteColor";

import type { GuidePartInput } from "../types/GuidePartInput";
import type { GuidePaletteColor } from "../types/ModelGuide";

export function getGuidePalette(
  parts: readonly GuidePartInput[],
  palette: readonly PaletteColor[],
): GuidePaletteColor[] {
  const visibleColorUsage = new Map<string, number>();

  for (const part of parts) {
    if (!part.visible || !part.paletteColorId) {
      continue;
    }

    visibleColorUsage.set(
      part.paletteColorId,
      (visibleColorUsage.get(part.paletteColorId) ?? 0) + 1,
    );
  }

  return palette
    .filter((color) => visibleColorUsage.has(color.id))
    .map((color) => ({
      id: color.id,
      number: color.number,
      name: color.name,
      hex: color.hex,
      usageCount: visibleColorUsage.get(color.id) ?? 0,
    }))
    .sort((firstColor, secondColor) =>
      firstColor.number - secondColor.number,
    );
}
