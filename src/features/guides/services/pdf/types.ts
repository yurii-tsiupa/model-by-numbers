import type { GuideViewModel } from "../../lib/getGuideViewModel";

export type PdfExportStatus="idle"|"awaitingConfirmation"|"preparing"|"loadingAssets"|"rendering"|"generating"|"success"|"error";
export type PdfExportActiveStatus=Extract<PdfExportStatus,"preparing"|"loadingAssets"|"rendering"|"generating">;
export type PdfExportProgress={status:PdfExportActiveStatus;progress:15|40|65|85};
export type PdfExportWarning={code:"IMAGE_LOAD_FAILED"|"LOW_RESOLUTION_IMAGE";count:number};
export type PdfExportSuccess={blob:Blob;fileName:string;warnings:PdfExportWarning[]};
export type ExportGuidePdfOptions={viewModel:GuideViewModel;existingBlob?:Blob|null;fileName?:string;onProgress?:(progress:PdfExportProgress)=>void;onImageWarning?:(warning:PdfExportWarning)=>void;beforeDownload?:(result:PdfExportSuccess)=>Promise<void>|void};
