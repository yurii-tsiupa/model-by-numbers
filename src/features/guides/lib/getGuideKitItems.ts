import type { GuideDefaultKitItem, GuideKitItem, GuideManualKitItem } from "../types/GuideKit";
import type { GuidePaletteColor } from "../types/ModelGuide";
import type { TranslationKey } from "@/features/i18n/locales/en";

export const GUIDE_KIT_CATEGORY_ORDER = ["paint", "brush", "tool", "material"] as const;

export const DEFAULT_GUIDE_KIT_ITEMS: readonly GuideDefaultKitItem[] = [
  { id: "default-detail-brush", source: "default", category: "brush", nameKey: "guide.kit.items.detailBrush", defaultIncluded: true },
  { id: "default-medium-brush", source: "default", category: "brush", nameKey: "guide.kit.items.mediumBrush", defaultIncluded: true },
  { id: "default-mixing-palette", source: "default", category: "tool", nameKey: "guide.kit.items.mixingPalette", defaultIncluded: true },
  { id: "default-water-container", source: "default", category: "tool", nameKey: "guide.kit.items.waterContainer", defaultIncluded: true },
  { id: "default-paper-towels", source: "default", category: "material", nameKey: "guide.kit.items.paperTowels", defaultIncluded: true },
] as const;

export function formatGuideColorCode(number: number): string {
  return `C${String(number).padStart(2, "0")}`;
}

export function resolveGuideKitItemName(item: GuideKitItem, t: (key: TranslationKey) => string): string {
  return item.source === "default" ? t(item.nameKey) : item.name;
}

export function getGuideKitItems(
  usedPalette: readonly GuidePaletteColor[],
  manualItems: readonly GuideManualKitItem[] = [],
): GuideKitItem[] {
  const paints = usedPalette.map((color) => ({
    id: `paint-${color.id}`,
    source: "palette" as const,
    category: "paint" as const,
    name: color.name,
    code: formatGuideColorCode(color.number),
    colorHex: color.hex,
  }));
  const nonPaintItems = manualItems.flatMap((item) =>
    GUIDE_KIT_CATEGORY_ORDER.includes(item.category) && item.name.trim()
      ? [{ ...item, name: item.name.trim() }]
      : [],
  );
  return [...paints, ...DEFAULT_GUIDE_KIT_ITEMS.filter((item) => item.defaultIncluded), ...nonPaintItems];
}
