export type UserBrandBackgroundAsset = {
  id: string;
  name: string | null;
  localAssetId: string;
};

export type UserBrandAssets = { backgrounds: UserBrandBackgroundAsset[]; defaultBackgroundId: string | null };
export const EMPTY_USER_BRAND_ASSETS: UserBrandAssets = { backgrounds: [], defaultBackgroundId: null };

export function normalizeUserBrandAssets(value: unknown): UserBrandAssets {
  if (!value || typeof value !== "object") return { ...EMPTY_USER_BRAND_ASSETS };
  const backgrounds = Array.isArray((value as Record<string, unknown>).backgrounds) ? (value as { backgrounds: unknown[] }).backgrounds : [];
  const normalized = backgrounds.slice(0, 20).flatMap((item): UserBrandBackgroundAsset[] => {
    if (!item || typeof item !== "object") return [];
    const source = item as Record<string, unknown>;
    if (typeof source.id !== "string" || typeof source.localAssetId !== "string" || !source.localAssetId.startsWith("profile-brand-background:")) return [];
    return [{ id: source.id, localAssetId: source.localAssetId, name: typeof source.name === "string" ? source.name.trim().slice(0, 80) || null : null }];
  });
  const defaultBackgroundId = typeof (value as Record<string, unknown>).defaultBackgroundId === "string" && normalized.some((item) => item.id === (value as Record<string, unknown>).defaultBackgroundId) ? (value as Record<string, unknown>).defaultBackgroundId as string : null;
  return { backgrounds: normalized, defaultBackgroundId };
}
