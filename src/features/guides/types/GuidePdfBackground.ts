import type { GuidePdfSectionId } from "../config/guideSectionRegistry";

export type GuidePdfBackgroundTarget = "all" | "cover" | GuidePdfSectionId;
export type GuidePdfBackgroundItem = {
  id: string;
  imageUrl: string | null;
  localAssetId: string | null;
  target: GuidePdfBackgroundTarget;
  opacity: number;
};

export type GuidePdfBackgroundItems = GuidePdfBackgroundItem[];

const DATA_IMAGE_PATTERN = /^data:image\/(png|jpeg);base64,/;
const clampOpacity = (value: unknown) => typeof value === "number" && Number.isFinite(value) ? Math.min(100, Math.max(0, Math.round(value))) : 20;
const isTarget = (value: unknown): value is GuidePdfBackgroundTarget => value === "all" || typeof value === "string";

export function normalizeGuidePdfBackgroundItems(value: unknown): GuidePdfBackgroundItems {
  if (!Array.isArray(value)) return [];
  const targets = new Set<GuidePdfBackgroundTarget>();
  return value.flatMap((raw, index) => {
    if (!raw || typeof raw !== "object") return [];
    const item = raw as Record<string, unknown>;
    if (!isTarget(item.target) || targets.has(item.target)) return [];
    const imageUrl = typeof item.imageUrl === "string" && (DATA_IMAGE_PATTERN.test(item.imageUrl) || item.imageUrl.startsWith("blob:")) ? item.imageUrl : null;
    const localAssetId = typeof item.localAssetId === "string" && item.localAssetId.startsWith("guide-asset:") ? item.localAssetId : null;
    if (!imageUrl && !localAssetId) return [];
    targets.add(item.target);
    return [{ id: typeof item.id === "string" && item.id ? item.id : `background-${index}`, imageUrl, localAssetId, target: item.target, opacity: clampOpacity(item.opacity) }];
  });
}

/** Converts the previous unfinished global/override format at the persistence boundary. */
export function migrateLegacyGuidePdfBackgrounds(globalValue: unknown, overridesValue: unknown): GuidePdfBackgroundItems {
  const items: GuidePdfBackgroundItems = [];
  const global = globalValue && typeof globalValue === "object" ? globalValue as Record<string, unknown> : {};
  if (typeof global.imageUrl === "string" && DATA_IMAGE_PATTERN.test(global.imageUrl)) items.push({ id: "background-all", imageUrl: global.imageUrl, localAssetId: null, target: "all", opacity: clampOpacity(global.opacity) });
  if (overridesValue && typeof overridesValue === "object") Object.entries(overridesValue as Record<string, unknown>).forEach(([target, raw]) => {
    if (!raw || typeof raw !== "object") return;
    const override = raw as Record<string, unknown>;
    const settings = override.settings && typeof override.settings === "object" ? override.settings as Record<string, unknown> : {};
    if (override.mode === "custom" && typeof settings.imageUrl === "string" && DATA_IMAGE_PATTERN.test(settings.imageUrl)) items.push({ id: `background-${target}`, imageUrl: settings.imageUrl, localAssetId: null, target: target as GuidePdfBackgroundTarget, opacity: clampOpacity(settings.opacity) });
  });
  return normalizeGuidePdfBackgroundItems(items);
}
