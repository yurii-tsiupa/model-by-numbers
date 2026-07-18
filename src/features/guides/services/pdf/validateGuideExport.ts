import type { TranslationKey } from "@/features/i18n/locales/en";
import type { GuideViewModel } from "../../lib/getGuideViewModel";
import { PDF_IMAGE } from "./pdfImage.constants";

export type GuideExportWarningCode =
  | "MISSING_THUMBNAIL"
  | "MISSING_IMAGES"
  | "MISSING_EXPLODED_VIEW"
  | "EMPTY_ASSEMBLY"
  | "MISSING_PAINTING"
  | "LOW_RESOLUTION_IMAGE"
  | "EMPTY_OPTIONAL_SECTION";

export type GuideExportErrorCode = "GUIDE_NOT_READY";

export type ExportValidationWarning = {
  code: GuideExportWarningCode;
  count?: number;
};

export type ExportValidationError = {
  code: GuideExportErrorCode;
};

export type GuideExportValidation = {
  canExport: boolean;
  errors: ExportValidationError[];
  warnings: ExportValidationWarning[];
};

export function validateGuideExport(viewModel: GuideViewModel): GuideExportValidation {
  const {guide,settings,modelViews,workflowGuide}=viewModel;
  const errors:ExportValidationError[]=[];
  const warnings:ExportValidationWarning[]=[];

  if (!guide.projectId || !guide.title || guide.partsCount < 0) errors.push({code:"GUIDE_NOT_READY"});

  const coverImages=[guide.images.painted,guide.images.base,guide.images.original,guide.images.numbers];
  if (!coverImages.some(Boolean)) warnings.push({code:"MISSING_THUMBNAIL"});

  const missingGuideImages=modelViews.filter(view=>!guide.images[view.key]).length;
  if (missingGuideImages) warnings.push({code:"MISSING_IMAGES",count:missingGuideImages});

  if (settings.includeExplodedView&&!guide.explodedView?.image) warnings.push({code:"MISSING_EXPLODED_VIEW"});
  if (settings.includeAssemblyInstructions&&!(guide.assemblySteps?.length)) warnings.push({code:"EMPTY_ASSEMBLY"});

  const missingPainting=workflowGuide.parts.filter(part=>!part.paintingWorkflow?.stages.length).length;
  if (viewModel.hasPaintingWorkflow&&missingPainting) warnings.push({code:"MISSING_PAINTING",count:missingPainting});

  const lowResolutionImages=settings.includeReferenceImages?(guide.references??[]).filter(reference=>reference.width<PDF_IMAGE.minWidth).length:0;
  if (lowResolutionImages) warnings.push({code:"LOW_RESOLUTION_IMAGE",count:lowResolutionImages});

  if (settings.includeReferenceImages&&!(guide.references?.length)) warnings.push({code:"EMPTY_OPTIONAL_SECTION"});

  return {canExport:errors.length===0,errors,warnings};
}

export function getGuideExportWarningTranslationKey(code:GuideExportWarningCode):TranslationKey {
  const keys:Record<GuideExportWarningCode,TranslationKey>={
    MISSING_THUMBNAIL:"guide.pdfExport.warnings.missingThumbnail",
    MISSING_IMAGES:"guide.pdfExport.warnings.missingImages",
    MISSING_EXPLODED_VIEW:"guide.pdfExport.warnings.missingExplodedView",
    EMPTY_ASSEMBLY:"guide.pdfExport.warnings.emptyAssembly",
    MISSING_PAINTING:"guide.pdfExport.warnings.missingPainting",
    LOW_RESOLUTION_IMAGE:"guide.pdfExport.warnings.lowResolutionImage",
    EMPTY_OPTIONAL_SECTION:"guide.pdfExport.warnings.emptyOptionalSection",
  };
  return keys[code];
}
