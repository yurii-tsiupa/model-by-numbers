export type GuideAssetKind = "thumbnail" | "model-original" | "model-base" | "model-painted" | "model-numbers" | "exploded" | "assembly" | "reference";

export type GuideAssetReference = {
  id: string;
  storageKey: string;
  mimeType: string;
  createdAt: string;
  kind: GuideAssetKind;
  assetId: string;
};

export type SaveGuideAssetInput = {
  projectId: string;
  kind: GuideAssetKind;
  assetId: string;
  blob: Blob;
};
