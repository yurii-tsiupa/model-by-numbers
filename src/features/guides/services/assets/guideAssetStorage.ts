import { deleteGuideAssetFile, loadGuideAssetFile, loadGuideAssetFiles, saveGuideAssetFile } from "@/features/storage/services/storage.service";
import type { GuideAssetReference, SaveGuideAssetInput } from "./types";

const keyFor = ({ projectId, kind, assetId }: Omit<SaveGuideAssetInput, "blob">) => `guide-asset:${projectId}:${kind}:${assetId}`;

export const guideAssetStorage = {
  async save(input: SaveGuideAssetInput): Promise<GuideAssetReference> {
    const id = keyFor(input);
    const existing = await loadGuideAssetFile(id);
    const now = new Date();
    await saveGuideAssetFile({ id, entity: "guide-asset", entityId: input.projectId, fileName: `${input.kind}-${input.assetId}`, mimeType: input.blob.type || "image/png", blob: input.blob, size: input.blob.size, createdAt: existing?.createdAt ?? now, updatedAt: now, metadata: { kind: input.kind, assetId: input.assetId,contentKey:input.contentKey } });
    return { id, storageKey: id, mimeType: input.blob.type || "image/png", createdAt: (existing?.createdAt ?? now).toISOString(), kind: input.kind, assetId: input.assetId,...(input.contentKey?{contentKey:input.contentKey}:{}) };
  },
  async load(reference: GuideAssetReference): Promise<Blob | null> {
    const file = await loadGuideAssetFile(reference.storageKey);
    return file?.entity === "guide-asset" ? file.blob : null;
  },
  delete: (reference: GuideAssetReference) => deleteGuideAssetFile(reference.storageKey),
  async list(projectId: string): Promise<GuideAssetReference[]> {
    return (await loadGuideAssetFiles(projectId)).map(file => ({ id: file.id, storageKey: file.id, mimeType: file.mimeType, createdAt: file.createdAt.toISOString(), kind: String(file.metadata?.kind) as GuideAssetReference["kind"], assetId: String(file.metadata?.assetId),...(typeof file.metadata?.contentKey==="string"?{contentKey:file.metadata.contentKey}:{}) }));
  },
};
