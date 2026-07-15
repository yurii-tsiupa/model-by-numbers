const WIDTH = 800;
const HEIGHT = 600;

function canvasBlob(canvas: HTMLCanvasElement, type: "image/webp" | "image/png", quality?: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

export async function createThumbnailBlob(dataUrl: string): Promise<{ blob: Blob; mimeType: "image/webp" | "image/png"; width: number; height: number }> {
  if (typeof document === "undefined") throw new Error("Thumbnail generation failed.");
  const image = new Image();
  await new Promise<void>((resolve, reject) => { image.onload = () => resolve(); image.onerror = () => reject(new Error("Thumbnail generation failed.")); image.src = dataUrl; });
  const canvas = document.createElement("canvas");
  canvas.width = WIDTH; canvas.height = HEIGHT;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Thumbnail generation failed.");
  context.fillStyle = "#151515"; context.fillRect(0, 0, WIDTH, HEIGHT);
  const scale = Math.min(WIDTH / image.naturalWidth, HEIGHT / image.naturalHeight);
  const width = image.naturalWidth * scale; const height = image.naturalHeight * scale;
  context.drawImage(image, (WIDTH - width) / 2, (HEIGHT - height) / 2, width, height);
  let blob = await canvasBlob(canvas, "image/webp", 0.85);
  let mimeType: "image/webp" | "image/png" = "image/webp";
  if (!blob || blob.size === 0 || blob.type !== "image/webp") { blob = await canvasBlob(canvas, "image/png"); mimeType = "image/png"; }
  if (!blob || blob.size === 0) throw new Error("Thumbnail generation failed.");
  return { blob, mimeType, width: WIDTH, height: HEIGHT };
}
