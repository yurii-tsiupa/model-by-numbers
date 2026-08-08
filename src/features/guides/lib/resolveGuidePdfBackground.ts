import type { GuidePdfBackgroundItem, GuidePdfBackgroundItems, GuidePdfBackgroundTarget } from "../types/GuidePdfBackground";

export function resolveGuidePdfBackground(sectionId: Exclude<GuidePdfBackgroundTarget, "all"> | undefined, items: GuidePdfBackgroundItems): GuidePdfBackgroundItem | null {
  return (sectionId ? items.find((item) => item.target === sectionId && item.imageUrl) : undefined) ?? items.find((item) => item.target === "all" && item.imageUrl) ?? null;
}
