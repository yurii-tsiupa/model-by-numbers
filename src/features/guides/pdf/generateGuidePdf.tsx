import { pdf } from "@react-pdf/renderer";

import type { GuideViewModel } from "../lib/getGuideViewModel";
import { ModelGuideDocument } from "./ModelGuideDocument";
import { prepareGuideImagesForPdf } from "./prepareGuideImagesForPdf";

export async function generateGuidePdf(
  viewModel: GuideViewModel,
  onImageWarning?: () => void,
): Promise<Blob> {
  const {guide}=viewModel;
  if (!guide.projectId || !guide.title || guide.partsCount < 0) {
    throw new Error("Guide data is unavailable or invalid.");
  }

  const prepared = await prepareGuideImagesForPdf(guide);
  if (prepared.hasFailures) onImageWarning?.();
  const blob = await pdf(
    <ModelGuideDocument viewModel={{...viewModel,guide:prepared.guide,workflowGuide:{...prepared.guide,parts:prepared.guide.workflowParts??prepared.guide.parts}}} />,
  ).toBlob();

  if (!blob || blob.size === 0 || blob.type !== "application/pdf") {
    throw new Error("PDF generation returned an invalid document.");
  }

  return blob;
}
