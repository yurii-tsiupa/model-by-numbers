import type { GuideAssemblyData, GuideAssemblyView } from "../types/GuideAssembly";
import type { GuideAssemblyPart, GuideSettings, ModelGuide } from "../types/ModelGuide";

export const GUIDE_ASSEMBLY_OVERVIEW_PARTS_PER_PAGE = 18;

export function getGuideAssemblyPageCount(data: GuideAssemblyData | null): number {
  if (!data) return 0;
  return data.mode === "steps"
    ? data.steps.length
    : Math.max(1, Math.ceil(data.parts.length / GUIDE_ASSEMBLY_OVERVIEW_PARTS_PER_PAGE));
}

export function resolveGuideAssemblyData(guide: ModelGuide, settings: GuideSettings): GuideAssemblyData | null {
  const parts: GuideAssemblyPart[] = (guide.workflowParts ?? guide.parts)
    .filter((part) => part.id && part.name.trim())
    .slice()
    .sort((first, second) => first.number - second.number)
    .map((part) => ({ id: part.id, name: part.name.trim(), number: part.number }));
  const validPartIds = new Set(parts.map((part) => part.id));
  const steps = settings.includeAssemblyInstructions
    ? (guide.assemblySteps ?? [])
        .filter((step) => step.title.trim() && step.parts.some((part) => validPartIds.has(part.id)))
        .slice()
        .sort((first, second) => first.order - second.order)
    : [];

  if (steps.length) {
    return { mode: "steps", parts, steps, views: [] };
  }

  const isMultipart = guide.partsCount > 1 && parts.length > 1;
  if (!isMultipart) return null;

  const views: GuideAssemblyView[] = [];
  const usedImages = new Set<string>();
  const addView = (view: GuideAssemblyView) => {
    if (!view.image || usedImages.has(view.image) || views.length >= 2) return;
    usedImages.add(view.image);
    views.push(view);
  };
  if (guide.explodedView?.image) addView({ id: "assembly-exploded", image: guide.explodedView.image, labelKey: "guide.exploded.title" });
  for (const view of (guide.overviewViews ?? []).filter((item) => item.included !== false).sort((first, second) => first.order - second.order)) {
    addView({ id: `assembly-${view.id}`, image: view.image, labelKey: "guide.visual" });
  }
  const fallbackImage = guide.images.painted ?? guide.images.base ?? guide.images.original;
  if (fallbackImage) addView({ id: "assembly-model", image: fallbackImage, labelKey: "guide.modelOverview" });

  return { mode: "overview", parts, steps: [], views };
}
