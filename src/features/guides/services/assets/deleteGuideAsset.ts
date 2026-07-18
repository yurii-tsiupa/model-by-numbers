import { guideAssetStorage } from "./guideAssetStorage";
import type { GuideAssetReference } from "./types";
export const deleteGuideAsset = (reference: GuideAssetReference) => guideAssetStorage.delete(reference);
