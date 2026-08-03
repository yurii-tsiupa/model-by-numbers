import type { TranslationKey } from "@/features/i18n/locales/en";

export type GuideTroubleshootingCategory =
  | "paintCoverage"
  | "paintOverflow"
  | "unevenEdge"
  | "markerVisibility"
  | "finish"
  | "other";

export type GuideTroubleshootingItem = {
  id: string;
  titleKey: TranslationKey;
  descriptionKey: TranslationKey;
  category: GuideTroubleshootingCategory;
  defaultIncluded: boolean;
};

export type GuideCustomTroubleshootingItem = {
  id: string;
  category: GuideTroubleshootingCategory;
  title: string;
  description: string;
  order?: number;
  defaultIncluded?: boolean;
};

export type ResolvedGuideTroubleshootingItem =
  | (GuideTroubleshootingItem & { source: "default"; order: number })
  | (GuideCustomTroubleshootingItem & { source: "custom"; order: number });

export type GuideTroubleshootingData = {
  items: readonly ResolvedGuideTroubleshootingItem[];
};
