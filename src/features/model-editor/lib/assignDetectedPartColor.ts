import type { PaletteColor } from "@/features/models/types/PaletteColor";
import { normalizeHexColor } from "./normalizeHexColor";

type DetectedPart = {
  id: string;
  includeInGuide: boolean;
  paletteColorId: string | null;
  color: string | null;
};

export function getSingleIncludedDetectedPart<T extends DetectedPart>(parts: readonly T[]): T | null {
  const included = parts.filter((part) => part.includeInGuide);
  return included.length === 1 ? included[0] : null;
}

export function assignDetectedPartColor<T extends DetectedPart>({
  parts,
  palette,
  partId,
  paletteColorId,
}: {
  parts: readonly T[];
  palette: readonly PaletteColor[];
  partId: string;
  paletteColorId: string;
}): { parts: T[]; changed: boolean; synchronizedBaseColor: string | null } | null {
  const color = palette.find((item) => item.id === paletteColorId);
  const part = parts.find((item) => item.id === partId);
  if (!color || !part) return null;
  const changed = part.paletteColorId !== paletteColorId || part.color !== null;
  const singlePart = getSingleIncludedDetectedPart(parts);
  return {
    parts: changed
      ? parts.map((item) => item.id === partId ? { ...item, color: null, paletteColorId } : item)
      : [...parts],
    changed,
    synchronizedBaseColor: changed && singlePart?.id === partId
      ? normalizeHexColor(color.hex)
      : null,
  };
}
