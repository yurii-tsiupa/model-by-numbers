import { deleteGuideAssetFile, loadGuideAssetFile, saveGuideAssetFile } from "@/features/storage/services/storage.service";

export const getUserBrandLogoAssetId = (userId: string) => `profile-brand-logo:${userId}`;

export async function saveUserBrandLogo(userId: string, blob: Blob): Promise<string> {
  const id = getUserBrandLogoAssetId(userId);
  const existing = await loadGuideAssetFile(id);
  const now = new Date();
  await saveGuideAssetFile({ id, entity: "guide-asset", entityId: userId, ownerId: userId, fileName: "profile-brand-logo", mimeType: blob.type || "image/png", blob, size: blob.size, createdAt: existing?.createdAt ?? now, updatedAt: now, metadata: { kind: "profile-brand-logo" } });
  return id;
}

export async function loadUserBrandLogo(assetId: string): Promise<Blob | null> {
  if (!assetId.startsWith("profile-brand-logo:")) return null;
  return (await loadGuideAssetFile(assetId))?.blob ?? null;
}

export async function deleteUserBrandLogo(assetId: string): Promise<void> {
  if (assetId.startsWith("profile-brand-logo:")) await deleteGuideAssetFile(assetId);
}
