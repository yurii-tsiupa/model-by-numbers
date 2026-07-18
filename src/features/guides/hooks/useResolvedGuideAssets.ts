import { useEffect, useState } from "react";
import { createGuideObjectUrl } from "../services/assets/createGuideObjectUrl";
import { loadGuideAsset } from "../services/assets/loadGuideAsset";
import type { ModelGuide } from "../types/ModelGuide";

export function useResolvedGuideAssets(guide: ModelGuide): ModelGuide {
  const [resolved, setResolved] = useState(guide);
  useEffect(() => {
    let active = true;
    const urls: Array<{ revoke: () => void }> = [];
    void Promise.all((guide.assetReferences ?? []).map(async reference => {
      try {
        const blob = await loadGuideAsset(reference);
        if (!blob || !active) return null;
        const objectUrl = createGuideObjectUrl(blob);
        urls.push(objectUrl);
        return { reference, url: objectUrl.url };
      } catch { return null; }
    })).then(items => {
      if (!active) return;
      const found = items.filter((item): item is NonNullable<typeof item> => item !== null);
      const byKind = new Map(found.map(item => [`${item.reference.kind}:${item.reference.assetId}`, item.url]));
      setResolved({ ...guide, images: { original: byKind.get("model-original:current") ?? guide.images.original, base: byKind.get("model-base:current") ?? guide.images.base, painted: byKind.get("model-painted:current") ?? guide.images.painted, numbers: byKind.get("model-numbers:current") ?? guide.images.numbers }, explodedView: guide.explodedView ? { ...guide.explodedView, image: byKind.get("exploded:current") ?? guide.explodedView.image } : guide.explodedView, assemblySteps: guide.assemblySteps?.map(step => ({ ...step, image: byKind.get(`assembly:${step.id}`) ?? step.image })) });
    });
    return () => { active = false; urls.forEach(item => item.revoke()); };
  }, [guide]);
  return resolved;
}
