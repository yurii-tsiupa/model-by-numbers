import {downloadGuidePdf} from "../../lib/downloadGuidePdf";
import {generateGuidePdfFileName} from "./generateGuidePdfFileName";
import {normalizePdfExportError,PdfExportError} from "./pdfExportErrors";
import type {ExportGuidePdfOptions,PdfExportSuccess} from "./types";

export async function exportGuidePdf(options:ExportGuidePdfOptions):Promise<PdfExportSuccess>{
  const{viewModel}=options;
  if(!viewModel.guide.projectId||!viewModel.guide.title)throw new PdfExportError("GUIDE_DATA_UNAVAILABLE");
  options.onProgress?.({status:"preparing",progress:20});
  let blob=options.existingBlob??null;
  try{
    if(!blob){
      const{generateGuidePdf}=await import("../../pdf/generateGuidePdf");
      blob=await generateGuidePdf(viewModel,options.onImageWarning,progress=>options.onProgress?.(progress));
    }
  }catch(error){throw normalizePdfExportError(error,"PDF_GENERATION_FAILED");}
  if(!blob||blob.size===0)throw new PdfExportError("PDF_GENERATION_FAILED");
  const fileName=options.fileName??generateGuidePdfFileName({projectName:viewModel.guide.title,modelName:viewModel.guide.paintingSummary?.modelName,locale:viewModel.locale});
  const result={blob,fileName};
  try{await options.beforeDownload?.(result);}catch(error){if(process.env.NODE_ENV!=="production")console.error("Guide PDF post-generation callback failed.",error);}
  try{downloadGuidePdf(blob,fileName);}catch(error){throw new PdfExportError("DOWNLOAD_FAILED",error);}
  return result;
}
