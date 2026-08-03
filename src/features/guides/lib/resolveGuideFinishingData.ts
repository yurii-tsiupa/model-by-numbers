import type { GuideFinishingData, GuideFinishingItem } from "../types/GuideFinishing";
import type { GuidePaintingStepViewModel } from "../types/GuidePaintingStep";
import type { ModelGuide } from "../types/ModelGuide";
import type { TranslationKey } from "@/features/i18n/locales/en";

export const GUIDE_FINISHING_ITEMS_PER_PAGE = 2;

export function getGuideFinishingItemTitleKey(type: GuideFinishingItem["type"]): TranslationKey {
  switch (type) {
    case "varnish":
      return "guide.finishing.protectiveFinish";
    case "basing":
      return "guide.finishing.base";
    case "finalDetail":
      return "guide.finishing.finalDetail";
    case "other":
      return "guide.finishing.eyebrow";
  }
}

export function getGuideFinishingPageCount(data: GuideFinishingData | null, itemsPerPage = GUIDE_FINISHING_ITEMS_PER_PAGE): number {
  return data ? Math.ceil(data.items.length / itemsPerPage) : 0;
}

export function resolveGuideFinishingData(
  guide: ModelGuide,
  paintingSteps: readonly GuidePaintingStepViewModel[],
): GuideFinishingData | null {
  const includedIds = guide.includedFinishingItemIds
    ? new Set(guide.includedFinishingItemIds)
    : null;
  const sourcePaintingStepIds = new Set<string>();
  const items: GuideFinishingItem[] = (guide.finishingItems ?? []).flatMap((item, index) => {
    const included = includedIds ? includedIds.has(item.id) : item.defaultIncluded !== false;
    const title = item.title?.trim() || null;
    const description = item.description?.trim() || null;
    if (!included || (!title && !description && !item.image)) return [];
    if (item.sourcePaintingStepId) sourcePaintingStepIds.add(item.sourcePaintingStepId);
    return [{
      id: item.id,
      type: item.type,
      title,
      description,
      imageId: item.imageId ?? null,
      image: item.image ?? null,
      order: item.order ?? index,
      source: "guide" as const,
      sourcePaintingStepId: item.sourcePaintingStepId ?? null,
      defaultIncluded: item.defaultIncluded !== false,
    }];
  });

  for (const step of paintingSteps) {
    if (step.stageType !== "finish" || sourcePaintingStepIds.has(step.id)) continue;
    const readyPreview = step.previews.find((preview) => preview.status === "ready");
    sourcePaintingStepIds.add(step.id);
    items.push({
      id: `painting-step-${step.id}`,
      type: "finalDetail",
      title: step.title.trim() || null,
      description: step.instruction.trim() || null,
      imageId: readyPreview?.id ?? null,
      image: readyPreview?.status === "ready" ? readyPreview.image : null,
      order: step.order,
      source: "painting-step",
      sourcePaintingStepId: step.id,
      defaultIncluded: true,
    });
  }

  if (!items.length) return null;
  items.sort((first, second) => first.order - second.order);
  return { items, sourcePaintingStepIds };
}
