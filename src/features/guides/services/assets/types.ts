export type GuideAssetKind = "thumbnail" | "model-original" | "model-base" | "model-painted" | "model-numbers" | "exploded" | "assembly" | "reference" | "step-preview";

export type GuideAssetReference = {
  id: string;
  storageKey: string;
  mimeType: string;
  createdAt: string;
  kind: GuideAssetKind;
  assetId: string;
  contentKey?:string;
};

export type SaveGuideAssetInput = {
  projectId: string;
  kind: GuideAssetKind;
  assetId: string;
  blob: Blob;
  contentKey?:string;
};
