import { MODEL_FILE_LIMITS } from "../constants/modelImport.constants";
import type { ModelImportError } from "../types/ModelImportError";
import type { ModelImportWarning } from "../types/ModelImportWarning";
import { getModelFileExtension } from "./getModelFileExtension";

const ACCEPTED_GL_BINARY_MIME_TYPES = new Set([
  "model/gltf-binary",
  "application/octet-stream",
]);

export function validateModelFile(file: File | null | undefined): { errors: ModelImportError[]; warnings: ModelImportWarning[] } {
  const errors: ModelImportError[] = [], warnings: ModelImportWarning[] = [];
  if (!file || file.size === 0) {
    errors.push({ code: "empty-file", messageKey: "modelImport.errors.empty-file" });
    return { errors, warnings };
  }
  const extensionIsValid = getModelFileExtension(file.name) === "glb";
  const mimeIsValid = !file.type || ACCEPTED_GL_BINARY_MIME_TYPES.has(file.type.toLowerCase());
  if (!extensionIsValid || !mimeIsValid) errors.push({ code: "unsupported-format", messageKey: "modelImport.errors.unsupported-format" });
  if (file.size > MODEL_FILE_LIMITS.maximumSizeMb * 1024 * 1024) errors.push({ code: "file-too-large", messageKey: "modelImport.errors.file-too-large" });
  else if (file.size >= MODEL_FILE_LIMITS.warningSizeMb * 1024 * 1024) warnings.push({ code: "large-file", severity: "warning", messageKey: "modelImport.warnings.large-file" });
  return { errors, warnings };
}
