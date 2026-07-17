import type { GuideViewModel } from "../../lib/getGuideViewModel";

export type PdfExportStatus="idle"|"preparing"|"rendering"|"generating"|"success"|"error";
export type PdfExportActiveStatus=Extract<PdfExportStatus,"preparing"|"rendering"|"generating">;
export type PdfExportProgress={status:PdfExportActiveStatus;progress:20|55|80};
export type PdfExportSuccess={blob:Blob;fileName:string};
export type ExportGuidePdfOptions={viewModel:GuideViewModel;existingBlob?:Blob|null;fileName?:string;onProgress?:(progress:PdfExportProgress)=>void;onImageWarning?:()=>void;beforeDownload?:(result:PdfExportSuccess)=>Promise<void>|void};
