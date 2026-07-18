import { prepareImageForPdf, type PrepareImageForPdfOptions } from "../services/pdf/prepareImageForPdf";
import type { ModelGuide } from "../types/ModelGuide";

export type PdfImagePreparationResult = { guide: ModelGuide; hasFailures: boolean; lowResolutionCount: number };

export async function prepareGuideImagesForPdf(guide: ModelGuide): Promise<PdfImagePreparationResult> {
  let hasFailures = false;
  let lowResolutionCount = 0;
  const cache = new Map<string, Promise<string | null>>();
  const normalize = (source: string | null | undefined, metadata: { type: string; id?: string }, options: PrepareImageForPdfOptions = {}) => {
    if (!source) return Promise.resolve(null);
    const cacheKey = `${options.preserveTransparency === true}:${options.applyWhiteBackground === true}:${source}`;
    const existing = cache.get(cacheKey);
    if (existing) return existing;
    const prepared = prepareImageForPdf(source, options).then(result => {
      if (result.isLowResolution) lowResolutionCount += 1;
      return result.source;
    }).catch(() => {
      hasFailures = true;
      if (process.env.NODE_ENV !== "production") console.warn("Guide image is not PDF-compatible.", { ...metadata, prefix: source.slice(0, 32), length: source.length, isBlobUrl: source.startsWith("blob:") });
      return null;
    });
    cache.set(cacheKey, prepared);
    return prepared;
  };
  const captureOptions = { applyWhiteBackground: true } as const;
  const referenceOptions = { preserveTransparency: true } as const;
  const [original, base, painted, numbers, explodedImage, assemblyImages, referenceImages] = await Promise.all([
    normalize(guide.images.original, { type: "original" }, captureOptions), normalize(guide.images.base, { type: "base" }, captureOptions), normalize(guide.images.painted, { type: "painted" }, captureOptions), normalize(guide.images.numbers, { type: "numbers" }, captureOptions),
    normalize(guide.explodedView?.image, { type: "exploded" }, captureOptions),
    Promise.all((guide.assemblySteps ?? []).map(step => normalize(step.image, { type: "assembly", id: step.id }, captureOptions))),
    Promise.all((guide.references ?? []).map(reference => normalize(reference.dataUrl, { type: "reference", id: reference.id }, referenceOptions))),
  ]);
  return { hasFailures, lowResolutionCount, guide: { ...guide, images: { original, base, painted, numbers }, explodedView: guide.explodedView ? { ...guide.explodedView, image: explodedImage } : guide.explodedView, assemblySteps: guide.assemblySteps?.map((step, index) => ({ ...step, parts: step.parts.map(part => ({ ...part })), image: assemblyImages[index] })), references: guide.references?.map((reference, index) => ({ ...reference, dataUrl: referenceImages[index] ?? "" })) } };
}
