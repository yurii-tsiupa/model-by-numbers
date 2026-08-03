import type { GuideTargetMode } from "./getGuideViewModel";
import type { ModelGuide } from "../types/ModelGuide";
import type {
  GuideTroubleshootingData,
  GuideTroubleshootingItem,
  ResolvedGuideTroubleshootingItem,
} from "../types/GuideTroubleshooting";

export const DEFAULT_GUIDE_TROUBLESHOOTING_ITEMS: readonly GuideTroubleshootingItem[] = [
  { id: "paint-overflow", category: "paintOverflow", titleKey: "guide.troubleshooting.items.paintOverflow.title", descriptionKey: "guide.troubleshooting.items.paintOverflow.description", defaultIncluded: true },
  { id: "uneven-layer", category: "paintCoverage", titleKey: "guide.troubleshooting.items.unevenLayer.title", descriptionKey: "guide.troubleshooting.items.unevenLayer.description", defaultIncluded: true },
  { id: "uneven-edge", category: "unevenEdge", titleKey: "guide.troubleshooting.items.unevenEdge.title", descriptionKey: "guide.troubleshooting.items.unevenEdge.description", defaultIncluded: true },
  { id: "previous-color-visible", category: "paintCoverage", titleKey: "guide.troubleshooting.items.coverage.title", descriptionKey: "guide.troubleshooting.items.coverage.description", defaultIncluded: true },
  { id: "marker-visibility", category: "markerVisibility", titleKey: "guide.troubleshooting.items.markerVisibility.title", descriptionKey: "guide.troubleshooting.items.markerVisibility.description", defaultIncluded: true },
  { id: "finish-sheen", category: "finish", titleKey: "guide.troubleshooting.items.finish.title", descriptionKey: "guide.troubleshooting.items.finish.description", defaultIncluded: true },
] as const;

export function resolveGuideTroubleshootingData(
  guide: ModelGuide,
  targetMode: GuideTargetMode,
  hasFinishing: boolean,
): GuideTroubleshootingData | null {
  if (guide.troubleshootingEnabled === false) return null;
  const includedIds = guide.includedTroubleshootingItemIds
    ? new Set(guide.includedTroubleshootingItemIds)
    : null;
  const items: ResolvedGuideTroubleshootingItem[] = DEFAULT_GUIDE_TROUBLESHOOTING_ITEMS.flatMap((item, order) => {
    if (item.category === "markerVisibility" && targetMode !== "markers") return [];
    if (item.category === "finish" && !hasFinishing) return [];
    if (includedIds ? !includedIds.has(item.id) : !item.defaultIncluded) return [];
    return [{ ...item, source: "default" as const, order }];
  });

  for (const [index, item] of (guide.troubleshootingItems ?? []).entries()) {
    const title = item.title.trim();
    const description = item.description.trim();
    const included = includedIds ? includedIds.has(item.id) : item.defaultIncluded !== false;
    if (!included || !title || !description) continue;
    items.push({ ...item, title, description, source: "custom", order: item.order ?? DEFAULT_GUIDE_TROUBLESHOOTING_ITEMS.length + index });
  }

  if (!items.length) return null;
  items.sort((first, second) => first.order - second.order);
  return { items };
}
