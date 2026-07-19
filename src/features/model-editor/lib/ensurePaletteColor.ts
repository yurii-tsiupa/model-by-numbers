import type { PaletteColor } from "@/features/models/types/PaletteColor";
import { normalizeHexColor } from "./normalizeHexColor";

export function ensurePaletteColor(
  palette: readonly PaletteColor[],
  value: string,
  name?: string,
): { palette: PaletteColor[]; color: PaletteColor; created: boolean } | null {
  const hex = normalizeHexColor(value);
  if (!hex) return null;

  const existing = palette.find(
    (color) => normalizeHexColor(color.hex) === hex,
  );
  if (existing) return { palette: [...palette], color: existing, created: false };

  const number = palette.reduce(
    (largest, color) => Math.max(largest, color.number),
    0,
  ) + 1;
  let id = `color-${number}`;
  let suffix = 1;
  while (palette.some((color) => color.id === id)) {
    id = `color-${number}-${suffix}`;
    suffix += 1;
  }

  const color: PaletteColor = {
    id,
    number,
    name: name?.trim() || `C${String(number).padStart(2, "0")}`,
    hex,
  };
  return { palette: [...palette, color], color, created: true };
}
