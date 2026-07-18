import type { Locale } from "@/features/i18n/types/Locale";
import type { ModelGuideGroup } from "../types/ModelGuideGroup";
import type { SavedGuide } from "../types/SavedGuide";

export type ModelGuideGroupSort = "recent" | "oldest" | "alphabetical";

export function groupGuidesByModel(guides: readonly SavedGuide[]): ModelGuideGroup[] {
  const groups = new Map<string, ModelGuideGroup>();
  for (const item of guides) {
    const existing = groups.get(item.project.id);
    if (existing) { existing.guides.push(item); if (item.guide.updatedAt > existing.updatedAt) existing.updatedAt = item.guide.updatedAt; continue; }
    groups.set(item.project.id, { project: item.project, thumbnail: item.thumbnail, updatedAt: item.guide.updatedAt, guides: [item] });
  }
  return [...groups.values()].map(group => ({ ...group, guides: [...group.guides].sort((left, right) => right.guide.updatedAt.getTime() - left.guide.updatedAt.getTime()) }));
}

export function filterModelGuideGroups(groups: readonly ModelGuideGroup[], query: string, locale: Locale, getGuideTitle: (guide: SavedGuide) => string): ModelGuideGroup[] {
  const normalized = query.trim().toLocaleLowerCase(locale);
  if (!normalized) return [...groups];
  return groups.flatMap(group => {
    if (group.project.name.toLocaleLowerCase(locale).includes(normalized)) return [{ ...group, guides: [...group.guides] }];
    const matchingGuides = group.guides.filter(guide => getGuideTitle(guide).toLocaleLowerCase(locale).includes(normalized));
    return matchingGuides.length ? [{ ...group, guides: matchingGuides }] : [];
  });
}

export function sortModelGuideGroups(groups: readonly ModelGuideGroup[], sort: ModelGuideGroupSort, locale: Locale): ModelGuideGroup[] {
  return [...groups].sort((left, right) => sort === "alphabetical" ? left.project.name.localeCompare(right.project.name, locale) : sort === "oldest" ? left.updatedAt.getTime() - right.updatedAt.getTime() : right.updatedAt.getTime() - left.updatedAt.getTime());
}
