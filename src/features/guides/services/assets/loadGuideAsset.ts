import { guideAssetStorage } from "./guideAssetStorage";
import type { GuideAssetReference } from "./types";
export const loadGuideAsset = (reference: GuideAssetReference) => guideAssetStorage.load(reference);
export const loadGuideAssetReferences = (projectId: string) => guideAssetStorage.list(projectId);
