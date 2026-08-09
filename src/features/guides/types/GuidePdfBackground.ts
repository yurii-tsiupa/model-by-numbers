import type { GuidePdfSectionId } from "../config/guideSectionRegistry";

export type GuidePdfBackgroundTarget = "all" | "cover" | GuidePdfSectionId;
export type GuidePdfBackgroundSectionId = Exclude<GuidePdfBackgroundTarget, "all">;
export type GuidePdfBackgroundScope =
  | { mode: "none" }
  | { mode: "all" }
  | { mode: "sections"; sectionIds: GuidePdfBackgroundSectionId[] };
export type GuidePdfBackgroundSourceType = "profile" | "guide";
export type GuidePdfBackgroundItem = {
  id: string;
  assetId: string;
  sourceType: GuidePdfBackgroundSourceType;
  imageUrl: string | null;
  localAssetId: string | null;
  scope: GuidePdfBackgroundScope;
  opacity: number;
};

export type GuidePdfBackgroundItems = GuidePdfBackgroundItem[];

const DATA_IMAGE_PATTERN = /^data:image\/(png|jpeg);base64,/;
const clampOpacity = (value: unknown) => typeof value === "number" && Number.isFinite(value) ? Math.min(100, Math.max(0, Math.round(value))) : 20;
const SECTION_IDS = new Set<GuidePdfBackgroundSectionId>(["cover", "projectOverview", "legend", "kit", "palette", "modelOverview", "explodedView", "assembly", "references", "partsOverview", "paintingInstructions", "finishing", "troubleshooting", "backCover", "toc"]);
const isSectionId = (value: unknown): value is GuidePdfBackgroundSectionId => typeof value === "string" && SECTION_IDS.has(value as GuidePdfBackgroundSectionId);
const normalizeScope = (item: Record<string, unknown>): GuidePdfBackgroundScope => {
  const scope = item.scope && typeof item.scope === "object" ? item.scope as Record<string, unknown> : null;
  if (scope?.mode === "none") return { mode: "none" };
  if (scope?.mode === "sections" && Array.isArray(scope.sectionIds)) {
    const sectionIds = [...new Set(scope.sectionIds.filter(isSectionId))];
    if (sectionIds.length) return { mode: "sections", sectionIds };
  }
  if (scope?.mode === "all" || item.target === "all") return { mode: "all" };
  return isSectionId(item.target) ? { mode: "sections", sectionIds: [item.target] } : { mode: "all" };
};

export function normalizeGuidePdfBackgroundItems(value: unknown): GuidePdfBackgroundItems {
  if (!Array.isArray(value)) return [];
  return value.flatMap((raw, index) => {
    if (!raw || typeof raw !== "object") return [];
    const item = raw as Record<string, unknown>;
    const imageUrl = typeof item.imageUrl === "string" && (DATA_IMAGE_PATTERN.test(item.imageUrl) || item.imageUrl.startsWith("blob:")) ? item.imageUrl : null;
    const sourceType: GuidePdfBackgroundSourceType = item.sourceType === "profile" ? "profile" : "guide";
    const localAssetId = typeof item.localAssetId === "string" && (item.localAssetId.startsWith("guide-asset:") || sourceType === "profile" && item.localAssetId.startsWith("profile-brand-background:")) ? item.localAssetId : null;
    if (!imageUrl && !localAssetId) return [];
    const id = typeof item.id === "string" && item.id ? item.id : `background-${index}`;
    const assetId = typeof item.assetId === "string" && item.assetId ? item.assetId : localAssetId ?? id;
    return [{ id, assetId, sourceType, imageUrl, localAssetId, scope: normalizeScope(item), opacity: clampOpacity(item.opacity) }];
  });
}

/** Converts the previous unfinished global/override format at the persistence boundary. */
export function migrateLegacyGuidePdfBackgrounds(globalValue: unknown, overridesValue: unknown): GuidePdfBackgroundItems {
  const items: GuidePdfBackgroundItems = [];
  const global = globalValue && typeof globalValue === "object" ? globalValue as Record<string, unknown> : {};
  if (typeof global.imageUrl === "string" && DATA_IMAGE_PATTERN.test(global.imageUrl)) items.push({ id: "background-all", assetId: "background-all", sourceType: "guide", imageUrl: global.imageUrl, localAssetId: null, scope: { mode: "all" }, opacity: clampOpacity(global.opacity) });
  if (overridesValue && typeof overridesValue === "object") Object.entries(overridesValue as Record<string, unknown>).forEach(([target, raw]) => {
    if (!raw || typeof raw !== "object") return;
    const override = raw as Record<string, unknown>;
    const settings = override.settings && typeof override.settings === "object" ? override.settings as Record<string, unknown> : {};
    if (override.mode === "custom" && typeof settings.imageUrl === "string" && DATA_IMAGE_PATTERN.test(settings.imageUrl) && isSectionId(target)) items.push({ id: `background-${target}`, assetId: `background-${target}`, sourceType: "guide", imageUrl: settings.imageUrl, localAssetId: null, scope: { mode: "sections", sectionIds: [target] }, opacity: clampOpacity(settings.opacity) });
  });
  return normalizeGuidePdfBackgroundItems(items);
}
