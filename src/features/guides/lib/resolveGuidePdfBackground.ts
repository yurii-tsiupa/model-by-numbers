import type { GuidePdfBackgroundItem, GuidePdfBackgroundItems, GuidePdfBackgroundTarget } from "../types/GuidePdfBackground";

export function resolveGuidePdfBackground(sectionId: Exclude<GuidePdfBackgroundTarget, "all"> | undefined, items: GuidePdfBackgroundItems): GuidePdfBackgroundItem | null {
  let global: GuidePdfBackgroundItem | null = null;
  let section: GuidePdfBackgroundItem | null = null;
  for (const item of items) {
    if (!item.imageUrl) continue;
    if (item.scope.mode === "all") global = item;
    else if (item.scope.mode === "sections" && sectionId && item.scope.sectionIds.includes(sectionId)) section = item;
  }
  return section ?? global;
}
