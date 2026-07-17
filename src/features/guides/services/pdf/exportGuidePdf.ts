import {downloadGuidePdf} from "../../lib/downloadGuidePdf";
import {generateGuidePdfFileName} from "./generateGuidePdfFileName";
import {normalizePdfExportError,PdfExportError} from "./pdfExportErrors";
import type {ExportGuidePdfOptions,PdfExportSuccess} from "./types";
import {prepareGuideForExport} from "./prepareGuideForExport";
import {waitForGuideImages} from "./waitForGuideImages";

export async function exportGuidePdf(options:ExportGuidePdfOptions):Promise<PdfExportSuccess>{
  const{viewModel}=options;
  if(!viewModel.guide.projectId||!viewModel.guide.title)throw new PdfExportError("GUIDE_DATA_UNAVAILABLE");
  options.onProgress?.({status:"preparing",progress:15});
  const root=await prepareGuideForExport(viewModel.sections.map(section=>section.id));
  options.onProgress?.({status:"loadingAssets",progress:40});
  const imageResult=await waitForGuideImages(root);
  const warnings=imageResult.failed.length?[{code:"IMAGE_LOAD_FAILED" as const,count:imageResult.failed.length}]:[];
  warnings.forEach(warning=>options.onImageWarning?.(warning));
  let blob=options.existingBlob??null;
  try{
    if(!blob){
      const{generateGuidePdf}=await import("../../pdf/generateGuidePdf");
      blob=await generateGuidePdf(viewModel,()=>{const warning={code:"IMAGE_LOAD_FAILED" as const,count:1};warnings.push(warning);options.onImageWarning?.(warning);},progress=>options.onProgress?.(progress));
    }
  }catch(error){throw normalizePdfExportError(error,"PDF_GENERATION_FAILED");}
  if(!blob||blob.size===0)throw new PdfExportError("PDF_GENERATION_FAILED");
  const fileName=options.fileName??generateGuidePdfFileName({projectName:viewModel.guide.title,modelName:viewModel.guide.paintingSummary?.modelName,locale:viewModel.locale});
  const result={blob,fileName,warnings};
  try{await options.beforeDownload?.(result);}catch(error){if(process.env.NODE_ENV!=="production")console.error("Guide PDF post-generation callback failed.",error);}
  try{downloadGuidePdf(blob,fileName);}catch(error){throw new PdfExportError("DOWNLOAD_FAILED",error);}
  return result;
}
