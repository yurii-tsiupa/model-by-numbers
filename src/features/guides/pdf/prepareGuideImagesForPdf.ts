import type { ModelGuide } from "../types/ModelGuide";

const PDF_IMAGE_PREFIX = /^data:image\/(?:png|jpeg);base64,/i;
const WEBP_IMAGE_PREFIX = /^data:image\/webp;base64,/i;
const MINIMUM_IMAGE_SOURCE_LENGTH = 64;

export type PdfImagePreparationResult = { guide: ModelGuide; hasFailures: boolean };

function isUsablePdfImage(source: string): boolean {
  return PDF_IMAGE_PREFIX.test(source) && source.length > MINIMUM_IMAGE_SOURCE_LENGTH;
}

function loadImage(source: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new window.Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Image decoding failed."));
    image.src = source;
  });
}

async function convertWebpToPng(source: string): Promise<string> {
  const image = await loadImage(source);
  if (typeof image.decode === "function") await image.decode();
  const { naturalWidth: width, naturalHeight: height } = image;
  if (width < 1 || height < 1) throw new Error("Invalid image dimensions.");
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas is unavailable.");
  context.drawImage(image, 0, 0, width, height);
  const png = canvas.toDataURL("image/png");
  canvas.width = 0;
  canvas.height = 0;
  if (!isUsablePdfImage(png)) throw new Error("Invalid PNG conversion result.");
  return png;
}

async function normalizePdfImageSource(source: string | null | undefined, metadata: { type: string; id?: string }): Promise<{ source: string | null; failed: boolean }> {
  if (!source) return { source: null, failed: false };
  if (isUsablePdfImage(source)) return { source, failed: false };
  try {
    if (WEBP_IMAGE_PREFIX.test(source) && source.length > MINIMUM_IMAGE_SOURCE_LENGTH) {
      return { source: await convertWebpToPng(source), failed: false };
    }
  } catch {
    // Report only safe metadata below.
  }
  if (process.env.NODE_ENV !== "production") console.warn("Guide image is not PDF-compatible.", { ...metadata, prefix: source.slice(0, 32), length: source.length, isBlobUrl: source.startsWith("blob:") });
  return { source: null, failed: true };
}

export async function prepareGuideImagesForPdf(guide: ModelGuide): Promise<PdfImagePreparationResult> {
  let hasFailures = false;
  const normalize = async (source: string | null | undefined, metadata: { type: string; id?: string }) => {
    const result = await normalizePdfImageSource(source, metadata);
    hasFailures ||= result.failed;
    return result.source;
  };
  const [original, base, painted, numbers, explodedImage, assemblyImages, referenceImages] = await Promise.all([
    normalize(guide.images.original, { type: "original" }), normalize(guide.images.base, { type: "base" }), normalize(guide.images.painted, { type: "painted" }), normalize(guide.images.numbers, { type: "numbers" }),
    normalize(guide.explodedView?.image, { type: "exploded" }),
    Promise.all((guide.assemblySteps ?? []).map((step) => normalize(step.image, { type: "assembly", id: step.id }))),
    Promise.all((guide.references ?? []).map((reference) => normalize(reference.dataUrl, { type: "reference", id: reference.id }))),
  ]);
  return { hasFailures, guide: { ...guide, images: { original, base, painted, numbers }, explodedView: guide.explodedView ? { ...guide.explodedView, image: explodedImage } : guide.explodedView, assemblySteps: guide.assemblySteps?.map((step, index) => ({ ...step, parts: step.parts.map((part) => ({ ...part })), image: assemblyImages[index] })), references: guide.references?.map((reference, index) => ({ ...reference, dataUrl: referenceImages[index] ?? "" })) } };
}
