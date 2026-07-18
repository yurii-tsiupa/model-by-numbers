import { PDF_IMAGE } from "./pdfImage.constants";

const PDF_DATA_URL = /^data:image\/(?:png|jpeg);base64,/i;
const MINIMUM_DATA_URL_LENGTH = 64;

export type PrepareImageForPdfOptions = {
  preserveTransparency?: boolean;
  applyWhiteBackground?: boolean;
};

export type PreparedPdfImage = {
  source: string;
  width: number;
  height: number;
  mimeType: "image/png" | "image/jpeg";
  isLowResolution: boolean;
  wasOptimized: boolean;
};

function loadImage(source: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new window.Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Image decoding failed."));
    image.src = source;
  });
}

function hasTransparency(context: CanvasRenderingContext2D, width: number, height: number): boolean {
  const pixels = context.getImageData(0, 0, width, height).data;
  const step = 4 * PDF_IMAGE.alphaSampleStride;
  for (let index = 3; index < pixels.length; index += step) {
    if (pixels[index] < 255) return true;
  }
  return false;
}

export async function prepareImageForPdf(source: string, options: PrepareImageForPdfOptions = {}): Promise<PreparedPdfImage> {
  const image = await loadImage(source);
  if (typeof image.decode === "function") await image.decode();
  const sourceWidth = image.naturalWidth;
  const sourceHeight = image.naturalHeight;
  if (sourceWidth < 1 || sourceHeight < 1) throw new Error("Invalid image dimensions.");

  const scale = Math.min(1, PDF_IMAGE.maxDimension / Math.max(sourceWidth, sourceHeight));
  const width = Math.max(1, Math.round(sourceWidth * scale));
  const height = Math.max(1, Math.round(sourceHeight * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d", { alpha: true });
  if (!context) throw new Error("Canvas is unavailable.");
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.clearRect(0, 0, width, height);
  context.drawImage(image, 0, 0, width, height);

  const transparent = hasTransparency(context, width, height);
  const keepTransparency = transparent && options.preserveTransparency === true && options.applyWhiteBackground !== true;
  if (transparent && !keepTransparency) {
    context.globalCompositeOperation = "destination-over";
    context.fillStyle = PDF_IMAGE.backgroundColor;
    context.fillRect(0, 0, width, height);
    context.globalCompositeOperation = "source-over";
  }

  const mimeType = keepTransparency ? "image/png" : "image/jpeg";
  const candidate = mimeType === "image/png" ? canvas.toDataURL(mimeType) : canvas.toDataURL(mimeType, PDF_IMAGE.jpegQuality);
  canvas.width = 0;
  canvas.height = 0;
  if (!PDF_DATA_URL.test(candidate) || candidate.length <= MINIMUM_DATA_URL_LENGTH) throw new Error("Invalid image conversion result.");

  const originalIsPdfCompatible = PDF_DATA_URL.test(source) && source.length > MINIMUM_DATA_URL_LENGTH;
  const canReuseOriginal = originalIsPdfCompatible && scale === 1 && ((keepTransparency && source.startsWith("data:image/png")) || (!transparent && candidate.length >= source.length));
  return { source: canReuseOriginal ? source : candidate, width: sourceWidth, height: sourceHeight, mimeType: canReuseOriginal && source.startsWith("data:image/png") ? "image/png" : mimeType, isLowResolution: sourceWidth < PDF_IMAGE.minWidth, wasOptimized: !canReuseOriginal };
}
