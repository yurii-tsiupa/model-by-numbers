import { deleteGuideAssetFile, loadGuideAssetFile, saveGuideAssetFile } from "@/features/storage/services/storage.service";

export const getUserBrandBackgroundAssetId = (userId: string, id: string) => `profile-brand-background:${userId}:${id}`;

export async function saveUserBrandBackground(userId: string, id: string, blob: Blob): Promise<string> {
  const localAssetId = getUserBrandBackgroundAssetId(userId, id);
  const existing = await loadGuideAssetFile(localAssetId);
  const now = new Date();
  await saveGuideAssetFile({ id: localAssetId, entity: "guide-asset", entityId: userId, ownerId: userId, fileName: `profile-brand-background-${id}`, mimeType: blob.type || "image/jpeg", blob, size: blob.size, createdAt: existing?.createdAt ?? now, updatedAt: now, metadata: { kind: "profile-brand-background", assetId: id } });
  return localAssetId;
}

export async function loadUserBrandBackground(localAssetId: string): Promise<Blob | null> {
  if (!localAssetId.startsWith("profile-brand-background:")) return null;
  return (await loadGuideAssetFile(localAssetId))?.blob ?? null;
}

export async function deleteUserBrandBackground(localAssetId: string): Promise<void> {
  if (localAssetId.startsWith("profile-brand-background:")) await deleteGuideAssetFile(localAssetId);
}
