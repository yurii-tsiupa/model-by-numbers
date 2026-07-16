export type ModelImportErrorCode="empty-file"|"unsupported-format"|"file-too-large"|"parse-failed"|"analysis-cancelled"|"no-visible-geometry"|"invalid-model-bounds"|"invalid-geometry"|"unknown";
export type ModelImportError={code:ModelImportErrorCode;messageKey:`modelImport.errors.${ModelImportErrorCode}`;technicalDetails?:string};
