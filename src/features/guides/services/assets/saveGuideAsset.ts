import { guideAssetStorage } from "./guideAssetStorage";
import type { SaveGuideAssetInput } from "./types";

export const saveGuideAsset = (input: SaveGuideAssetInput) => guideAssetStorage.save(input);

export async function imageSourceToBlob(source: string): Promise<Blob> {
  const response = await fetch(source);
  if (!response.ok) throw new Error("Unable to read guide asset.");
  return response.blob();
}
