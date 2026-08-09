export type UserBrandBackgroundAsset = {
  id: string;
  name: string | null;
  localAssetId: string;
};

export type UserBrandAssets = { backgrounds: UserBrandBackgroundAsset[] };
export const EMPTY_USER_BRAND_ASSETS: UserBrandAssets = { backgrounds: [] };

export function normalizeUserBrandAssets(value: unknown): UserBrandAssets {
  if (!value || typeof value !== "object") return { ...EMPTY_USER_BRAND_ASSETS };
  const backgrounds = Array.isArray((value as Record<string, unknown>).backgrounds) ? (value as { backgrounds: unknown[] }).backgrounds : [];
  return { backgrounds: backgrounds.slice(0, 20).flatMap((item): UserBrandBackgroundAsset[] => {
    if (!item || typeof item !== "object") return [];
    const source = item as Record<string, unknown>;
    if (typeof source.id !== "string" || typeof source.localAssetId !== "string" || !source.localAssetId.startsWith("profile-brand-background:")) return [];
    return [{ id: source.id, localAssetId: source.localAssetId, name: typeof source.name === "string" ? source.name.trim().slice(0, 80) || null : null }];
  }) };
}
