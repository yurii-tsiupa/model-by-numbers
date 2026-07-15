import { pdf } from "@react-pdf/renderer";

import type { ModelGuide } from "../types/ModelGuide";
import { ModelGuideDocument } from "./ModelGuideDocument";

export async function generateGuidePdf(
  guide: ModelGuide,
): Promise<Blob> {
  if (!guide.projectId || !guide.title || guide.partsCount < 0) {
    throw new Error("Guide data is unavailable or invalid.");
  }

  const blob = await pdf(
    <ModelGuideDocument guide={guide} />,
  ).toBlob();

  if (!blob || blob.size === 0 || blob.type !== "application/pdf") {
    throw new Error("PDF generation returned an invalid document.");
  }

  return blob;
}
