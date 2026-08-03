import type { TranslationKey } from "@/features/i18n/locales/en";

export type GuideKitCategory = "paint" | "brush" | "tool" | "material";

type GuideKitItemBase = {
  id: string;
  category: GuideKitCategory;
  code?: string | null;
  quantity?: string | null;
  colorHex?: string | null;
};

export type GuidePaletteKitItem = GuideKitItemBase & {
  source: "palette";
  category: "paint";
  name: string;
};

export type GuideDefaultKitItem = GuideKitItemBase & {
  source: "default";
  category: Exclude<GuideKitCategory, "paint">;
  nameKey: TranslationKey;
  defaultIncluded: boolean;
};

export type GuideManualKitItem = GuideKitItemBase & {
  source: "manual";
  category: Exclude<GuideKitCategory, "paint">;
  name: string;
};

export type GuideKitItem = GuidePaletteKitItem | GuideDefaultKitItem | GuideManualKitItem;
