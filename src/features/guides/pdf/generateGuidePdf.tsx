import { pdf } from "@react-pdf/renderer";

import type { GuideViewModel } from "../lib/getGuideViewModel";
import { ModelGuideDocument } from "./ModelGuideDocument";
import { prepareGuideImagesForPdf } from "./prepareGuideImagesForPdf";
import { PdfExportError } from "../services/pdf/pdfExportErrors";
import type { PdfExportProgress } from "../services/pdf/types";

export async function generateGuidePdf(
  viewModel: GuideViewModel,
  onImageWarning?: () => void,
  onProgress?: (progress:PdfExportProgress)=>void,
): Promise<Blob> {
  const {guide}=viewModel;
  if (!guide.projectId || !guide.title || guide.partsCount < 0) {
    throw new PdfExportError("GUIDE_DATA_UNAVAILABLE");
  }

  let prepared;
  try{prepared=await prepareGuideImagesForPdf(guide);}catch(error){throw new PdfExportError("PREPARATION_FAILED",error);}
  if (prepared.hasFailures) onImageWarning?.();
  onProgress?.({status:"rendering",progress:65});
  let renderer;
  try{renderer=pdf(<ModelGuideDocument viewModel={{...viewModel,guide:prepared.guide,workflowGuide:{...prepared.guide,parts:prepared.guide.workflowParts??prepared.guide.parts}}} />);}catch(error){throw new PdfExportError("RENDER_FAILED",error);}
  onProgress?.({status:"generating",progress:85});
  let blob:Blob;try{blob=await renderer.toBlob();}catch(error){throw new PdfExportError("PDF_GENERATION_FAILED",error);}

  if (!blob || blob.size === 0 || blob.type !== "application/pdf") {
    throw new PdfExportError("PDF_GENERATION_FAILED");
  }

  return blob;
}
