import type { GuideImageSource } from "./GuidePaintingStep";

export type GuideFinishingItemType = "varnish" | "basing" | "finalDetail" | "other";

export type GuideFinishingItemInput = {
  id: string;
  type: GuideFinishingItemType;
  title?: string | null;
  description?: string | null;
  imageId?: string | null;
  image?: GuideImageSource | null;
  order?: number;
  defaultIncluded?: boolean;
  sourcePaintingStepId?: string | null;
};

export type GuideFinishingItem = {
  id: string;
  type: GuideFinishingItemType;
  title: string | null;
  description: string | null;
  imageId: string | null;
  image: GuideImageSource | null;
  order: number;
  source: "guide" | "painting-step";
  sourcePaintingStepId: string | null;
  defaultIncluded: boolean;
};

export type GuideFinishingData = {
  items: readonly GuideFinishingItem[];
  sourcePaintingStepIds: ReadonlySet<string>;
};
