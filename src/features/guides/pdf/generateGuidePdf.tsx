import { pdf } from "@react-pdf/renderer";

import type { GuideViewModel } from "../lib/getGuideViewModel";
import { ModelGuideDocument } from "./ModelGuideDocument";
import { prepareGuideImagesForPdf } from "./prepareGuideImagesForPdf";
import { PdfExportError } from "../services/pdf/pdfExportErrors";
import type { PdfExportProgress } from "../services/pdf/types";
import type { GuideTemplateSettings } from "@/features/templates/types/GuideLibraryTemplate";
import {prepareGuideStepPreviewsForPdf} from "./prepareGuideStepPreviewsForPdf";

export async function generateGuidePdf(
  viewModel: GuideViewModel,
  templateSettings: GuideTemplateSettings,
  onImageWarning?: (warning: { code: "IMAGE_LOAD_FAILED" | "LOW_RESOLUTION_IMAGE"; count: number }) => void,
  onProgress?: (progress:PdfExportProgress)=>void,
): Promise<Blob> {
  const {guide}=viewModel;
  if (!guide.projectId || !guide.title || guide.partsCount < 0) {
    throw new PdfExportError("GUIDE_DATA_UNAVAILABLE");
  }
  const unavailableStepImages=viewModel.paintingSteps.filter(step=>step.preview.status!=="ready"&&!(step.preview.status==="unavailable"&&step.preview.reason==="general")).length;
  if(unavailableStepImages)onImageWarning?.({code:"IMAGE_LOAD_FAILED",count:unavailableStepImages});

  let prepared,preparedSteps;
  try{prepared=await prepareGuideImagesForPdf(guide);preparedSteps=await prepareGuideStepPreviewsForPdf(viewModel);}catch(error){throw new PdfExportError("PREPARATION_FAILED",error);}
  if (prepared.hasFailures||preparedSteps.hasFailures) onImageWarning?.({ code: "IMAGE_LOAD_FAILED", count: 1 });
  if (prepared.lowResolutionCount > 0) onImageWarning?.({ code: "LOW_RESOLUTION_IMAGE", count: prepared.lowResolutionCount });
  onProgress?.({status:"rendering",progress:65});
  let renderer;
  try{renderer=pdf(<ModelGuideDocument templateSettings={templateSettings} viewModel={{...preparedSteps.viewModel,guide:prepared.guide,workflowGuide:{...prepared.guide,parts:prepared.guide.workflowParts??prepared.guide.parts}}} />);}catch(error){throw new PdfExportError("RENDER_FAILED",error);}
  onProgress?.({status:"generating",progress:85});
  let blob:Blob;try{blob=await renderer.toBlob();}catch(error){throw new PdfExportError("PDF_GENERATION_FAILED",error);}

  if (!blob || blob.size === 0 || blob.type !== "application/pdf") {
    throw new PdfExportError("PDF_GENERATION_FAILED");
  }

  return blob;
}
