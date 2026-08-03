import type { TranslationKey } from "@/features/i18n/locales/en";

import type { GuideTargetMode } from "./getGuideViewModel";

export type GuideLegendItemKind = "step" | "target" | "color" | "view" | "technique";

export type GuideLegendItem = {
  id: "step" | "marker" | "region" | "part" | "color" | "view";
  kind: GuideLegendItemKind;
  titleKey: TranslationKey;
  descriptionKey: TranslationKey;
};

const commonItems = {
  step: {
    id: "step",
    kind: "step",
    titleKey: "guide.legend.step.title",
    descriptionKey: "guide.legend.step.description",
  },
  color: {
    id: "color",
    kind: "color",
    titleKey: "guide.legend.color.title",
    descriptionKey: "guide.legend.color.description",
  },
  view: {
    id: "view",
    kind: "view",
    titleKey: "guide.legend.view.title",
    descriptionKey: "guide.legend.view.description",
  },
} as const satisfies Record<string, GuideLegendItem>;

const targetItems = {
  markers: {
    id: "marker",
    kind: "target",
    titleKey: "guide.legend.marker.title",
    descriptionKey: "guide.legend.marker.description",
  },
  region: {
    id: "region",
    kind: "target",
    titleKey: "guide.legend.region.title",
    descriptionKey: "guide.legend.region.description",
  },
  parts: {
    id: "part",
    kind: "target",
    titleKey: "guide.legend.part.title",
    descriptionKey: "guide.legend.part.description",
  },
} as const satisfies Record<GuideTargetMode, GuideLegendItem>;

export function getGuideLegendItems(targetMode: GuideTargetMode): readonly GuideLegendItem[] {
  return [commonItems.step, targetItems[targetMode], commonItems.color, commonItems.view];
}
